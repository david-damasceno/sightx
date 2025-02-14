
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pencil, Trash2 } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Column {
  name: string
  type: string
  sample: any
}

interface DataPreviewProps {
  columns: Column[]
  previewData: any[]
  onNext: () => void
}

export function DataPreview({ columns, previewData, onNext }: DataPreviewProps) {
  const [editingHeader, setEditingHeader] = useState<string | null>(null)
  const [tableColumns, setTableColumns] = useState(columns)
  const [data, setData] = useState(previewData)

  const handleHeaderEdit = (columnName: string, newName: string) => {
    setTableColumns(prev => 
      prev.map(col => col.name === columnName ? { ...col, name: newName } : col)
    )
    setEditingHeader(null)
  }

  const handleDeleteRow = (index: number) => {
    setData(prev => prev.filter((_, i) => i !== index))
  }

  const handleCellEdit = (rowIndex: number, columnName: string, value: string) => {
    setData(prev => 
      prev.map((row, i) => 
        i === rowIndex ? { ...row, [columnName]: value } : row
      )
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium">Editor de Dados</h2>
          <p className="text-sm text-muted-foreground">
            Edite os dados importados antes de continuar
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setData(previewData)}>
            Restaurar Original
          </Button>
          <Button onClick={onNext}>Continuar</Button>
        </div>
      </div>

      <Card>
        <ScrollArea className="h-[600px] rounded-md border">
          <div className="p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px] text-center">#</TableHead>
                  {tableColumns.map((column) => (
                    <TableHead key={column.name} className="min-w-[200px]">
                      {editingHeader === column.name ? (
                        <Input
                          className="h-8 px-2"
                          defaultValue={column.name}
                          autoFocus
                          onBlur={(e) => handleHeaderEdit(column.name, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.currentTarget.blur()
                            }
                          }}
                        />
                      ) : (
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <span className="font-medium">{column.name}</span>
                            <span className="ml-2 text-xs text-muted-foreground">
                              ({column.type})
                            </span>
                          </div>
                          <Pencil
                            className="h-4 w-4 cursor-pointer hover:text-primary"
                            onClick={() => setEditingHeader(column.name)}
                          />
                        </div>
                      )}
                    </TableHead>
                  ))}
                  <TableHead className="w-[80px] text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    <TableCell className="text-center text-muted-foreground">
                      {rowIndex + 1}
                    </TableCell>
                    {tableColumns.map((column) => (
                      <TableCell key={`${rowIndex}-${column.name}`}>
                        <Input
                          className="h-8 px-2"
                          value={row[column.name] ?? ''}
                          onChange={(e) => handleCellEdit(rowIndex, column.name, e.target.value)}
                        />
                      </TableCell>
                    ))}
                    <TableCell>
                      <div className="flex justify-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteRow(rowIndex)}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </Card>
    </div>
  )
}
