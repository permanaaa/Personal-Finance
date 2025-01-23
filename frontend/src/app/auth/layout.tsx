import { Toaster } from "@/components/ui/toaster";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="flex flex-col justify-center items-center min-h-screen gap-4">
        <h1 className="text-3xl font-bold">Personal Finance App</h1>
        {children}
      </div>
      <Toaster />
    </>
  );
}
