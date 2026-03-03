import { Star } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Politician } from "@/types/congress";

interface PoliticianCardProps {
  politician: Politician;
}

export function PoliticianCard({ politician }: PoliticianCardProps) {
  return (
    <Card className="transition-colors hover:border-primary/50">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={politician.image_url || ""} />
            <AvatarFallback>{politician.name.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold leading-none">{politician.name}</h3>
            <div className="mt-1 flex items-center gap-2">
              <Badge
                variant="secondary"
                className={
                  politician.party === "Democrat"
                    ? "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
                    : politician.party === "Republican"
                      ? "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                      : "bg-gray-500/10 text-gray-500"
                }
              >
                {politician.party}
              </Badge>
              <span className="text-muted-foreground text-xs">{politician.state}</span>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
          <Star className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mt-4 grid grid-cols-2 gap-4 border-border/50 border-t pt-4">
          <div>
            <p className="text-muted-foreground text-xs">Total Trades</p>
            <p className="font-medium">{politician.tradeCount}</p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground text-xs">Last Trade</p>
            <p className="font-medium text-sm">
              {politician.latestTradeDate ? new Date(politician.latestTradeDate).toLocaleDateString() : "N/A"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
