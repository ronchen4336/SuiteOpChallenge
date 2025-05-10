import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Pencil, Trash2, Zap, Clock, Mail, MessageSquare, Bell, CheckSquare, Power } from "lucide-react"
import Link from "next/link"

// Mock data - in a real app this would come from an API or state
const allWorkflows = [
  {
    id: "wf-1",
    name: "Guest Check-in Email",
    description: "Send welcome email when guest checks in",
    trigger: "Guest checks in",
    action: "Send Email",
    actionIcon: Mail,
    type: "immediate",
    active: true,
    lastRun: "2 hours ago",
    executionCount: 42,
  },
  {
    id: "wf-2",
    name: "Cleaning Reminder",
    description: "Send notification to cleaning staff after checkout",
    trigger: "Guest checks out",
    action: "Send Slack Notification",
    actionIcon: MessageSquare,
    type: "scheduled",
    active: true,
    lastRun: "1 day ago",
    executionCount: 128,
  },
  {
    id: "wf-3",
    name: "Maintenance Follow-up",
    description: "Create task for maintenance team when issue reported",
    trigger: "Maintenance issue reported",
    action: "Create Task",
    actionIcon: CheckSquare,
    type: "immediate",
    active: false,
    lastRun: "3 days ago",
    executionCount: 17,
  },
  {
    id: "wf-4",
    name: "Inventory Alert",
    description: "Send notification when inventory is running low",
    trigger: "Inventory running low",
    action: "Send Native Notification",
    actionIcon: Bell,
    type: "immediate",
    active: true,
    lastRun: "12 hours ago",
    executionCount: 8,
  },
  {
    id: "wf-5",
    name: "Turn Off Devices",
    description: "Turn off smart devices when guest checks out",
    trigger: "Guest checks out",
    action: "Turn Device Off",
    actionIcon: Power,
    type: "scheduled",
    active: false,
    lastRun: "5 days ago",
    executionCount: 56,
  },
]

interface WorkflowListProps {
  filterActive?: boolean
}

export default function WorkflowList({ filterActive }: WorkflowListProps) {
  // Filter workflows based on active state if specified
  const workflows = filterActive !== undefined ? allWorkflows.filter((wf) => wf.active === filterActive) : allWorkflows

  if (workflows.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No workflows found</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {workflows.map((workflow) => (
        <Card key={workflow.id} className="overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="flex-1 p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-2">
                <div className="flex flex-col md:flex-row md:items-center gap-2">
                  <h3 className="font-semibold text-lg">{workflow.name}</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant={workflow.type === "immediate" ? "secondary" : "outline"}>
                      {workflow.type === "immediate" ? (
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
                    <Switch checked={workflow.active} />
                    <span className="text-sm">{workflow.active ? "Active" : "Inactive"}</span>
                  </div>
                  <Link href={`/workflows/edit/${workflow.id}`}>
                    <Button variant="ghost" size="icon">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{workflow.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Trigger</h4>
                  <p className="text-sm">{workflow.trigger}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Action</h4>
                  <div className="flex items-center gap-1">
                    <workflow.actionIcon className="h-4 w-4" />
                    <p className="text-sm">{workflow.action}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Executions</h4>
                  <p className="text-sm">{workflow.executionCount} times</p>
                </div>
              </div>
            </div>
            <div className="bg-muted p-6 md:w-48 flex flex-col justify-center items-center">
              <p className="text-xs text-muted-foreground mb-1">Last executed</p>
              <p className="text-sm font-medium">{workflow.lastRun}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
