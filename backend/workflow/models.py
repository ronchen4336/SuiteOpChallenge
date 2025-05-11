from django.db import models

# Create your models here.

class Trigger(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class Action(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class WorkflowRule(models.Model):
    RULE_TYPE_CHOICES = [
        ('immediate', 'Immediate'),
        ('scheduled', 'Scheduled'),
    ]
    DELAY_UNIT_CHOICES = [
        ('minutes', 'Minutes'),
        ('hours', 'Hours'),
        ('days', 'Days'),
    ]

    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    trigger = models.ForeignKey(Trigger, on_delete=models.CASCADE, related_name='rules')
    action = models.ForeignKey(Action, on_delete=models.CASCADE, related_name='rules')
    
    rule_type = models.CharField(max_length=20, choices=RULE_TYPE_CHOICES, default='immediate')
    delay_time = models.IntegerField(blank=True, null=True)
    delay_unit = models.CharField(max_length=20, choices=DELAY_UNIT_CHOICES, blank=True, null=True)
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['-created_at']

class WorkflowExecutionLog(models.Model):
    STATUS_CHOICES = [
        ('SIMULATED_IMMEDIATE', 'Simulated Immediate Execution'),
        ('SIMULATED_SCHEDULED', 'Simulated Scheduled for Later'),
        ('SIMULATION_ERROR', 'Error During Simulation'),
        # Future statuses for real execution:
        # ('PENDING', 'Pending Scheduled Execution'),
        # ('EXECUTED', 'Executed via Scheduler'),
        # ('ERROR', 'Error During Execution'),
    ]

    workflow_rule = models.ForeignKey(WorkflowRule, on_delete=models.CASCADE, related_name='execution_logs')
    status = models.CharField(max_length=30, choices=STATUS_CHOICES)
    
    trigger_name_snapshot = models.CharField(max_length=100)
    action_name_snapshot = models.CharField(max_length=100)
    
    logged_at = models.DateTimeField(auto_now_add=True) # When this log entry was created
    # For SIMULATED_SCHEDULED, this is when it *would* run:
    scheduled_execution_time = models.DateTimeField(null=True, blank=True) 
    # For SIMULATED_IMMEDIATE, this is effectively now (can be same as logged_at or set explicitly):
    actual_execution_time = models.DateTimeField(null=True, blank=True) 
    
    details = models.TextField(blank=True, null=True) # For error messages or other info

    def __str__(self):
        return f"Log for '{self.workflow_rule.name}': {self.status} at {self.logged_at.strftime('%Y-%m-%d %H:%M:%S')}"

    class Meta:
        ordering = ['-logged_at']
