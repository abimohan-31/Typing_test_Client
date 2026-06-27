"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "../../store/useAuthStore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Keyboard, ArrowLeft, KeyRound, Mail, AlertTriangle } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";

// Strict validation constraints using Zod
const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, user, error, setError } = useAuthStore();
  const [loading, setLoading] = useState(false);

  // Parse callbackUrl or default to correct dashboard
  const callbackUrl = searchParams.get("callbackUrl");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Clear previous errors when visiting login
  useEffect(() => {
    setError(null);
  }, [setError]);

  // If already authenticated, redirect
  useEffect(() => {
    if (isAuthenticated && user) {
      if (callbackUrl) {
        router.push(callbackUrl);
      } else {
        if (user.role === "admin") router.push("/admin");
        else if (user.role === "team-leader") router.push("/leader");
        else router.push("/student");
      }
    }
  }, [isAuthenticated, user, router, callbackUrl]);

  const onSubmit = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      await login({
        email: values.email,
        password: values.password,
      });
      // Redirect handled in useEffect
    } catch (err) {
      // Error state captured in Zustand
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 relative overflow-hidden font-sans">
      {/* Background radial effects */}
      <div className="absolute top-[-10%] left-[-15%] w-[60%] h-[60%] rounded-full bg-brand/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-15%] w-[60%] h-[60%] rounded-full bg-brand/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md z-10 relative">
        <Link href="/" className="inline-flex items-center space-x-2 text-sm text-slate-400 hover:text-white mb-6 transition-all group">
          <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>

        <Card className="glass shadow-2xl border-panel-border">
          <CardHeader className="text-center space-y-2 pb-4">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-brand flex items-center justify-center shadow-lg shadow-brand/35 mb-2">
              <Keyboard className="h-6 w-6 text-white animate-pulse" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-white to-brand-light bg-clip-text text-transparent">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-slate-400">
              Sign in to resume synchronized keyboard practice.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Form Errors */}
              {error && (
                <div className="flex items-start space-x-2.5 p-3 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-medium">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Email */}
              <div className="relative">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="name@example.com"
                  error={errors.email?.message}
                  {...register("email")}
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  error={errors.password?.message}
                  {...register("password")}
                />
              </div>

              <Button type="submit" className="w-full mt-2" isLoading={loading}>
                Sign In to Platform
              </Button>
            </form>

            <div className="text-center mt-6 text-xs text-slate-500">
              <span>Don't have an account? </span>
              <Link href="/register" className="font-semibold text-brand-light hover:text-brand-light transition-colors">
                Create one now
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
