"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, Lock, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { type SignupInput, signupSchema } from "@/lib/validations/auth";
import { MotionWrapper } from "@/components/ui/motion-wrapper";

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
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
          data: {
            full_name: data.fullName,
          },
        },
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Account created successfully!");
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
        <h1 className="font-bold text-3xl tracking-tight text-white">Create an account</h1>
        <p className="text-muted-foreground text-sm">
          Join thousands of traders tracking smart money
        </p>
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
                     <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <FormControl>
                        <Input
                        placeholder="John Doe"
                        autoComplete="name"
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
                        autoComplete="new-password"
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
            className="w-full mt-2 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 h-11 font-medium text-base transition-all hover:scale-[1.02]" 
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

      <p className="text-center text-muted-foreground text-sm pt-2">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary underline-offset-4 hover:underline transition-colors hover:text-primary/80">
          Sign in
        </Link>
      </p>
    </MotionWrapper>
  );
}
