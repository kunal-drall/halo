import { describe, it, expect } from "vitest";
import {
  cn,
  formatTokenAmount,
  formatSOL,
  shortenAddress,
  timeAgo,
  formatDate,
  getTrustTierColor,
  bpsToPercent,
} from "@/lib/utils";

describe("cn (class merge)", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  it("deduplicates tailwind classes", () => {
    expect(cn("p-4", "p-8")).toBe("p-8");
  });
});

describe("formatTokenAmount", () => {
  it("formats USDC amounts (6 decimals)", () => {
    expect(formatTokenAmount(1_000_000)).toBe("1.00");
    expect(formatTokenAmount(1_500_000)).toBe("1.50");
    expect(formatTokenAmount(100_000_000)).toBe("100.00");
  });

  it("formats with custom decimals", () => {
    expect(formatTokenAmount(1_000_000_000, 9)).toBe("1.00");
  });

  it("handles zero", () => {
    expect(formatTokenAmount(0)).toBe("0.00");
  });

  it("handles bigint input", () => {
    expect(formatTokenAmount(BigInt(5_000_000))).toBe("5.00");
  });
});

describe("formatSOL", () => {
  it("formats SOL (9 decimals)", () => {
    expect(formatSOL(1_000_000_000)).toBe("1.00");
    expect(formatSOL(500_000_000)).toBe("0.50");
  });
});

describe("shortenAddress", () => {
  it("shortens a Solana address", () => {
    const addr = "7xKXabcd1234efgh5678ijkl9012mnop3456qrst";
    const result = shortenAddress(addr);
    expect(result).toBe("7xKX...qrst");
  });

  it("respects custom char count", () => {
    const addr = "7xKXabcd1234efgh5678ijkl9012mnop3456qrst";
    const result = shortenAddress(addr, 6);
    expect(result).toBe("7xKXab...56qrst");
  });
});

describe("timeAgo", () => {
  it("returns 'just now' for recent times", () => {
    expect(timeAgo(new Date())).toBe("just now");
  });

  it("returns minutes ago", () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    expect(timeAgo(fiveMinAgo)).toBe("5m ago");
  });

  it("returns hours ago", () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    expect(timeAgo(twoHoursAgo)).toBe("2h ago");
  });

  it("returns days ago", () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    expect(timeAgo(threeDaysAgo)).toBe("3d ago");
  });
});

describe("formatDate", () => {
  it("formats a date string", () => {
    const result = formatDate("2024-06-15");
    expect(result).toContain("Jun");
    expect(result).toContain("15");
    expect(result).toContain("2024");
  });

  it("formats a Date object", () => {
    const result = formatDate(new Date(2024, 0, 1));
    expect(result).toContain("Jan");
    expect(result).toContain("1");
    expect(result).toContain("2024");
  });
});

describe("getTrustTierColor", () => {
  it("returns correct color for each tier", () => {
    expect(getTrustTierColor("platinum")).toContain("purple");
    expect(getTrustTierColor("gold")).toContain("yellow");
    expect(getTrustTierColor("silver")).toContain("gray");
    expect(getTrustTierColor("newcomer")).toContain("blue");
  });

  it("is case-insensitive", () => {
    expect(getTrustTierColor("Platinum")).toContain("purple");
    expect(getTrustTierColor("GOLD")).toContain("yellow");
  });
});

describe("bpsToPercent", () => {
  it("converts basis points to percentage", () => {
    expect(bpsToPercent(50)).toBe("0.50%");
    expect(bpsToPercent(25)).toBe("0.25%");
    expect(bpsToPercent(200)).toBe("2.00%");
    expect(bpsToPercent(10000)).toBe("100.00%");
  });
});
