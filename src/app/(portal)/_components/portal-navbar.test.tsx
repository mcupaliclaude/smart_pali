import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PortalNavbar } from "./portal-navbar";

const setThemeMock = vi.fn();
const signOutMock = vi.fn();
let currentTheme = "light";
let mockPathname = "/portal";
let mockSession = {
  status: "unauthenticated" as "authenticated" | "unauthenticated" | "loading",
  user: null as null | { id: string; name: string; email: string; image?: string | null },
  roles: [] as string[],
  permissions: [] as string[],
  isSuperAdmin: false,
  isAuthenticated: false,
  isLoading: false,
  update: vi.fn(),
  tenantId: null as string | null,
  mustChangePassword: false,
};

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));

vi.mock("next-themes", () => ({
  useTheme: () => ({
    theme: currentTheme,
    setTheme: setThemeMock,
  }),
}));

vi.mock("next-auth/react", () => ({
  signOut: (...args: unknown[]) => signOutMock(...args),
}));

vi.mock("@/hooks/use-session", () => ({
  useAppSession: () => mockSession,
}));

vi.mock("@/shared/lib/i18n/client", () => ({
  useT: () => (key: string) => {
    const dict: Record<string, string> = {
      "portal.brand.title": "แพลตฟอร์มคณะวิชาการ",
      "portal.brand.subtitle": "ศูนย์ข่าวสารและบริการการศึกษา",
      "portal.nav.home": "หน้าแรก",
      "portal.nav.news": "ข่าวประชาสัมพันธ์",
      "portal.nav.curriculum": "หลักสูตร",
      "portal.nav.staff": "บุคลากร",
      "portal.nav.reservations": "จองห้องและยานพาหนะ",
      "portal.nav.meditation": "วิปัสสนาธุระ",
      "portal.nav.alumni": "ศิษย์เก่า",
      "portal.nav.adminConsole": "ระบบหลังบ้าน",
      "account.profile": "โปรไฟล์",
      "account.logout": "ออกจากระบบ",
      "nav.settings": "ตั้งค่าองค์กร",
      "nav.themeToggle": "สลับโหมดสี",
      "nav.menu": "เมนู",
      "common.close": "ปิด",
    };
    return dict[key] || key;
  },
  useLocale: () => "th",
}));

describe("PortalNavbar", () => {
  beforeEach(() => {
    setThemeMock.mockClear();
    signOutMock.mockClear();
    currentTheme = "light";
    mockPathname = "/portal";
    mockSession = {
      status: "unauthenticated",
      user: null,
      roles: [],
      permissions: [],
      isSuperAdmin: false,
      isAuthenticated: false,
      isLoading: false,
      update: vi.fn(),
      tenantId: null,
      mustChangePassword: false,
    };
  });

  it("เรนเดอร์ Brand Block และโลโก้ที่ส่งเข้ามาอย่างถูกต้อง", () => {
    render(
      <PortalNavbar
        brandName="คณะพุทธศาสตร์และภาษาบาลี"
        brandTagline="MCU Pali Smart Portal"
        brandLogoUrl="/uploads/logo.png"
      />
    );

    expect(screen.getByText("คณะพุทธศาสตร์และภาษาบาลี")).toBeTruthy();
    expect(screen.getByText("MCU Pali Smart Portal")).toBeTruthy();
    const logoImg = screen.getByAltText("คณะพุทธศาสตร์และภาษาบาลี");
    expect(logoImg.getAttribute("src")).toBe("/uploads/logo.png");
  });

  it("เรนเดอร์เมนูครบทั้ง 7 รายการของ Portal", () => {
    render(<PortalNavbar />);

    const links = [
      "หน้าแรก",
      "ข่าวประชาสัมพันธ์",
      "หลักสูตร",
      "บุคลากร",
      "จองห้องและยานพาหนะ",
      "วิปัสสนาธุระ",
      "ศิษย์เก่า",
    ];

    for (const label of links) {
      expect(screen.getAllByText(label).length).toBeGreaterThanOrEqual(1);
    }
  });

  it("ใส่ aria-current='page' ให้กับหน้าที่เปิดอยู่ (Active State)", () => {
    mockPathname = "/portal/curriculum";
    render(<PortalNavbar />);

    const curriculumLink = screen
      .getAllByRole("link", { name: /หลักสูตร/ })
      .find((el) => el.getAttribute("aria-current") === "page");

    expect(curriculumLink).toBeTruthy();
    expect(curriculumLink?.getAttribute("href")).toBe("/portal/curriculum");
  });

  it("เมื่อยังไม่ได้ล็อกอิน แสดงปุ่มลิงก์เข้าสู่ระบบหลังบ้าน", () => {
    render(<PortalNavbar />);

    const loginLinks = screen.getAllByRole("link", { name: /ระบบหลังบ้าน/ });
    expect(loginLinks.length).toBeGreaterThanOrEqual(1);
    expect(loginLinks[0]?.getAttribute("href")).toBe("/login");
  });

  it("เมื่อผู้ใช้ล็อกอินแล้ว แสดง Avatar Menu พร้อมชื่อผู้ใช้", () => {
    mockSession = {
      status: "authenticated",
      user: { id: "user-1", name: "พระมหาทดสอบ", email: "tester@mcu.ac.th", image: null },
      roles: ["admin"],
      permissions: ["settings:manage"],
      isSuperAdmin: false,
      isAuthenticated: true,
      isLoading: false,
      update: vi.fn(),
      tenantId: "tenant-1",
      mustChangePassword: false,
    };

    render(<PortalNavbar />);

    expect(screen.getByText("พระมหาทดสอบ")).toBeTruthy();
    // ตัวย่อชื่อ พ
    expect(screen.getByText("พ")).toBeTruthy();
  });

  it("คลิกปุ่มสลับธีมแล้วเรียก setTheme", () => {
    render(<PortalNavbar />);

    const themeButton = screen.getByRole("button", { name: "สลับโหมดสี" });
    fireEvent.click(themeButton);

    expect(setThemeMock).toHaveBeenCalledWith("dark");
  });

  it("เปิดปิด Mobile Drawer เมื่อคลิกปุ่ม Hamburger", () => {
    render(<PortalNavbar />);

    const menuButton = screen.getByRole("button", { name: "เมนู" });
    fireEvent.click(menuButton);

    expect(screen.getByRole("button", { name: "ปิด" })).toBeTruthy();
  });
});
