"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Zap, Clock, ArrowLeft, Pencil, Trash2, PlayCircle, PauseCircle, BarChart } from "lucide-react"
import Link from "next/link"
import WorkflowExecutionHistory from "@/components/workflow-execution-history"

// Mock data - in a real app this would come from an API
const mockWorkflows = [
  {
    id: "wf-1",
    name: "Guest Check-in Email",
    description: "Send welcome email when guest checks in",
    trigger: "Guest checks in",
    action: "Send Email",
    type: "immediate",
    active: true,
    createdAt: "2023-05-15",
    lastRun: "2 hours ago",
    executionCount: 42,
  },
  {
    id: "wf-2",
    name: "Cleaning Reminder",
    description: "Send notification to cleaning staff after checkout",
    trigger: "Guest checks out",
    action: "Send Slack Notification",
    type: "scheduled",
    delay: {
      time: 2,
      unit: "hours",
    },
    active: true,
    createdAt: "2023-06-22",
    lastRun: "1 day ago",
    executionCount: 128,
  },
]

export default function WorkflowDetails() {
  const params = useParams()
  const workflowId = params.id as string

  const [workflow, setWorkflow] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Simulate fetching workflow data
  useEffect(() => {
    // In a real app, this would be an API call
    const fetchWorkflow = () => {
      setIsLoading(true)

      setTimeout(() => {
        const foundWorkflow = mockWorkflows.find((w) => w.id === workflowId)
        setWorkflow(foundWorkflow || null)
        setIsLoading(false)
      }, 500)
    }

    fetchWorkflow()
  }, [workflowId])

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-8">
            <Link href="/workflows">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Loading workflow...</h1>
          </div>

          <Card>
            <CardContent className="p-8">
              <div className="h-8 bg-muted animate-pulse rounded-md mb-4" />
              <div className="h-24 bg-muted animate-pulse rounded-md" />
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  if (!workflow) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-8">
            <Link href="/workflows">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Workflow not found</h1>
          </div>

          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground mb-4">
                The workflow you're looking for doesn't exist or has been deleted.
              </p>
              <Link href="/workflows">
                <Button>Return to Workflows</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-8">
          <Link href="/workflows">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">{workflow.name}</h1>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle>{workflow.name}</CardTitle>
                <CardDescription>{workflow.description}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={workflow.active ? "default" : "outline"}>
                  {workflow.active ? "Active" : "Inactive"}
                </Badge>
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
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Trigger (If This...)</h3>
                <div className="bg-muted p-3 rounded-md">
                  <p>{workflow.trigger}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Action (Then That...)</h3>
                <div className="bg-muted p-3 rounded-md">
                  <p>{workflow.action}</p>
                </div>
              </div>
            </div>

            {workflow.type === "scheduled" && workflow.delay && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Delay</h3>
                <div className="bg-muted p-3 rounded-md">
                  <p>
                    Wait for {workflow.delay.time} {workflow.delay.unit} before executing the action
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-muted p-4 rounded-md">
                <p className="text-sm text-muted-foreground mb-1">Created on</p>
                <p className="font-medium">{workflow.createdAt}</p>
              </div>
              <div className="bg-muted p-4 rounded-md">
                <p className="text-sm text-muted-foreground mb-1">Last executed</p>
                <p className="font-medium">{workflow.lastRun}</p>
              </div>
              <div className="bg-muted p-4 rounded-md">
                <p className="text-sm text-muted-foreground mb-1">Total executions</p>
                <p className="font-medium">{workflow.executionCount}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                {workflow.active ? (
                  <>
                    <PauseCircle className="mr-2 h-4 w-4" /> Pause
                  </>
                ) : (
                  <>
                    <PlayCircle className="mr-2 h-4 w-4" /> Activate
                  </>
                )}
              </Button>
              <Button variant="destructive" size="sm">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            </div>
            <Link href={`/workflows/edit/${workflow.id}`}>
              <Button>
                <Pencil className="mr-2 h-4 w-4" /> Edit Workflow
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Tabs defaultValue="history">
          <TabsList className="mb-6">
            <TabsTrigger value="history" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              Execution History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="history">
            <WorkflowExecutionHistory workflowId={workflow.id} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
