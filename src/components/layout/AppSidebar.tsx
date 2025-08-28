
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Calendar,
  ClipboardList,
  BarChart3,
  Users,
  Settings,
  FileText,
  Clock,
  CheckSquare,
  Shield,
  TrendingUp
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useAuth, UserRole } from '@/contexts/AuthContext';

const getMenuItems = (role: UserRole) => {
  const baseItems = [
    { title: 'Dashboard', url: '/', icon: BarChart3 },
  ];

  const employeeItems = [
    { title: 'Apply for Leave', url: '/apply-leave', icon: ClipboardList },
    { title: 'Leave History', url: '/leave-history', icon: Clock },
    { title: 'Leave Balance', url: '/leave-balance', icon: Calendar },
  ];

  const managerItems = [
    { title: 'Pending Approvals', url: '/approvals', icon: CheckSquare },
    { title: 'Team Calendar', url: '/team-calendar', icon: Calendar },
    { title: 'Team Reports', url: '/team-reports', icon: FileText },
  ];

  const adminItems = [
    { title: 'User Management', url: '/user-management', icon: Users },
    { title: 'Leave Policies', url: '/leave-policies', icon: Settings },
    { title: 'System Reports', url: '/system-reports', icon: TrendingUp },
    { title: 'Audit Logs', url: '/audit-logs', icon: Shield },
  ];

  switch (role) {
    case 'employee':
      return [...baseItems, ...employeeItems];
    case 'manager':
      return [...baseItems, ...employeeItems, ...managerItems];
    case 'admin':
      return [...baseItems, ...adminItems];
    default:
      return baseItems;
  }
};

export const AppSidebar: React.FC = () => {
  const { profile } = useAuth();
  const menuItems = getMenuItems(profile?.role || 'employee');

  return (
    <Sidebar className="border-r border-gray-200">
      <SidebarContent className="bg-corporate-black">
        <div className="p-6 border-b border-corporate-gray-dark">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-corporate-orange rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-white">LMS</h2>
              <p className="text-xs text-gray-400">Leave Management</p>
            </div>
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-400 uppercase tracking-wider text-xs">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                          isActive
                            ? 'bg-corporate-orange text-white font-medium'
                            : 'text-gray-300 hover:bg-corporate-gray-dark hover:text-white'
                        }`
                      }
                      end
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto p-6 border-t border-corporate-gray-dark">
          <div className="text-xs text-gray-400">
            <p>© 2024 Dantata Town Developers</p>
            <p className="mt-1">Version 1.0.0</p>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
};
