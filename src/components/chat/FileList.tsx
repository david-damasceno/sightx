import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Eye, Download, Trash2, CheckSquare } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface FileListProps {
  files: Array<{
    id: string
    file_name: string
    file_type: string
    created_at: string
    status: string
    preview_data: any
  }>
  onDelete: (id: string) => void
  selectedFiles: string[]
  onToggleSelect: (id: string) => void
}

export function FileList({ files, onDelete, selectedFiles, onToggleSelect }: FileListProps) {
  const [selectedFile, setSelectedFile] = useState<any>(null)

  const renderPreviewContent = (file: any) => {
    if (!file.preview_data) return <p>Sem dados para visualizar</p>

    if (file.file_type === "json") {
      return (
        <pre className="bg-muted p-4 rounded-lg overflow-auto">
          {JSON.stringify(file.preview_data, null, 2)}
        </pre>
      )
    }

    if (file.file_type === "csv" || file.file_type === "excel") {
      return (
        <div className="overflow-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {Object.keys(file.preview_data[0] || {}).map((header) => (
                  <th key={header} className="border p-2 bg-muted">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {file.preview_data.map((row: any, index: number) => (
                <tr key={index}>
                  {Object.values(row).map((cell: any, cellIndex: number) => (
                    <td key={cellIndex} className="border p-2">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }

    return <p>Tipo de arquivo não suportado para visualização</p>
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Arquivos Carregados</h3>
      <ScrollArea className="h-[200px] w-full rounded-md border p-4">
        <div className="space-y-4">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-2 hover:bg-accent rounded-lg"
            >
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onToggleSelect(file.id)}
                  className={selectedFiles.includes(file.id) ? "text-purple-500" : ""}
                >
                  <CheckSquare className="h-4 w-4" />
                </Button>
                <div>
                  <p className="font-medium">{file.file_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(file.created_at), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedFile(file)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[800px] sm:w-[540px]">
                    <SheetHeader>
                      <SheetTitle>Visualização - {file.file_name}</SheetTitle>
                    </SheetHeader>
                    <div className="mt-4">
                      {renderPreviewContent(selectedFile)}
                    </div>
                  </SheetContent>
                </Sheet>
                <Button variant="ghost" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(file.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}