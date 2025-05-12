from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone
from workflow.models import WorkflowExecutionLog
import logging

# Get an instance of a logger
logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Processes due scheduled workflow tasks'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS(f"[{timezone.now()}] Starting to process scheduled workflows..."))
        
        due_logs = WorkflowExecutionLog.objects.filter(
            status='SIMULATED_SCHEDULED',
            scheduled_execution_time__lte=timezone.now()
        )
        
        processed_count = 0
        error_count = 0
        
        if not due_logs.exists():
            self.stdout.write(self.style.NOTICE("No due scheduled workflows to process at this time."))
            return

        for log in due_logs:
            try:
                log.status = 'PROCESSING'
                log.save()
                
                # --- Placeholder for Actual Action Execution ---
                # Here you would implement the logic to actually execute log.action_name_snapshot
                # For example, if log.action_name_snapshot == "Create Task":
                #   create_the_task(log.workflow_rule.action.details_or_config) 
                # elif log.action_name_snapshot == "Send Email":
                #   send_the_email(log.workflow_rule.action.details_or_config)
                
                self.stdout.write(self.style.SUCCESS(f"  Simulating execution of action: '{log.action_name_snapshot}' for workflow rule: '{log.workflow_rule.name}' (Log ID: {log.id})"))
                # --- End Placeholder ---

                log.actual_execution_time = timezone.now()
                log.status = 'EXECUTED'
                log.details = f"Successfully processed by scheduler at {log.actual_execution_time}."
                log.save()
                processed_count += 1
                self.stdout.write(self.style.SUCCESS(f"  Successfully processed Log ID: {log.id}"))

            except Exception as e:
                logger.error(f"Error processing WorkflowExecutionLog ID {log.id} for rule '{log.workflow_rule.name}': {str(e)}", exc_info=True)
                error_count += 1
                try:
                    log.status = 'EXECUTION_ERROR'
                    log.details = f"Error during scheduled execution: {str(e)}"
                    # actual_execution_time might still be set to now to indicate when the error occurred during processing attempt
                    log.actual_execution_time = timezone.now() 
                    log.save()
                    self.stdout.write(self.style.ERROR(f"  Error processing Log ID: {log.id}. Marked as EXECUTION_ERROR."))
                except Exception as e_save:
                    # If saving the error state itself fails, log that too.
                    logger.error(f"Critical: Failed to save EXECUTION_ERROR status for Log ID {log.id}: {str(e_save)}", exc_info=True)


        summary_style = self.style.SUCCESS if error_count == 0 else self.style.WARNING
        self.stdout.write(summary_style(
            f"Finished processing. Processed: {processed_count}, Errors: {error_count}"
        )) 