from rest_framework import serializers
from .models import Trigger, Action, WorkflowRule

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
            'created_at', 'updated_at'
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