"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { useCookies } from "react-cookie";
import Link from "next/link";

import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { UpgradeDialog } from "@/components/UpgradeDialog";

const projectSchema = z.object({
  name: z.string().min(1, "Negotiation topic is required").max(100),
  partyAName: z.string().min(1, "Your name is required").max(100),
  partyA: z.string().min(1, "Your interests are required").max(1000),
  partyBName: z.string().min(1, "The other Party's name is required").max(100),
  partyB: z.string().min(1, "The other Party's interests are required").max(1000),
});

type ProjectFormData = z.infer<typeof projectSchema>;

export default function NewProjectPage() {
  const router = useRouter();
  const [cookies] = useCookies(["authToken"]);
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
  });

  // Check if user has reached project limit
  const projectsQuery = api.getProjects.useQuery(
    { authToken: cookies.authToken },
    {
      enabled: !!cookies.authToken,
      onError: (error) => {
        if (error.data?.code === "UNAUTHORIZED") {
          router.push("/login");
        }
      },
    },
  );

  useEffect(() => {
    // If user is on free tier and has reached project limit, show upgrade dialog
    if (
      projectsQuery.data?.userTier === "free" &&
      projectsQuery.data?.projectCount >=
        (projectsQuery.data?.projectLimit || 2)
    ) {
      setIsUpgradeDialogOpen(true);
    }
  }, [projectsQuery.data]);

  const upgradeUserMutation = api.upgradeUserTier.useMutation({
    onSuccess: () => {
      toast.success("Successfully upgraded to premium tier!");
      setIsUpgradeDialogOpen(false);
      projectsQuery.refetch();
    },
    onError: (error) => {
      toast.error(`Failed to upgrade: ${error.message}`);
    },
  });

  const handleUpgrade = () => {
    if (!cookies.authToken) {
      router.push("/login");
      return;
    }

    upgradeUserMutation.mutate({
      authToken: cookies.authToken,
    });
  };

  const createProjectMutation = api.createProject.useMutation({
    onSuccess: () => {
      toast.success("Project created successfully!");
      router.push("/dashboard");
    },
    onError: (error) => {
      if (error.data?.code === "UNAUTHORIZED") {
        router.push("/login");
      } else {
        toast.error(error.message);
      }
    },
  });

  const onSubmit = (data: ProjectFormData) => {
    if (!cookies.authToken) {
      router.push("/login");
      return;
    }

    createProjectMutation.mutate({
      authToken: cookies.authToken,
      name: data.name,
      partyAName: data.partyAName,
      partyA: data.partyA,
      partyBName: data.partyBName,
      partyB: data.partyB,
    });
  };

  if (!cookies.authToken) {
    router.push("/login");
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8">
      <div className="mx-auto max-w-4xl px-4">
        {/* Breadcrumb and Header */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-1 text-sm text-gray-500">
            <Link href="/dashboard" className="hover:text-gray-700">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-gray-700">New Project</span>
          </div>
          <h1 className="mt-2 text-xl font-bold text-gray-900 sm:text-2xl">
            Create New Negotiation Project
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Define your negotiation problem and identify the interests of both
            parties.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="animate-fadeIn space-y-6"
        >
          {/* Step 1: Define the Negotiation Problem */}
          <div className="mb-2">
            <div className="mb-2 flex items-center">
              <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
                1
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Define the Negotiation Problem
              </h2>
            </div>
            <Card className="overflow-hidden border border-gray-200">
              <CardContent className="space-y-4 pt-5">
                <p className="mb-2 text-sm text-gray-600">
                  Separate people from the problem by clearly defining what
                  needs to be negotiated.
                </p>
                <div>
                  <input
                    id="name"
                    type="text"
                    placeholder="Office Space Lease Agreement"
                    {...register("name")}
                    className="mt-1 w-full rounded-md border border-gray-300 p-2.5 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.name.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Step 2: Identify Parties' Interests */}
          <div>
            <div className="mb-2 flex items-center">
              <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-white">
                2
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Identify Parties' Interests
              </h2>
            </div>
            <Card className="overflow-hidden border border-gray-200">
              <CardContent className="space-y-4 pt-5">
                <p className="mb-2 text-sm text-gray-600">
                  Focus on underlying interests rather than positions to find
                  solutions that satisfy both parties.
                </p>
                <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
                  {/* You (First Party) */}
                  <div className="space-y-4 rounded-lg border border-blue-200 p-4">
                    <h3 className="font-medium text-blue-800">You</h3>
                    <div>
                      <label
                        htmlFor="partyAName"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Name
                      </label>
                      <input
                        id="partyAName"
                        type="text"
                        placeholder="Your name or organization"
                        {...register("partyAName")}
                        className="mt-1 w-full rounded-md border border-gray-300 p-2.5 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                      {errors.partyAName && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.partyAName.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="partyA"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Underlying Interests
                      </label>
                      <textarea
                        id="partyA"
                        placeholder="What do you truly need from this negotiation?"
                        {...register("partyA")}
                        className="mt-1 w-full rounded-md border border-gray-300 p-2.5 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        rows={4}
                      />
                      {errors.partyA && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.partyA.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* The other Party (Second Party) */}
                  <div className="space-y-4 rounded-lg border border-purple-200 p-4">
                    <h3 className="font-medium text-purple-800">
                      The other Party
                    </h3>
                    <div>
                      <label
                        htmlFor="partyBName"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Name
                      </label>
                      <input
                        id="partyBName"
                        type="text"
                        placeholder="Their name or organization"
                        {...register("partyBName")}
                        className="mt-1 w-full rounded-md border border-gray-300 p-2.5 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                      {errors.partyBName && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.partyBName.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="partyB"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Underlying Interests
                      </label>
                      <textarea
                        id="partyB"
                        placeholder="What does the other party truly need from this negotiation?"
                        {...register("partyB")}
                        className="mt-1 w-full rounded-md border border-gray-300 p-2.5 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        rows={4}
                      />
                      {errors.partyB && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.partyB.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard")}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createProjectMutation.isPending}
              className="w-full sm:w-auto"
            >
              {createProjectMutation.isPending
                ? "Creating project..."
                : "Create Project"}
            </Button>
          </div>
        </form>
      </div>

      {/* Upgrade Dialog */}
      <UpgradeDialog
        isOpen={isUpgradeDialogOpen}
        onClose={() => router.push("/dashboard")}
        onUpgrade={handleUpgrade}
        userTier={projectsQuery.data?.userTier}
      />
    </main>
  );
}