import { NavItem } from "./NavItem"
import { Logo } from "./Logo"
import { OrganizationSelector } from "./OrganizationSelector"

export function Navigation() {
  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <Logo />
        <div className="ml-8">
          <OrganizationSelector />
        </div>
      </div>
    </div>
  )
}