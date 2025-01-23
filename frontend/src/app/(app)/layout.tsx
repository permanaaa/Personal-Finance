import AppNavbar from "@/components/app-navbar";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider} from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";

export default function AppLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
      <>
        <SidebarProvider>
          <AppSidebar />
          <main className="w-full">
            <AppNavbar />
            {children}
            <Toaster />
          </main>
        </SidebarProvider>
      </>
    );
}