"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { Bell, LogOut, Shield, User } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/client";
import { usePreferencesStore } from "@/stores/use-preferences-hook";

export default function SettingsPage() {
  const { notifications, theme, updatePreferences } = usePreferencesStore();
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser({
          email: user.email || "",
          name: user.email?.split("@")[0] || "User",
        });
      }
    });
  }, [supabase.auth]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error signing out");
      return;
    }
    router.push("/login");
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-bold text-3xl text-white tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences and notifications.</p>
      </div>

      <Tabs defaultValue="account" className="w-full">
        <TabsList className="mb-8 grid w-full grid-cols-3 rounded-xl border border-white/10 bg-black/40 p-1">
          <TabsTrigger
            value="account"
            className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white"
          >
            Account
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white"
          >
            Notifications
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white"
          >
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-6">
          <Card className="border-white/5 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="font-bold text-lg text-white">Profile Information</CardTitle>
                  <CardDescription>Update your personal details.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-foreground/90">Full Name</Label>
                  <Input defaultValue={user?.name || ""} className="border-white/10 bg-black/40" />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground/90">Email Address</Label>
                  <Input
                    defaultValue={user?.email || "demo@capitolalpha.com"}
                    disabled
                    className="border-white/5 bg-black/20 opacity-70"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button className="bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90">
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-500/20 bg-red-500/5 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-red-500">Danger Zone</CardTitle>
              <CardDescription>Irreversible actions for your account.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Sign out of all devices</p>
                <p className="text-muted-foreground text-xs">You will be redirected to the login page.</p>
              </div>
              <Button variant="destructive" onClick={handleSignOut} className="gap-2">
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="border-white/5 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="font-bold text-lg text-white">Email Notifications</CardTitle>
                  <CardDescription>Choose what updates you want to receive via email.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="font-medium text-foreground/90">Marketing Emails</Label>
                  <p className="text-muted-foreground text-xs">Receive updates about new features and promotions.</p>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(checked) =>
                    updatePreferences({ notifications: { ...notifications, email: checked } })
                  }
                  className="data-[state=checked]:bg-primary"
                />
              </div>
              <Separator className="bg-white/5" />
              <div className="pointer-events-none flex items-center justify-between opacity-50">
                <div className="space-y-0.5">
                  <Label className="font-medium text-foreground/90">Push Notifications</Label>
                  <p className="text-muted-foreground text-xs">
                    Receive real-time alerts on your device (Coming Soon).
                  </p>
                </div>
                <Switch checked={false} disabled />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="border-white/5 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="font-bold text-lg text-white">Password & Authentication</CardTitle>
                  <CardDescription>Manage your security preferences.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Current Password</Label>
                <Input type="password" placeholder="••••••••" className="border-white/10 bg-black/40" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input type="password" placeholder="••••••••" className="border-white/10 bg-black/40" />
                </div>
                <div className="space-y-2">
                  <Label>Confirm New Password</Label>
                  <Input type="password" placeholder="••••••••" className="border-white/10 bg-black/40" />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button variant="outline" className="border-white/10 hover:bg-white/5">
                  Update Password
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
