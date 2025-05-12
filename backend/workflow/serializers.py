from rest_framework import serializers
from .models import Trigger, Action, WorkflowRule, WorkflowExecutionLog

class TriggerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trigger
        fields = '__all__'

class ActionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Action
        fields = '__all__'

class WorkflowRuleSerializer(serializers.ModelSerializer):
    trigger = TriggerSerializer(read_only=True) 
    action = ActionSerializer(read_only=True)  
    trigger_id = serializers.PrimaryKeyRelatedField(
        queryset=Trigger.objects.all(), source='trigger', write_only=True
    )
    action_id = serializers.PrimaryKeyRelatedField(
        queryset=Action.objects.all(), source='action', write_only=True
    )

    class Meta:
        model = WorkflowRule
        fields = [
            'id', 'name', 'description', 'trigger', 'action', 
            'rule_type', 'delay_time', 'delay_unit', 'is_active',
            'trigger_id', 'action_id',
            'created_at', 'updated_at',
            # 'execution_logs' # Add if Log Serializer is defined above this or imported
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, data):
        rule_type = data.get('rule_type')
        delay_time = data.get('delay_time')
        delay_unit = data.get('delay_unit')

        if rule_type == 'scheduled':
            if delay_time is None or delay_unit is None:
                raise serializers.ValidationError(
                    "For scheduled rules, delay_time and delay_unit are required."
                )
            if delay_time <= 0:
                raise serializers.ValidationError("Delay time must be a positive integer.")
        elif rule_type == 'immediate':
            if delay_time is not None or delay_unit is not None:
                data['delay_time'] = None
                data['delay_unit'] = None
        return data 

class WorkflowRuleNameSerializer(serializers.ModelSerializer):
    """A light serializer for just the workflow rule name and ID."""
    class Meta:
        model = WorkflowRule
        fields = ['id', 'name']

class WorkflowExecutionLogSerializer(serializers.ModelSerializer):
    workflow_rule = WorkflowRuleNameSerializer(read_only=True) # Use the lighter serializer
    workflow_rule_id = serializers.PrimaryKeyRelatedField(
        queryset=WorkflowRule.objects.all(), source='workflow_rule', write_only=True
    )

    class Meta:
        model = WorkflowExecutionLog
        fields = [
            'id', 'workflow_rule', 'workflow_rule_id',
            'status', 
            'trigger_name_snapshot', 'action_name_snapshot',
            'logged_at', 'scheduled_execution_time', 'actual_execution_time', 'details'
        ]
        read_only_fields = ['id', 'logged_at', 'workflow_rule'] 
        # workflow_rule is read_only because it's populated by workflow_rule_id on write,
        # and workflow_rule_id itself is write_only=True in its declaration. 