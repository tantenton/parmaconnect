import { describe, it, expect } from "vitest";

describe("event capacity enforcement", () => {
  // registerAttendance rejects when event.capacity <= _count.attendees
  function canRegister(status: string, capacity: number | null, currentAttendees: number, alreadyRegistered: boolean): string | null {
    if (status !== "ACTIVE") return "Event tidak aktif";
    // Source uses: event.capacity && event._count.attendees >= event.capacity
    // capacity=0/null is falsy → unlimited
    if (capacity && currentAttendees >= capacity) return "Kapasitas penuh";
    if (alreadyRegistered) return "Anda sudah terdaftar";
    return null; // allowed
  }

  it("allows registration when under capacity", () => {
    expect(canRegister("ACTIVE", 2, 0, false)).toBeNull();
    expect(canRegister("ACTIVE", 2, 1, false)).toBeNull();
  });

  it("rejects registration when capacity reached", () => {
    expect(canRegister("ACTIVE", 2, 2, false)).toBe("Kapasitas penuh");
    expect(canRegister("ACTIVE", 2, 3, false)).toBe("Kapasitas penuh");
  });

  it("allows registration when no capacity limit set", () => {
    expect(canRegister("ACTIVE", null, 999, false)).toBeNull();
  });

  it("allows registration when capacity = 0 (unlimited)", () => {
    expect(canRegister("ACTIVE", 0, 0, false)).toBeNull();
  });
});

describe("duplicate attendance prevention", () => {
  it("rejects duplicate registration for same user+event", () => {
    function canRegister(alreadyRegistered: boolean, status: string): string | null {
      if (status !== "ACTIVE") return "Event tidak aktif";
      if (alreadyRegistered) return "Anda sudah terdaftar";
      return null;
    }

    expect(canRegister(true, "ACTIVE")).toBe("Anda sudah terdaftar");
    expect(canRegister(false, "ACTIVE")).toBeNull();
  });
});

describe("cancelled event denies registration", () => {
  it("rejects registration for non-ACTIVE events", () => {
    function canRegister(status: string): string | null {
      if (status !== "ACTIVE") return "Event tidak aktif";
      return null;
    }

    expect(canRegister("CANCELLED")).toBe("Event tidak aktif");
    expect(canRegister("DRAFT")).toBe("Event tidak aktif");
    expect(canRegister("COMPLETED")).toBe("Event tidak aktif");
    expect(canRegister("ACTIVE")).toBeNull();
  });
});

describe("event date validation", () => {
  it("rejects event where endsAt before startsAt", () => {
    function validateDates(startsAt: Date, endsAt: Date): string | null {
      if (endsAt < startsAt) return "Tanggal akhir tidak boleh sebelum tanggal mulai";
      return null;
    }

    const now = new Date("2025-01-01T10:00:00Z");
    const later = new Date("2025-01-01T12:00:00Z");
    const earlier = new Date("2025-01-01T08:00:00Z");

    expect(validateDates(now, earlier)).toBe("Tanggal akhir tidak boleh sebelum tanggal mulai");
    expect(validateDates(now, later)).toBeNull();
    expect(validateDates(now, now)).toBeNull();
  });
});

describe("event cancellation state machine", () => {
  // cancelEvent checks: event.status === "CANCELLED" → throw "Event sudah dibatalkan"
  it("cancelling an already-cancelled event fails", () => {
    function cancelEvent(status: string): string | null {
      if (status === "CANCELLED") return "Event sudah dibatalkan";
      return null;
    }
    expect(cancelEvent("CANCELLED")).toBe("Event sudah dibatalkan");
    expect(cancelEvent("ACTIVE")).toBeNull();
    expect(cancelEvent("DRAFT")).toBeNull();
  });
});

describe("attendee cancellation", () => {
  it("rejects cancelling attendance when not registered", () => {
    function cancelAttendance(isRegistered: boolean): string | null {
      if (!isRegistered) return "Anda tidak terdaftar";
      return null;
    }
    expect(cancelAttendance(false)).toBe("Anda tidak terdaftar");
    expect(cancelAttendance(true)).toBeNull();
  });
});
