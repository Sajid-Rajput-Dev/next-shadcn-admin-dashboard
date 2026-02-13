"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, Lock } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { type LoginInput, loginSchema } from "@/lib/validations/auth";
import { MotionWrapper } from "@/components/ui/motion-wrapper";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Welcome back!");
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MotionWrapper className="space-y-6" duration={0.4}>
      <div className="space-y-2 text-center sm:text-left">
        <h1 className="font-bold text-3xl tracking-tight text-white">Welcome back</h1>
        <p className="text-muted-foreground text-sm">
          Enter your credentials to access your dashboard
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground/90">Email Address</FormLabel>
                <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <FormControl>
                    <Input
                        placeholder="name@example.com"
                        type="email"
                        autoComplete="email"
                        disabled={isLoading}
                        className="pl-9 bg-black/50 border-white/10 focus-visible:ring-primary/50 text-white placeholder:text-muted-foreground/50"
                        {...field}
                    />
                    </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground/90">Password</FormLabel>
                <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <FormControl>
                    <Input
                        type="password"
                        placeholder="••••••••"
                        autoComplete="current-password"
                        disabled={isLoading}
                        className="pl-9 bg-black/50 border-white/10 focus-visible:ring-primary/50 text-white placeholder:text-muted-foreground/50"
                        {...field}
                    />
                    </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button 
            className="w-full bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 h-11 font-medium text-base transition-all hover:scale-[1.02]" 
            type="submit" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </Form>

      <p className="text-center text-muted-foreground text-sm pt-2">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-semibold text-primary underline-offset-4 hover:underline transition-colors hover:text-primary/80">
          Create account
        </Link>
      </p>
    </MotionWrapper>
  );
}
