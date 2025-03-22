"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCookies } from "react-cookie";
import toast from "react-hot-toast";
import Link from "next/link";

import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [cookies, , removeCookie] = useCookies(["adminAuthToken"]);
  const [selectedUser, setSelectedUser] = useState<{
    id: number;
    email: string;
    tier: string;
  } | null>(null);
  const [targetTier, setTargetTier] = useState<"free" | "waitlist" | "paid">("free");
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{
    id: number;
    email: string;
  } | null>(null);

  // Fetch all users
  const usersQuery = api.getAllUsers.useQuery(
    { authToken: cookies.adminAuthToken },
    {
      enabled: !!cookies.adminAuthToken,
      onSuccess: (data) => {
        // Debug log for lastLoginAt values
        if (process.env.NODE_ENV === "development") {
          console.log("Client received lastLoginAt values:", data.users.map(user => ({
            id: user.id,
            email: user.email,
            lastLoginAt: user.lastLoginAt,
          })));
        }
      },
      onError: (error) => {
        if (error.data?.code === "UNAUTHORIZED" || error.data?.code === "FORBIDDEN") {
          toast.error("Admin authentication required");
          router.push("/admin/login");
        } else {
          toast.error(error.message);
        }
      },
    },
  );

  // Update user tier mutation
  const updateUserTierMutation = api.updateUserTier.useMutation({
    onSuccess: () => {
      toast.success(`User tier updated to ${targetTier}`);
      setIsConfirmDialogOpen(false);
      usersQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Delete user mutation
  const deleteUserMutation = api.deleteUser.useMutation({
    onSuccess: () => {
      toast.success("User deleted successfully");
      setIsDeleteDialogOpen(false);
      usersQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Handle logout
  const handleLogout = () => {
    removeCookie("adminAuthToken", { path: "/" });
    router.push("/admin/login");
  };

  // Open confirmation dialog for tier change
  const openTierChangeDialog = (user: { id: number; email: string; tier: string }, newTier: "free" | "waitlist" | "paid") => {
    setSelectedUser(user);
    setTargetTier(newTier);
    setIsConfirmDialogOpen(true);
  };

  // Confirm tier change
  const confirmTierChange = () => {
    if (!selectedUser) return;
    
    updateUserTierMutation.mutate({
      authToken: cookies.adminAuthToken,
      userId: selectedUser.id,
      tier: targetTier,
    });
  };

  // Open confirmation dialog for user deletion
  const openDeleteDialog = (user: { id: number; email: string }) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  // Confirm user deletion
  const confirmUserDeletion = () => {
    if (!userToDelete) return;
    
    deleteUserMutation.mutate({
      authToken: cookies.adminAuthToken,
      userId: userToDelete.id,
    });
  };

  // Redirect to login if not authenticated
  if (!cookies.adminAuthToken) {
    router.push("/admin/login");
    return null;
  }

  // Format date for display
  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "Never";
    try {
      return new Date(date).toLocaleString();
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };

  // Get tier badge variant
  const getTierBadgeVariant = (tier: string) => {
    switch (tier) {
      case "paid":
        return "success";
      case "waitlist":
        return "warning";
      default:
        return "secondary";
    }
  };

  // Get tier display name
  const getTierDisplayName = (tier: string) => {
    switch (tier) {
      case "paid":
        return "Premium";
      case "waitlist":
        return "Waitlist";
      default:
        return "Free";
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <Link href="/" className="hover:text-gray-700">Home</Link>
              <span>/</span>
              <span className="text-gray-700">Admin</span>
              <span>/</span>
              <span className="text-gray-700">Dashboard</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        {/* Waitlist Users Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Waitlist Users</CardTitle>
          </CardHeader>
          <CardContent>
            {usersQuery.isLoading ? (
              <div className="text-center py-4">Loading waitlist users...</div>
            ) : usersQuery.data?.waitlistUsers.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No users on the waitlist</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Username</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Email</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Projects</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Created At</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Last Login</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersQuery.data?.waitlistUsers.map((user) => (
                      <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm">{user.username}</td>
                        <td className="py-3 px-4 text-sm">{user.email}</td>
                        <td className="py-3 px-4 text-sm">{user.projectCount}</td>
                        <td className="py-3 px-4 text-sm">{formatDate(user.createdAt)}</td>
                        <td className="py-3 px-4 text-sm">{formatDate(user.lastLoginAt)}</td>
                        <td className="py-3 px-4 text-sm">
                          <Button 
                            size="sm" 
                            variant="success"
                            onClick={() => openTierChangeDialog(
                              { id: user.id, email: user.email, tier: "waitlist" }, 
                              "paid"
                            )}
                          >
                            Approve Premium
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* All Users Section */}
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
          </CardHeader>
          <CardContent>
            {usersQuery.isLoading ? (
              <div className="text-center py-4">Loading users...</div>
            ) : usersQuery.data?.users.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No users found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Username</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Email</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Tier</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Projects</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Created At</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Last Login</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersQuery.data?.users.map((user) => (
                      <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm">{user.username}</td>
                        <td className="py-3 px-4 text-sm">{user.email}</td>
                        <td className="py-3 px-4 text-sm">
                          <Badge variant={getTierBadgeVariant(user.tier)}>
                            {getTierDisplayName(user.tier)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm">{user.projectCount}</td>
                        <td className="py-3 px-4 text-sm">{formatDate(user.createdAt)}</td>
                        <td className="py-3 px-4 text-sm">{formatDate(user.lastLoginAt)}</td>
                        <td className="py-3 px-4 text-sm">
                          <div className="flex space-x-2">
                            {user.tier !== "free" && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => openTierChangeDialog(
                                  { id: user.id, email: user.email, tier: user.tier }, 
                                  "free"
                                )}
                              >
                                Set Free
                              </Button>
                            )}
                            {user.tier !== "waitlist" && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => openTierChangeDialog(
                                  { id: user.id, email: user.email, tier: user.tier }, 
                                  "waitlist"
                                )}
                              >
                                Set Waitlist
                              </Button>
                            )}
                            {user.tier !== "paid" && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => openTierChangeDialog(
                                  { id: user.id, email: user.email, tier: user.tier }, 
                                  "paid"
                                )}
                              >
                                Set Premium
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="danger"
                              onClick={() => openDeleteDialog({ id: user.id, email: user.email })}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isConfirmDialogOpen}
        title="Change User Tier"
        message={`Are you sure you want to change ${selectedUser?.email}'s tier from ${getTierDisplayName(selectedUser?.tier || "")} to ${getTierDisplayName(targetTier)}?`}
        confirmText="Confirm"
        cancelText="Cancel"
        type={targetTier === "paid" ? "success" : "warning"}
        onConfirm={confirmTierChange}
        onCancel={() => setIsConfirmDialogOpen(false)}
      />

      {/* Delete User Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        title="Delete User"
        message={`Are you sure you want to delete user ${userToDelete?.email}? This action cannot be undone and will delete all of their projects.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="delete"
        onConfirm={confirmUserDeletion}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </main>
  );
}