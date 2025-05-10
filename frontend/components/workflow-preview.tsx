"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pencil, Save, Zap, Clock } from "lucide-react"

interface WorkflowPreviewProps {
  workflow: {
    name: string
    description: string
    trigger: string
    action: string
    type: string
    delay?: {
      time: number
      unit: string
    } | null
  }
  onEdit: () => void
}

export default function WorkflowPreview({ workflow, onEdit }: WorkflowPreviewProps) {
  return (
    <Card className="suiteop-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Preview Your Workflow</CardTitle>
            <CardDescription>Review the AI-generated workflow before saving</CardDescription>
          </div>
          <Badge
            variant={workflow.type === "immediate" ? "secondary" : "outline"}
            className="bg-primary-100 text-primary border-primary-200"
          >
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
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold">{workflow.name}</h3>
          <p className="text-sm text-muted-foreground mt-1">{workflow.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Trigger (If This...)</h4>
            <div className="bg-primary-100 p-3 rounded-xl">
              <p>{workflow.trigger}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Action (Then That...)</h4>
            <div className="bg-primary-100 p-3 rounded-xl">
              <p>{workflow.action}</p>
            </div>
          </div>
        </div>

        {workflow.type === "scheduled" && workflow.delay && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Delay</h4>
            <div className="bg-primary-100 p-3 rounded-xl">
              <p>
                Wait for {workflow.delay.time} {workflow.delay.unit} before executing the action
              </p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onEdit}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </Button>
        <Button>
          <Save className="mr-2 h-4 w-4" />
          Save Workflow
        </Button>
      </CardFooter>
    </Card>
  )
}
