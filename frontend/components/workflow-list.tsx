"use client";

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Pencil, Trash2, Zap, Clock, Mail, MessageSquare, Bell, CheckSquare, Power, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Interface for fetched workflow rules (consistent with RecentWorkflows)
interface WorkflowRuleFromAPI {
  id: number | string;
  name: string;
  description?: string;
  trigger: { id: number | string; name: string; description?: string };
  action: { id: number | string; name: string; description?: string };
  rule_type: 'immediate' | 'scheduled';
  delay_time?: number | null;
  delay_unit?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  // Properties not yet in API: actionIcon, lastRun, executionCount
}

interface WorkflowListProps {
  filterActive?: boolean;
  searchTerm?: string;
  filterType?: string; // 'all', 'immediate', 'scheduled'
  filterTrigger?: string; // 'all', or specific trigger name/id
}

export default function WorkflowList({ filterActive, searchTerm, filterType, filterTrigger }: WorkflowListProps) {
  const [allFetchedWorkflows, setAllFetchedWorkflows] = useState<WorkflowRuleFromAPI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workflowToDelete, setWorkflowToDelete] = useState<{id: string | number, name: string} | null>(null);

  useEffect(() => {
    const fetchAllWorkflows = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('http://127.0.0.1:8000/api/rules/');
        if (!response.ok) {
          throw new Error(`Failed to fetch workflows: ${response.status}`);
        }
        const data = await response.json();
        setAllFetchedWorkflows(data.results || data); // Handle paginated or direct list
      } catch (err) {
        console.error("Error fetching all workflows:", err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllWorkflows();
  }, []);

  const handleToggleActive = async (workflowId: number | string, newStatus: boolean) => {
    const originalWorkflows = [...allFetchedWorkflows];
    // Optimistic update
    setAllFetchedWorkflows(prevWorkflows => 
      prevWorkflows.map(wf => 
        wf.id === workflowId ? { ...wf, is_active: newStatus } : wf
      )
    );

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/rules/${workflowId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "An unknown error occurred." }));
        throw new Error(errorData.detail || `Failed to update status: ${response.statusText}`);
      }

      const updatedWorkflow = await response.json();
      // Optionally, update state again with server response if there are other computed fields
      setAllFetchedWorkflows(prevWorkflows => 
        prevWorkflows.map(wf => 
          wf.id === workflowId ? { ...wf, ...updatedWorkflow } : wf // Ensure all fields are updated from server
        )
      );
      toast.success(`Workflow "${updatedWorkflow.name}" ${newStatus ? 'activated' : 'deactivated'}.`);

    } catch (err) {
      // Revert optimistic update on error
      setAllFetchedWorkflows(originalWorkflows);
      const errorMessage = err instanceof Error ? err.message : String(err);
      toast.error(`Failed to update workflow: ${errorMessage}`);
      console.error("Error toggling workflow status:", err);
    }
  };

  const handleDeleteWorkflow = async (workflowId: number | string, workflowName: string) => {
    const originalWorkflows = [...allFetchedWorkflows];
    // Optimistic update: remove workflow from list immediately
    setAllFetchedWorkflows(prevWorkflows => prevWorkflows.filter(wf => wf.id !== workflowId));

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/rules/${workflowId}/`, {
        method: 'DELETE',
      });

      if (!response.ok) { // Status 204 No Content is also OK for DELETE
        if (response.status === 204) {
          toast.success(`Workflow "${workflowName}" deleted successfully.`);
          // No need to re-filter or re-set state if optimistic update was done correctly
          return; 
        }
        const errorData = await response.json().catch(() => ({ detail: "An unknown error occurred." }));
        throw new Error(errorData.detail || `Failed to delete workflow: ${response.statusText}`);
      }
      // If API returns 200 OK with content (though typical for DELETE is 204 No Content)
      toast.success(`Workflow "${workflowName}" deleted successfully.`);

    } catch (err) {
      // Revert optimistic update on error
      setAllFetchedWorkflows(originalWorkflows);
      const errorMessage = err instanceof Error ? err.message : String(err);
      toast.error(`Failed to delete workflow: ${errorMessage}`);
      console.error("Error deleting workflow:", err);
    }
  };

  // Client-side filtering
  const filteredWorkflows = allFetchedWorkflows.filter(workflow => {
    if (filterActive !== undefined && workflow.is_active !== filterActive) {
      return false;
    }

    // Filter by search term (name or description)
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      const inName = workflow.name.toLowerCase().includes(lowerSearchTerm);
      const inDescription = workflow.description?.toLowerCase().includes(lowerSearchTerm) || false;
      if (!inName && !inDescription) {
        return false;
      }
    }

    // Filter by workflow type
    if (filterType && filterType !== "all" && workflow.rule_type !== filterType) {
      return false;
    }

    // Filter by trigger name (adjust if using IDs later)
    // For simplicity, assuming filterTrigger holds the trigger name if not 'all'
    if (filterTrigger && filterTrigger !== "all") {
      if (!workflow.trigger.name.toLowerCase().includes(filterTrigger.toLowerCase())) {
        // This might need to be more robust if trigger names aren't unique or if you pass IDs
        // For now, it's a case-insensitive substring match with the trigger name.
        // If filterTrigger is an ID, you'd compare workflow.trigger.id instead.
        return false;
      }
    }

    return true;
  });

  if (isLoading) {
    return <p className="text-center py-12">Loading workflows...</p>;
  }

  if (error) {
    return <p className="text-center py-12 text-red-600">Error: {error}</p>;
  }

  if (filteredWorkflows.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No workflows match your current filters.</p>
      </div>
    );
  }
  
  // Helper to get an icon based on action name (very basic)
  const getActionIcon = (actionName: string) => {
    if (actionName.toLowerCase().includes('email')) return Mail;
    if (actionName.toLowerCase().includes('slack') || actionName.toLowerCase().includes('notification')) return MessageSquare;
    if (actionName.toLowerCase().includes('task')) return CheckSquare;
    if (actionName.toLowerCase().includes('device')) return Power;
    return AlertTriangle; // Default icon
  };

  return (
    <div className="space-y-4">
      {filteredWorkflows.map((workflow) => {
        const ActionIcon = getActionIcon(workflow.action.name);
        return (
          <Card key={workflow.id} className="overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="flex-1 p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-2">
                  <div className="flex flex-col md:flex-row md:items-center gap-2">
                    <h3 className="font-semibold text-lg">{workflow.name}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant={workflow.rule_type === "immediate" ? "secondary" : "outline"}>
                        {workflow.rule_type === "immediate" ? (
                          <>
                            <Zap className="mr-1 h-3 w-3" /> Immediate
                          </>
                        ) : (
                          <>
                            <Clock className="mr-1 h-3 w-3" /> Scheduled
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={workflow.is_active} 
                        onCheckedChange={(newStatus) => handleToggleActive(workflow.id, newStatus)}
                      /> 
                      <span className="text-sm">{workflow.is_active ? "Active" : "Inactive"}</span>
                    </div>
                    <Link href={`/workflows/edit/${workflow.id}`}> {/* TODO: Edit page needs to be created */}
                      <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setWorkflowToDelete({ id: workflow.id, name: workflow.name })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>

                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{workflow.description || "No description provided."}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Trigger</h4>
                    <p className="text-sm">{workflow.trigger.name}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Action</h4>
                    <div className="flex items-center gap-1">
                      <ActionIcon className="h-4 w-4" />
                      <p className="text-sm">{workflow.action.name}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Executions</h4>
                    <p className="text-sm">N/A</p> {/* Placeholder */}
                  </div>
                </div>
              </div>
              <div className="bg-muted p-6 md:w-48 flex flex-col justify-center items-center">
                <p className="text-xs text-muted-foreground mb-1">Last executed</p>
                <p className="text-sm font-medium">N/A</p> {/* Placeholder */}
              </div>
            </div>
          </Card>
        );
      })}

      {workflowToDelete && (
        <AlertDialog open={!!workflowToDelete} onOpenChange={(isOpen) => !isOpen && setWorkflowToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the workflow
                named "<strong>{workflowToDelete.name}</strong>".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setWorkflowToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => {
                  handleDeleteWorkflow(workflowToDelete.id, workflowToDelete.name);
                  setWorkflowToDelete(null);
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                Yes, delete workflow
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}
