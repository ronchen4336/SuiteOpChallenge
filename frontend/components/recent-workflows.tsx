"use client";

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, PlayCircle, PauseCircle, ArrowRight, Zap, Clock } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

// Interface for the structure of a fetched workflow rule from our API
interface WorkflowRuleFromAPI {
  id: number | string;
  name: string;
  description?: string;
  trigger: { id: number | string; name: string; description?: string }; // Nested trigger object
  action: { id: number | string; name: string; description?: string };  // Nested action object
  rule_type: 'immediate' | 'scheduled';
  delay_time?: number | null;
  delay_unit?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  // lastRun: string; // lastRun is not in our API model yet, can be added later if needed
}

export default function RecentWorkflows() {
  const [workflows, setWorkflows] = useState<WorkflowRuleFromAPI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkflows = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Assuming your backend is running on port 8000
        const response = await fetch('http://127.0.0.1:8000/api/rules/');
        if (!response.ok) {
          throw new Error(`Failed to fetch workflows: ${response.status}`);
        }
        const data = await response.json();
        setWorkflows(data.results || data); // Handle paginated or direct list response
      } catch (err) {
        console.error("Error fetching workflows:", err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkflows();
  }, []);

  if (isLoading) {
    return <p className="text-center p-8">Loading recent workflows...</p>;
  }

  if (error) {
    return <p className="text-center p-8 text-red-600">Error: {error}</p>;
  }

  if (workflows.length === 0) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold mb-4">No Workflows Yet</h2>
        <p className="text-muted-foreground mb-6">
          Get started by creating your first automation!
        </p>
        <Link href="/create">
          <Button className="suiteop-button gap-2">
            <Zap className="h-5 w-5" /> Create Workflow
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold">Recent Workflows</h2>
        <Link href="/workflows">
          <Button variant="outline" className="rounded-full gap-2">
            View All
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="space-y-6">
        {/* Display only a few, e.g., the first 3, or implement pagination later */}
        {workflows.slice(0, 3).map((workflow) => (
          <Card key={workflow.id} className="suiteop-card overflow-hidden workflow-card">
            <div className="flex flex-col md:flex-row">
              <div className="flex-1 p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="font-semibold text-xl mb-1">{workflow.name}</h3>
                    <p className="text-muted-foreground">{workflow.description || "No description"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={workflow.is_active ? "default" : "outline"}
                      className={workflow.is_active ? "bg-primary hover:bg-primary/90" : ""}
                    >
                      {workflow.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <Badge
                      variant={workflow.rule_type === "immediate" ? "secondary" : "outline"}
                      className="bg-primary-100 text-primary border-primary-200 hover:bg-primary-200"
                    >
                      {workflow.rule_type === "immediate" ? "Immediate" : "Scheduled"}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="gradient-border">
                    <div className="bg-primary-50 p-4 rounded-2xl">
                      <h4 className="text-sm font-medium mb-2 text-primary">Trigger</h4>
                      <div className="flex items-center gap-2">
                        <div className="bg-white p-2 rounded-full shadow-sm">
                          <div className="bg-primary-100 p-1 rounded-full">
                            {/* This icon logic might need adjustment based on actual trigger type if available */}
                            {workflow.rule_type === "immediate" ? (
                              <Zap className="h-4 w-4 text-primary" />
                            ) : (
                              <Clock className="h-4 w-4 text-primary" />
                            )}
                          </div>
                        </div>
                        <p className="font-medium">{workflow.trigger.name}</p>
                      </div>
                    </div>
                  </div>

                  <div className="gradient-border">
                    <div className="bg-primary-50 p-4 rounded-2xl">
                      <h4 className="text-sm font-medium mb-2 text-primary">Action</h4>
                      <div className="flex items-center gap-2">
                        <div className="bg-white p-2 rounded-full shadow-sm">
                          <div className="bg-primary-100 p-1 rounded-full">
                            <ArrowRight className="h-4 w-4 text-primary" />
                          </div>
                        </div>
                        <p className="font-medium">{workflow.action.name}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 mt-6">
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    {workflow.is_active ? <PauseCircle className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {/* The 'lastRun' section is removed as it's not in the API data yet */}
              {/* <div className="bg-primary-100 p-6 md:w-48 flex flex-col justify-center items-center">
                <p className="text-xs text-muted-foreground mb-1">Last executed</p>
                <p className="text-lg font-medium">{workflow.lastRun}</p>
              </div> */}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
