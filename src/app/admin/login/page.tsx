"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import Link from "next/link";
import { useCookies } from "react-cookie";

import { api } from "@/trpc/react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";

const adminLoginSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

type AdminLoginFormData = z.infer<typeof adminLoginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const [, setCookie] = useCookies(["adminAuthToken"]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginFormData>({
    resolver: zodResolver(adminLoginSchema),
  });

  const adminLoginMutation = api.adminLogin.useMutation({
    onSuccess: ({ token }) => {
      setCookie("adminAuthToken", token, {
        path: "/",
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
      });
      toast.success("Admin login successful!");
      router.push("/admin/dashboard");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: AdminLoginFormData) => {
    adminLoginMutation.mutate(data);
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
            <CardTitle className="text-center text-2xl">Admin Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
                  Admin Password
                </label>
                <input
                  id="password"
                  type="password"
                  {...register("password")}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="••••••••"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                disabled={adminLoginMutation.isPending}
                className="w-full"
              >
                {adminLoginMutation.isPending ? "Logging in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-gray-100 p-6">
            <p className="text-center text-sm text-gray-600">
              <Link href="/" className="font-medium text-primary-600 hover:text-primary-700">
                Return to Home
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
