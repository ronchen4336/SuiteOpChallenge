from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TriggerViewSet, 
    ActionViewSet, 
    WorkflowRuleViewSet, 
    WorkflowExecutionLogViewSet,
    run_scheduled_tasks_view
)

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'triggers', TriggerViewSet, basename='trigger')
router.register(r'actions', ActionViewSet, basename='action')
router.register(r'rules', WorkflowRuleViewSet, basename='workflowrule')
router.register(r'workflow-logs', WorkflowExecutionLogViewSet, basename='workflowexecutionlog')

# The API URLs are now determined automatically by the router.
urlpatterns = [
    path('', include(router.urls)),
    # URL for Cloud Scheduler to call
    path('tasks/process-scheduled/', run_scheduled_tasks_view, name='process-scheduled-tasks'),
] 