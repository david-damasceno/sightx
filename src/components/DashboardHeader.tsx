import { ModeToggle } from "@/components/mode-toggle"
import { APP_VERSION } from "@/config/version"

export function DashboardHeader() {
  return (
    <header className="border-b">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">SightX</h1>
          <span className="text-xs text-muted-foreground">v{APP_VERSION.toString()}</span>
        </div>
        <div className="flex items-center gap-4">
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}