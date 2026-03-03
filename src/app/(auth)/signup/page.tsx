"use client";

import { useState } from "react";

import Link from "next/link";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Eye, EyeOff, Loader2, Lock, Mail, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MotionWrapper } from "@/components/ui/motion-wrapper";
import { createClient } from "@/lib/supabase/client";
import { type SignupInput, signupSchema } from "@/lib/validations/auth";

function getRedirectUrl(): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) return `${siteUrl}/api/auth/callback`;
  if (typeof window !== "undefined") return `${window.location.origin}/api/auth/callback`;
  return "/api/auth/callback";
}

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: SignupInput) => {
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: { full_name: data.fullName },
          emailRedirectTo: getRedirectUrl(),
        },
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      setEmailSent(data.email);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Email sent confirmation screen ──────────────────────────────────────
  if (emailSent) {
    return (
      <MotionWrapper className="space-y-6 text-center" duration={0.4}>
        <div className="flex justify-center">
          <div className="rounded-full bg-primary/10 p-4 ring-1 ring-primary/20">
            <CheckCircle2 className="h-10 w-10 text-primary" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="font-bold text-2xl text-white tracking-tight">Check your inbox</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            We sent a confirmation link to <span className="font-semibold text-white">{emailSent}</span>.
            <br />
            Click the link to activate your account.
          </p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-muted-foreground text-xs">
          Didn&apos;t receive it? Check your spam folder or{" "}
          <button
            type="button"
            className="text-primary underline-offset-4 hover:underline"
            onClick={() => setEmailSent(null)}
          >
            try again
          </button>
          .
        </div>
        <p className="text-center text-muted-foreground text-sm">
          Already confirmed?{" "}
          <Link href="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      </MotionWrapper>
    );
  }

  // ── Signup form ──────────────────────────────────────────────────────────
  return (
    <MotionWrapper className="space-y-6" duration={0.4}>
      <div className="space-y-2 text-center sm:text-left">
        <h1 className="font-bold text-3xl text-white tracking-tight">Create an account</h1>
        <p className="text-muted-foreground text-sm">Join thousands of traders tracking smart money</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground/90">Full Name</FormLabel>
                <div className="relative">
                  <User className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                  <FormControl>
                    <Input
                      placeholder="John Doe"
                      autoComplete="name"
                      disabled={isLoading}
                      className="border-white/10 bg-black/50 pl-9 text-white placeholder:text-muted-foreground/50 focus-visible:ring-primary/50"
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
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground/90">Email Address</FormLabel>
                <div className="relative">
                  <Mail className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                  <FormControl>
                    <Input
                      placeholder="name@example.com"
                      type="email"
                      autoComplete="email"
                      disabled={isLoading}
                      className="border-white/10 bg-black/50 pl-9 text-white placeholder:text-muted-foreground/50 focus-visible:ring-primary/50"
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
                  <Lock className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                  <FormControl>
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      disabled={isLoading}
                      className="border-white/10 bg-black/50 pr-10 pl-9 text-white placeholder:text-muted-foreground/50 focus-visible:ring-primary/50"
                      {...field}
                    />
                  </FormControl>
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute top-3 right-3 text-muted-foreground transition-colors hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground/90">Confirm Password</FormLabel>
                <div className="relative">
                  <Lock className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                  <FormControl>
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      disabled={isLoading}
                      className="border-white/10 bg-black/50 pr-10 pl-9 text-white placeholder:text-muted-foreground/50 focus-visible:ring-primary/50"
                      {...field}
                    />
                  </FormControl>
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute top-3 right-3 text-muted-foreground transition-colors hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            className="mt-2 h-11 w-full bg-primary font-medium text-base text-white shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] hover:bg-primary/90"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>
      </Form>

      <p className="pt-2 text-center text-muted-foreground text-sm">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-primary underline-offset-4 transition-colors hover:text-primary/80 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </MotionWrapper>
  );
}
