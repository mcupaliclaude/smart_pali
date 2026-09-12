import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { PortalFooter } from "./portal-footer";

vi.mock("@/shared/lib/i18n/client", () => ({
  useT: () => (key: string) => {
    const dict: Record<string, string> = {
      "home.hero.title": "คณะพุทธศาสตร์และภาษาบาลี",
      "home.hero.badge": "ศูนย์กลางวิชาการและวิปัสสนาธุระชั้นนำ",
      "home.hero.subtitle": "สืบสานคัมภีร์บาลีโบราณ บูรณาการศาสตร์สมัยใหม่ พัฒนาจิตตภาวนาเพื่อสันติสุขของมนุษยชาติ",
      "portal.brand.title": "แพลตฟอร์มคณะวิชาการ",
      "portal.footer.quickLinks": "เมนูลัด",
      "portal.footer.services": "บริการดิจิทัล",
      "portal.footer.contact": "ติดต่อคณะ",
      "portal.footer.rights": "สงวนลิขสิทธิ์ทุกประการ",
      "portal.footer.operational": "ระบบเปิดให้บริการตามปกติ",
      "portal.nav.home": "หน้าแรก",
      "portal.nav.news": "ข่าวประชาสัมพันธ์",
      "portal.nav.curriculum": "หลักสูตร",
      "portal.nav.staff": "บุคลากร",
      "portal.nav.reservations": "จองห้องและยานพาหนะ",
      "portal.nav.meditation": "วิปัสสนาธุระ",
      "portal.nav.alumni": "ศิษย์เก่า",
      "portal.nav.contact": "ติดต่อเรา",
      "portal.nav.adminConsole": "ระบบหลังบ้าน",
      "portal.contact.title": "ติดต่อคณะและสำนักงาน",
      "home.contact.address": "อาคารเรียนรวม คณะพุทธศาสตร์ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย อ.วังน้อย จ.พระนครศรีอยุธยา",
      "home.contact.hours": "วันจันทร์ - ศุกร์: 08:30 - 16:30 น.",
    };
    return dict[key] || key;
  },
}));

describe("PortalFooter", () => {
  it("เรนเดอร์ข้อมูล Brand และข้อความอธิบายของคณะอย่างถูกต้อง", () => {
    render(
      <PortalFooter
        brandName="คณะพุทธศาสตร์และภาษาบาลี"
        brandTagline="MCU Pali Smart Portal"
        brandLogoUrl="/uploads/custom-logo.png"
      />
    );

    expect(screen.getByText("คณะพุทธศาสตร์และภาษาบาลี")).toBeTruthy();
    expect(screen.getByText("MCU Pali Smart Portal")).toBeTruthy();
    const logoImg = screen.getByAltText("คณะพุทธศาสตร์และภาษาบาลี");
    expect(logoImg.getAttribute("src")).toBe("/uploads/custom-logo.png");
  });

  it("เรนเดอร์ส่วนเมนูลัดและบริการดิจิทัลครบถ้วน", () => {
    render(<PortalFooter />);

    // หัวข้อส่วนต่างๆ
    expect(screen.getByText("เมนูลัด")).toBeTruthy();
    expect(screen.getByText("บริการดิจิทัล")).toBeTruthy();
    expect(screen.getByText("ติดต่อคณะ")).toBeTruthy();

    // ลิงก์เมนู
    expect(screen.getByText("หน้าแรก")).toBeTruthy();
    expect(screen.getByText("ข่าวประชาสัมพันธ์")).toBeTruthy();
    expect(screen.getByText("หลักสูตร")).toBeTruthy();
    expect(screen.getByText("บุคลากร")).toBeTruthy();
    expect(screen.getByText("จองห้องและยานพาหนะ")).toBeTruthy();
    expect(screen.getByText("วิปัสสนาธุระ")).toBeTruthy();
    expect(screen.getByText("ศิษย์เก่า")).toBeTruthy();
    expect(screen.getByText("ระบบหลังบ้าน")).toBeTruthy();
  });

  it("แสดงสถานะระบบเปิดให้บริการตามปกติและสงวนลิขสิทธิ์", () => {
    render(<PortalFooter />);

    expect(screen.getByText("ระบบเปิดให้บริการตามปกติ")).toBeTruthy();
    expect(screen.getByText(/สงวนลิขสิทธิ์ทุกประการ/)).toBeTruthy();
  });
});
