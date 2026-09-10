import React, { createContext, useContext, useEffect, useState } from "react";
import { ENDPOINT } from "@/utils/endpoints";
import { getToken } from "@/utils/cookies";
import PropTypes from "prop-types";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  // Unlike `socket` (which becomes non-null as soon as the socket.io client is
  // created), `connected` tracks the actual connection state. Consumers that
  // fall back to polling must branch on `connected`, otherwise a client that
  // was created but never (or no longer) connected would keep realtime updates
  // disabled (refetchInterval off) while receiving no events either — the
  // exact broken-polling-fallback bug this guards against.
  const [connected, setConnected] = useState(false);
  const [newNotification, setNewNotification] = useState(null);

  useEffect(() => {
    const token = getToken();
    if (!token || ENDPOINT.BASE_URL.includes("vercel")) return;

    let cancelled = false;
    let s;

    // ponytail: socket.io-client (~40KB gz) di-dynamic-import supaya tidak
    // ikut critical path main entry — dipakai hanya oleh Header (notification
    // badge) di balik DashboardLayout, tidak relevan untuk /login maupun /cashier.
    import("socket.io-client").then(({ io }) => {
      if (cancelled) return;

      s = io(ENDPOINT.BASE_URL, {
        auth: { token },
        transports: ["polling"],
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 3000
      });

      s.on("connect", () => {
        setConnected(true);
        console.log("Socket connected:", s.id);
      });

      s.on("new-notification-global", (notification) => {
        setNewNotification(notification);
      });

      s.on("disconnect", (reason) => {
        setConnected(false);
        if (reason !== "io client disconnect") {
          console.log("Socket disconnected:", reason);
        }
      });

      s.on("connect_error", (err) => {
        setConnected(false);
        console.warn("Socket connection error (realtime notifications unavailable):", err.message);
      });

      setSocket(s);
    });

    return () => {
      cancelled = true;
      s?.removeAllListeners();
      s?.disconnect();
      setSocket(null);
      setConnected(false);
    };
  }, []);

  const joinStore = (storeId) => {
    if (socket && storeId) {
      socket.emit("join-store", storeId);
    }
  };

  return (
    <SocketContext.Provider
      value={{ socket, connected, newNotification, setNewNotification, joinStore }}>
      {children}
    </SocketContext.Provider>
  );
};

SocketProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export const useSocket = () => useContext(SocketContext);
