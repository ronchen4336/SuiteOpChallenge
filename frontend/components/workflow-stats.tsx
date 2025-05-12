"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Workflow, Zap, Clock, CheckCircle2 } from "lucide-react"
import { useState, useEffect } from "react"
import { isToday, parseISO } from 'date-fns'; // Import for date comparison

// Assuming WorkflowRuleFromAPI interface is defined elsewhere or we define a simpler one here
interface WorkflowRuleBasic {
  id: number | string;
  rule_type: 'immediate' | 'scheduled';
  is_active: boolean;
}

// Interface for individual execution logs (simplified for this component)
interface WorkflowExecutionLogStats {
  id: number | string;
  actual_execution_time?: string | null;
}

export default function WorkflowStats() {
  const [totalWorkflows, setTotalWorkflows] = useState(0);
  const [immediateActions, setImmediateActions] = useState(0);
  const [scheduledActions, setScheduledActions] = useState(0);
  const [executionsToday, setExecutionsToday] = useState(0); // State for executions today
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkflowData = async () => {
      // setError(null); // Reset error at the beginning of data fetching
      // setIsLoading(true); // Set loading true for the combined fetch operations

      try {
        // Fetch workflow rules for general stats
        const rulesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rules/`);
        if (!rulesResponse.ok) {
          throw new Error(`Failed to fetch workflow rules: ${rulesResponse.status}`);
        }
        const rulesData = await rulesResponse.json();
        const rules: WorkflowRuleBasic[] = rulesData.results || rulesData;

        setTotalWorkflows(rules.length);
        setImmediateActions(rules.filter(rule => rule.rule_type === 'immediate' && rule.is_active).length);
        setScheduledActions(rules.filter(rule => rule.rule_type === 'scheduled' && rule.is_active).length);

        // Fetch workflow execution logs for "Executions Today"
        const logsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/workflow-logs/`);
        if (!logsResponse.ok) {
          throw new Error(`Failed to fetch workflow logs: ${logsResponse.status}`);
        }
        const logsData = await logsResponse.json();
        // Assuming logsData might be paginated like rulesData, or could be a direct array
        const executionLogs: WorkflowExecutionLogStats[] = logsData.results || logsData; 
        
        const todayCount = executionLogs.filter(log => {
          if (log.actual_execution_time) {
            try {
              const executionDate = parseISO(log.actual_execution_time);
              return isToday(executionDate);
            } catch (e) {
              console.warn("Failed to parse execution date for log:", log.id, e);
              return false;
            }
          }
          return false;
        }).length;
        setExecutionsToday(todayCount);
        setError(null); // Clear any previous errors if all fetches succeed

      } catch (err) {
        console.error("Error fetching workflow stats or logs:", err);
        setError(err instanceof Error ? err.message : String(err));
        // Keep existing data on screen if new fetch fails, but show error
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkflowData();
    // Consider if a polling interval is needed here or if data is static enough
  }, []);

  const displayStats = [
    {
      title: "Active Workflows",
      value: totalWorkflows, // This is total, might need to sum immediate and scheduled for "active"
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
      value: executionsToday, // Updated to use state variable
      icon: CheckCircle2,
      description: "Successful workflow runs today", // Clarified description
    },
  ];

  if (isLoading) {
    return <p className="text-center p-4">Loading stats...</p>; 
  }

  if (error && totalWorkflows === 0 && executionsToday === 0) { // Only show full error if no data at all
    return <p className="text-center p-4 text-red-600">Error loading stats: {error}</p>;
  }
  
  // If there's an error but some data was loaded previously, show data with an error message
  // This UX can be refined based on preference.

  return (
    <>
      {error && <p className="text-center p-2 text-sm text-red-500 mb-2">Error refreshing stats: {error}. Displaying last known data.</p>}
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
    </>
  )
}
