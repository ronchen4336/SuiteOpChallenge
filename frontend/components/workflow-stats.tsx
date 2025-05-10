import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Workflow, Zap, Clock, CheckCircle } from "lucide-react"

export default function WorkflowStats() {
  // In a real app, these would come from an API or state
  const stats = [
    {
      title: "Total Workflows",
      value: "12",
      icon: Workflow,
      description: "Active automation workflows",
    },
    {
      title: "Immediate Actions",
      value: "8",
      icon: Zap,
      description: "Instant response workflows",
    },
    {
      title: "Scheduled Actions",
      value: "4",
      icon: Clock,
      description: "Time-delayed workflows",
    },
    {
      title: "Executions Today",
      value: "37",
      icon: CheckCircle,
      description: "Successful workflow runs",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="suiteop-card stats-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <div className="bg-primary-100 p-2 rounded-full">
              <stat.icon className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stat.value}</div>
            <p className="text-sm text-muted-foreground mt-1">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
