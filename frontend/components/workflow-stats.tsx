"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Workflow, Zap, Clock, CheckCircle2 } from "lucide-react"
import { useState, useEffect } from "react"

// Assuming WorkflowRuleFromAPI interface is defined elsewhere or we define a simpler one here
interface WorkflowRuleBasic {
  id: number | string;
  rule_type: 'immediate' | 'scheduled';
  is_active: boolean;
  // Add other fields if needed for more detailed stats, e.g., last_executed_today
}

export default function WorkflowStats() {
  const [totalWorkflows, setTotalWorkflows] = useState(0);
  const [immediateActions, setImmediateActions] = useState(0);
  const [scheduledActions, setScheduledActions] = useState(0);
  // const [executionsToday, setExecutionsToday] = useState(0); // This needs actual execution logs
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkflowData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('http://127.0.0.1:8000/api/rules/');
        if (!response.ok) {
          throw new Error(`Failed to fetch workflow stats: ${response.status}`);
        }
        const data = await response.json();
        const rules: WorkflowRuleBasic[] = data.results || data;

        setTotalWorkflows(rules.length);
        setImmediateActions(rules.filter(rule => rule.rule_type === 'immediate' && rule.is_active).length);
        setScheduledActions(rules.filter(rule => rule.rule_type === 'scheduled' && rule.is_active).length);
        // setExecutionsToday would require a different API endpoint or processing logs

      } catch (err) {
        console.error("Error fetching workflow stats:", err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkflowData();
  }, []);

  const displayStats = [
    {
      title: "Active Workflows", // Changed from Total to Active for clarity
      value: totalWorkflows, // This is total, but description implies active
      icon: Workflow,
      description: "Currently enabled automations",
    },
    {
      title: "Immediate Actions",
      value: immediateActions,
      icon: Zap,
      description: "Active instant response workflows",
    },
    {
      title: "Scheduled Actions",
      value: scheduledActions,
      icon: Clock,
      description: "Active time-delayed workflows",
    },
    {
      title: "Executions Today",
      value: "N/A", // Placeholder as we don't have this data yet
      icon: CheckCircle2,
      description: "Successful workflow runs",
    },
  ];

  if (isLoading) {
    // Optional: render placeholder cards or a single loading message
    return <p className="text-center p-4">Loading stats...</p>; 
  }

  if (error) {
    return <p className="text-center p-4 text-red-600">Error loading stats: {error}</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {displayStats.map((stat, index) => (
        <Card key={index} className="suiteop-card stats-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <div className="bg-primary-100 p-2 rounded-full">
              <stat.icon className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{String(stat.value)}</div>
            <p className="text-sm text-muted-foreground mt-1">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
