"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import Link from "next/link";
import { useCookies } from "react-cookie";
import { useState, useEffect } from "react";

import { api } from "@/trpc/react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

const verificationSchema = z.object({
  verificationCode: z.string().length(6, "Verification code must be 6 digits"),
});

type VerificationFormData = z.infer<typeof verificationSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [cookies, setCookie] = useCookies(["authToken"]);
  const [isVerificationStep, setIsVerificationStep] = useState(false);
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");
  const [verificationCode, setVerificationCode] = useState("");
  
  // Registration form
  const {
    register: registerForm,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  // Verification form
  const {
    register: registerVerification,
    handleSubmit: handleVerificationSubmit,
    formState: { errors: verificationErrors },
    reset: resetVerificationForm,
    setValue: setVerificationValue,
  } = useForm<VerificationFormData>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      verificationCode: "",
    },
  });

  // Reset verification form when step changes
  useEffect(() => {
    if (isVerificationStep) {
      resetVerificationForm({ verificationCode: "" });
      setVerificationValue("verificationCode", "");
      setVerificationCode("");
    }
  }, [isVerificationStep, resetVerificationForm, setVerificationValue]);

  const registerMutation = api.register.useMutation({
    onSuccess: ({ token, requiresVerification }) => {
      if (requiresVerification) {
        setTempToken(token);
        setIsVerificationStep(true);
        toast.success("Please check your email for a verification code");
      } else {
        // This branch is unlikely to be used now, but keeping for safety
        setCookie("authToken", token, {
          path: "/",
          expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        });
        toast.success("Registration successful!");
        router.push("/dashboard");
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const verifyEmailMutation = api.verifyEmail.useMutation({
    onSuccess: ({ token }) => {
      setCookie("authToken", token, {
        path: "/",
        expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      });
      toast.success("Email verified successfully!");
      router.push("/dashboard");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onRegisterSubmit = (data: RegisterFormData) => {
    setEmail(data.email);
    registerMutation.mutate(data);
  };

  const onVerificationSubmit = (data: VerificationFormData) => {
    if (!tempToken) {
      toast.error("Something went wrong. Please try registering again.");
      return;
    }
    
    verifyEmailMutation.mutate({
      authToken: tempToken,
      verificationCode: data.verificationCode,
    });
  };

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-gray-50 to-gray-100 px-4 py-8">
      <div className="mx-auto mb-8 w-full max-w-6xl">
        <Link href="/" className="text-primary-600 hover:text-primary-700">
          <span className="text-xl font-bold">Fair Mind</span>
        </Link>
      </div>
      
      <div className="mx-auto w-full max-w-md">
        <Card className="animate-fadeIn">
          <CardHeader className="pb-4">
            <CardTitle className="text-center text-2xl">
              {isVerificationStep ? "Verify Your Email" : "Create Your Account"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!isVerificationStep ? (
              // Step 1: Registration form
              <form onSubmit={handleRegisterSubmit(onRegisterSubmit)} className="space-y-5">
                <div>
                  <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    {...registerForm("email")}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="you@example.com"
                  />
                  {registerErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{registerErrors.email.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="username" className="mb-1 block text-sm font-medium text-gray-700">
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    {...registerForm("username")}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="johndoe"
                  />
                  {registerErrors.username && (
                    <p className="mt-1 text-sm text-red-600">
                      {registerErrors.username.message}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    {...registerForm("password")}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="••••••••"
                  />
                  {registerErrors.password && (
                    <p className="mt-1 text-sm text-red-600">
                      {registerErrors.password.message}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={registerMutation.isPending}
                  className="w-full"
                >
                  {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            ) : (
              // Step 2: Verification form
              <form 
                key="verification-form" 
                onSubmit={handleVerificationSubmit(onVerificationSubmit)} 
                className="space-y-5"
              >
                <p className="text-center text-sm text-gray-600">
                  We've sent a verification code to <strong>{email}</strong>. 
                  Please enter it below to complete your registration.
                </p>
                <div className="mt-4">
                  <label htmlFor="verificationCode" className="mb-1 block text-sm font-medium text-gray-700">
                    Verification Code
                  </label>
                  <input
                    key="verification-code-input"
                    id="verificationCode"
                    type="text"
                    placeholder="6-digit code"
                    value={verificationCode}
                    onChange={(e) => {
                      setVerificationCode(e.target.value);
                      setVerificationValue("verificationCode", e.target.value);
                    }}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-center text-lg tracking-widest focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                  {verificationErrors.verificationCode && (
                    <p className="mt-1 text-sm text-red-600">
                      {verificationErrors.verificationCode.message}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={verifyEmailMutation.isPending}
                  className="w-full"
                >
                  {verifyEmailMutation.isPending ? "Verifying..." : "Verify Email"}
                </Button>
                <p className="mt-2 text-center text-xs text-gray-500">
                  Didn't receive the code? Check your spam folder or try registering again.
                </p>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex justify-center border-t border-gray-100 p-6">
            <p className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-primary-600 hover:text-primary-700">
                Sign In
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}