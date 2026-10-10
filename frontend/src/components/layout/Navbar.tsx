'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { ChevronDown, User, LogOut, Menu } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface NavbarProps {
  onMobileSidebarToggle: () => void;
  mobileSidebarOpen: boolean;
}

export default function Navbar({ onMobileSidebarToggle, mobileSidebarOpen }: NavbarProps) {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    // Handle keyboard navigation for dropdown
    const handleDropdownKeyDown = (event: KeyboardEvent) => {
      if (!dropdownOpen) return;
      
      switch (event.key) {
        case 'Escape':
          setDropdownOpen(false);
          // Return focus to the dropdown button
          const button = dropdownRef.current?.querySelector('button');
          button?.focus();
          event.preventDefault();
          break;
        case 'ArrowDown':
        case 'ArrowUp':
          event.preventDefault();
          const links = dropdownRef.current?.querySelectorAll('a, button:last-child');
          if (!links) return;
          
          const currentIndex = Array.from(links).findIndex(link => 
            link === document.activeElement
          );
          
          let nextIndex;
          if (event.key === 'ArrowDown') {
            nextIndex = currentIndex < links.length - 1 ? currentIndex + 1 : 0;
          } else {
            nextIndex = currentIndex > 0 ? currentIndex - 1 : links.length - 1;
          }
          
          (links[nextIndex] as HTMLElement).focus();
          break;
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleDropdownKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleDropdownKeyDown);
    };
  }, [dropdownOpen]);

  if (!isAuthenticated) return null;

  return (
    <nav className="bg-surface shadow-sm border-b-2 border-primary sticky top-0 z-40" role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger menu button */}
            <button
              onClick={onMobileSidebarToggle}
              className="flex md:hidden items-center justify-center w-11 h-11 rounded-lg hover:bg-bg transition-colors touch-manipulation"
              aria-label={mobileSidebarOpen ? "Close mobile menu" : "Open mobile menu"}
              aria-expanded={mobileSidebarOpen}
              aria-controls="mobile-sidebar"
            >
              <Menu className="w-6 h-6 text-text" />
            </button>
            
            <Link href="/dashboard" className="flex items-center gap-3 group" aria-label="ExamGuard home">
              <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg group-hover:bg-primary-dark transition-colors">
                <span className="text-surface font-bold text-lg">KLE</span>
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-lg font-bold text-primary leading-tight">ExamGuard</span>
                <span className="text-xs text-text-muted leading-tight">KLE Technological University</span>
              </div>
            </Link>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown' && !dropdownOpen) {
                    e.preventDefault();
                    setDropdownOpen(true);
                    // Focus first dropdown item after a brief delay for DOM update
                    setTimeout(() => {
                      const firstItem = dropdownRef.current?.querySelector('a, button:last-child');
                      (firstItem as HTMLElement)?.focus();
                    }, 0);
                  }
                }}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-bg transition-colors min-h-[44px]"
                aria-expanded={dropdownOpen}
                aria-haspopup="menu"
                aria-label="User menu"
              >
                <div className="flex items-center justify-center w-9 h-9 bg-primary-light rounded-full">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-text">{user?.full_name}</p>
                  <p className="text-xs text-text-muted capitalize">{user?.role.replace('_', ' ').toLowerCase()}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-56 bg-surface rounded-lg shadow-lg border border-border overflow-hidden z-50"
                  role="menu"
                  aria-labelledby="user-menu-button"
                >
                  <div className="px-4 py-3 border-b border-border bg-bg">
                    <p className="text-sm font-semibold text-text">{user?.full_name}</p>
                    <p className="text-xs text-text-muted">{user?.email}</p>
                    <p className="text-xs text-primary font-medium mt-1 capitalize">{user?.role.replace('_', ' ')}</p>
                  </div>
                  
                  <div className="py-2" role="none">
                    <Link
                      href="/settings"
                      className="flex items-center gap-3 px-4 py-3 text-sm text-text hover:bg-bg transition-colors min-h-[44px]"
                      onClick={() => setDropdownOpen(false)}
                      role="menuitem"
                    >
                      <User className="w-4 h-4" />
                      <span>Profile Settings</span>
                    </Link>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-primary hover:bg-primary-light transition-colors min-h-[44px]"
                      role="menuitem"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
