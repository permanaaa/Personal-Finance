"use client";

import { useState, useEffect } from "react";
import {
  BadgeDollarSign,
  CalendarClock,
  HandCoins,
  Home,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { Button } from "./ui/button";
import { removeCookie } from "@/hooks/useCookie";

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Allocation",
    url: "/allocation",
    icon: HandCoins,
  },
  {
    title: "Transactions",
    url: "/transaction",
    icon: BadgeDollarSign,
  },
  {
    title: "Reminder",
    url: "/reminder",
    icon: CalendarClock,
  },
];

export function AppSidebar() {
  const [activePath, setActivePath] = useState("");

  const handleLogout = async () => {
    await removeCookie("accessToken");
    await removeCookie("refreshToken");
    await removeCookie("roomId");
    window.location.href = "/auth";
  };

  useEffect(() => {
    // Hanya jalankan kode ini di sisi klien
    setActivePath(window.location.pathname);
  }, [activePath]);

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={"text-md font-normal font-black"}>
            Application Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={activePath === item.url}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <Button className="w-auto mx-4" onClick={() => handleLogout()}>
          Logout
        </Button>
      </SidebarContent>
    </Sidebar>
  );
}
