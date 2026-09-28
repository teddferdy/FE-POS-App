import React from "react";
import { render, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useRoomSubscription } from "@/hooks/useRoomSubscription";

let mockEnding = false;
jest.mock("@/services/session", () => ({ isSessionEnding: () => mockEnding }));

const Probe = ({ socket, connected, roomEvent = "join-kitchen", roomKey = 7 }) => {
  const { roomOk, roomState } = useRoomSubscription({ socket, connected, roomEvent, roomKey });
  return <div data-testid="probe">{`${roomOk ? "ok" : "not-ok"}|${roomState}`}</div>;
};

const makeSocketStub = () => {
  const handlers = {};
  const stub = {
    on: jest.fn((event, cb) => {
      handlers[event] = handlers[event] || [];
      handlers[event].push(cb);
    }),
    off: jest.fn((event, cb) => {
      handlers[event] = (handlers[event] || []).filter((h) => h !== cb);
    }),
    emit: jest.fn(),
    handlers
  };
  return stub;
};

const joinEmits = (stub) => stub.emit.mock.calls.filter((c) => String(c[0]).startsWith("join-"));
const leaveEmits = (stub) => stub.emit.mock.calls.filter((c) => String(c[0]).startsWith("leave-"));
const fireAck = (stub, index, value) => {
  const ack = joinEmits(stub)[index][2];
  act(() => ack(value));
};
const fireJoinRejected = (stub, data) => {
  act(() => {
    [...(stub.handlers["join-rejected"] || [])].forEach((h) => h(data));
  });
};
const renderProbe = (props) => render(<Probe {...props} />);

beforeEach(() => {
  mockEnding = false;
});

describe("useRoomSubscription — idle", () => {
  test("stays idle with no socket and emits nothing", () => {
    const { getByTestId } = renderProbe({ socket: null, connected: false });
    expect(getByTestId("probe")).toHaveTextContent("not-ok|idle");
  });

  test("stays idle with a null room key and emits nothing", () => {
    const stub = makeSocketStub();
    const { getByTestId } = renderProbe({ socket: stub, connected: true, roomKey: null });
    expect(getByTestId("probe")).toHaveTextContent("not-ok|idle");
    expect(stub.emit).not.toHaveBeenCalled();
  });

  test("emits nothing while the session is ending", () => {
    mockEnding = true;
    const stub = makeSocketStub();
    const { getByTestId } = renderProbe({ socket: stub, connected: true });
    expect(getByTestId("probe")).toHaveTextContent("not-ok|idle");
    expect(stub.emit).not.toHaveBeenCalled();
  });
});

describe("useRoomSubscription — ack protocol", () => {
  test("accepted join flips to joined and passes an ack callback", () => {
    const stub = makeSocketStub();
    const { getByTestId } = renderProbe({ socket: stub, connected: true });
    expect(getByTestId("probe")).toHaveTextContent("not-ok|pending");
    expect(joinEmits(stub).map((c) => [c[0], c[1]])).toEqual([["join-kitchen", 7]]);
    expect(typeof joinEmits(stub)[0][2]).toBe("function");

    fireAck(stub, 0, { ok: true });
    expect(getByTestId("probe")).toHaveTextContent("ok|joined");
  });

  test("rejected ack fails open to polling (roomOk stays false)", () => {
    const stub = makeSocketStub();
    const { getByTestId } = renderProbe({ socket: stub, connected: true });
    fireAck(stub, 0, { ok: false, message: "Forbidden store" });
    expect(getByTestId("probe")).toHaveTextContent("not-ok|rejected");
  });

  test("missing ack payload fails open to polling", () => {
    const stub = makeSocketStub();
    const { getByTestId } = renderProbe({ socket: stub, connected: true });
    fireAck(stub, 0, undefined);
    expect(getByTestId("probe")).toHaveTextContent("not-ok|rejected");
  });

  test("pending join (no ack yet) keeps polling enabled", () => {
    const stub = makeSocketStub();
    const { getByTestId } = renderProbe({ socket: stub, connected: true });
    expect(joinEmits(stub)).toHaveLength(1);
    expect(getByTestId("probe")).toHaveTextContent("not-ok|pending");
  });
});

describe("useRoomSubscription — join-rejected event", () => {
  test("matching join-rejected marks the room rejected", () => {
    const stub = makeSocketStub();
    const { getByTestId } = renderProbe({ socket: stub, connected: true });
    fireJoinRejected(stub, { event: "join-kitchen", store: 7, ok: false });
    expect(getByTestId("probe")).toHaveTextContent("not-ok|rejected");
  });

  test("join-rejected for another room or store is ignored", () => {
    const stub = makeSocketStub();
    const { getByTestId } = renderProbe({ socket: stub, connected: true });
    fireJoinRejected(stub, { event: "join-store", store: 7, ok: false });
    fireJoinRejected(stub, { event: "join-kitchen", store: 99, ok: false });
    expect(getByTestId("probe")).toHaveTextContent("not-ok|pending");
    fireAck(stub, 0, { ok: true });
    expect(getByTestId("probe")).toHaveTextContent("ok|joined");
  });
});

