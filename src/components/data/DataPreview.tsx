
import { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import DataGrid from "react-data-grid"
import { Pencil, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import 'react-data-grid/lib/styles.css'

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

interface GridColumn {
  key: string
  name: string
  editor: any
  headerRenderer?: (props: any) => JSX.Element
}

export function DataPreview({ columns, previewData, onNext }: DataPreviewProps) {
  const [editingHeader, setEditingHeader] = useState<string | null>(null)
  const [gridColumns, setGridColumns] = useState<GridColumn[]>(
    columns.map(col => ({
      key: col.name,
      name: col.name,
      editor: TextEditor
    }))
  )
  const [rows, setRows] = useState(previewData)

  // Renderizador personalizado para o cabeçalho
  function HeaderRenderer({ column }: { column: GridColumn }) {
    if (editingHeader === column.key) {
      return (
        <Input
          className="h-8 px-2"
          defaultValue={column.name}
          autoFocus
          onBlur={(e) => {
            const newColumns = gridColumns.map(col => {
              if (col.key === column.key) {
                return { ...col, name: e.target.value }
              }
              return col
            })
            setGridColumns(newColumns)
            setEditingHeader(null)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.currentTarget.blur()
            }
          }}
        />
      )
    }

    return (
      <div className="flex items-center justify-between px-2 w-full h-full">
        <span>{column.name}</span>
        <Pencil
          className="h-4 w-4 cursor-pointer hover:text-primary"
          onClick={() => setEditingHeader(column.key)}
        />
      </div>
    )
  }

  // Configuração das colunas com o renderizador personalizado
  const finalColumns = useMemo(() => {
    return gridColumns.map(col => ({
      ...col,
      headerRenderer: HeaderRenderer
    }))
  }, [gridColumns])

  // Editor de texto para células
  function TextEditor({ row, column, onRowChange }: any) {
    return (
      <Input
        className="h-8 px-2"
        value={row[column.key]}
        onChange={(e) => onRowChange({ ...row, [column.key]: e.target.value })}
      />
    )
  }

  // Função para deletar uma linha
  const deleteRow = (index: number) => {
    const newRows = [...rows]
    newRows.splice(index, 1)
    setRows(newRows)
  }

  // Adiciona coluna de ações
  const columnsWithActions = useMemo(() => {
    return [
      ...finalColumns,
      {
        key: 'actions',
        name: 'Ações',
        width: 80,
        formatter: (_: any, { rowIdx }: { rowIdx: number }) => (
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteRow(rowIdx)}
              className="h-8 w-8 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )
      }
    ]
  }, [finalColumns])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Preview dos Dados</h2>
        <Button onClick={onNext}>Continuar</Button>
      </div>

      <Card className="overflow-hidden">
        <DataGrid
          columns={columnsWithActions}
          rows={rows}
          onRowsChange={setRows}
          className="h-[500px]"
          headerRowHeight={45}
        />
      </Card>
    </div>
  )
}
