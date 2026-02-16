import { describe, it, expect } from "vitest";
import {
  generateSessionToken,
  parseSessionToken,
  validateFields,
} from "@/lib/api-utils";

describe("Session Token", () => {
  it("generates a valid HMAC-signed token", () => {
    const token = generateSessionToken("7xKXabcd1234efgh5678");
    expect(token).toBeTruthy();
    expect(token).toContain(".");
    const parts = token.split(".");
    expect(parts).toHaveLength(2);
    // Base64 payload and hex signature
    expect(parts[0].length).toBeGreaterThan(0);
    expect(parts[1].length).toBe(64); // SHA-256 hex = 64 chars
  });

  it("parses a valid token and returns wallet", () => {
    const wallet = "7xKXabcd1234efgh5678";
    const token = generateSessionToken(wallet);
    const parsed = parseSessionToken(token);
    expect(parsed).not.toBeNull();
    expect(parsed!.wallet).toBe(wallet);
    expect(parsed!.exp).toBeGreaterThan(Date.now());
  });

  it("rejects a tampered token", () => {
    const token = generateSessionToken("7xKXabcd1234efgh5678");
    const [data] = token.split(".");
    const tampered = `${data}.deadbeef${"0".repeat(56)}`;
    const parsed = parseSessionToken(tampered);
    expect(parsed).toBeNull();
  });

  it("rejects a completely invalid token", () => {
    expect(parseSessionToken("")).toBeNull();
    expect(parseSessionToken("garbage")).toBeNull();
    expect(parseSessionToken("no.valid.token")).toBeNull();
  });

  it("rejects an expired token", () => {
    // Manually craft an expired token
    const payload = {
      wallet: "7xKXabcd1234efgh5678",
      iat: Date.now() - 2 * 86400000,
      exp: Date.now() - 86400000, // expired 1 day ago
    };
    const data = Buffer.from(JSON.stringify(payload)).toString("base64");
    const { createHmac } = require("crypto");
    const secret =
      process.env.SESSION_SECRET ||
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      "";
    const sig = createHmac("sha256", secret).update(data).digest("hex");
    const token = `${data}.${sig}`;

    const parsed = parseSessionToken(token);
    expect(parsed).toBeNull();
  });
});

describe("validateFields", () => {
  it("returns null when all required fields are present", () => {
    const body = { name: "Test", amount: 100 };
    expect(validateFields(body, ["name", "amount"])).toBeNull();
  });

  it("returns error for missing field", () => {
    const body = { name: "Test" };
    const result = validateFields(body, ["name", "amount"]);
    expect(result).toBe("Missing required field: amount");
  });

  it("returns error for empty string field", () => {
    const body = { name: "" };
    const result = validateFields(body, ["name"]);
    expect(result).toBe("Missing required field: name");
  });

  it("returns error for null field", () => {
    const body = { name: null };
    const result = validateFields(body as Record<string, unknown>, ["name"]);
    expect(result).toBe("Missing required field: name");
  });

  it("passes with empty required array", () => {
    expect(validateFields({}, [])).toBeNull();
  });
});
