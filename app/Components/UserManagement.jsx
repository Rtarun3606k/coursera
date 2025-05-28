"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

const UserManagement = () => {
  const [users] = useState([
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      role: "user",
      status: "active",
      joinDate: "2024-01-15",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      role: "user",
      status: "active",
      joinDate: "2024-02-20",
    },
    {
      id: 3,
      name: "Tarun Nayaka",
      email: "r.tarunnayaka25042005@gmail.com",
      role: "admin",
      status: "active",
      joinDate: "2024-01-01",
    },
  ]);

  const handleRoleChange = (userId, newRole) => {
    console.log(`Changing user ${userId} role to ${newRole}`);
    // Here you would implement the actual role change logic
  };

  const handleStatusChange = (userId, newStatus) => {
    console.log(`Changing user ${userId} status to ${newStatus}`);
    // Here you would implement the actual status change logic
  };

  return (
    <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">
          User Management
        </h2>
        <Button>Add New User</Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-medium text-foreground">
                User
              </th>
              <th className="text-left py-3 px-4 font-medium text-foreground">
                Role
              </th>
              <th className="text-left py-3 px-4 font-medium text-foreground">
                Status
              </th>
              <th className="text-left py-3 px-4 font-medium text-foreground">
                Join Date
              </th>
              <th className="text-left py-3 px-4 font-medium text-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-border/50 hover:bg-muted/50"
              >
                <td className="py-3 px-4">
                  <div>
                    <div className="font-medium text-foreground">
                      {user.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {user.email}
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role === "admin"
                        ? "bg-primary/10 text-primary"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.status === "active"
                        ? "bg-chart-2/10 text-chart-2"
                        : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-muted-foreground">
                  {new Date(user.joinDate).toLocaleDateString()}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleRoleChange(
                          user.id,
                          user.role === "admin" ? "user" : "admin"
                        )
                      }
                    >
                      {user.role === "admin" ? "Remove Admin" : "Make Admin"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleStatusChange(
                          user.id,
                          user.status === "active" ? "inactive" : "active"
                        )
                      }
                    >
                      {user.status === "active" ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
