import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { User } from "lucide-react"
import { ProfileAvatarEditor } from "@/components/AvatarEditor/AvatarEditor"
import { useProfile } from "@/hooks/useProfile"
import { useAvatar } from "@/hooks/useAvatar"
import { ProfileHeader } from "@/components/ProfileHeader/ProfileHeader"
import { ProfileForm } from "@/components/ProfileForm/ProfileForm"

export default function Profile() {
  const { 
    profile, 
    setProfile, 
    loading: profileLoading, 
    updateProfile 
  } = useProfile()

  const {
    selectedImage,
    isEditorOpen,
    setIsEditorOpen,
    setSelectedImage,
    handleAvatarClick,
    handleSaveAvatar,
    handleDeleteAvatar
  } = useAvatar()

  const handleSave = async () => {
    await updateProfile(profile)
  }

  const handleEditorSave = async (url: string) => {
    try {
      await handleSaveAvatar(url)
      setProfile({ ...profile, avatar_url: url })
    } catch (error) {
      console.error('Error saving avatar:', error)
    }
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center gap-2">
        <User className="h-5 w-5" />
        <h1 className="text-2xl font-bold">Minha Conta</h1>
      </div>

      <Card className="p-6">
        <div className="space-y-8">
          <ProfileHeader
            profile={profile}
            onAvatarClick={() => handleAvatarClick(profile.avatar_url)}
          />

          <Separator />

          <ProfileForm
            profile={profile}
            loading={profileLoading}
            onProfileChange={setProfile}
            onSubmit={handleSave}
          />
        </div>
      </Card>

      {selectedImage && (
        <ProfileAvatarEditor
          open={isEditorOpen}
          onClose={() => {
            setIsEditorOpen(false)
            setSelectedImage(null)
          }}
          imageUrl={selectedImage}
          onSave={handleEditorSave}
          onDelete={handleDeleteAvatar}
        />
      )}
    </div>
  )
}