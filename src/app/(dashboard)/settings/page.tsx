"use client";

import { usePreferencesStore } from "@/stores/use-preferences-hook";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { LogOut, User, Bell, Shield } from "lucide-react";

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
    <div className="flex flex-col gap-8 p-6 max-w-5xl mx-auto w-full">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-white">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences and notifications.</p>
      </div>

      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full mb-8 grid-cols-3 bg-black/40 border border-white/10 p-1 rounded-xl">
          <TabsTrigger value="account" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">Account</TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">Notifications</TabsTrigger>
          <TabsTrigger value="security" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-6">
          <Card className="border-white/5 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-primary/10 rounded-lg">
                    <User className="h-5 w-5 text-primary" />
                 </div>
                 <div>
                    <CardTitle className="text-lg font-bold text-white">Profile Information</CardTitle>
                    <CardDescription>Update your personal details.</CardDescription>
                 </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                 <div className="space-y-2">
                    <Label className="text-foreground/90">Full Name</Label>
                    <Input defaultValue={user?.name || ""} className="bg-black/40 border-white/10" />
                 </div>
                 <div className="space-y-2">
                    <Label className="text-foreground/90">Email Address</Label>
                    <Input defaultValue={user?.email || "demo@capitolalpha.com"} disabled className="bg-black/20 border-white/5 opacity-70" />
                 </div>
              </div>

              <div className="flex justify-end">
                <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
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
             <CardContent className="flex justify-between items-center">
                <div>
                   <p className="font-medium text-foreground">Sign out of all devices</p>
                   <p className="text-xs text-muted-foreground">You will be redirected to the login page.</p>
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
                 <div className="p-2 bg-primary/10 rounded-lg">
                    <Bell className="h-5 w-5 text-primary" />
                 </div>
                 <div>
                    <CardTitle className="text-lg font-bold text-white">Email Notifications</CardTitle>
                    <CardDescription>Choose what updates you want to receive via email.</CardDescription>
                 </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-foreground/90 font-medium">Marketing Emails</Label>
                  <p className="text-xs text-muted-foreground">Receive updates about new features and promotions.</p>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(checked) => updatePreferences({ notifications: { ...notifications, email: checked } })}
                  className="data-[state=checked]:bg-primary"
                />
              </div>
              <Separator className="bg-white/5" />
              <div className="flex items-center justify-between opacity-50 pointer-events-none">
                <div className="space-y-0.5">
                  <Label className="text-foreground/90 font-medium">Push Notifications</Label>
                  <p className="text-xs text-muted-foreground">Receive real-time alerts on your device (Coming Soon).</p>
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
                 <div className="p-2 bg-primary/10 rounded-lg">
                    <Shield className="h-5 w-5 text-primary" />
                 </div>
                 <div>
                    <CardTitle className="text-lg font-bold text-white">Password & Authentication</CardTitle>
                    <CardDescription>Manage your security preferences.</CardDescription>
                 </div>
              </div>
            </CardHeader>
             <CardContent className="space-y-4">
                 <div className="space-y-2">
                     <Label>Current Password</Label>
                     <Input type="password" placeholder="••••••••" className="bg-black/40 border-white/10" />
                 </div>
                 <div className="grid md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                         <Label>New Password</Label>
                         <Input type="password" placeholder="••••••••" className="bg-black/40 border-white/10" />
                     </div>
                     <div className="space-y-2">
                         <Label>Confirm New Password</Label>
                         <Input type="password" placeholder="••••••••" className="bg-black/40 border-white/10" />
                     </div>
                 </div>
                 <div className="pt-4 flex justify-end">
                      <Button variant="outline" className="border-white/10 hover:bg-white/5">Update Password</Button>
                 </div>
             </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
