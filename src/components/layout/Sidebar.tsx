/**
 * Sidebar Navigation Component
 *
 * Professional sidebar with navigation links.
 */

import { useState } from 'react';
import {
  Shield,
  LayoutDashboard,
  FileText,
  Building2,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';

interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
  active?: boolean;
}

const mainNavItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '#', active: true },
  { label: 'My Records', icon: FileText, href: '#' },
  { label: 'Organization', icon: Building2, href: '#' },
];

const secondaryNavItems: NavItem[] = [
  { label: 'Settings', icon: Settings, href: '#' },
  { label: 'Help', icon: HelpCircle, href: '#' },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'flex flex-col border-r bg-sidebar transition-all duration-300',
          collapsed ? 'w-16' : 'w-64',
          className
        )}
      >
        {/* Logo */}
        <div className={cn(
          'flex h-16 items-center border-b px-4',
          collapsed ? 'justify-center' : 'gap-3'
        )}>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="text-lg font-semibold text-sidebar-foreground">
              Arkova
            </span>
          )}
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 space-y-1 p-3">
          {mainNavItems.map((item) => (
            <NavLink
              key={item.label}
              item={item}
              collapsed={collapsed}
            />
          ))}
        </nav>

        <Separator className="mx-3" />

        {/* Secondary Navigation */}
        <nav className="space-y-1 p-3">
          {secondaryNavItems.map((item) => (
            <NavLink
              key={item.label}
              item={item}
              collapsed={collapsed}
            />
          ))}
        </nav>

        {/* Collapse Toggle */}
        <div className="border-t p-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              'w-full justify-center',
              !collapsed && 'justify-start'
            )}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 mr-2" />
                <span>Collapse</span>
              </>
            )}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  );
}

interface NavLinkProps {
  item: NavItem;
  collapsed: boolean;
}

function NavLink({ item, collapsed }: NavLinkProps) {
  const Icon = item.icon;

  const link = (
    <a
      href={item.href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        item.active
          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
          : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
        collapsed && 'justify-center px-2'
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span>{item.label}</span>}
    </a>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right">
          {item.label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return link;
}
