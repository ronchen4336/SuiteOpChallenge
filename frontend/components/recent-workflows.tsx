import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, PlayCircle, PauseCircle, ArrowRight, Zap, Clock } from "lucide-react"
import Link from "next/link"

// Mock data - in a real app this would come from an API or state
const recentWorkflows = [
  {
    id: "wf-1",
    name: "Guest Check-in Email",
    description: "Send welcome email when guest checks in",
    trigger: "Guest checks in",
    action: "Send Email",
    type: "immediate",
    active: true,
    lastRun: "2 hours ago",
  },
  {
    id: "wf-2",
    name: "Cleaning Reminder",
    description: "Send notification to cleaning staff after checkout",
    trigger: "Guest checks out",
    action: "Send Slack Notification",
    type: "scheduled",
    active: true,
    lastRun: "1 day ago",
  },
  {
    id: "wf-3",
    name: "Maintenance Follow-up",
    description: "Create task for maintenance team when issue reported",
    trigger: "Maintenance issue reported",
    action: "Create Task",
    type: "immediate",
    active: false,
    lastRun: "3 days ago",
  },
]

export default function RecentWorkflows() {
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
        {recentWorkflows.map((workflow) => (
          <Card key={workflow.id} className="suiteop-card overflow-hidden workflow-card">
            <div className="flex flex-col md:flex-row">
              <div className="flex-1 p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="font-semibold text-xl mb-1">{workflow.name}</h3>
                    <p className="text-muted-foreground">{workflow.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={workflow.active ? "default" : "outline"}
                      className={workflow.active ? "bg-primary hover:bg-primary/90" : ""}
                    >
                      {workflow.active ? "Active" : "Inactive"}
                    </Badge>
                    <Badge
                      variant={workflow.type === "immediate" ? "secondary" : "outline"}
                      className="bg-primary-100 text-primary border-primary-200 hover:bg-primary-200"
                    >
                      {workflow.type === "immediate" ? "Immediate" : "Scheduled"}
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
                            {workflow.type === "immediate" ? (
                              <Zap className="h-4 w-4 text-primary" />
                            ) : (
                              <Clock className="h-4 w-4 text-primary" />
                            )}
                          </div>
                        </div>
                        <p className="font-medium">{workflow.trigger}</p>
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
                        <p className="font-medium">{workflow.action}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 mt-6">
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    {workflow.active ? <PauseCircle className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="bg-primary-100 p-6 md:w-48 flex flex-col justify-center items-center">
                <p className="text-xs text-muted-foreground mb-1">Last executed</p>
                <p className="text-lg font-medium">{workflow.lastRun}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
