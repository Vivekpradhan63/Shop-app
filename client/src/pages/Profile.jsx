import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export default function Profile() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated || !user) {
    navigate("/login", { replace: true });
    return null;
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle>{user.name}</CardTitle>
          <CardDescription>{user.email}</CardDescription>
          <Badge variant={user.role === "admin" ? "admin" : "customer"} className="w-fit capitalize mt-2">
            {user.role}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          {user.address ? (
            <div>
              <p className="text-sm text-muted-foreground">Saved address</p>
              <p className="font-medium">{user.address}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No address on file.</p>
          )}
          <Separator />
          <div className="flex flex-col gap-2">
            <Button asChild variant="outline">
              <Link to="/orders">My orders</Link>
            </Button>
            {user.role === "admin" && (
              <Button asChild variant="secondary">
                <Link to="/admin">Admin dashboard</Link>
              </Button>
            )}
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                logout();
                navigate("/");
              }}
            >
              Log out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