describe("useRoomSubscription — disconnect and reconnect", () => {
  test("disconnect after a successful join marks non-ok and leaves the room", () => {
    const stub = makeSocketStub();
    const { getByTestId, rerender } = renderProbe({ socket: stub, connected: true });
    fireAck(stub, 0, { ok: true });
    expect(getByTestId("probe")).toHaveTextContent("ok|joined");

    rerender(<Probe socket={stub} connected={false} />);
    expect(getByTestId("probe")).toHaveTextContent("not-ok|rejected");
    expect(leaveEmits(stub).map((c) => [c[0], c[1]])).toEqual([["leave-kitchen", 7]]);
  });

  test("disconnect before ack keeps polling enabled", () => {
    const stub = makeSocketStub();
    const { getByTestId, rerender } = renderProbe({ socket: stub, connected: true });
    expect(getByTestId("probe")).toHaveTextContent("not-ok|pending");
    rerender(<Probe socket={stub} connected={false} />);
    expect(getByTestId("probe")).toHaveTextContent("not-ok|rejected");
  });

  test("reconnect triggers exactly one fresh join; accepted rejoin restores realtime", () => {
    const stub = makeSocketStub();
    const { getByTestId, rerender } = renderProbe({ socket: stub, connected: true });
    fireAck(stub, 0, { ok: true });
    rerender(<Probe socket={stub} connected={false} />);
    rerender(<Probe socket={stub} connected={true} />);

    expect(joinEmits(stub)).toHaveLength(2);
    expect(getByTestId("probe")).toHaveTextContent("not-ok|pending");
    fireAck(stub, 1, { ok: true });
    expect(getByTestId("probe")).toHaveTextContent("ok|joined");
  });

  test("reconnect with a rejected rejoin stays degraded", () => {
    const stub = makeSocketStub();
    const { getByTestId, rerender } = renderProbe({ socket: stub, connected: true });
    fireAck(stub, 0, { ok: true });
    rerender(<Probe socket={stub} connected={false} />);
    rerender(<Probe socket={stub} connected={true} />);
    fireAck(stub, 1, { ok: false });
    expect(getByTestId("probe")).toHaveTextContent("not-ok|rejected");
  });
});

describe("useRoomSubscription — store change and listener hygiene", () => {
  test("store change leaves the old room, joins the new one as pending", () => {
    const stub = makeSocketStub();
    const { getByTestId, rerender } = renderProbe({ socket: stub, connected: true, roomKey: 7 });
    fireAck(stub, 0, { ok: true });
    expect(getByTestId("probe")).toHaveTextContent("ok|joined");

    rerender(<Probe socket={stub} connected={true} roomKey={99} />);
    expect(leaveEmits(stub).map((c) => [c[0], c[1]])).toEqual([["leave-kitchen", 7]]);
    expect(joinEmits(stub).map((c) => [c[0], c[1]])).toEqual([
      ["join-kitchen", 7],
      ["join-kitchen", 99]
    ]);
    expect(getByTestId("probe")).toHaveTextContent("not-ok|pending");
    fireAck(stub, 1, { ok: true });
    expect(getByTestId("probe")).toHaveTextContent("ok|joined");
  });

  test("a stale ack for the previous room cannot confirm the new room", () => {
    const stub = makeSocketStub();
    const { getByTestId, rerender } = renderProbe({ socket: stub, connected: true, roomKey: 7 });
    rerender(<Probe socket={stub} connected={true} roomKey={99} />);
    fireAck(stub, 0, { ok: true });
    expect(getByTestId("probe")).toHaveTextContent("not-ok|pending");
  });

  test("rerenders with identical props emit exactly one join", () => {
    const stub = makeSocketStub();
    const { rerender } = renderProbe({ socket: stub, connected: true });
    rerender(<Probe socket={stub} connected={true} />);
    rerender(<Probe socket={stub} connected={true} />);
    expect(joinEmits(stub)).toHaveLength(1);
    expect(stub.on.mock.calls.filter((c) => c[0] === "join-rejected")).toHaveLength(1);
  });

  test("unmount removes the listener, leaves the room, and remount starts fresh", () => {
    const stub = makeSocketStub();
    const first = renderProbe({ socket: stub, connected: true });
    first.unmount();
    expect(stub.off.mock.calls.filter((c) => c[0] === "join-rejected")).toHaveLength(1);
    expect(leaveEmits(stub)).toHaveLength(1);

    renderProbe({ socket: stub, connected: true });
    expect(joinEmits(stub)).toHaveLength(2);
    expect(stub.on.mock.calls.filter((c) => c[0] === "join-rejected")).toHaveLength(2);
    expect(stub.off.mock.calls.filter((c) => c[0] === "join-rejected")).toHaveLength(1);
  });

  test("unmount during session teardown performs no socket write", () => {
    const stub = makeSocketStub();
    const { unmount } = renderProbe({ socket: stub, connected: true });
    mockEnding = true;
    unmount();
    expect(leaveEmits(stub)).toHaveLength(0);
  });
});
