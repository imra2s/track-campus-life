
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Syllabus from "./pages/Syllabus";
import Notices from "./pages/Notices";
import PYQs from "./pages/PYQs";
import NotFound from "./pages/NotFound";

// Admin pages
import AdminStudents from "./pages/admin/Students";
import AdminAttendance from "./pages/admin/Attendance";
import AdminUploads from "./pages/admin/Uploads";
import AdminNotices from "./pages/admin/Notices";
import AdminAnalytics from "./pages/admin/Analytics";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            } />
            <Route path="/syllabus" element={
              <DashboardLayout>
                <Syllabus />
              </DashboardLayout>
            } />
            <Route path="/notices" element={
              <DashboardLayout>
                <Notices />
              </DashboardLayout>
            } />
            <Route path="/pyqs" element={
              <DashboardLayout>
                <PYQs />
              </DashboardLayout>
            } />
            
            {/* Admin Routes */}
            <Route path="/admin/students" element={
              <DashboardLayout>
                <AdminStudents />
              </DashboardLayout>
            } />
            <Route path="/admin/attendance" element={
              <DashboardLayout>
                <AdminAttendance />
              </DashboardLayout>
            } />
            <Route path="/admin/uploads" element={
              <DashboardLayout>
                <AdminUploads />
              </DashboardLayout>
            } />
            <Route path="/admin/notices" element={
              <DashboardLayout>
                <AdminNotices />
              </DashboardLayout>
            } />
            <Route path="/admin/analytics" element={
              <DashboardLayout>
                <AdminAnalytics />
              </DashboardLayout>
            } />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
