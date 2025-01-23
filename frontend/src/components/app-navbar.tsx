"use client";

import { Bell} from "lucide-react";
import { SidebarTrigger } from "./ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { getCookie } from "@/hooks/useCookie";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  getNotifications,
  NotificationInterface,
} from "@/service/dashboardService";

export default function AppNavbar() {
  const [, setNotifications] = useState<string[]>([]);
  // const [socketId, setSocketId] = useState<string | null>(null);
  const [notificationsData, setNotificationsData] = useState<
    NotificationInterface[]
  >([]);

  const handleGetNotifications = async () => {
    try {
      const response = await getNotifications();
      if (response) {
        // console.log(response);
        setNotificationsData(response.data);
      } else {
        console.error("Unexpected error:", response);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  };

  useEffect(() => {
    handleGetNotifications();
    const socket: Socket = io("http://192.168.1.146:3001");

    socket.on("connect", () => {
      // setSocketId(socket.id!);
      console.log("Connected to socket with ID:", socket.id);

      const roomId = getCookie("roomId");
      socket.emit("join-room", roomId);
    });

    socket.on("newNotification", (message: string) => {
      console.log("New notification:", message);
      handleGetNotifications();
      setNotifications((prev) => [...prev, message]);
    });

    return () => {
      socket.off("newNotification");
      socket.disconnect();
    };
  }, []);

  return (
    <div className="flex items-center justify-between bg-white border-b px-4 py-5 w-full">
      <SidebarTrigger />
      <div className="w-28 flex flex-row justify-between">
        <Popover>
          <PopoverTrigger asChild>
            <button className="relative">
              <Bell />
              {notificationsData.length > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notificationsData.length}
                </span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80 mr-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <div className="flex flex-row justify-between items-center">
                  <h4 className="font-semibold leading-none">Notification</h4>
                </div>
                <hr />
                {notificationsData.map((notification) => (
                  <div
                    className="w-full border rounded-md"
                    key={notification._id}
                  >
                    <div className="flex flex-col gap-2 p-2">
                      <div className="flex flex-row justify-between">
                        <p className="text-xs text-muted-foreground">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                        {/* <button>
                          <X width={12} height={12} />
                        </button> */}
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-semibold">
                          {notification.reminderTitle}
                        </p>
                        <h1 className="font-medium text-xs">
                          {notification.allocationName}
                        </h1>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}
