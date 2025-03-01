
import { ColumnMetadata } from "@/types/data-imports"

export interface Column {
  name: string
  type: string
  sample: any
}

export function adaptColumnMetadata(metadata: ColumnMetadata): Column {
  return {
    name: metadata.original_name,
    type: metadata.data_type || 'text',
    sample: metadata.sample_values
  }
}
