
import { useState, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, File, X, AlertCircle, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"

interface FileUploaderProps {
  onUploadComplete: (fileId: string) => void
}

export function FileUploader({ onUploadComplete }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const { toast } = useToast()
  const { currentOrganization } = useAuth()

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const validateFile = useCallback((file: File): string | null => {
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]

    if (!allowedTypes.includes(file.type)) {
      return "Formato de arquivo não suportado. Por favor, use CSV ou Excel."
    }

    if (file.size > 10 * 1024 * 1024) {
      return "Arquivo muito grande. O tamanho máximo é 10MB."
    }

    return null
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    if (file) {
      const error = validateFile(file)
      if (error) {
        toast({
          title: "Erro",
          description: error,
          variant: "destructive"
        })
        return
      }
      setSelectedFile(file)
    }
  }, [validateFile, toast])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const error = validateFile(file)
      if (error) {
        toast({
          title: "Erro",
          description: error,
          variant: "destructive"
        })
        return
      }
      setSelectedFile(file)
    }
  }, [validateFile, toast])

  const simulateProgress = useCallback(() => {
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 10
      if (progress > 95) {
        clearInterval(interval)
        progress = 95
      }
      