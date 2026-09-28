import { useEffect, useState } from "react";
import { isSessionEnding } from "@/services/session";

// F2: room-subscription awareness with polling continuity.
//
// `connected` from useSocket() proves only that the socket transport is up —
// it says nothing about whether this screen actually joined its required
// room. The backend can reject the join (wrong store, session scope,
// disabled account) via `ack({ ok: false })` and/or a `join-rejected` event
// while the transport stays connected, which previously disabled polling
// (`connected ? false : interval`) and left the screen silently stale.
//
// This hook tracks one room subscription (`join-store`/`join-kitchen` +
// `roomKey`) and reports `roomOk`, which is true ONLY after the server
// confirms the join. Consumers gate polling on `connected && roomOk` so
// polling stays on whenever realtime membership is unconfirmed.
//
// roomState: "idle" (nothing to join) | "pending" (join emitted, no success
// yet — fails open to polling) | "joined" (ack ok) | "rejected" (ack
// !ok, join-rejected, or transport loss after join/pending).
//
// Lifecycle: join on mount/store-change/reconnect (the effect is keyed on
// `connected` because the socket object identity survives reconnects, so a
// `[socket, key]`-only effect would never re-join); reset to non-ok on
// disconnect; leave + unsubscribe on cleanup. No timers, no retries, no new
// protocol — a missing ack simply never flips to "joined".
export const useRoomSubscription = ({ socket, connected, roomEvent, roomKey }) => {
  const [roomState, setRoomState] = useState("idle");

  useEffect(() => {
    if (!socket || roomKey === null || roomKey === undefined) {
      setRoomState("idle");
      return undefined;
    }
    if (!connected || isSessionEnding()) {
      // Transport down (or teardown): a previous subscription is no longer
      // valid. Never emit here — just mark non-ok so polling resumes.
      setRoomState((prev) => (prev === "joined" || prev === "pending" ? "rejected" : prev));
      return undefined;
    }

    const leaveEvent = roomEvent.replace(/^join-/, "leave-");
    let stale = false;
    setRoomState("pending");
    socket.emit(roomEvent, roomKey, (ack) => {
      if (stale) return;
      if (ack && ack.ok) setRoomState("joined");
      else setRoomState("rejected");
    });

    const handleJoinRejected = (data) => {
      if (stale || !data || data.event !== roomEvent) return;
      if (String(data.store) !== String(roomKey)) return;
      setRoomState("rejected");
    };
    socket.on("join-rejected", handleJoinRejected);

    return () => {
      stale = true;
      socket.off("join-rejected", handleJoinRejected);
      // While a session is ending no new socket writes may leave the tab —
      // the provider's session teardown owns disposal instead.
      if (!isSessionEnding()) socket.emit(leaveEvent, roomKey);
    };
  }, [socket, connected, roomEvent, roomKey]);

  return { roomOk: roomState === "joined", roomState };
};
