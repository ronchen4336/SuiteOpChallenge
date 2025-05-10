from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Trigger, Action, WorkflowRule
from .serializers import TriggerSerializer, ActionSerializer, WorkflowRuleSerializer
# We will need OpenAI or Gemini client later
# import openai 

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
