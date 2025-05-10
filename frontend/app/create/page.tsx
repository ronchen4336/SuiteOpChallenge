"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Zap, Clock, Sparkles, ArrowRight, Save } from "lucide-react"
import WorkflowPreview from "@/components/workflow-preview"

export default function CreateWorkflow() {
  const [workflowName, setWorkflowName] = useState("")
  const [workflowDescription, setWorkflowDescription] = useState("")
  const [aiPrompt, setAiPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedWorkflow, setGeneratedWorkflow] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("ai")
  const [workflowType, setWorkflowType] = useState("immediate")

  // Manual configuration state
  const [selectedTrigger, setSelectedTrigger] = useState("")
  const [selectedAction, setSelectedAction] = useState("")
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

  const handleGenerateWorkflow = () => {
    setIsGenerating(true)

    // Simulate AI generation
    setTimeout(() => {
      // This would be replaced with actual AI API call
      const mockGeneratedWorkflow = {
        name: aiPrompt.split(" ").slice(0, 4).join(" "),
        description: aiPrompt,
        trigger: "Guest checks in",
        action: "Send Email",
        type: workflowType,
        delay:
          workflowType === "scheduled"
            ? {
                time: 15,
                unit: "minutes",
              }
            : null,
      }

      setGeneratedWorkflow(mockGeneratedWorkflow)
      setWorkflowName(mockGeneratedWorkflow.name)
      setWorkflowDescription(mockGeneratedWorkflow.description)
      setSelectedTrigger(mockGeneratedWorkflow.trigger)
      setSelectedAction(mockGeneratedWorkflow.action)

      setIsGenerating(false)
    }, 1500)
  }

  const handleSaveWorkflow = () => {
    // In a real app, this would save to backend
    alert("Workflow saved successfully!")
    // Then redirect to workflows list
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Create New Workflow</h1>

        <Tabs defaultValue="ai" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-primary-100 p-1 rounded-full">
            <TabsTrigger value="ai" className="flex items-center gap-2 rounded-full data-[state=active]:bg-primary data-[state=active]:text-white">
              <Sparkles className="h-4 w-4" />
              AI-Powered Creation
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-2 rounded-full data-[state=active]:bg-primary data-[state=active]:text-white">
              <ArrowRight className="h-4 w-4" />
              Manual Configuration
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ai">
            <Card className="suiteop-card">
              <CardHeader>
                <CardTitle>Create with AI</CardTitle>
                <CardDescription>
                  Describe your workflow in natural language and let AI configure it for you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="ai-prompt">Describe your workflow</Label>
                  <Textarea
                    id="ai-prompt"
                    placeholder="E.g., Send a welcome email when a guest checks in, or create a cleaning task 2 hours after checkout"
                    rows={4}
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    className="rounded-xl"
                  />
                  <p className="text-sm text-muted-foreground">
                    Be specific about triggers, actions, and timing if applicable.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Label htmlFor="workflow-type">Workflow Type</Label>
                  <Select value={workflowType} onValueChange={setWorkflowType}>
                    <SelectTrigger id="workflow-type" className="w-[180px] rounded-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
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

                <Button onClick={handleGenerateWorkflow} disabled={!aiPrompt || isGenerating} className="w-full">
                  {isGenerating ? (
                    <>Generating...</>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Workflow
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {generatedWorkflow && (
              <div className="mt-8">
                <WorkflowPreview workflow={generatedWorkflow} onEdit={() => setActiveTab("manual")} />
              </div>
            )}
          </TabsContent>

          <TabsContent value="manual">
            <Card className="suiteop-card">
              <CardHeader>
                <CardTitle>Manual Configuration</CardTitle>
                <CardDescription>Configure your workflow step by step</CardDescription>
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
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="workflow-type-manual">Workflow Type</Label>
                    <Select value={workflowType} onValueChange={setWorkflowType}>
                      <SelectTrigger id="workflow-type-manual" className="rounded-full">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
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
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="trigger">Trigger (If This...)</Label>
                  <Select value={selectedTrigger} onValueChange={setSelectedTrigger}>
                    <SelectTrigger id="trigger" className="rounded-full">
                      <SelectValue placeholder="Select a trigger" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {triggers.map((trigger) => (
                        <SelectItem key={trigger} value={trigger}>
                          {trigger}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="action">Action (Then That...)</Label>
                  <Select value={selectedAction} onValueChange={setSelectedAction}>
                    <SelectTrigger id="action" className="rounded-full">
                      <SelectValue placeholder="Select an action" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {actions.map((action) => (
                        <SelectItem key={action} value={action}>
                          {action}
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
                      />
                      <Select value={delayUnit} onValueChange={setDelayUnit}>
                        <SelectTrigger className="rounded-full">
                          <SelectValue placeholder="Unit" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="minutes">Minutes</SelectItem>
                          <SelectItem value="hours">Hours</SelectItem>
                          <SelectItem value="days">Days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Switch id="active" defaultChecked />
                  <Label htmlFor="active">Activate workflow immediately</Label>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleSaveWorkflow}
                  disabled={!workflowName || !selectedTrigger || !selectedAction}
                  className="w-full"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Workflow
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
