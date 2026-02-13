import { useQuery } from "@tanstack/react-query";
import { type Politician } from "@/types/congress";

export function usePoliticians() {
    return useQuery<{ data: Politician[] }>({
        queryKey: ["politicians"],
        queryFn: async () => {
            const res = await fetch("/api/congress/politicians");
            if (!res.ok) throw new Error("Failed to fetch politicians");
            return res.json();
        },
        staleTime: 30 * 60 * 1000, // 30 mins
    });
}
