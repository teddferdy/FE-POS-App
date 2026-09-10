import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { SocketProvider, useSocket } from "@/services/socket";
import { io } from "socket.io-client";

// The provider strips the ~40KB socket.io-client out of the main bundle via a
// dynamic import; mocking the module keeps the provider testable without
// loading the real client (and mimics the deferred resolution exactly).
jest.mock("socket.io-client", () => ({
  __esModule: true,
  io: jest.fn()
}));
jest.mock("@/utils/cookies", () => ({ getToken: () => "token" }));
jest.mock("@/utils/endpoints", () => ({ ENDPOINT: { BASE_URL: "https://api.example.com" } }));

const makeSocketMock = () => {
  const handlers = {};
  return {
    id: "test-socket-1",
    on: jest.fn((event, cb) => {
      handlers[event] = cb;
    }),
    off: jest.fn(),
    removeAllListeners: jest.fn(),
    disconnect: jest.fn(),
    emit: jest.fn(),
    handlers
  };
};

const Probe = () => {
  const { socket, connected } = useSocket();
  return (
    <div data-testid="probe">
      {socket ? "has-socket" : "no-socket"}|{connected ? "connected" : "disconnected"}
    </div>
  );
};

// The `connected` flag in SocketContext is the contract that polling consumers
// (Kitchen Display, Waiter Request) branch on: it must start false, flip true
// only on a real socket.io `connect`, flip back to false on disconnect /
// connect_error, and the provider must not leak listeners on unmount.
describe("SocketProvider — connected state", () => {
  let socket;

  beforeEach(() => {
    socket = makeSocketMock();
    io.mockReturnValue(socket);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("exposes connected=false until the client actually connects", async () => {
    render(
      <SocketProvider>
        <Probe />
      </SocketProvider>
    );

    expect(screen.getByTestId("probe")).toHaveTextContent("no-socket|disconnected");

    // Client object exists but no connect event yet → still disconnected.
    await waitFor(() =>
      expect(screen.getByTestId("probe")).toHaveTextContent("has-socket|disconnected")
    );

    act(() => socket.handlers.connect());
    expect(screen.getByTestId("probe")).toHaveTextContent("has-socket|connected");
  });

  test("flips connected back to false on disconnect", async () => {
    render(
      <SocketProvider>
        <Probe />
      </SocketProvider>
    );
    await waitFor(() => expect(screen.getByTestId("probe")).toHaveTextContent("has-socket"));

    act(() => socket.handlers.connect());
    expect(screen.getByTestId("probe")).toHaveTextContent("connected");

    act(() => socket.handlers.disconnect("transport close"));
    expect(screen.getByTestId("probe")).toHaveTextContent("has-socket|disconnected");
  });

  test("keeps connected=false on connect_error (polling must not be turned off)", async () => {
    render(
      <SocketProvider>
        <Probe />
      </SocketProvider>
    );
    await waitFor(() => expect(screen.getByTestId("probe")).toHaveTextContent("has-socket"));

    act(() => socket.handlers.connect_error(new Error("boom")));
    expect(screen.getByTestId("probe")).toHaveTextContent("has-socket|disconnected");
  });

  test("removes all listeners and disconnects the client on unmount", async () => {
    const { unmount } = render(
      <SocketProvider>
        <Probe />
      </SocketProvider>
    );
    await waitFor(() => expect(screen.getByTestId("probe")).toHaveTextContent("has-socket"));

    unmount();

    expect(socket.removeAllListeners).toHaveBeenCalled();
    expect(socket.disconnect).toHaveBeenCalled();
  });
});
