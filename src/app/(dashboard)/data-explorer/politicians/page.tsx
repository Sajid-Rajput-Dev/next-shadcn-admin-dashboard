"use client";

import { useState } from "react";
import { usePoliticians } from "@/hooks/use-politicians";
import { PoliticianCard } from "./_components/politician-card";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";

export default function PoliticiansPage() {
  const { data, isLoading, isError } = usePoliticians();
  const [search, setSearch] = useState("");

  const politicians = data?.data || [];
  
  const filteredPoliticians = politicians.filter((p) => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.state?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Politician Directory</h2>
        <p className="text-muted-foreground">
           Who is trading on Capitol Hill? Track individual representatives and senators.
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or state..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      {isLoading ? (
        <div className="flex h-[400px] w-full items-center justify-center">
             <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : isError ? (
        <div className="text-red-500">Failed to load politicians.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPoliticians.map((politician, i) => (
            <PoliticianCard key={i} politician={politician} />
          ))}
          {filteredPoliticians.length === 0 && (
            <div className="col-span-full text-center py-10 text-muted-foreground">
                No politicians found matching your search.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
