import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import MainLayout from "./components/layout/MainLayout";
import Home from "./pages/Home"; // Now Home will contain all sections

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {/* MainLayout will wrap the single Home page */}
        <MainLayout>
          <Home />
        </MainLayout>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;