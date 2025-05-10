import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock } from "lucide-react"

// Mock execution history data - in a real app this would come from an API
const generateMockExecutions = (workflowId: string) => {
  const statuses = ["success", "failed", "pending"]
  const triggers = ["Guest checks in", "Guest checks out", "Maintenance issue reported"]
  const dates = [
    "2023-10-15T09:23:11",
    "2023-10-14T14:45:22",
    "2023-10-14T08:12:05",
    "2023-10-13T16:34:18",
    "2023-10-12T11:56:32",
    "2023-10-11T15:22:47",
    "2023-10-10T09:11:03",
  ]

  return dates.map((date, index) => {
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    return {
      id: `exec-${workflowId}-${index}`,
      workflowId,
      timestamp: date,
      trigger: triggers[Math.floor(Math.random() * triggers.length)],
      status,
      duration: status === "pending" ? null : `${Math.floor(Math.random() * 5000)}ms`,
      details: status === "failed" ? "Connection timeout" : null,
    }
  })
}

interface WorkflowExecutionHistoryProps {
  workflowId: string
}

export default function WorkflowExecutionHistory({ workflowId }: WorkflowExecutionHistoryProps) {
  const executions = generateMockExecutions(workflowId)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Execution History</CardTitle>
        <CardDescription>Recent workflow executions and their results</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {executions.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No execution history available</p>
          ) : (
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="py-3 px-4 text-left font-medium">Date & Time</th>
                    <th className="py-3 px-4 text-left font-medium">Trigger</th>
                    <th className="py-3 px-4 text-left font-medium">Status</th>
                    <th className="py-3 px-4 text-left font-medium">Duration</th>
                    <th className="py-3 px-4 text-left font-medium">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {executions.map((execution) => (
                    <tr key={execution.id} className="border-b">
                      <td className="py-3 px-4">{new Date(execution.timestamp).toLocaleString()}</td>
                      <td className="py-3 px-4">{execution.trigger}</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            execution.status === "success"
                              ? "success"
                              : execution.status === "failed"
                                ? "destructive"
                                : "outline"
                          }
                        >
                          {execution.status === "success" && <CheckCircle className="mr-1 h-3 w-3" />}
                          {execution.status === "failed" && <XCircle className="mr-1 h-3 w-3" />}
                          {execution.status === "pending" && <Clock className="mr-1 h-3 w-3" />}
                          {execution.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">{execution.duration || "-"}</td>
                      <td className="py-3 px-4 text-muted-foreground">{execution.details || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
