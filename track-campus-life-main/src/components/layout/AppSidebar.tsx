import { 
  Home, 
  Calendar, 
  BookOpen, 
  FileText, 
  Bell, 
  Users, 
  Upload,
  BarChart3,
  Settings,
  GraduationCap
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';

interface AppSidebarProps {
  userProfile: any;
}

export function AppSidebar({ userProfile }: AppSidebarProps) {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === 'collapsed';

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-sidebar-accent text-sidebar-primary font-medium" : "hover:bg-sidebar-accent/50";

  const studentItems = [
    { title: "Dashboard", url: "/dashboard", icon: Home },
    { title: "Attendance", url: "/attendance", icon: Calendar },
    { title: "Syllabus", url: "/syllabus", icon: BookOpen },
    { title: "PYQs", url: "/pyqs", icon: FileText },
    { title: "Notices", url: "/notices", icon: Bell },
  ];

  const adminItems = [
    { title: "Dashboard", url: "/dashboard", icon: Home },
    { title: "Students", url: "/admin/students", icon: Users },
    { title: "Attendance", url: "/admin/attendance", icon: Calendar },
    { title: "Upload Files", url: "/admin/uploads", icon: Upload },
    { title: "Notices", url: "/admin/notices", icon: Bell },
    { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
  ];

  const items = userProfile?.role === 'admin' ? adminItems : studentItems;

  return (
    <Sidebar className={collapsed ? "w-14" : "w-60"} collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-8 w-8 text-sidebar-primary" />
          {!collapsed && (
            <div>
              <h1 className="text-lg font-bold text-sidebar-primary">CampusTrack</h1>
              <p className="text-xs text-sidebar-foreground/60">Student Portal</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {userProfile?.role === 'admin' ? 'Admin Panel' : 'Student Portal'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/settings" className={getNavCls}>
                    <Settings className="h-4 w-4" />
                    {!collapsed && <span>Settings</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}