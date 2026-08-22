import React from "react";
import { render } from "@testing-library/react";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

function Probe({ locked, label }) {
  useBodyScrollLock(locked);
  return <div>{label}</div>;
}

const getOverflow = () => document.body.style.overflow;

describe("useBodyScrollLock", () => {
  beforeEach(() => {
    document.body.style.overflow = "";
  });

  afterEach(() => {
    document.body.style.overflow = "";
  });

  test("mengunci scroll body saat locked=true", () => {
    render(<Probe locked label="a" />);
    expect(getOverflow()).toBe("hidden");
  });

  test("mengembalikan overflow saat unlocked", () => {
    const { rerender } = render(<Probe locked={false} label="a" />);
    expect(getOverflow()).toBe("");
    rerender(<Probe locked label="a" />);
    expect(getOverflow()).toBe("hidden");
    rerender(<Probe locked={false} label="a" />);
    expect(getOverflow()).toBe("");
  });

  test("refcount: lock baru dilepas setelah semua pemakai unlock", () => {
    // dua "modal" terbuka bersamaan (mis. palette + drawer)
    const { rerender, unmount } = render(
      <>
        <Probe locked label="one" />
        <Probe locked label="two" />
      </>
    );
    expect(getOverflow()).toBe("hidden");

    // satu tertutup -> masih terkunci
    rerender(
      <>
        <Probe locked={false} label="one" />
        <Probe locked label="two" />
      </>
    );
    expect(getOverflow()).toBe("hidden");

    // semua tertutup -> lepas
    rerender(
      <>
        <Probe locked={false} label="one" />
        <Probe locked={false} label="two" />
      </>
    );
    expect(getOverflow()).toBe("");

    unmount();
  });

  test("unmount tanpa toggle juga melepas lock", () => {
    const { unmount } = render(<Probe locked label="a" />);
    expect(getOverflow()).toBe("hidden");
    unmount();
    expect(getOverflow()).toBe("");
  });
});
