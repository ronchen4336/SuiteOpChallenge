# Generated by Django 5.0.14 on 2025-05-10 23:08

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("workflow", "0002_seed_initial_data"),
    ]

    operations = [
        migrations.CreateModel(
            name="WorkflowExecutionLog",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("SIMULATED_IMMEDIATE", "Simulated Immediate Execution"),
                            ("SIMULATED_SCHEDULED", "Simulated Scheduled for Later"),
                            ("SIMULATION_ERROR", "Error During Simulation"),
                        ],
                        max_length=30,
                    ),
                ),
                ("trigger_name_snapshot", models.CharField(max_length=100)),
                ("action_name_snapshot", models.CharField(max_length=100)),
                ("logged_at", models.DateTimeField(auto_now_add=True)),
                (
                    "scheduled_execution_time",
                    models.DateTimeField(blank=True, null=True),
                ),
                ("actual_execution_time", models.DateTimeField(blank=True, null=True)),
                ("details", models.TextField(blank=True, null=True)),
                (
                    "workflow_rule",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="execution_logs",
                        to="workflow.workflowrule",
                    ),
                ),
            ],
            options={
                "ordering": ["-logged_at"],
            },
        ),
    ]
