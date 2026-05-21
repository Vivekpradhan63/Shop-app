import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import axiosInstance from "@/utils/axiosInstance";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function Profile() {
  usePageTitle("My Profile");
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Profile Form State
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState(user?.address || "");
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);

  if (!isAuthenticated || !user) {
    navigate("/login", { replace: true });
    return null;
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      // Assuming AuthContext fetches user on initial load, we might need a way to refresh it or just rely on local state changes.
      // But we can just hit the API and it will update the DB.
      await axiosInstance.put("/auth/profile", { name, phone, address });
      toast.success("Profile updated successfully");
      // Optionally reload to fetch new user data in AuthContext, or just let user see it next time
      // window.location.reload(); 
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update profile");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    setUpdatingPassword(true);
    try {
      await axiosInstance.put("/auth/password", { currentPassword, newPassword });
      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update password");
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
      
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="details">Profile Details</TabsTrigger>
          <TabsTrigger value="password">Change Password</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details and address.</CardDescription>
            </CardHeader>
            <CardContent>
              <form id="profile-form" onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={user.email} disabled />
                  <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. +91 9876543210" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address">Default Address</Label>
                  <Input id="address" value={address} onChange={e => setAddress(e.target.value)} placeholder="Street, City, Postal Code" />
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-between border-t p-6">
              <div className="flex gap-2">
                <Badge variant={user.role === "admin" ? "admin" : "secondary"} className="capitalize">
                  {user.role} Account
                </Badge>
              </div>
              <Button type="submit" form="profile-form" disabled={updatingProfile}>
                {updatingProfile ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Ensure your account is using a long, random password to stay secure.</CardDescription>
            </CardHeader>
            <CardContent>
              <form id="password-form" onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="current_password">Current Password</Label>
                  <Input 
                    id="current_password" 
                    type="password" 
                    value={currentPassword} 
                    onChange={e => setCurrentPassword(e.target.value)} 
                    required 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new_password">New Password</Label>
                  <Input 
                    id="new_password" 
                    type="password" 
                    value={newPassword} 
                    onChange={e => setNewPassword(e.target.value)} 
                    required 
                    minLength={6}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirm_password">Confirm New Password</Label>
                  <Input 
                    id="confirm_password" 
                    type="password" 
                    value={confirmPassword} 
                    onChange={e => setConfirmPassword(e.target.value)} 
                    required 
                    minLength={6}
                  />
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-end border-t p-6">
              <Button type="submit" form="password-form" disabled={updatingPassword}>
                {updatingPassword ? "Updating..." : "Update Password"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6">
          <div className="space-y-1">
            <h3 className="font-semibold">Quick Actions</h3>
            <p className="text-sm text-muted-foreground">Navigate to other areas or sign out.</p>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Button asChild variant="outline" className="flex-1 sm:flex-none">
              <Link to="/orders">My Orders</Link>
            </Button>
            {user.role === "admin" && (
              <Button asChild variant="secondary" className="flex-1 sm:flex-none">
                <Link to="/admin">Admin Dashboard</Link>
              </Button>
            )}
            <Button
              type="button"
              variant="destructive"
              className="flex-1 sm:flex-none"
              onClick={() => {
                logout();
                navigate("/");
              }}
            >
              Log Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
