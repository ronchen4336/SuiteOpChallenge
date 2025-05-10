"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Zap, Clock, Save, ArrowLeft, Trash2 } from "lucide-react"
import Link from "next/link"

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
  },
]

export default function EditWorkflow() {
  const params = useParams()
  const router = useRouter()
  const workflowId = params.id as string

  const [workflow, setWorkflow] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Form state
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [trigger, setTrigger] = useState("")
  const [action, setAction] = useState("")
  const [type, setType] = useState("immediate")
  const [active, setActive] = useState(true)
  const [delayTime, setDelayTime] = useState("15")
  const [delayUnit, setDelayUnit] = useState("minutes")

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
    // In a real app, this would be an API call
    const fetchWorkflow = () => {
      setIsLoading(true)

      setTimeout(() => {
        const foundWorkflow = mockWorkflows.find((w) => w.id === workflowId)

        if (foundWorkflow) {
          setWorkflow(foundWorkflow)
          setName(foundWorkflow.name)
          setDescription(foundWorkflow.description)
          setTrigger(foundWorkflow.trigger)
          setAction(foundWorkflow.action)
          setType(foundWorkflow.type)
          setActive(foundWorkflow.active)

          if (foundWorkflow.delay) {
            setDelayTime(foundWorkflow.delay.time.toString())
            setDelayUnit(foundWorkflow.delay.unit)
          }
        }

        setIsLoading(false)
      }, 500)
    }

    fetchWorkflow()
  }, [workflowId])

  const handleSave = () => {
    // In a real app, this would save to backend
    alert("Workflow updated successfully!")
    router.push("/workflows")
  }

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this workflow?")) {
      // In a real app, this would delete from backend
      alert("Workflow deleted successfully!")
      router.push("/workflows")
    }
  }

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
                <Input id="workflow-name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="workflow-type">Workflow Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger id="workflow-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-amber-500" />
                        <span>Immediate</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="scheduled">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-indigo-500" />
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
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="trigger">Trigger (If This...)</Label>
              <Select value={trigger} onValueChange={setTrigger}>
                <SelectTrigger id="trigger">
                  <SelectValue placeholder="Select a trigger" />
                </SelectTrigger>
                <SelectContent>
                  {triggers.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="action">Action (Then That...)</Label>
              <Select value={action} onValueChange={setAction}>
                <SelectTrigger id="action">
                  <SelectValue placeholder="Select an action" />
                </SelectTrigger>
                <SelectContent>
                  {actions.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {type === "scheduled" && (
              <div className="space-y-2">
                <Label>Delay</Label>
                <div className="flex gap-4">
                  <Input
                    type="number"
                    min="1"
                    value={delayTime}
                    onChange={(e) => setDelayTime(e.target.value)}
                    className="w-24"
                  />
                  <Select value={delayUnit} onValueChange={setDelayUnit}>
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
              <Switch id="active" checked={active} onCheckedChange={setActive} />
              <Label htmlFor="active">Workflow is active</Label>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Workflow
            </Button>
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  )
}
