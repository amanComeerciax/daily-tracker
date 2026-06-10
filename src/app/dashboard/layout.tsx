import { Sidebar } from "@/components/dashboard/sidebar";
import { syncUser } from "@/actions/user.actions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Sync user to MongoDB on dashboard load
  await syncUser();

  return (
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
