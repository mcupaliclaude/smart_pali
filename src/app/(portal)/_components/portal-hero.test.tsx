import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PortalHero } from "./portal-hero";

vi.mock("@/shared/lib/i18n/client", () => ({
  useT: () => (key: string) => {
    const dict: Record<string, string> = {
      "home.hero.badge": "ศูนย์กลางวิชาการและวิปัสสนาธุระชั้นนำ",
      "home.hero.sloganA": "ancient wisdom,",
      "home.hero.sloganB": "digital vision.",
      "home.hero.title": "คณะพุทธศาสตร์และภาษาบาลี",
      "home.hero.subtitle": "สืบสานคัมภีร์บาลีโบราณ บูรณาการศาสตร์สมัยใหม่ พัฒนาจิตตภาวนาเพื่อสันติสุขของมนุษยชาติ",
      "home.hero.btnPrograms": "สำรวจหลักสูตรการศึกษา",
      "home.hero.btnMeditation": "สมัครอบรมวิปัสสนา",
      "home.news.viewAll": "ดูข่าวทั้งหมด",
      "home.hero.scrollCue": "สำรวจบริการดิจิทัล",
    };
    return dict[key] || key;
  },
}));

describe("PortalHero", () => {
  it("เรนเดอร์ Editorial Slogans และชื่อคณะอย่างถูกต้อง", () => {
    render(<PortalHero />);

    expect(screen.getByText("ancient wisdom,")).toBeTruthy();
    expect(screen.getByText("digital vision.")).toBeTruthy();
    expect(screen.getByText("คณะพุทธศาสตร์และภาษาบาลี")).toBeTruthy();
    expect(screen.getByText("ศูนย์กลางวิชาการและวิปัสสนาธุระชั้นนำ")).toBeTruthy();
  });

  it("เรนเดอร์ปุ่ม CTA ครบทั้งหลักสูตร วิปัสสนา และข่าวสาร", () => {
    render(<PortalHero />);

    const programBtn = screen.getByRole("link", { name: /สำรวจหลักสูตรการศึกษา/ });
    expect(programBtn.getAttribute("href")).toBe("/portal/curriculum");

    const meditationBtn = screen.getByRole("link", { name: /สมัครอบรมวิปัสสนา/ });
    expect(meditationBtn.getAttribute("href")).toBe("/portal/meditation");

    const newsBtn = screen.getByRole("link", { name: /ดูข่าวทั้งหมด/ });
    expect(newsBtn.getAttribute("href")).toBe("/portal/news");
  });

  it("เรนเดอร์ Scroll Cue และสามารถคลิกเลื่อนลงได้", () => {
    render(<PortalHero />);

    const scrollBtn = screen.getByRole("button", { name: "สำรวจบริการดิจิทัล" });
    expect(scrollBtn).toBeTruthy();

    const scrollBySpy = vi.spyOn(window, "scrollBy").mockImplementation(() => {});
    fireEvent.click(scrollBtn);
    expect(scrollBySpy).toHaveBeenCalled();
    scrollBySpy.mockRestore();
  });

  it("เรนเดอร์ภาพพื้นหลังสมาธิ และไม่มีเส้นกรอบบนคอนเทนเนอร์", () => {
    const { container } = render(<PortalHero />);

    const img = screen.getByAltText("Meditation in nature at sunrise");
    expect(img).toBeTruthy();
    expect(img.getAttribute("src")).toBe("/images/hero-meditation.jpg");

    const section = container.querySelector("section");
    expect(section).toBeTruthy();
    // ยืนยันว่าไม่มีคลาส border กรอบ
    expect(section?.className).not.toContain("border-[var(--glass-border)]");
    expect(section?.className).not.toContain("border ");
  });

  it("ตอบสนองต่อการขยับและนำเมาส์ชี้ (Mouse Hover & Move)", () => {
    const { container } = render(<PortalHero />);
    const section = container.querySelector("section");
    expect(section).toBeTruthy();

    if (section) {
      fireEvent.mouseEnter(section);
      fireEvent.mouseMove(section, { clientX: 150, clientY: 200 });
      fireEvent.mouseLeave(section);
    }
  });
});
