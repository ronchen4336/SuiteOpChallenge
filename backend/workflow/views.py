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
from django.http import JsonResponse
from django.core.management import call_command
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

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

        preview_suggestions_for_frontend = []
        # ai_suggestions_list = [] # This will be populated from the AI call
        ai_global_errors = [] # To store errors reported by AI for the whole prompt

        try:
            ai_response_json_str = get_ai_suggestions_for_prompt(prompt_text)

            if ai_response_json_str is None:
                return Response({"error": "AI service failed to generate suggestions. Check server logs."},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            try:
                ai_data = json.loads(ai_response_json_str)
            except json.JSONDecodeError as je:
                print(f"Error: AI response was not valid JSON: {je}")
                print(f"AI Response String: {ai_response_json_str}")
                return Response({"error": "AI response was not in the expected JSON format."},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            raw_ai_suggestions = ai_data.get("suggested_workflows", [])
            ai_global_errors = ai_data.get("errors", []) # Capture global errors if AI returns them

            if not raw_ai_suggestions and not ai_global_errors:
                return Response({
                    "preview_workflows": [],
                    "ai_reported_errors": [],
                    "message": "AI could not suggest any workflows or the prompt was too vague."
                }, status=status.HTTP_200_OK)

            for raw_suggestion in raw_ai_suggestions:
                mapped_suggestion_data = {
                    'workflow_name': raw_suggestion.get('workflow_name', 'AI Suggested Workflow'),
                    'workflow_description': raw_suggestion.get('workflow_description', ''),
                    'rule_type': raw_suggestion.get('rule_type'),
                    'delay_time': None,
                    'delay_unit': None,
                    'trigger_id': None,
                    'trigger_name': None, # Will be populated if found
                    'action_id': None,
                    'action_name': None,  # Will be populated if found
                    'is_active': True # Default to true, user can change on frontend
                }
                mapping_notes = []

                # Map Trigger
                ai_trigger_name = raw_suggestion.get('trigger_name')
                if ai_trigger_name:
                    trigger_instance = Trigger.objects.filter(name__iexact=ai_trigger_name).first()
                    if trigger_instance:
                        mapped_suggestion_data['trigger_id'] = trigger_instance.id
                        mapped_suggestion_data['trigger_name'] = trigger_instance.name # Use actual DB name
                    else:
                        mapping_notes.append(f"AI suggested trigger '{ai_trigger_name}' which was not found. Please select a trigger.")
                else:
                    mapping_notes.append("AI did not suggest a trigger. Please select one.")

                # Map Action
                ai_action_name = raw_suggestion.get('action_name')
                if ai_action_name:
                    action_instance = Action.objects.filter(name__iexact=ai_action_name).first()
                    if action_instance:
                        mapped_suggestion_data['action_id'] = action_instance.id
                        mapped_suggestion_data['action_name'] = action_instance.name # Use actual DB name
                    else:
                        mapping_notes.append(f"AI suggested action '{ai_action_name}' which was not found. Please select an action.")
                else:
                    mapping_notes.append("AI did not suggest an action. Please select one.")

                # Process delay if rule_type is 'scheduled'
                if mapped_suggestion_data['rule_type'] == 'scheduled':
                    delay_time_raw = raw_suggestion.get('delay_time')
                    delay_unit_raw = raw_suggestion.get('delay_unit')

                    if delay_time_raw is not None:
                        try:
                            parsed_delay_time = int(float(delay_time_raw)) # AI might send float
                            if parsed_delay_time > 0:
                                mapped_suggestion_data['delay_time'] = parsed_delay_time
                            else:
                                mapping_notes.append(f"AI suggested non-positive delay_time '{delay_time_raw}'. Please enter a positive number.")
                        except (ValueError, TypeError):
                            mapping_notes.append(f"AI suggested invalid delay_time format '{delay_time_raw}'. Please enter a number.")
                    else:
                        mapping_notes.append("Scheduled rule type chosen by AI, but no delay_time provided. Please specify.")
                    
                    if delay_unit_raw and delay_unit_raw in [choice[0] for choice in WorkflowRule.DELAY_UNIT_CHOICES]:
                        mapped_suggestion_data['delay_unit'] = delay_unit_raw
                    elif delay_unit_raw: # It was provided but invalid
                        mapping_notes.append(f"AI suggested invalid delay_unit '{delay_unit_raw}'. Please select a valid unit.")
                    else: # Not provided for scheduled
                         mapping_notes.append("Scheduled rule type chosen by AI, but no delay_unit provided. Please specify.")
                elif mapped_suggestion_data['rule_type'] == 'immediate':
                    mapped_suggestion_data['delay_time'] = None
                    mapped_suggestion_data['delay_unit'] = None
                else: # Invalid rule_type
                    mapping_notes.append(f"AI suggested an invalid rule_type: '{mapped_suggestion_data['rule_type']}'. Please select 'immediate' or 'scheduled'.")
                    mapped_suggestion_data['rule_type'] = None # Nullify if invalid

                preview_suggestions_for_frontend.append({
                    "original_ai_suggestion": raw_suggestion,
                    "mapped_suggestion": mapped_suggestion_data,
                    "mapping_notes": mapping_notes
                })
            
            final_response_message = f"AI returned {len(raw_ai_suggestions)} suggestion(s)."
            if ai_global_errors:
                final_response_message += f" AI also reported {len(ai_global_errors)} global issue(s)."
            
            return Response({
                "preview_workflows": preview_suggestions_for_frontend,
                "ai_reported_errors": ai_global_errors,
                "message": final_response_message
            }, status=status.HTTP_200_OK)

        except Exception as e:
            import traceback
            print(f"General error in AI workflow generation process: {str(e)}")
            print(f"Traceback: {traceback.format_exc()}")
            return Response({"error": f"An unexpected error occurred on the server while processing AI suggestions: {str(e)}"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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

@csrf_exempt # For simplicity; production should use proper auth
@require_POST # Ensure this endpoint is called via POST by Cloud Scheduler
def run_scheduled_tasks_view(request):
    """
    An HTTP endpoint to trigger the process_scheduled_workflows command.
    Cloud Scheduler will call this endpoint.
    """
    try:
        # It's good practice to capture the output if needed, though call_command prints to stdout/stderr
        # from io import StringIO
        # out = StringIO()
        # call_command('process_scheduled_workflows', stdout=out, stderr=out)
        # command_output = out.getvalue()
        
        call_command('process_scheduled_workflows')
        
        return JsonResponse({"status": "success", "message": "Scheduled tasks processing command triggered."})
    except Exception as e:
        # Log the exception e
        return JsonResponse({"status": "error", "message": str(e)}, status=500)

class WorkflowExecutionLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for viewing workflow execution logs.
    Allows only GET requests to list logs.
    """
    queryset = WorkflowExecutionLog.objects.all().order_by('-logged_at') # Default ordering
    serializer_class = WorkflowExecutionLogSerializer
    # http_method_names can be removed to default to read-only if ModelViewSet is changed to ReadOnlyModelViewSet
    # http_method_names = ['get', 'head', 'options'] # Explicitly make it read-only for listing
