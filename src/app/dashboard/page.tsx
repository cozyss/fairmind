"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCookies } from "react-cookie";
import toast from "react-hot-toast";
import Link from "next/link";

import { api } from "@/trpc/react";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { UpgradeDialog } from "@/components/UpgradeDialog";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProjectCardSkeleton, Skeleton } from "@/components/ui/Skeleton";
import { PlusIcon, TrashIcon, CalendarIcon, LogoutIcon, SparklesIcon, UserIcon } from "@/components/ui/Icons";
import { Badge } from "@/components/ui/Badge";

export default function DashboardPage() {
  const router = useRouter();
  const [cookies, setCookie, removeCookie] = useCookies(["authToken"]);
  const [projectToDelete, setProjectToDelete] = useState<number | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);

  const getTierDisplayName = (tier: string | undefined) => {
    switch (tier) {
      case "paid":
        return "Premium";
      case "waitlist":
        return "Waitlist";
      case "free":
      default:
        return "Free";
    }
  };

  const getTierBadgeVariant = (tier: string | undefined): "primary" | "warning" | "success" => {
    switch (tier) {
      case "paid":
        return "success";
      case "waitlist":
        return "warning";
      case "free":
      default:
        return "primary";
    }
  };

  const projectsQuery = api.getProjects.useQuery(
    { authToken: cookies.authToken },
    {
      enabled: !!cookies.authToken,
      onError: (error) => {
        if (error.data?.code === "UNAUTHORIZED") {
          router.push("/login");
        } else {
          toast.error(error.message);
        }
      },
    },
  );

  const deleteProjectMutation = api.deleteProject.useMutation({
    onSuccess: () => {
      toast.success("Project deleted successfully");
      projectsQuery.refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete project: ${error.message}`);
    },
  });

  const upgradeUserMutation = api.upgradeUserTier.useMutation({
    onSuccess: () => {
      toast.success("You've been added to the premium waitlist!");
      projectsQuery.refetch();
      setIsUpgradeDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Failed to join waitlist: ${error.message}`);
    },
  });

  const handleDeleteClick = (e: React.MouseEvent, projectId: number) => {
    e.preventDefault(); // Prevent navigation to project details
    e.stopPropagation(); // Prevent event bubbling
    setProjectToDelete(projectId);
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    console.log("Confirm delete button clicked for project ID:", projectToDelete);
    if (projectToDelete !== null) {
      deleteProjectMutation.mutate({
        authToken: cookies.authToken,
        projectId: projectToDelete,
      });
    }
    setIsConfirmDialogOpen(false);
    setProjectToDelete(null);
  };

  const handleCancelDelete = () => {
    console.log("Cancel delete button clicked");
    setIsConfirmDialogOpen(false);
    setProjectToDelete(null);
  };

  const handleLogout = () => {
    removeCookie("authToken", { path: "/" });
    toast.success("Logged out successfully");
    router.push("/login");
  };

  const handleUpgrade = () => {
    if (!cookies.authToken) {
      router.push("/login");
      return;
    }

    upgradeUserMutation.mutate({
      authToken: cookies.authToken,
    });
  };

  if (!cookies.authToken) {
    router.push("/login");
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              {projectsQuery.data?.username ? `${projectsQuery.data.username}'s Projects` : "My Projects"}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <div className="flex items-center">
                <UserIcon size={16} className="mr-1.5 text-gray-500" />
                <Badge 
                  variant={getTierBadgeVariant(projectsQuery.data?.userTier)}
                  className="mr-2"
                >
                  {getTierDisplayName(projectsQuery.data?.userTier)} Tier
                </Badge>
                
                {projectsQuery.data?.userTier === "paid" ? (
                  <span className="text-xs text-gray-500">Unlimited Projects</span>
                ) : (
                  <div className="flex items-center">
                    <span className="text-xs text-gray-500">
                      {projectsQuery.data?.projectCount} of {projectsQuery.data?.projectLimit} Projects Used
                    </span>
                    <div className="ml-2 h-1.5 w-16 overflow-hidden rounded-full bg-gray-200">
                      <div 
                        className={`h-full ${
                          projectsQuery.data?.projectCount === projectsQuery.data?.projectLimit 
                            ? "bg-red-500" 
                            : "bg-primary-500"
                        }`}
                        style={{ 
                          width: `${projectsQuery.data?.projectLimit 
                            ? (projectsQuery.data.projectCount / projectsQuery.data.projectLimit) * 100 
                            : 0}%` 
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={() => {
                if (
                  projectsQuery.data?.userTier === "free" && 
                  projectsQuery.data?.projectCount >= (projectsQuery.data?.projectLimit || 2)
                ) {
                  setIsUpgradeDialogOpen(true);
                } else {
                  router.push("/dashboard/new-project");
                }
              }}
              icon={<PlusIcon size={16} />}
              className="w-full sm:w-auto"
            >
              Create New Project
            </Button>
            {projectsQuery.data?.userTier === "free" && (
              <Button
                variant="outline"
                onClick={() => setIsUpgradeDialogOpen(true)}
                icon={<SparklesIcon size={16} />}
                className="w-full sm:w-auto"
              >
                Upgrade
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleLogout}
              icon={<LogoutIcon size={16} />}
              className="w-full sm:w-auto"
            >
              Logout
            </Button>
          </div>
        </div>

        {projectsQuery.isPending ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <ProjectCardSkeleton key={i} />
            ))}
          </div>
        ) : projectsQuery.error ? (
          <Card className="border border-red-100 bg-red-50 p-4 sm:p-6">
            <div className="text-center text-red-600">
              <h3 className="mb-2 font-semibold">Error Loading Projects</h3>
              <p className="text-sm">{projectsQuery.error.message}</p>
              <Button 
                variant="outline" 
                className="mt-4" 
                onClick={() => projectsQuery.refetch()}
              >
                Try Again
              </Button>
            </div>
          </Card>
        ) : projectsQuery.data?.projects.length === 0 ? (
          <EmptyState
            title="No projects yet"
            description="Create your first project to get started with negotiation analysis."
            icon={<PlusIcon size={40} />}
            action={{
              label: "Create New Project",
              onClick: () => router.push("/dashboard/new-project"),
            }}
            className="mt-8"
          />
        ) : (
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projectsQuery.data?.projects.map((project) => (
              <Card 
                key={project.id} 
                className="group relative overflow-hidden border-2 border-transparent transition-all duration-300 hover:border-primary-500"
                hover={true}
              >
                <Link
                  href={`/dashboard/project/${project.id}`}
                  className="absolute inset-0 z-10"
                  aria-label={`View ${project.name}`}
                />
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <Badge 
                      variant="primary" 
                      className="mb-2"
                    >
                      Project
                    </Badge>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDeleteClick(e, project.id);
                      }}
                      className="relative z-20 rounded-full p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 focus:outline-none"
                      aria-label={`Delete ${project.name}`}
                    >
                      <TrashIcon size={16} />
                    </button>
                  </div>
                  <CardTitle className="line-clamp-1 group-hover:text-primary-600">
                    {project.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="h-12 overflow-hidden text-sm text-gray-500">
                    <p className="line-clamp-2">
                      {project.partyAName && project.partyBName 
                        ? `Negotiation between ${project.partyAName} and ${project.partyBName}`
                        : "Negotiation project with interest statements for two parties."}
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="text-xs text-gray-500">
                  <div className="flex w-full flex-col space-y-1">
                    <div className="flex items-center">
                      <CalendarIcon size={14} className="mr-1.5 flex-shrink-0" />
                      <span className="truncate">Created: {new Date(project.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}</span>
                    </div>
                    <div className="flex items-center">
                      <CalendarIcon size={14} className="mr-1.5 flex-shrink-0" />
                      <span className="truncate">Updated: {new Date(project.updatedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}</span>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isConfirmDialogOpen}
        title="Delete Project"
        message="Are you sure you want to delete this project? This action cannot be undone."
        confirmButtonText={deleteProjectMutation.isPending ? "Deleting..." : "Delete"}
        cancelButtonText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        type="delete"
      />

      {/* Upgrade Dialog */}
      <UpgradeDialog
        isOpen={isUpgradeDialogOpen}
        onClose={() => setIsUpgradeDialogOpen(false)}
        onUpgrade={handleUpgrade}
        userTier={projectsQuery.data?.userTier}
      />
    </main>
  );
}