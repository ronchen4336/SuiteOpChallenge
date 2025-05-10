"use client";

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Pencil, Trash2, Zap, Clock, Mail, MessageSquare, Bell, CheckSquare, Power, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

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
  // We will add filterTriggerId?: string | null;
  // and filterActionId?: string | null; later
}

export default function WorkflowList({ filterActive }: WorkflowListProps) {
  const [allFetchedWorkflows, setAllFetchedWorkflows] = useState<WorkflowRuleFromAPI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Client-side filtering for now
  const filteredWorkflows = allFetchedWorkflows.filter(workflow => {
    if (filterActive !== undefined && workflow.is_active !== filterActive) {
      return false;
    }
    // Add more filters here for triggerId, actionId when passed as props
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
                      {/* TODO: Make Switch interactive - will require a mutation function */}
                      <Switch checked={workflow.is_active} disabled /> 
                      <span className="text-sm">{workflow.is_active ? "Active" : "Inactive"}</span>
                    </div>
                    <Link href={`/workflows/edit/${workflow.id}`}> {/* TODO: Edit page needs to be created */}
                      <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    {/* TODO: Delete functionality - will require a mutation function */}
                    <Button variant="ghost" size="icon" disabled>
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
    </div>
  )
}
