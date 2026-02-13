"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, FileText, Settings } from "lucide-react";
import Link from "next/link";

export function QuickActions() {
  return (
    <Card className="col-span-1 border-white/5 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-white">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Button variant="outline" className="w-full justify-start border-white/10 hover:bg-white/5 hover:text-primary transition-colors h-11" asChild>
          <Link href="/watchlist">
            <Plus className="mr-2 h-4 w-4" />
            Add to Watchlist
          </Link>
        </Button>
        <Button variant="outline" className="w-full justify-start border-white/10 hover:bg-white/5 hover:text-primary transition-colors h-11" asChild>
          <Link href="/data-explorer/trades">
             <Search className="mr-2 h-4 w-4" />
             Search Trades
          </Link>
        </Button>
        <Button variant="outline" className="w-full justify-start border-white/10 hover:bg-white/5 hover:text-primary transition-colors h-11" asChild>
          <Link href="/reports">
             <FileText className="mr-2 h-4 w-4" />
             View Reports
          </Link>
        </Button>
        <Button variant="outline" className="w-full justify-start border-white/10 hover:bg-white/5 hover:text-primary transition-colors h-11" asChild>
          <Link href="/settings">
             <Settings className="mr-2 h-4 w-4" />
             Settings
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
