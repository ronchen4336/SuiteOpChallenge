"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from 'next/navigation' // For redirect and getting URL params
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Zap, Clock, Save, ArrowLeft, Trash2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface ApiItem {
  id: number | string;
  name: string;
  description?: string;
}

interface WorkflowRuleData {
  id: number | string;
  name: string;
  description?: string;
  trigger: ApiItem; // Expecting full trigger object from API for a single rule
  action: ApiItem;  // Expecting full action object
  rule_type: 'immediate' | 'scheduled';
  delay_time?: number | null;
  delay_unit?: string | null;
  is_active: boolean;
}

export default function EditWorkflow() {
  const router = useRouter()
  const params = useParams()
  const workflowId = params.id as string

  const [workflow, setWorkflow] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Form state
  const [workflowName, setWorkflowName] = useState("")
  const [workflowDescription, setWorkflowDescription] = useState("")
  const [workflowType, setWorkflowType] = useState("immediate")
  const [isActive, setIsActive] = useState(true)
  const [selectedTrigger, setSelectedTrigger] = useState<string>("")
  const [selectedAction, setSelectedAction] = useState<string>("")
  const [delayTime, setDelayTime] = useState("15")
  const [delayUnit, setDelayUnit] = useState("minutes")

  const [dbTriggers, setDbTriggers] = useState<ApiItem[]>([])
  const [dbActions, setDbActions] = useState<ApiItem[]>([])
  
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const triggers = [
    "Guest checks in",
    "Guest checks out",
    "Cleaning completed",
    "Maintenance issue reported",
    "Booking canceled",
    "Inventory running low",
  ]

  const actions = [
    "Send Email",
    "Send Slack Notification",
    "Send Native Notification",
    "Create Task",
    "Turn Device On/Off",
  ]

  // Simulate fetching workflow data
  useEffect(() => {
    if (!workflowId) return

    const fetchWorkflowAndOptions = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const [workflowResponse, triggersResponse, actionsResponse] = await Promise.all([
          fetch(`http://127.0.0.1:8000/api/rules/${workflowId}/`),
          fetch('http://127.0.0.1:8000/api/triggers/'),
          fetch('http://127.0.0.1:8000/api/actions/') 
        ])

        if (!workflowResponse.ok) {
          throw new Error(`Failed to fetch workflow (ID: ${workflowId}): ${workflowResponse.status}`)
        }
        if (!triggersResponse.ok || !actionsResponse.ok) {
          throw new Error('Failed to fetch trigger/action options')
        }

        const workflowData: WorkflowRuleData = await workflowResponse.json()
        const triggersData = await triggersResponse.json()
        const actionsData = await actionsResponse.json()

        // Pre-fill form states
        setWorkflow(workflowData)
        setWorkflowName(workflowData.name || "")
        setWorkflowDescription(workflowData.description || "")
        setWorkflowType(workflowData.rule_type || "immediate")
        setIsActive(workflowData.is_active === undefined ? true : workflowData.is_active)
        setSelectedTrigger(workflowData.trigger ? String(workflowData.trigger.id) : "")
        setSelectedAction(workflowData.action ? String(workflowData.action.id) : "")
        setDelayTime(String(workflowData.delay_time || "15"))
        setDelayUnit(workflowData.delay_unit || "minutes")

        setDbTriggers(triggersData.results || triggersData)
        setDbActions(actionsData.results || actionsData)

      } catch (err) {
        console.error("Error fetching data for edit page:", err)
        const errorMessage = err instanceof Error ? err.message : String(err)
        setError(errorMessage)
        toast.error("Failed to load workflow data: " + errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    fetchWorkflowAndOptions()
  }, [workflowId])

  const handleUpdateWorkflow = async () => {
    if (!workflowName || !selectedTrigger || !selectedAction) {
      toast.error("Please fill in all required fields: Name, Trigger, and Action.")
      return
    }
    setIsSubmitting(true)

    const payload: any = {
      name: workflowName,
      description: workflowDescription,
      trigger_id: parseInt(selectedTrigger),
      action_id: parseInt(selectedAction),
      rule_type: workflowType,
      is_active: isActive,
    }

    if (workflowType === "scheduled") {
      const delay = parseInt(delayTime, 10)
      if (isNaN(delay) || delay <= 0) {
        toast.error("Please enter a valid positive number for delay time.")
        setIsSubmitting(false)
        return
      }
      payload.delay_time = delay
      payload.delay_unit = delayUnit
    } else {
      payload.delay_time = null
      payload.delay_unit = null
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/rules/${workflowId}/`, {
        method: 'PUT', // Or PATCH if you prefer partial updates
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const updatedWorkflow = await response.json()
        toast.success(`Workflow "${updatedWorkflow.name}" updated successfully!`)
        router.push('/workflows') // Redirect to workflows list
      } else {
        const errorData = await response.json().catch(() => ({ detail: "An unknown error occurred while updating." }))
        toast.error(`Failed to update workflow: ${errorData.detail || response.statusText}`)
        console.error("Error updating workflow:", errorData)
      }
    } catch (error) {
      toast.error("An error occurred while updating the workflow. Please check your connection.")
      console.error("Network error during update:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteWorkflow = async () => {
    setIsSubmitting(true); 
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/rules/${workflowId}/`, {
        method: 'DELETE',
      });

      if (response.ok || response.status === 204) { 
        toast.success(`Workflow "${workflowName}" deleted successfully!`);
        router.push("/workflows");
      } else {
        const errorData = await response.json().catch(() => ({ detail: "An unknown error occurred while deleting." }));
        toast.error(`Failed to delete workflow: ${errorData.detail || response.statusText}`);
        setIsSubmitting(false); 
      }
    } catch (error) {
      toast.error("An error occurred while deleting the workflow. Please check your connection.");
      setIsSubmitting(false); 
    }
  };

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
          <h1 className="text-3xl font-bold">Edit Workflow</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Edit Workflow</CardTitle>
            <CardDescription>Update your automation workflow settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="workflow-name">Workflow Name</Label>
                <Input
                  id="workflow-name"
                  placeholder="E.g., Guest Welcome Email"
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  className="rounded-full"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="workflow-type">Workflow Type</Label>
                <Select value={workflowType} onValueChange={setWorkflowType} disabled={isSubmitting}>
                  <SelectTrigger id="workflow-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-primary" />
                        <span>Immediate</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="scheduled">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <span>Scheduled</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="workflow-description">Description</Label>
              <Textarea
                id="workflow-description"
                placeholder="Describe what this workflow does"
                value={workflowDescription}
                onChange={(e) => setWorkflowDescription(e.target.value)}
                className="rounded-xl"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="trigger">Trigger (If This...)</Label>
              <Select value={selectedTrigger} onValueChange={setSelectedTrigger} disabled={isSubmitting}>
                <SelectTrigger id="trigger">
                  <SelectValue placeholder="Select a trigger" />
                </SelectTrigger>
                <SelectContent>
                  {dbTriggers.map((t) => (
                    <SelectItem key={t.id} value={String(t.id)}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="action">Action (Then That...)</Label>
              <Select value={selectedAction} onValueChange={setSelectedAction} disabled={isSubmitting}>
                <SelectTrigger id="action">
                  <SelectValue placeholder="Select an action" />
                </SelectTrigger>
                <SelectContent>
                  {dbActions.map((a) => (
                    <SelectItem key={a.id} value={String(a.id)}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {workflowType === "scheduled" && (
              <div className="space-y-2">
                <Label>Delay</Label>
                <div className="flex gap-4">
                  <Input
                    type="number"
                    min="1"
                    value={delayTime}
                    onChange={(e) => setDelayTime(e.target.value)}
                    className="w-24 rounded-full"
                    disabled={isSubmitting}
                  />
                  <Select value={delayUnit} onValueChange={setDelayUnit} disabled={isSubmitting}>
                    <SelectTrigger>
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minutes">Minutes</SelectItem>
                      <SelectItem value="hours">Hours</SelectItem>
                      <SelectItem value="days">Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Switch id="active" checked={isActive} onCheckedChange={setIsActive} disabled={isSubmitting} />
              <Label htmlFor="active">Workflow is active</Label>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="destructive" 
              disabled={isSubmitting || !workflowName}
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Workflow
            </Button>
            <Button
              onClick={handleUpdateWorkflow}
              disabled={!workflowName || !selectedTrigger || !selectedAction || isSubmitting}
              className="w-full"
            >
              {isSubmitting ? "Saving..." : <><Save className="mr-2 h-4 w-4" /> Save Changes</>}
            </Button>
          </CardFooter>
        </Card>

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the workflow
                named "<strong>{workflowName}</strong>".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteWorkflow} 
                disabled={isSubmitting} 
                className="bg-red-600 hover:bg-red-700">
                {isSubmitting ? "Deleting..." : "Yes, delete workflow"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </div>
    </main>
  )
}
