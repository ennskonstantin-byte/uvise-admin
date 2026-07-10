import { Sidebar } from "@/components/Sidebar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-page-bg">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-x-hidden px-10 py-8 max-w-6xl">{children}</main>
    </div>
  );
}
