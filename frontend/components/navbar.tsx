"use client";

import Link from "next/link"
import { Button } from "@/components/ui/button"
// import { ModeToggle } from "@/components/mode-toggle"
import { Home, PlusCircle, List, Settings, Zap } from "lucide-react"
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const getLinkClassName = (href: string) => {
    return `text-sm font-medium flex items-center gap-2 hover:text-primary transition-colors py-2 px-3 rounded-full ${pathname === href ? 'bg-primary-100 text-primary' : 'hover:bg-primary-100'}`;
  };

  return (
    <header className="border-b border-transparent bg-[#f5f2ff] sticky top-0 z-50 glass-effect">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-[#6c5ce7] to-[#8e44ad] text-white p-2 rounded-full">
              <Zap className="h-5 w-5" />
            </div>
            <span className="font-bold text-xl">SuiteOp</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className={getLinkClassName("/")}
            >
              <Home className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="/workflows"
              className={getLinkClassName("/workflows")}
            >
              <List className="h-4 w-4" />
              Workflows
            </Link>
            <Link
              href="/create"
              className={getLinkClassName("/create")}
            >
              <PlusCircle className="h-4 w-4" />
              Create
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {/* <ModeToggle /> */}
          <Link href="/dev/trigger-simulator" passHref legacyBehavior>
            <Button variant="outline" className={`hidden md:flex items-center gap-2 rounded-full ${pathname === '/dev/trigger-simulator' ? 'bg-primary-100 text-primary' : 'hover:bg-primary-100'}`}>
              <Settings className="h-4 w-4" /> 
              <span>Dev Tools</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
