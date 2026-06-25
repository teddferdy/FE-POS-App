import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { ENDPOINT } from "@/utils/endpoints";
import { getToken } from "@/utils/cookies";
import PropTypes from "prop-types";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [newNotification, setNewNotification] = useState(null);

  useEffect(() => {
    const token = getToken();
    if (!token || ENDPOINT.BASE_URL.includes("vercel")) return;

    const s = io(ENDPOINT.BASE_URL, {
      auth: { token },
      transports: ["polling"],
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 3000
    });

    s.on("connect", () => {
      console.log("Socket connected:", s.id);
    });

    s.on("new-notification-global", (notification) => {
      setNewNotification(notification);
    });

    s.on("disconnect", (reason) => {
      if (reason !== "io client disconnect") {
        console.log("Socket disconnected:", reason);
      }
    });

    s.on("connect_error", (err) => {
      console.warn("Socket connection error (realtime notifications unavailable):", err.message);
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  const joinStore = (storeId) => {
    if (socket && storeId) {
      socket.emit("join-store", storeId);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, newNotification, setNewNotification, joinStore }}>
      {children}
    </SocketContext.Provider>
  );
};

SocketProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export const useSocket = () => useContext(SocketContext);
