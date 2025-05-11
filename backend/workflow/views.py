from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Trigger, Action, WorkflowRule, WorkflowExecutionLog
from .serializers import TriggerSerializer, ActionSerializer, WorkflowRuleSerializer, WorkflowExecutionLogSerializer
import json
from django.conf import settings # To access settings like API keys, if needed here
from .gemini import get_ai_suggestions_for_prompt # Import the new function
# import google.generativeai as genai # Import your Gemini SDK
# from django.conf import settings # To access settings like API keys
# We will need OpenAI or Gemini client later
# import openai 
from django.utils import timezone
from datetime import timedelta

class TriggerViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint that allows triggers to be viewed.
    """
    queryset = Trigger.objects.all().order_by('name')
    serializer_class = TriggerSerializer

class ActionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint that allows actions to be viewed.
    """
    queryset = Action.objects.all().order_by('name')
    serializer_class = ActionSerializer

class WorkflowRuleViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows workflow rules to be viewed or edited.
    """
    queryset = WorkflowRule.objects.all()
    serializer_class = WorkflowRuleSerializer

    @action(detail=False, methods=['post'], url_path='generate-from-ai')
    def generate_from_ai(self, request):
        prompt_text = request.data.get('prompt')
        if not prompt_text:
            return Response({"error": "No prompt provided"}, status=status.HTTP_400_BAD_REQUEST)

        created_workflows_instances = []
        ai_suggestions_list = []
        ai_errors_list = [] # To store errors reported by AI

        try:
            # Call the refactored function from gemini.py
            ai_response_json_str = get_ai_suggestions_for_prompt(prompt_text)

            if ai_response_json_str is None:
                # get_ai_suggestions_for_prompt would have printed detailed errors
                return Response({"error": "AI service failed to generate suggestions. Check server logs for details."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Parse the JSON string response from AI
            try:
                ai_data = json.loads(ai_response_json_str)
            except json.JSONDecodeError as je:
                print(f"Error: AI response was not valid JSON: {je}")
                print(f"AI Response String: {ai_response_json_str}")
                return Response({"error": "AI response was not in the expected JSON format."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            ai_suggestions_list = ai_data.get("suggested_workflows", [])
            ai_errors_list = ai_data.get("errors", []) # Capture errors if AI returns them

            if not ai_suggestions_list and not ai_errors_list:
                # If AI returns empty suggestions and no specific errors in the JSON
                return Response({"message": "AI could not suggest any workflows based on the prompt, or the prompt was too vague."}, status=status.HTTP_200_OK)
            
            if ai_errors_list:
                # If AI explicitly returns errors, pass them to the frontend
                # You might want to format this more nicely or log it more extensively
                print(f"AI reported errors: {ai_errors_list}")
                # For now, if there are AI-reported errors, we might not proceed with saving any partial suggestions
                # or we could attempt to save valid ones and report errors for others.
                # Current logic will try to save valid suggestions even if AI also reports errors for others.

            # Process suggestions (even if there were some AI-reported errors for other suggestions)
            for suggestion in ai_suggestions_list:
                try:
                    trigger_name = suggestion.get('trigger_name')
                    action_name = suggestion.get('action_name')
                    rule_type = suggestion.get('rule_type')

                    # Case-insensitive matching for trigger and action names
                    trigger_instance = Trigger.objects.filter(name__iexact=trigger_name).first()
                    action_instance = Action.objects.filter(name__iexact=action_name).first()

                    error_messages_for_suggestion = []
                    if not trigger_instance:
                        msg = f"AI suggested an unknown trigger: '{trigger_name}'."
                        print(msg + " Skipping this suggestion.")
                        error_messages_for_suggestion.append(msg)
                        # continue # Depending on policy, either skip or try to save with errors noted
                    
                    if not action_instance:
                        msg = f"AI suggested an unknown action: '{action_name}'."
                        print(msg + " Skipping this suggestion.")
                        error_messages_for_suggestion.append(msg)
                        # continue
                    
                    if error_messages_for_suggestion: # If critical components are missing, skip
                        # You could collect these errors and return them if needed
                        continue

                    workflow_data = {
                        'name': suggestion.get('workflow_name', 'AI Suggested Workflow'),
                        'description': suggestion.get('workflow_description', ''),
                        'trigger_id': trigger_instance.id if trigger_instance else None,
                        'action_id': action_instance.id if action_instance else None,
                        'rule_type': rule_type,
                        'is_active': True 
                    }
                    
                    # Ensure delay_time is treated as integer if present
                    delay_time_raw = suggestion.get('delay_time')
                    if delay_time_raw is not None:
                        try:
                            workflow_data['delay_time'] = int(float(delay_time_raw)) # AI might return float, DB needs int
                        except (ValueError, TypeError):
                            print(f"AI suggested invalid delay_time format for '{workflow_data['name']}': {delay_time_raw}. Skipping delay.")
                            # Decide if this makes the suggestion invalid or just removes delay
                            # For now, remove delay if format is wrong for a scheduled task
                            if rule_type == 'scheduled': 
                                print("Cannot save scheduled task with invalid delay time. Skipping suggestion")
                                continue
                            workflow_data['delay_time'] = None # Or set to 0 if rule_type is immediate
                    
                    delay_unit_raw = suggestion.get('delay_unit')
                    if delay_unit_raw is not None:
                         workflow_data['delay_unit'] = delay_unit_raw

                    # Additional validation for scheduled type
                    if rule_type == 'scheduled':
                        dt = workflow_data.get('delay_time')
                        du = workflow_data.get('delay_unit')
                        if not (isinstance(dt, int) and dt > 0 and du in ['minutes', 'hours', 'days']):
                            print(f"AI suggested invalid schedule parameters for '{workflow_data['name']}' (time: {dt}, unit: {du}). Skipping.")
                            continue
                    elif rule_type == 'immediate': # Ensure delay is None for immediate, as per model
                        workflow_data['delay_time'] = None
                        workflow_data['delay_unit'] = None
                    
                    serializer = WorkflowRuleSerializer(data=workflow_data, context={'request': request})
                    if serializer.is_valid():
                        workflow_instance = serializer.save()
                        created_workflows_instances.append(workflow_instance)
                    else:
                        print(f"Serializer errors for AI suggestion '{workflow_data.get('name')}': {serializer.errors}")
                        # Optionally, collect these errors to return to frontend later

                except Exception as e:
                    import traceback
                    print(f"Error processing one AI suggestion: {str(e)}. Suggestion: {suggestion}")
                    print(f"Traceback: {traceback.format_exc()}")
                    continue # Skip this suggestion and try the next

            response_payload = {}
            if created_workflows_instances:
                final_serializer = WorkflowRuleSerializer(created_workflows_instances, many=True)
                response_payload['created_workflows'] = final_serializer.data
                status_code = status.HTTP_201_CREATED
            else:
                status_code = status.HTTP_200_OK # Or 400 if AI errors were the only thing

            if ai_errors_list: # Include AI-reported errors in the response
                response_payload['ai_reported_errors'] = ai_errors_list
                if not created_workflows_instances: # If only errors, maybe it's not a success status
                     status_code = status.HTTP_400_BAD_REQUEST 
                     if 'message' not in response_payload: response_payload['message'] = "AI reported errors and no workflows could be created."
            
            if not created_workflows_instances and not ai_errors_list:
                response_payload['message'] = "No valid workflows were generated from the AI suggestions, or AI returned no suggestions."
                # Status code remains 200 if AI just returned empty suggestions without errors.

            return Response(response_payload, status=status_code)

        except Exception as e:
            # Catch-all for other unexpected errors during the process
            import traceback
            print(f"General error in AI workflow generation process: {str(e)}")
            print(f"Traceback: {traceback.format_exc()}")
            return Response({"error": f"An unexpected error occurred on the server: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # New action for simulating triggers
    @action(detail=False, methods=['post'], url_path='simulate-trigger')
    def simulate_trigger(self, request):
        trigger_id = request.data.get('trigger_id')
        if not trigger_id:
            return Response({"error": "trigger_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            trigger_id = int(trigger_id)
            trigger_instance = Trigger.objects.get(id=trigger_id)
        except (ValueError, TypeError):
            return Response({"error": "Invalid trigger_id format"}, status=status.HTTP_400_BAD_REQUEST)
        except Trigger.DoesNotExist:
            return Response({"error": f"Trigger with id {trigger_id} not found"}, status=status.HTTP_404_NOT_FOUND)

        active_rules = WorkflowRule.objects.filter(trigger=trigger_instance, is_active=True)
        
        simulated_logs_created = []
        simulation_errors = []

        for rule in active_rules:
            log_data = {
                'workflow_rule_id': rule.id,
                'trigger_name_snapshot': trigger_instance.name,
                'action_name_snapshot': rule.action.name, # Assumes action is always present on a rule
            }
            current_time = timezone.now() # Requires: from django.utils import timezone

            if rule.rule_type == 'immediate':
                log_data['status'] = 'SIMULATED_IMMEDIATE'
                log_data['actual_execution_time'] = current_time
            elif rule.rule_type == 'scheduled':
                log_data['status'] = 'SIMULATED_SCHEDULED'
                if rule.delay_time and rule.delay_unit:
                    delta = timedelta()
                    if rule.delay_unit == 'minutes':
                        delta = timedelta(minutes=rule.delay_time)
                    elif rule.delay_unit == 'hours':
                        delta = timedelta(hours=rule.delay_time)
                    elif rule.delay_unit == 'days':
                        delta = timedelta(days=rule.delay_time)
                    log_data['scheduled_execution_time'] = current_time + delta
                else:
                    log_data['status'] = 'SIMULATION_ERROR'
                    log_data['details'] = f"Rule '{rule.name}' is scheduled but has invalid delay parameters."
                    simulation_errors.append(log_data)
                    continue # Skip creating this log as a success
            else:
                log_data['status'] = 'SIMULATION_ERROR'
                log_data['details'] = f"Rule '{rule.name}' has an unknown rule_type: {rule.rule_type}."
                simulation_errors.append(log_data)
                continue
            
            log_serializer = WorkflowExecutionLogSerializer(data=log_data) # Ensure this serializer is in scope
            if log_serializer.is_valid():
                log_instance = log_serializer.save()
                simulated_logs_created.append(WorkflowExecutionLogSerializer(log_instance).data)
            else:
                log_data['status'] = 'SIMULATION_ERROR' # Override status
                log_data['details'] = f"Error saving log for rule '{rule.name}': {json.dumps(log_serializer.errors)}"
                simulation_errors.append(log_data)

        response_data = {
            "trigger_simulated": trigger_instance.name,
            "rules_processed_count": active_rules.count(),
            "simulated_logs_created": simulated_logs_created,
            "simulation_errors": simulation_errors
        }
        return Response(response_data, status=status.HTTP_200_OK)

    # We will add a custom action here later for AI-powered rule creation
    # @action(detail=False, methods=['post'], url_path='generate-from-text')
    # def generate_from_text(self, request):
    #     natural_text = request.data.get('text')
    #     if not natural_text:
    #         return Response({"error": "No text provided"}, status=status.HTTP_400_BAD_REQUEST)
    #     
    #     # Placeholder for AI processing logic
    #     # 1. Parse text using OpenAI/Gemini to identify trigger, action, entities, schedule
    #     # 2. Map to your system's Triggers and Actions (e.g., find by name or use fuzzy matching)
    #     # 3. Construct a suggested rule structure (dictionary)
    #     
    #     suggested_rule = {
    #         "name": "Suggested: " + natural_text[:30],
    #         "description": natural_text,
    #         "trigger_id": None, # Replace with ID of matched Trigger
    #         "action_id": None,  # Replace with ID of matched Action
    #         "rule_type": "immediate", # or 'scheduled' based on parsing
    #         # ... other fields like delay_time, delay_unit
    #     }
    #     
    #     # You might want to return the suggested rule for confirmation, 
    #     # or even a serialized (but not saved) WorkflowRule instance.
    #     return Response(suggested_rule, status=status.HTTP_200_OK)

class WorkflowExecutionLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for viewing workflow execution logs.
    Allows only GET requests to list logs.
    """
    queryset = WorkflowExecutionLog.objects.all().order_by('-logged_at') # Default ordering
    serializer_class = WorkflowExecutionLogSerializer
    # http_method_names can be removed to default to read-only if ModelViewSet is changed to ReadOnlyModelViewSet
    # http_method_names = ['get', 'head', 'options'] # Explicitly make it read-only for listing
