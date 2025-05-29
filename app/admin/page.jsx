import { auth } from "../auth";
import { redirect } from "next/navigation";

const AdminPage = async () => {
  const session = await auth();
  // console.log("Session data:", session);

  // Redirect unauthenticated users to login
  if (!session) {
    redirect("/login");
  }

  // Redirect non-admin users to unauthorized page
  if (session.user?.role !== "admin") {
    redirect("/unauthorized");
    // return;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">
          Welcome, {session.user?.name}!
        </h2>
        <p className="text-gray-600 mb-4">Email: {session.user?.email}</p>
        <p className="text-sm text-gray-500">Role: {session.user?.role}</p>

        {/* Add your admin functionality here */}
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-3">Admin Actions</h3>
          <div className="space-y-2">
            <button className="block w-full text-left px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded border">
              Manage Users
            </button>
            <button className="block w-full text-left px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded border">
              Manage Courses
            </button>
            <button className="block w-full text-left px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded border">
              View Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
