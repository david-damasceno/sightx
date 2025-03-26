
import { useEffect, useState } from "react"
import { ModeToggle } from "@/components/mode-toggle"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { Logo } from "./navbar/Logo"
import { Navigation } from "./navbar/Navigation"
import { UserMenu } from "./navbar/UserMenu"
import { MobileNav } from "./MobileNav"
import { useMobile } from "@/hooks/use-mobile"

export function AppNavbar() {
  const { session } = useAuth()
  const [profile, setProfile] = useState<{
    full_name: string;
    email: string;
    avatar_url: string;
  } | null>(null)
  const isMobile = useMobile()

  useEffect(() => {
    if (session?.user) {
      getProfile()
    }
  }, [session])

  const getProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, email, avatar_url')
        .eq('id', session?.user?.id)
        .single()

      if (error) {
        console.error('Error loading profile:', error)
        return
      }
      
      setProfile(data)
    } catch (error) {
      console.error('Error loading profile:', error)
    }
  }

  if (!profile) {
    return null
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-green-100/20 dark:border-emerald-900/20 safe-area-top">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <Logo />
              <Navigation />
            </div>

            <div className="flex items-center gap-4">
              <ModeToggle />
              {!isMobile && <UserMenu profile={profile} />}
            </div>
          </div>
        </div>
      </nav>
      
      {/* Menu para Mobile */}
      <MobileNav />
    </>
  )
}
