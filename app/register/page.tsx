"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "../../store/useAuthStore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Keyboard, ArrowLeft, Users, GraduationCap, ShieldAlert } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";

// Strict validation constraints using Zod
const registerSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters long"),
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { registerStudent, registerLeader, isAuthenticated, user, error, setError } = useAuthStore();
  const [loading, setLoading] = useState(false);
  
  // Choose initial role from search query or default to 'student'
  const initialRole = searchParams.get("role") === "team-leader" ? "team-leader" : "student";
  const [role, setRole] = useState<"student" | "team-leader">(initialRole);

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

  // If already authenticated, redirect
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "admin") router.push("/admin");
      else if (user.role === "team-leader") router.push("/leader");
      else router.push("/student");
    }
  }, [isAuthenticated, user, router]);

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
    <div className="flex min-h-screen items-center justify-center bg-[#090a0f] p-4 relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] left-[-15%] w-[60%] h-[60%] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-15%] w-[60%] h-[60%] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md z-10 relative">
        <Link href="/" className="inline-flex items-center space-x-2 text-sm text-slate-400 hover:text-white mb-6 transition-all group">
          <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>

        <Card className="glass shadow-2xl border-slate-800">
          <CardHeader className="text-center space-y-2 pb-4">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/35 mb-2">
              <Keyboard className="h-6 w-6 text-white animate-pulse" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-white to-indigo-300 bg-clip-text text-transparent">
              Create Account
            </CardTitle>
            <CardDescription className="text-slate-400">
              Join the synchronized live typing arena.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Role Toggle Capsules */}
            <div className="flex p-1 bg-slate-950/60 border border-slate-850 rounded-lg mb-6">
              <button
                type="button"
                onClick={() => setRole("student")}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  role === "student"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <GraduationCap className="h-4 w-4" />
                <span>Student</span>
              </button>
              <button
                type="button"
                onClick={() => setRole("team-leader")}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  role === "team-leader"
                    ? "bg-indigo-600 text-white shadow-sm"
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
              <Input
                label="Full Name"
                placeholder={role === "student" ? "John Doe" : "Professor Smith"}
                error={errors.name?.message}
                {...register("name")}
              />

              {/* Email */}
              <Input
                label="Email Address"
                type="email"
                placeholder="name@example.com"
                error={errors.email?.message}
                {...register("email")}
              />

              {/* Password */}
              <Input
                label="Password"
                type="password"
                placeholder="Minimum 6 characters"
                error={errors.password?.message}
                {...register("password")}
              />

              {/* Confirm Password */}
              <Input
                label="Confirm Password"
                type="password"
                placeholder="Confirm your password"
                error={errors.confirmPassword?.message}
                {...register("confirmPassword")}
              />

              <Button type="submit" className="w-full mt-2" isLoading={loading}>
                Register as {role === "student" ? "Student" : "Leader"}
              </Button>
            </form>

            <div className="text-center mt-6 text-xs text-slate-500">
              <span>Already have an account? </span>
              <Link href="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
