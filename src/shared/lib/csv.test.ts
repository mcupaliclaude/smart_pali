import { describe, it, expect } from "vitest";
import { parseCsv, generateCsv } from "./csv";

describe("csv utility", () => {
  it("should parse standard CSV text", () => {
    const csv = "name,email,role\nสมชาย,somchai@test.com,ADMIN\nสมหญิง,somying@test.com,STAFF";
    const result = parseCsv(csv);
    expect(result.headers).toEqual(["name", "email", "role"]);
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0]).toEqual({
      name: "สมชาย",
      email: "somchai@test.com",
      role: "ADMIN",
    });
    expect(result.rows[1]).toEqual({
      name: "สมหญิง",
      email: "somying@test.com",
      role: "STAFF",
    });
  });

  it("should handle UTF-8 BOM automatically", () => {
    const csvWithBom = "\uFEFFname,email\nทดสอบ,test@test.com";
    const result = parseCsv(csvWithBom);
    expect(result.headers).toEqual(["name", "email"]);
    expect(result.rows[0]?.name).toBe("ทดสอบ");
  });

  it("should handle quoted fields containing commas, newlines, and escaped quotes", () => {
    const csv = 'name,notes\n"ใจดี, สมชาย","บรรทัดที่ 1\nบรรทัดที่ 2"\n"คำว่า ""พิเศษ""",ปกติ';
    const result = parseCsv(csv);
    expect(result.headers).toEqual(["name", "notes"]);
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0]?.name).toBe("ใจดี, สมชาย");
    expect(result.rows[0]?.notes).toBe("บรรทัดที่ 1\nบรรทัดที่ 2");
    expect(result.rows[1]?.name).toBe('คำว่า "พิเศษ"');
    expect(result.rows[1]?.notes).toBe("ปกติ");
  });

  it("should generate CSV with UTF-8 BOM and correct escaping", () => {
    const columns = [
      { key: "name", label: "ชื่อ" },
      { key: "email", label: "อีเมล" },
      { key: "notes", label: "หมายเหตุ" },
    ];
    const data = [
      { name: "พระมหาทดสอบ", email: "pali@test.com", notes: "ไม่มี" },
      { name: "ใจดี, สมชาย", email: "somchai@test.com", notes: 'มี "เครื่องหมายคำพูด"' },
    ];
    const output = generateCsv(columns, data);
    expect(output.startsWith("\uFEFF")).toBe(true);
    expect(output).toContain("ชื่อ,อีเมล,หมายเหตุ");
    expect(output).toContain('"ใจดี, สมชาย",somchai@test.com,"มี ""เครื่องหมายคำพูด"""');
  });
});
