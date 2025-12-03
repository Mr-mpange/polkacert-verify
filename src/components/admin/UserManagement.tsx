import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, UserPlus, Shield, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
}

interface UserRole {
  user_id: string;
  role: string;
}

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [userRoles, setUserRoles] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch all profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");

      if (rolesError) throw rolesError;

      // Organize roles by user_id
      const rolesMap: Record<string, string[]> = {};
      rolesData?.forEach((role: UserRole) => {
        if (!rolesMap[role.user_id]) {
          rolesMap[role.user_id] = [];
        }
        rolesMap[role.user_id].push(role.role);
      });

      setProfiles(profilesData || []);
      setUserRoles(rolesMap);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async (userId: string, newRole: "admin" | "user") => {
    try {
      // First, delete existing role
      const { error: deleteError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);

      if (deleteError) throw deleteError;

      // Then insert new role
      const { error: insertError } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role: newRole });

      if (insertError) throw insertError;

      toast.success(`Role changed to ${newRole} successfully`);
      setDialogOpen(false);
      fetchData();
    } catch (error: any) {
      console.error("Error changing role:", error);
      toast.error("Failed to change role");
    }
  };

  const handleAssignRole = async (userId: string, role: "admin" | "user") => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role });

      if (error) throw error;

      toast.success(`${role} role assigned successfully`);
      setDialogOpen(false);
      fetchData();
    } catch (error: any) {
      console.error("Error assigning role:", error);
      if (error.code === "23505") {
        toast.error("User already has this role");
      } else {
        toast.error("Failed to assign role");
      }
    }
  };

  const filteredProfiles = profiles.filter(
    (profile) =>
      profile.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Card className="shadow-soft">
        <CardContent className="py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading users...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <div className="flex items-center gap-3 pt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by email or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProfiles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProfiles.map((profile) => (
                    <TableRow key={profile.id}>
                      <TableCell className="font-mono text-xs">
                        {profile.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell className="font-medium">{profile.email}</TableCell>
                      <TableCell>{profile.full_name || "-"}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {userRoles[profile.id]?.map((role) => (
                            <Badge
                              key={role}
                              className={
                                role === "admin"
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-secondary text-secondary-foreground"
                              }
                            >
                              {role === "admin" ? (
                                <Shield className="h-3 w-3 mr-1" />
                              ) : (
                                <User className="h-3 w-3 mr-1" />
                              )}
                              {role}
                            </Badge>
                          )) || (
                            <Badge variant="outline" className="text-muted-foreground">
                              No roles
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(profile.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(profile);
                            setDialogOpen(true);
                          }}
                        >
                          <UserPlus className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage User Role</DialogTitle>
            <DialogDescription>
              Change role for {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">User ID:</p>
              <code className="text-xs bg-muted p-2 rounded block break-all">
                {selectedUser?.id}
              </code>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Current Role:</p>
              <div className="flex gap-2">
                {userRoles[selectedUser?.id || ""]?.map((role) => (
                  <Badge key={role} variant="secondary">
                    {role}
                  </Badge>
                )) || <span className="text-sm text-muted-foreground">No role assigned</span>}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Change to:</p>
              <div className="flex gap-2">
                <Button
                  variant={userRoles[selectedUser?.id || ""]?.[0] === "user" ? "secondary" : "outline"}
                  onClick={() => selectedUser && handleChangeRole(selectedUser.id, "user")}
                  className="flex-1"
                >
                  <User className="h-4 w-4 mr-2" />
                  User
                </Button>
                <Button
                  variant={userRoles[selectedUser?.id || ""]?.[0] === "admin" ? "default" : "outline"}
                  onClick={() => selectedUser && handleChangeRole(selectedUser.id, "admin")}
                  className="flex-1"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Admin
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserManagement;
