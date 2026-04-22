import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import Government from "./pages/Government";
import Military from "./pages/Military";
import Departments from "./pages/Departments";
import Development from "./pages/Development";
import Judicial from "./pages/Judicial";
import Entity from "./pages/Entity";
import Search from "./pages/Search";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/government" element={<Government />} />
            <Route path="/military" element={<Military />} />
            <Route path="/departments" element={<Departments />} />
            <Route path="/development" element={<Development />} />
            <Route path="/judicial" element={<Judicial />} />
            <Route path="/search" element={<Search />} />
            <Route path="/entity/:category/:id/:slug?" element={<Entity />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
