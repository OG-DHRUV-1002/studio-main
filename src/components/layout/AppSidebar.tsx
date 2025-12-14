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

const menuItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/orders/new", label: "New Order", icon: FilePlus2 },
  { href: "/patients", label: "Patients", icon: Users },
  { href: "/data-entry", label: "Data Entry", icon: FlaskConical },
]

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-primary">🔬DR. BHONSLE'S LABORATORY</h2>
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
        {/* Can add user profile or settings here */}
      </SidebarFooter>
    </Sidebar>
  )
}
