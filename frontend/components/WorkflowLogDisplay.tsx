"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { format } from 'date-fns';

// Updated interface to match the new backend model
interface WorkflowRuleInfo {
  id: number | string;
  name: string;
}
interface WorkflowExecutionLog {
  id: number | string;
  workflow_rule: WorkflowRuleInfo; // Nested rule info
  status: string;
  trigger_name_snapshot: string;
  action_name_snapshot: string;
  logged_at: string; 
  scheduled_execution_time?: string | null;
  actual_execution_time?: string | null;
  details?: string | null;
}

export default function WorkflowLogDisplay() {
  const [logs, setLogs] = useState<WorkflowExecutionLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/workflow-logs/");
        if (!response.ok) {
          throw new Error(`Failed to fetch logs: ${response.status}`);
        }
        const data = await response.json();
        setLogs(data);
        if (isLoading) setIsLoading(false);
        if (error) setError(null);
      } catch (err) {
        console.error("Error fetching logs:", err);
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
        setError(errorMessage);
        if (logs.length === 0) {
            toast.error("Failed to load workflow execution logs.");
        }
      } 
    };

    fetchLogs();
    const intervalId = setInterval(fetchLogs, 10000);
    return () => clearInterval(intervalId);
  }, [isLoading, error, logs.length]);

  if (isLoading && logs.length === 0) {
    return <p className="text-center p-8">Loading workflow logs...</p>;
  }

  if (error && logs.length === 0) { 
    return <p className="text-center p-8 text-red-600">Error loading logs: {error}</p>;
  }

  const formatNullableDate = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "PPpp");
    } catch (e) {
      return "Invalid Date";
    }
  };

  return (
    <div className="w-full">
      {/* <h1 className="text-2xl font-semibold mb-6 text-center">Workflow Execution Logs</h1> Removed title for component use */}
      {error && logs.length > 0 && (
        <p className="text-center p-2 text-sm text-red-500">Error refreshing logs: {error}. Displaying last known data.</p>
      )}
      {logs.length === 0 && !isLoading && !error && (
        <p className="text-center text-muted-foreground">No workflow execution logs found.</p>
      )}
      {logs.length > 0 && (
        <Table className="suiteop-table">
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">Workflow Rule</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Trigger</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Scheduled For</TableHead>
              <TableHead className="text-right">Executed At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}><TableCell className="font-medium">{log.workflow_rule?.name || "N/A"}</TableCell><TableCell>{log.actual_execution_time ? "Executed" : "Scheduled"}</TableCell><TableCell>{log.trigger_name_snapshot}</TableCell><TableCell>{log.action_name_snapshot}</TableCell><TableCell className="max-w-[200px] truncate" title={log.details || undefined}>{log.details || "N/A"}</TableCell><TableCell>{formatNullableDate(log.scheduled_execution_time)}</TableCell><TableCell className="text-right">{formatNullableDate(log.actual_execution_time)}</TableCell></TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
} 