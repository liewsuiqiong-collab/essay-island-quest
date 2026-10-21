import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("Adventure player profile", () => {
  beforeEach(() => { localStorage.clear(); vi.resetModules(); });

  it("saves the class locally and preserves the existing name and XP", async () => {
    const store = await import("@/lib/store");
    const { result } = renderHook(() => store.useStore());
    act(() => { store.setName("探险家"); store.award("profile-test", 20, "test"); store.setPlayerDetails({ className: "中二 A" }); });
    expect(result.current.className).toBe("中二 A");
    expect(result.current.name).toBe("探险家");
    expect(result.current.xp).toBe(20);
    expect(JSON.parse(localStorage.getItem("zuowen-island-v1") ?? "{}").className).toBe("中二 A");
  });

  it("restores the chosen Higher Chinese track after reloading the store", async () => {
    const store = await import("@/lib/store");
    store.setPlayerDetails({ chineseTrack: "higher" });
    vi.resetModules();
    const reloaded = await import("@/lib/store");
    const { result } = renderHook(() => reloaded.useStore());
    expect(result.current.chineseTrack).toBe("higher");
  });

  it("keeps older saved records compatible with the new player fields", async () => {
    localStorage.setItem("zuowen-island-v1", JSON.stringify({ name: "原有玩家", xp: 35 }));
    const store = await import("@/lib/store");
    const { result } = renderHook(() => store.useStore());
    expect(result.current.name).toBe("原有玩家");
    expect(result.current.xp).toBe(35);
    expect(result.current.className).toBe("");
    expect(result.current.chineseTrack).toBe("express");
  });
});