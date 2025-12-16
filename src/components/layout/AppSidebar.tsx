'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter
} from "@/components/ui/sidebar"
import { LayoutDashboard, FilePlus2, Users, FlaskConical } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";

const menuItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/orders/new", label: "New Order", icon: FilePlus2 },
  { href: "/patients", label: "Patients", icon: Users },
  { href: "/data-entry", label: "Data Entry", icon: FlaskConical },
]

export function AppSidebar() {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();

  const labName = user?.lab_context.display_name || "Laboratory";

  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-primary">🔬 {loading ? "Loading..." : labName}</h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(item.href) && (item.href === '/' ? pathname === '/' : true)}
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}

        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        {user && (
          <div className="p-2 text-xs text-muted-foreground border-t bg-muted/20">
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium text-foreground">{user.lab_context.display_name}</span>
            </div>
            <p className="mb-2">Log in: {user.access_control.is_admin ? "Admin" : "Staff"} ({user.user_uid})</p>
            <Button
              variant="destructive"
              size="sm"
              className="w-full text-xs h-7"
              onClick={() => logout()}
            >
              Log Out
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
