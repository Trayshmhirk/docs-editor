"use client";

import React from "react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Bell } from "lucide-react";
import {
  useInboxNotifications,
  useUnreadInboxNotificationsCount,
} from "@liveblocks/react/suspense";
import {
  InboxNotification,
  InboxNotificationList,
  LiveblocksUIConfig,
} from "@liveblocks/react-ui";
import Image from "next/image";

const Notifications = () => {
  const { inboxNotifications } = useInboxNotifications();
  const { count } = useUnreadInboxNotificationsCount();

  const unreadNotifications = inboxNotifications.filter(
    (notification) => !notification.readAt
  );

  return (
    <Popover>
      <PopoverTrigger className="relative flex size-10 items-center justify-center rounded-lg">
        <Bell className="size-6" />

        {count > 0 && (
          <div className="absolute right-2 top-2 z-20 size-2 rounded-full bg-[#00afdb] text-white"></div>
        )}
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="flex flex-col gap-2 max-w-[350px] sm:max-w-[460px] w-full border dark:bg-[#1f1f1f] border-[#eeeeee] dark:border-[#181818] ml-3 shadow-lg"
      >
        <LiveblocksUIConfig
          overrides={{
            INBOX_NOTIFICATION_TEXT_MENTION: (user: React.ReactNode) => (
              <>{user} mentioned you.</>
            ),
          }}
        >
          <InboxNotificationList className="flex flex-col gap-2">
            {unreadNotifications.length === 0 && (
              <p className="p-2 text-center text-[#bbbbbb] dark:text-[#656565]">
                No new notifications
              </p>
            )}
            {unreadNotifications.length > 0 &&
              unreadNotifications.map((notification) => (
                <InboxNotification
                  key={notification.id}
                  inboxNotification={notification}
                  className="flex flex-col gap-2 md:gap-3 sm:flex-row border border-[#eeeeee] dark:border-[#434343] bg-[#f7f7f7] dark:bg-[#2a2a2a] text-[#1e1e1e] dark:text-[white] py-3 rounded"
                  href={`/documents/${notification.roomId}`}
                  showActions={false}
                  kinds={{
                    thread: (props) => (
                      <InboxNotification.Thread
                        {...props}
                        showActions={false}
                        showRoomName={true}
                      />
                    ),
                    textMention: (props) => (
                      <InboxNotification.TextMention
                        {...props}
                        showRoomName={false}
                      />
                    ),
                    $documentAccess: (props) => (
                      <InboxNotification.Custom
                        {...props}
                        title={
                          <p className="text-sm">
                            {props.inboxNotification.activities[0].data.title}
                          </p>
                        }
                        aside={
                          <InboxNotification.Icon className="bg-transparent">
                            <Image
                              src={
                                (props.inboxNotification.activities[0].data
                                  .avatar as string) || ""
                              }
                              alt="avatar"
                              width={36}
                              height={36}
                              className="rounded-full"
                            />
                          </InboxNotification.Icon>
                        }
                      >
                        {props.children}
                      </InboxNotification.Custom>
                    ),
                  }}
                />
              ))}
          </InboxNotificationList>
        </LiveblocksUIConfig>
      </PopoverContent>
    </Popover>
  );
};

export default Notifications;
