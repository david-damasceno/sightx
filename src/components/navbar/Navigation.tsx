import { NavItem } from "./NavItem"
import { UserMenu } from "./UserMenu"
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
        <div className="ml-auto flex items-center space-x-4">
          <UserMenu />
        </div>
      </div>
    </div>
  )
}