import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardTitle } from "@/components/ui/card"
import { PlusCircle, Zap, Clock, Sparkles, ArrowRight } from "lucide-react"
import WorkflowStats from "@/components/workflow-stats"
import RecentWorkflows from "@/components/recent-workflows"

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="relative hero-pattern rounded-3xl p-8 mb-12 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-300/20 to-indigo-300/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-300/20 to-indigo-300/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>

        <div className="flex flex-col md:flex-row items-center justify-between relative z-10">
          <div className="max-w-2xl mb-8 md:mb-0">
            <h1 className="text-5xl font-bold mb-4 leading-tight">
              <span className="text-black">Unlock the</span>{" "}
              <span className="suiteop-gradient-text">Future of Automation</span>
            </h1>
            <p className="text-xl text-muted-foreground mt-4 leading-relaxed">
              Create powerful automation workflows for your lodging operations with AI assistance.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/create">
                <Button size="lg" className="suiteop-button gap-2 text-base px-8 py-6">
                  <PlusCircle className="h-5 w-5" />
                  Create Workflow
                </Button>
              </Link>
              <Link href="/workflows">
                <Button variant="outline" size="lg" className="gap-2 text-base px-8 py-6 rounded-full">
                  View All Workflows
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
          <div className="w-full md:w-1/3 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-full blur-3xl"></div>
              <img
                src="/automation-workflow-typing.png"
                alt="AI-powered workflow creation"
                className="relative z-10 rounded-2xl shadow-xl animate-float"
                style={{ maxWidth: "100%", height: "auto" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <WorkflowStats />

      {/* Features Section */}
      <div className="mt-16">
        <Card className="suiteop-card overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            <div className="p-8 flex flex-col justify-between">
              <div>
                <CardTitle className="text-3xl mb-3 suiteop-gradient-text">Create Powerful Workflows</CardTitle>
                <CardDescription className="text-lg mb-6">
                  Automate your lodging operations with our intuitive workflow builder
                </CardDescription>

                <div className="space-y-6 mt-8">
                  <div className="flex items-start gap-4 feature-item">
                    <div className="feature-icon-container">
                      <Sparkles className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">AI-Powered Creation</h3>
                      <p className="text-muted-foreground mt-1">
                        Describe workflows in natural language and let AI do the heavy lifting
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 feature-item">
                    <div className="feature-icon-container">
                      <Zap className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Immediate Actions</h3>
                      <p className="text-muted-foreground mt-1">
                        Trigger actions instantly when conditions are met for real-time automation
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 feature-item">
                    <div className="feature-icon-container">
                      <Clock className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Scheduled Actions</h3>
                      <p className="text-muted-foreground mt-1">
                        Delay actions for specific timing needs with precise scheduling controls
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <Link href="/create">
                  <Button size="lg" className="suiteop-button gap-2 w-full md:w-auto text-base px-8 py-6">
                    <PlusCircle className="h-5 w-5" />
                    Create Your First Workflow
                  </Button>
                </Link>
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center p-8">
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="absolute w-64 h-64 bg-white/30 rounded-full blur-3xl animate-pulse-subtle"></div>
                <img
                  src="/automation-workflow-typing.png"
                  alt="AI-powered workflow creation"
                  className="rounded-xl max-w-full h-auto object-cover shadow-lg relative z-10"
                />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Workflows Section */}
      <div className="mt-16">
        <RecentWorkflows />
      </div>
    </main>
  )
}
