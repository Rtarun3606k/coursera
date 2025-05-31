import { LucideMail, LucideUser, LucideUser2 } from "lucide-react";
import { auth } from "../auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";

const AdminPage = async () => {
  const session = await auth();
  // console.log("Session data:", session);

  // Redirect unauthenticated users to login
  if (!session) {
    redirect("/login");
  }

  // Redirect non-admin users to unauthorized page
  if (session.user?.role !== "ADMIN") {
    redirect("/unauthorized");
    // return;
  }

  return (
    <div className="container mx-auto px-4 py-8 dark:bg-gray-900 mt-2 bg-white">
      <h1 className="text-3xl font-bold mb-6 text-center">Admin Dashboard</h1>
      <div>
        <div className=" shadow rounded-lg p-6 dark:bg-gray-800 bg-white flex items-center justify-between gap-4 md:flex-row flex-col">
          <h2 className="text-xl font-semibold mb-4 flex gap-2 items-center">
            <LucideUser />
            <p>Welcome, {session.user?.name}!</p>
          </h2>
          <p className="mb-4 dark:text-white text-black text-xl  flex gap-2 items-center">
            <LucideMail />
            Email: {session.user?.email}
          </p>
          <p className="mb-4 text-gray-500 dark:text-white text-xl  flex gap-2 items-center">
            <LucideUser2 />
            Role: {session.user?.role}
          </p>
        </div>

        {/* Add your admin functionality here */}

        <div className="flex-1 text-center mt-2">
          <p className="text-gray-600 dark:text-gray-300">
            This is the admin dashboard where you can manage users, content, and
            other administrative tasks.
          </p>
        </div>

        {/* Example buttons for admin actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4 mt-6">
          {/* <Button
            className={"mt-4 bg-blue-600 hover:bg-blue-700 text-white"}
            size={"lg"}
          >
            Provider Application
          </Button> */}

          <Card>
            <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
              <LucideUser />
              <p>Provider Applications</p>
            </CardTitle>

            <CardDescription
              className={"text-center mt-2 text-gray-600 dark:text-gray-300"}
            >
              Here you can manage providers , view applications, and perform
              other administrative tasks.
            </CardDescription>

            <div className="flex flex-col gap-4 mt-4 border-1 border-gray-500 w-[90%] mr-[5%] ml-[5%]" />
            <CardFooter className="flex justify-between mt-1 items-center">
              <p className="text-sm dark:text-gray-400 text-white">
                Applications recived
              </p>

              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
              >
                Manage Providers
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
