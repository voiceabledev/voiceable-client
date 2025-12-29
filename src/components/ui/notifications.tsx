import React, { useEffect, useState } from "react";
import { CheckCircle2, X, AlertCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const NOTIFICATION_TTL = 5000;

type NotificationType = {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
};

const Notification = ({ id, title, description, variant = "default", removeNotif }: NotificationType & { removeNotif: (id: string) => void }) => {
  useEffect(() => {
    const timeoutRef = setTimeout(() => {
      removeNotif(id);
    }, NOTIFICATION_TTL);

    return () => clearTimeout(timeoutRef);
  }, [id, removeNotif]);

  const bgColor = variant === "destructive" ? "bg-red-500" : "bg-indigo-500";
  const text = description || title || "Notification";
  const Icon = variant === "destructive" ? AlertCircle : CheckCircle2;

  return (
    <motion.div
      layout
      initial={{ y: -15, scale: 0.95 }}
      animate={{ y: 0, scale: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`p-3 flex items-start rounded-lg gap-2 text-sm font-medium shadow-lg text-white ${bgColor} pointer-events-auto w-full sm:w-auto sm:min-w-[300px] sm:max-w-[400px]`}
    >
      <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        {title && <div className="font-semibold">{title}</div>}
        {description && <div className="text-xs opacity-90 mt-0.5">{description}</div>}
        {!title && !description && <span>{text}</span>}
      </div>
      <button 
        onClick={() => removeNotif(id)} 
        className="ml-auto mt-0.5 flex-shrink-0 hover:opacity-80 transition-opacity p-0.5"
        aria-label="Close notification"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
};

export const NotificationContainer = () => {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);

  const removeNotif = (id: string) => {
    setNotifications((pv) => pv.filter((n) => n.id !== id));
  };

  // Listen for toast events from the toast hook
  useEffect(() => {
    const handleToast = (event: CustomEvent<NotificationType>) => {
      setNotifications((pv) => [event.detail, ...pv]);
    };

    window.addEventListener("show-notification" as any, handleToast as EventListener);
    return () => {
      window.removeEventListener("show-notification" as any, handleToast as EventListener);
    };
  }, []);

  return (
    <div className="flex flex-col gap-2 fixed top-4 right-4 z-[9999] pointer-events-none max-w-[420px] w-full sm:w-auto">
      <AnimatePresence>
        {notifications.map((n) => (
          <Notification removeNotif={removeNotif} {...n} key={n.id} />
        ))}
      </AnimatePresence>
    </div>
  );
};
