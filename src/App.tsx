import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import MainLayout from "./components/layout/MainLayout";
import AdminDashboard from "./pages/AdminDashboard";
import Home from "./pages/Home"; // Import the Home component
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Router>
          <Routes>
            <Route
              path="/"
              element={
                <MainLayout>
                  <Home />
                </MainLayout>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminDashboard />
              }
            />
          </Routes>
        </Router>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;