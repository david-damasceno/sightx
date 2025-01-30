import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import { ModeToggle } from "@/components/mode-toggle"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { Logo } from "./navbar/Logo"
import { Navigation } from "./navbar/Navigation"
import { UserMenu } from "./navbar/UserMenu"

export function AppNavbar() {
  const location = useLocation()
  const { session } = useAuth()
  const [profile, setProfile] = useState<{
    full_name: string;
    email: string;
    avatar_url: string;
  } | null>(null)

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
    <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Logo />
          <Navigation />
        </div>

        <div className="flex items-center gap-4">
          <ModeToggle />
          <UserMenu profile={profile} />
        </div>
      </div>
    </nav>
  )
}