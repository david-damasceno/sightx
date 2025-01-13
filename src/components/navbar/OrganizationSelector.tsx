import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useOrganization } from "@/hooks/useOrganization"
import { useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export function OrganizationSelector() {
  const [open, setOpen] = useState(false)
  const { 
    organizations, 
    currentOrganization, 
    setCurrentOrganization, 
    loading 
  } = useOrganization()

  if (loading) {
    return <Skeleton className="h-9 w-[200px]" />
  }

  if (!organizations || organizations.length === 0) {
    return null
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {currentOrganization?.name ?? "Selecionar organização"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Buscar organização..." />
          <CommandEmpty>Nenhuma organização encontrada.</CommandEmpty>
          <CommandGroup>
            {organizations.map((org) => (
              <CommandItem
                key={org.id}
                value={org.name}
                onSelect={() => {
                  setCurrentOrganization(org)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    currentOrganization?.id === org.id ? "opacity-100" : "opacity-0"
                  )}
                />
                {org.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}