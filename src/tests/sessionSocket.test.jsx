import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { SocketProvider, useSocket } from "@/services/socket";
import { io } from "socket.io-client";

// SocketProvider's side of the session boundary: it hands the session module
// a disconnect for the live socket, withdraws it on cleanup, never opens a
// socket while the session is ending, and binds each socket to the token read
// at app boot (so a fresh boot after login gets the new user's token).

jest.mock("socket.io-client", () => ({
  __esModule: true,
  io: jest.fn()
}));

let mockToken = "token-A";
jest.mock("@/utils/cookies", () => ({ getToken: () => mockToken }));
jest.mock("@/utils/endpoints", () => ({ ENDPOINT: { BASE_URL: "https://api.example.com" } }));

let mockEnding = false;
const mockResources = new Set();
const mockUnregister = jest.fn();
jest.mock("@/services/session", () => ({
  isSessionEnding: () => mockEnding,
  registerSessionResource: (dispose) => {
    mockResources.add(dispose);
    return () => {
      mockUnregister(dispose);
      mockResources.delete(dispose);
    };
  }
}));

const makeSocketMock = () => ({
  id: "socket",
  on: jest.fn(),
  off: jest.fn(),
  emit: jest.fn(),
  removeAllListeners: jest.fn(),
  disconnect: jest.fn()
});

const Probe = () => {
  const { socket } = useSocket();
  return <div data-testid="probe">{socket ? "has-socket" : "no-socket"}</div>;
};

const renderProvider = () =>
  render(
    <SocketProvider>
      <Probe />
    </SocketProvider>
  );

let socket;

beforeEach(() => {
  mockEnding = false;
  mockToken = "token-A";
  mockResources.clear();
  mockUnregister.mockClear();
  socket = makeSocketMock();
  io.mockReset();
  io.mockReturnValue(socket);
});

describe("SocketProvider × session boundary", () => {
  test("registers a disconnect for the live socket with the session module", async () => {
    renderProvider();
    await waitFor(() => expect(screen.getByTestId("probe")).toHaveTextContent("has-socket"));

    expect(mockResources.size).toBe(1);
    const [dispose] = [...mockResources];
    dispose();

    expect(socket.removeAllListeners).toHaveBeenCalled();
    expect(socket.disconnect).toHaveBeenCalledTimes(1);
  });

  test("withdraws the registration when the provider unmounts", async () => {
    const { unmount } = renderProvider();
    await waitFor(() => expect(mockResources.size).toBe(1));

    unmount();

    expect(mockUnregister).toHaveBeenCalledTimes(1);
    expect(mockResources.size).toBe(0);
  });

  test("never opens a socket while the session is ending", async () => {
    mockEnding = true;
    renderProvider();

    await new Promise((r) => setTimeout(r, 0));
    expect(io).not.toHaveBeenCalled();
    expect(screen.getByTestId("probe")).toHaveTextContent("no-socket");
    expect(mockResources.size).toBe(0);
  });

  test("does not open a socket if the session starts ending while the client loads", async () => {
    renderProvider();
    mockEnding = true;

    await new Promise((r) => setTimeout(r, 0));
    expect(io).not.toHaveBeenCalled();
  });

  test("each boot binds the socket to the token current at that boot", async () => {
    const first = renderProvider();
    await waitFor(() => expect(io).toHaveBeenCalledTimes(1));
    expect(io.mock.calls[0][1].auth).toEqual({ token: "token-A" });
    first.unmount();

    // login B → full page load → a new provider mount reads the new token
    mockToken = "token-B";
    io.mockReturnValue(makeSocketMock());
    renderProvider();
    await waitFor(() => expect(io).toHaveBeenCalledTimes(2));
    expect(io.mock.calls[1][1].auth).toEqual({ token: "token-B" });
  });

  test("with no token (e.g. the login page after a boundary) no socket is created", async () => {
    mockToken = null;
    renderProvider();
    await new Promise((r) => setTimeout(r, 0));
    expect(io).not.toHaveBeenCalled();
  });
});
