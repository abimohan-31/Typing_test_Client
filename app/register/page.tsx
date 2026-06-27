"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "../../store/useAuthStore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Keyboard,
  ArrowLeft,
  Users,
  GraduationCap,
  ShieldAlert,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

// Strict validation constraints using Zod
const registerSchema = z
  .object({
    name: z.string().min(2, "Full name must be at least 2 characters long"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    registerStudent,
    registerLeader,
    isAuthenticated,
    user,
    error,
    setError,
  } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const [role, setRole] = useState<"student" | "team-leader">("student");

  // Stabilize role from URL after hydration to prevent mismatch
  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam === "team-leader") setRole("team-leader");
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Clear previous errors on load
  useEffect(() => {
    setError(null);
  }, [setError]);

  // Parse callbackUrl or default to correct dashboard
  const callbackUrl = searchParams.get("callbackUrl");

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

  const onSubmit = async (values: RegisterFormValues) => {
    setLoading(true);
    try {
      if (role === "student") {
        await registerStudent({
          name: values.name,
          email: values.email,
          password: values.password,
        });
      } else {
        await registerLeader({
          name: values.name,
          email: values.email,
          password: values.password,
        });
      }
    } catch (err) {
      // Error captured in Zustand
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] left-[-15%] w-[60%] h-[60%] rounded-full bg-brand/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-15%] w-[60%] h-[60%] rounded-full bg-brand/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md z-10 relative">
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-sm text-slate-400 hover:text-white mb-6 transition-all group"
        >
          <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>

        <Card className="glass shadow-2xl border-panel-border/50 bg-slate-900/40 backdrop-blur-xl ring-1 ring-white/10">
          <CardHeader className="text-center space-y-2 pb-4">
            <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center shadow-lg shadow-brand/20 mb-2 ring-2 ring-white/10">
              <Keyboard className="h-7 w-7 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-white to-brand-light bg-clip-text text-transparent">
              Create Account
            </CardTitle>
            <CardDescription className="text-slate-400">
              Join the synchronized live typing arena.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Role Toggle Capsules */}
            <div className="flex p-1 bg-slate-950/80 border border-panel-border rounded-xl mb-8">
              <button
                type="button"
                onClick={() => setRole("student")}
                className={`flex-1 flex items-center justify-center space-x-2 py-2.5 text-xs font-bold rounded-lg transition-all duration-300 cursor-pointer ${
                  role === "student"
                    ? "bg-brand text-white shadow-lg shadow-brand/20"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <GraduationCap className="h-4 w-4" />
                <span>Student</span>
              </button>
              <button
                type="button"
                onClick={() => setRole("team-leader")}
                className={`flex-1 flex items-center justify-center space-x-2 py-2.5 text-xs font-bold rounded-lg transition-all duration-300 cursor-pointer ${
                  role === "team-leader"
                    ? "bg-brand text-white shadow-lg shadow-brand/20"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Users className="h-4 w-4" />
                <span>Team Leader</span>
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Form Errors */}
              {error && (
                <div className="flex items-start space-x-2.5 p-3 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-medium">
                  <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wider font-bold text-slate-500 ml-1">
                  Full Name
                </label>
                <Input
                  placeholder={
                    role === "student" ? "John Doe" : "Professor Smith"
                  }
                  className="bg-slate-950/50 border-panel-border focus:border-brand/50 focus:ring-brand/20 transition-all h-11"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-[10px] text-red-400 font-medium ml-1 mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wider font-bold text-slate-500 ml-1">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  className="bg-slate-950/50 border-panel-border focus:border-brand/50 focus:ring-brand/20 transition-all h-11"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-[10px] text-red-400 font-medium ml-1 mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wider font-bold text-slate-500 ml-1">
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="Minimum 6 characters"
                  className="bg-slate-950/50 border-panel-border focus:border-brand/50 focus:ring-brand/20 transition-all h-11"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-[10px] text-red-400 font-medium ml-1 mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wider font-bold text-slate-500 ml-1">
                  Confirm Password
                </label>
                <Input
                  type="password"
                  placeholder="Confirm your password"
                  className="bg-slate-950/50 border-panel-border focus:border-brand/50 focus:ring-brand/20 transition-all h-11"
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword && (
                  <p className="text-[10px] text-red-400 font-medium ml-1 mt-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full mt-4 h-11 bg-brand hover:bg-brand-light text-white font-bold shadow-lg shadow-brand/20"
                isLoading={loading}
              >
                Register as {role === "student" ? "Student" : "Leader"}
              </Button>
            </form>

            <div className="text-center mt-6 text-xs text-slate-500">
              <span>Already have an account? </span>
              <Link
                href="/login"
                className="font-semibold text-brand-light hover:text-brand-light transition-colors"
              >
                Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center text-white">
          Loading...
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
