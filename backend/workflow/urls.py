from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TriggerViewSet, ActionViewSet, WorkflowRuleViewSet

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'triggers', TriggerViewSet, basename='trigger')
router.register(r'actions', ActionViewSet, basename='action')
router.register(r'rules', WorkflowRuleViewSet, basename='workflowrule')

# The API URLs are now determined automatically by the router.
urlpatterns = [
    path('', include(router.urls)),
] 