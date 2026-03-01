import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { mockOwners, mockPets } from "@/lib/mock-data";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Search, User, PawPrint } from "lucide-react";
import { cn } from "@/lib/utils";

export function GlobalSearch() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const q = debouncedQuery.toLowerCase().trim();
  const ownerResults = q
    ? mockOwners.filter((o) => o.full_name.toLowerCase().includes(q) || o.phone.includes(q)).slice(0, 5)
    : [];
  const petResults = q
    ? mockPets.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 5)
    : [];
  const hasResults = ownerResults.length > 0 || petResults.length > 0;

  const handleSelect = (path: string) => {
    setOpen(false);
    setQuery("");
    navigate(path);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); if (!open) setOpen(true); }}
            onFocus={() => { if (query) setOpen(true); }}
            placeholder="Search owners, pets, phone..."
            className="pl-9 h-9 text-sm"
          />
        </div>
      </PopoverTrigger>
      {q && (
        <PopoverContent className="w-[320px] p-0 pointer-events-auto" align="start" onOpenAutoFocus={(e) => e.preventDefault()}>
          {!hasResults ? (
            <p className="p-4 text-sm text-muted-foreground text-center">No results found</p>
          ) : (
            <div className="max-h-[300px] overflow-y-auto">
              {ownerResults.length > 0 && (
                <div>
                  <p className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Owners</p>
                  {ownerResults.map((o) => (
                    <button
                      key={o.id}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-muted/50 text-left transition-colors"
                      onClick={() => handleSelect(`/owners/${o.id}`)}
                    >
                      <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium truncate">{o.full_name}</p>
                        <p className="text-xs text-muted-foreground">{o.phone}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {petResults.length > 0 && (
                <div>
                  <p className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-t">Pets</p>
                  {petResults.map((p) => (
                    <button
                      key={p.id}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-muted/50 text-left transition-colors"
                      onClick={() => handleSelect(`/pets/${p.id}`)}
                    >
                      <PawPrint className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium truncate">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.species} · {p.owner?.full_name}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </PopoverContent>
      )}
    </Popover>
  );
}
