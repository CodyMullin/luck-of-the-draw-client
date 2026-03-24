import { createRootRoute, Outlet } from "@tanstack/react-router";
import { ToastProvider } from "../components/Toaster.tsx";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-cream font-body text-dirt">
        <Outlet />
      </div>
    </ToastProvider>
  );
}
