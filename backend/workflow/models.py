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
