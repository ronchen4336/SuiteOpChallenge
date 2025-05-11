"use client";

import WorkflowLogDisplay from "@/components/WorkflowLogDisplay";

export default function WorkflowLogsPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Workflow Execution Logs</h1>
      <WorkflowLogDisplay />
    </main>
  );
} 