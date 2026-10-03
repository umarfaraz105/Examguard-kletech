'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { HelpButton } from '@/components/help/HelpSystem';
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  Users,
  Building2,
  UserCheck,
  ClipboardList,
  CreditCard,
  FileCheck,
  GraduationCap,
  FileText,
  Bell,
  Settings,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Upload,
  Printer,
  Loader2,
} from 'lucide-react';
import { useState } from 'react';

interface MenuItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  roles?: string[];
}

const menuItems: MenuItem[] = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    name: 'Analytics',
    path: '/dashboard/admin/analytics',
    icon: <BarChart3 className="w-5 h-5" />,
    roles: ['ADMIN'],
  },
  {
    name: 'Analytics',
    path: '/dashboard/faculty/analytics',
    icon: <BarChart3 className="w-5 h-5" />,
    roles: ['FACULTY', 'HOD'],
  },
  {
    name: 'Analytics',
    path: '/dashboard/student/analytics',
    icon: <BarChart3 className="w-5 h-5" />,
    roles: ['STUDENT'],
  },
  {
    name: 'Exam Plans',
    path: '/plans',
    icon: <Calendar className="w-5 h-5" />,
  },
  {
    name: 'Courses',
    path: '/courses',
    icon: <BookOpen className="w-5 h-5" />,
  },
  {
    name: 'Students',
    path: '/students',
    icon: <Users className="w-5 h-5" />,
  },
  {
    name: 'Rooms',
    path: '/rooms',
    icon: <Building2 className="w-5 h-5" />,
  },
  {
    name: 'Seating',
    path: '/seating',
    icon: <ClipboardList className="w-5 h-5" />,
  },
  {
    name: 'Invigilators',
    path: '/invigilators',
    icon: <UserCheck className="w-5 h-5" />,
  },
  {
    name: 'Hall Tickets',
    path: '/hall-tickets',
    icon: <CreditCard className="w-5 h-5" />,
    roles: ['ADMIN', 'EXAM_CELL', 'STUDENT'],
  },
  {
    name: 'Attendance',
    path: '/attendance',
    icon: <FileCheck className="w-5 h-5" />,
    roles: ['ADMIN', 'EXAM_CELL', 'FACULTY'],
  },
  {
    name: 'Marks Entry',
    path: '/marks',
    icon: <GraduationCap className="w-5 h-5" />,
    roles: ['ADMIN', 'EXAM_CELL', 'FACULTY'],
  },
  {
    name: 'Revaluation',
    path: '/revaluation',
    icon: <FileText className="w-5 h-5" />,
    roles: ['ADMIN', 'EXAM_CELL', 'STUDENT'],
  },
  {
    name: 'Notifications',
    path: '/notifications',
    icon: <Bell className="w-5 h-5" />,
  },
  {
    name: 'Reports',
    path: '/reports',
    icon: <FileText className="w-5 h-5" />,
    roles: ['ADMIN', 'EXAM_CELL'],
  },
  {
    name: 'Loading States',
    path: '/dashboard/admin/loading-states',
    icon: <Loader2 className="w-5 h-5" />,
    roles: ['ADMIN', 'EXAM_CELL'],
  },
  {
    name: 'Data Tables',
    path: '/dashboard/admin/data-tables',
    icon: <ClipboardList className="w-5 h-5" />,
    roles: ['ADMIN', 'EXAM_CELL'],
  },
  {
    name: 'Export & Print',
    path: '/dashboard/admin/export-print',
    icon: <Printer className="w-5 h-5" />,
    roles: ['ADMIN', 'EXAM_CELL'],
  },
  {
    name: 'File Uploads',
    path: '/dashboard/admin/file-uploads',
    icon: <Upload className="w-5 h-5" />,
    roles: ['ADMIN', 'EXAM_CELL'],
  },
  {
    name: 'Settings',
    path: '/rules',
    icon: <Settings className="w-5 h-5" />,
    roles: ['ADMIN', 'EXAM_CELL'],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const hasAccess = (item: MenuItem) => {
    if (!item.roles) return true;
    return user && item.roles.includes(user.role);
  };

  const visibleItems = menuItems.filter(hasAccess);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-surface border-r border-border transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          {!collapsed && (
            <span className="text-xl font-bold text-primary">ExamGuard</span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-lg hover:bg-primary-light text-text-muted hover:text-primary transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {visibleItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  active
                    ? 'bg-primary-light text-primary font-medium'
                    : 'text-text-muted hover:bg-primary-light hover:text-primary'
                }`}
                title={collapsed ? item.name : undefined}
              >
                {item.icon}
                {!collapsed && <span className="text-sm">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          {!collapsed ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <HelpButton 
                  content="Get help and start tutorials"
                  className="w-full justify-start gap-2 text-text-muted hover:text-primary hover:bg-primary-light"
                />
              </div>
              {user && (
                <div className="text-xs text-text-muted">
                  <p className="font-medium text-text truncate">{user.full_name}</p>
                  <p className="truncate">{user.email}</p>
                  <p className="mt-1 px-2 py-0.5 bg-primary-light text-primary rounded inline-block">
                    {user.role}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <HelpButton 
                content="Get help and start tutorials"
                className="text-text-muted hover:text-primary"
              />
              {user && (
                <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center text-primary font-medium text-xs">
                  {user.full_name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Sidebar - Slide-in Drawer */}
      <div className="md:hidden">
        {/* Mobile menu button handled in Navbar */}
      </div>
    </>
  );
}
