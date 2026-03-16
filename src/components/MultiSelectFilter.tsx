import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { ChevronsUpDown } from "lucide-react";

export interface FilterOption {
  id: string;
  label: string;
}

interface MultiSelectFilterProps {
  label: string;
  options: FilterOption[];
  selected: string[];
  onSelectionChange: (selected: string[]) => void;
  searchPlaceholder?: string;
  width?: string;
}

export function MultiSelectFilter({
  label,
  options,
  selected,
  onSelectionChange,
  searchPlaceholder,
  width = "w-[160px]",
}: MultiSelectFilterProps) {
  const [open, setOpen] = useState(false);
  const allSelected = selected.length === 0;

  const toggleOption = (id: string) => {
    if (selected.includes(id)) {
      onSelectionChange(selected.filter((s) => s !== id));
    } else {
      onSelectionChange([...selected, id]);
    }
  };

  const selectAll = () => {
    onSelectionChange([]);
  };

  const displayLabel = allSelected
    ? `All ${label}`
    : selected.length === 1
      ? options.find((o) => o.id === selected[0])?.label || label
      : `${selected.length} ${label}`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("h-7 justify-between text-xs font-normal", width)}
        >
          <span className="truncate">{displayLabel}</span>
          <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder={searchPlaceholder || `Search ${label.toLowerCase()}...`}
            className="h-8 text-xs"
          />
          <CommandList>
            <CommandEmpty className="py-2 text-xs text-center">
              No results found.
            </CommandEmpty>
            <CommandGroup>
              <CommandItem
                value={`all-${label.toLowerCase()}`}
                onSelect={selectAll}
                className="text-xs"
              >
                <Checkbox
                  checked={allSelected}
                  className="mr-2 h-3.5 w-3.5 rounded-sm"
                />
                All {label}
              </CommandItem>
              {options.map((option) => (
                <CommandItem
                  key={option.id}
                  value={option.label}
                  onSelect={() => toggleOption(option.id)}
                  className="text-xs"
                >
                  <Checkbox
                    checked={selected.includes(option.id)}
                    className="mr-2 h-3.5 w-3.5 rounded-sm"
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
