"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { toPng } from "html-to-image";
import JSZip from "jszip";

/* ── Mockup measurements ── */
const MK_W = 1022;
const MK_H = 2082;
const SC_L = (52 / MK_W) * 100;
const SC_T = (46 / MK_H) * 100;
const SC_W = (918 / MK_W) * 100;
const SC_H = (1990 / MK_H) * 100;
const SC_RX = (126 / 918) * 100;
const SC_RY = (126 / 1990) * 100;

/* ── Size Presets ── */
const IOS_SIZES = [
  { label: 'iPhone 6.9"', w: 1320, h: 2868 },
  { label: 'iPhone 6.5"', w: 1284, h: 2778 },
  { label: 'iPhone 6.3"', w: 1206, h: 2622 },
  { label: 'iPhone 6.1"', w: 1125, h: 2436 },
] as const;

const PLAY_SS = { w: 1080, h: 1920 };
const FG_W = 1024;
const FG_H = 500;
const ICON_PLAY = 512;
const ICON_IOS = 1024;

/* ── Section IDs ── */
const SECTIONS = [
  { id: "icon", label: "App Icon" },
  { id: "feature-graphic", label: "Feature Graphic" },
  { id: "ios-screenshots", label: "iOS Screenshots" },
  { id: "play-screenshots", label: "Play Screenshots" },
] as const;

/* ── Image Preloader ── */
const BASE_PATH = process.env.NODE_ENV === "production" ? "/zkap-app-store-screenshots" : "";

const IMAGE_PATHS = [
  "/mockup.png",
  "/app-icon.png",
  "/app-icon-play.png",
  "/screenshots/home.png",
  "/screenshots/exchange.png",
  "/screenshots/tax-confirm.png",
  "/screenshots/agent-select.png",
  "/screenshots-develop/home.png",
  "/screenshots-develop/exchange.png",
  "/screenshots-develop/tax-confirm.png",
  "/screenshots-develop/agent-select.png",
];

const VERSIONS = ["current", "develop"] as const;
type Version = typeof VERSIONS[number];

const imageCache: Record<string, string> = {};

async function preloadAllImages() {
  await Promise.all(
    IMAGE_PATHS.map(async (path) => {
      const resp = await fetch(`${BASE_PATH}${path}`);
      const blob = await resp.blob();
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
      imageCache[path] = dataUrl;
    })
  );
}

function img(path: string): string {
  return imageCache[path] || path;
}

/* ── Slides Definition ── */
function getSlides(version: Version) {
  const dir = version === "current" ? "/screenshots" : "/screenshots-develop";
  return [
  {
    id: "home",
    label: "자산관리",
    headline: "내 모든 거래소\n자산, 한눈에",
    screenshot: `${dir}/home.png`,
    bg: "linear-gradient(165deg, #2570cc 0%, #4DA0F7 40%, #7fc0ff 100%)",
    textColor: "#fff",
  },
  {
    id: "exchange",
    label: "거래소 연동",
    headline: "국내·해외 거래소\n한곳에서 연동",
    screenshot: `${dir}/exchange.png`,
    bg: "linear-gradient(165deg, #f8faff 0%, #e8f0fe 50%, #dbe7ff 100%)",
    textColor: "#1a1a2e",
  },
  {
    id: "tax-confirm",
    label: "자산 수집",
    headline: "해외 거래소 자산\n간편하게 수집",
    screenshot: `${dir}/tax-confirm.png`,
    bg: "linear-gradient(165deg, #1a2744 0%, #2a4b7a 50%, #3d6aab 100%)",
    textColor: "#fff",
  },
  {
    id: "agent-select",
    label: "세무대리인",
    headline: "세무대리인 선택부터\n신고까지 간편하게",
    screenshot: `${dir}/agent-select.png`,
    bg: "linear-gradient(165deg, #f0f4ff 0%, #e4ecff 50%, #d8e4ff 100%)",
    textColor: "#1a1a2e",
  },
  ];
}

const SLIDES = getSlides("current");

const DECO: { top: string; left?: string; right?: string; size: number; bg: string }[] = [
  { top: "15%", right: "-20%", size: 0.8, bg: "rgba(107,155,255,0.3)" },
  { top: "auto", left: "-15%", size: 0.6, bg: "rgba(59,107,245,0.08)" },
  { top: "40%", left: "-10%", size: 0.7, bg: "rgba(59,107,245,0.2)" },
  { top: "20%", right: "-15%", size: 0.6, bg: "rgba(59,107,245,0.1)" },
];

/* ── Phone Component ── */
function Phone({ src, alt, style, className = "" }: { src: string; alt: string; style?: React.CSSProperties; className?: string }) {
  return (
    <div className={`relative ${className}`} style={{ aspectRatio: `${MK_W}/${MK_H}`, ...style }}>
      <img src={img("/mockup.png")} alt="" className="block w-full h-full" draggable={false} />
      <div
        className="absolute z-10 overflow-hidden"
        style={{ left: `${SC_L}%`, top: `${SC_T}%`, width: `${SC_W}%`, height: `${SC_H}%`, borderRadius: `${SC_RX}% / ${SC_RY}%` }}
      >
        <img src={img(src)} alt={alt} className="block w-full h-full object-cover object-top" draggable={false} />
      </div>
    </div>
  );
}

/* ── Caption Component ── */
function Caption({ label, headline, color, canvasW }: { label: string; headline: string; color: string; canvasW: number }) {
  return (
    <div style={{ padding: `0 ${canvasW * 0.06}px` }}>
      <div style={{ fontSize: canvasW * 0.032, fontWeight: 600, color, opacity: 0.7, marginBottom: canvasW * 0.015, letterSpacing: "0.02em" }}>{label}</div>
      <div style={{ fontSize: canvasW * 0.085, fontWeight: 700, color, lineHeight: 1.15, letterSpacing: "-0.01em", whiteSpace: "pre-line" }}>{headline}</div>
    </div>
  );
}

/* ── Generic Slide ── */
function Slide({ index, canvasW, canvasH, slides }: { index: number; canvasW: number; canvasH: number; slides: ReturnType<typeof getSlides> }) {
  const s = slides[index];
  const d = DECO[index];
  // Adjust phone size & position based on aspect ratio (Play 1.78:1 vs iOS ~2.17:1)
  const ratio = canvasH / canvasW;
  const isCompact = ratio < 2; // Play Store (16:9)
  const phoneWidth = isCompact ? "75%" : "88%";
  const phoneTranslateY = isCompact ? "18%" : "10%";
  const textFontScale = isCompact ? 0.085 : 0.095;
  const labelFontScale = isCompact ? 0.032 : 0.036;
  return (
    <div style={{ width: canvasW, height: canvasH, background: s.bg, position: "relative", overflow: "hidden", fontFamily: "Pretendard, -apple-system, sans-serif" }}>
      <div
        style={{
          position: "absolute",
          top: d.top === "auto" ? undefined : d.top,
          bottom: d.top === "auto" ? "10%" : undefined,
          left: d.left,
          right: d.right,
          width: canvasW * d.size,
          height: canvasW * d.size,
          borderRadius: "50%",
          background: index === 3 ? undefined : `radial-gradient(circle, ${d.bg} 0%, transparent 70%)`,
          border: index === 3 ? `2px solid ${d.bg}` : undefined,
        }}
      />
      <div style={{ paddingTop: canvasH * 0.07 }}>
        <div style={{ padding: `0 ${canvasW * 0.06}px` }}>
          <div style={{ fontSize: canvasW * labelFontScale, fontWeight: 600, color: s.textColor, opacity: 0.7, marginBottom: canvasW * 0.015, letterSpacing: "0.02em" }}>{s.label}</div>
          <div style={{ fontSize: canvasW * textFontScale, fontWeight: 700, color: s.textColor, lineHeight: 1.15, letterSpacing: "-0.01em", whiteSpace: "pre-line" }}>{s.headline}</div>
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 0, left: "50%", transform: `translateX(-50%) translateY(${phoneTranslateY})`, width: phoneWidth }}>
        <Phone src={s.screenshot} alt={s.id} />
      </div>
    </div>
  );
}

/* ── Feature Graphic (1024x500) ── */
function FeatureGraphic({ canvasW, canvasH }: { canvasW: number; canvasH: number }) {
  const phoneH = canvasH * 1.0;
  const phoneW = phoneH * (MK_W / MK_H);
  return (
    <div style={{ width: canvasW, height: canvasH, background: "linear-gradient(135deg, #1a3a6e 0%, #2d6bcf 50%, #4da0f7 100%)", position: "relative", overflow: "hidden", fontFamily: "Pretendard, -apple-system, sans-serif", display: "flex", alignItems: "center" }}>
      <div style={{ position: "absolute", top: "-30%", right: "5%", width: canvasH * 0.9, height: canvasH * 0.9, borderRadius: "50%", background: "radial-gradient(circle, rgba(107,175,255,0.25) 0%, transparent 70%)" }} />
      <div style={{ position: "absolute", bottom: "-40%", left: "10%", width: canvasH * 0.7, height: canvasH * 0.7, borderRadius: "50%", background: "radial-gradient(circle, rgba(59,107,245,0.2) 0%, transparent 70%)" }} />
      <div style={{ flex: 1, paddingLeft: canvasW * 0.06, paddingRight: canvasW * 0.02, zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: canvasW * 0.015, marginBottom: canvasH * 0.06 }}>
          <img src={img("/app-icon-play.png")} alt="ZKAP" style={{ width: canvasH * 0.14, height: canvasH * 0.14, borderRadius: canvasH * 0.03 }} />
          <span style={{ fontSize: canvasH * 0.09, fontWeight: 700, color: "#fff", letterSpacing: "0.02em" }}>ZKAP</span>
        </div>
        <div style={{ fontSize: canvasH * 0.115, fontWeight: 700, color: "#fff", lineHeight: 1.25, letterSpacing: "-0.01em", whiteSpace: "pre-line" }}>
          {"내 모든 거래소 자산,\n한눈에 관리하고\n간편하게 신고까지"}
        </div>
        <div style={{ marginTop: canvasH * 0.05, fontSize: canvasH * 0.055, fontWeight: 500, color: "rgba(255,255,255,0.7)" }}>
          해외 가상자산 신고 · 자산 통합 관리
        </div>
      </div>
      <div style={{ position: "absolute", right: canvasW * 0.03, top: canvasH * 0.15, display: "flex", gap: canvasW * -0.02, zIndex: 1 }}>
        <div style={{ width: phoneW * 0.85, height: phoneH * 0.85, transform: "translateY(8%) rotate(-3deg)", opacity: 0.92, filter: "brightness(0.95)" }}>
          <Phone src="/screenshots/tax-confirm.png" alt="Tax confirm" />
        </div>
        <div style={{ width: phoneW * 0.95, height: phoneH * 0.95, marginLeft: canvasW * -0.06, transform: "rotate(3deg)" }}>
          <Phone src="/screenshots/home.png" alt="Home" />
        </div>
      </div>
    </div>
  );
}

/* ── App Icon Canvas ── */
function AppIconCanvas({ size, iconPath = "/app-icon.png" }: { size: number; iconPath?: string }) {
  return (
    <div style={{ width: size, height: size, position: "relative" }}>
      <img src={img(iconPath)} alt="ZKAP Icon" style={{ width: size, height: size, display: "block" }} draggable={false} />
    </div>
  );
}

/* ── Generic export helper ── */
function waitForPaint(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
}

async function captureElement(el: HTMLDivElement, w: number, h: number): Promise<string> {
  el.style.position = "fixed";
  el.style.left = "0px";
  el.style.top = "0px";
  el.style.opacity = "1";
  el.style.zIndex = "-9999";
  el.style.width = `${w}px`;
  el.style.height = `${h}px`;
  el.style.pointerEvents = "none";

  await waitForPaint();
  await new Promise((r) => setTimeout(r, 100));

  const opts = { width: w, height: h, pixelRatio: 1, cacheBust: true };
  await toPng(el, opts);
  await waitForPaint();
  const dataUrl = await toPng(el, opts);

  el.style.position = "absolute";
  el.style.left = "-9999px";
  el.style.top = "";
  el.style.opacity = "0";
  el.style.zIndex = "";
  el.style.pointerEvents = "";

  return dataUrl;
}

async function exportElement(el: HTMLDivElement, w: number, h: number, filename: string) {
  const dataUrl = await captureElement(el, w, h);
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)?.[1] || "image/png";
  const bytes = atob(base64);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

/* ── Scaled Preview wrapper ── */
function ScaledPreview({ children, canvasW, canvasH, onClick, label }: { children: React.ReactNode; canvasW: number; canvasH: number; onClick: () => void; label: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.2);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const obs = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / canvasW));
    obs.observe(container);
    return () => obs.disconnect();
  }, [canvasW]);

  return (
    <div className="flex flex-col gap-2">
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-xl border border-gray-200 cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all"
        style={{ aspectRatio: `${canvasW}/${canvasH}` }}
        onClick={onClick}
      >
        <div style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: canvasW, height: canvasH }}>
          {children}
        </div>
      </div>
      <p className="text-xs text-gray-500 text-center">{label}</p>
    </div>
  );
}

/* ── Main Page ── */
export default function ScreenshotsPage() {
  const [ready, setReady] = useState(false);
  const [iosSizeIdx, setIosSizeIdx] = useState(0);
  const [version, setVersion] = useState<Version>("develop");
  const [exporting, setExporting] = useState(false);

  const slides = getSlides(version);

  // Export refs
  const iosRefs = useRef<(HTMLDivElement | null)[]>([]);
  const playRefs = useRef<(HTMLDivElement | null)[]>([]);
  const fgRef = useRef<HTMLDivElement | null>(null);

  const iosSize = IOS_SIZES[iosSizeIdx];

  useEffect(() => {
    preloadAllImages().then(() => setReady(true));
  }, []);

  /* ── Individual export handlers ── */
  const handleExportIos = useCallback(async (index: number) => {
    const el = iosRefs.current[index];
    if (!el) return;
    await exportElement(el, iosSize.w, iosSize.h, `ios-${String(index + 1).padStart(2, "0")}-${slides[index].id}-${iosSize.w}x${iosSize.h}.png`);
  }, [iosSize]);

  const handleExportPlay = useCallback(async (index: number) => {
    const el = playRefs.current[index];
    if (!el) return;
    await exportElement(el, PLAY_SS.w, PLAY_SS.h, `play-${String(index + 1).padStart(2, "0")}-${slides[index].id}-${PLAY_SS.w}x${PLAY_SS.h}.png`);
  }, []);

  const handleExportFG = useCallback(async () => {
    if (!fgRef.current) return;
    await exportElement(fgRef.current, FG_W, FG_H, `feature-graphic-${FG_W}x${FG_H}.png`);
  }, []);

  const handleExportIconPlay = useCallback(() => {
    const link = document.createElement("a");
    link.download = `app-icon-play-${ICON_PLAY}x${ICON_PLAY}.png`;
    link.href = img("/app-icon-play.png");
    link.click();
  }, []);

  const handleExportIconIos = useCallback(() => {
    const link = document.createElement("a");
    link.download = `app-icon-ios-${ICON_IOS}x${ICON_IOS}.png`;
    link.href = img("/app-icon.png");
    link.click();
  }, []);

  /* ── Export All ── */
  const handleExportAll = useCallback(async () => {
    setExporting(true);
    const zip = new JSZip();
    const delay = () => new Promise((r) => setTimeout(r, 300));

    // Icons
    const playIconData = imageCache["/app-icon-play.png"];
    const iosIconData = imageCache["/app-icon.png"];
    if (playIconData) zip.file(`icons/app-icon-play-${ICON_PLAY}x${ICON_PLAY}.png`, dataUrlToBlob(playIconData));
    if (iosIconData) zip.file(`icons/app-icon-ios-${ICON_IOS}x${ICON_IOS}.png`, dataUrlToBlob(iosIconData));

    // Feature Graphic
    if (fgRef.current) {
      const fgData = await captureElement(fgRef.current, FG_W, FG_H);
      zip.file(`feature-graphic/feature-graphic-${FG_W}x${FG_H}.png`, dataUrlToBlob(fgData));
      await delay();
    }

    // iOS Screenshots
    for (let i = 0; i < slides.length; i++) {
      const el = iosRefs.current[i];
      if (!el) continue;
      const data = await captureElement(el, iosSize.w, iosSize.h);
      zip.file(`ios/${String(i + 1).padStart(2, "0")}-${slides[i].id}-${iosSize.w}x${iosSize.h}.png`, dataUrlToBlob(data));
      await delay();
    }

    // Play Screenshots
    for (let i = 0; i < slides.length; i++) {
      const el = playRefs.current[i];
      if (!el) continue;
      const data = await captureElement(el, PLAY_SS.w, PLAY_SS.h);
      zip.file(`play/${String(i + 1).padStart(2, "0")}-${slides[i].id}-${PLAY_SS.w}x${PLAY_SS.h}.png`, dataUrlToBlob(data));
      await delay();
    }

    const blob = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.download = "zkap-store-assets.zip";
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);

    setExporting(false);
  }, [slides, iosSize]);

  if (!ready) {
    return <div className="flex items-center justify-center h-screen"><p className="text-gray-500 text-lg">Loading images...</p></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Sticky Header ── */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={img("/app-icon.png")} alt="ZKAP" className="w-8 h-8 rounded-lg" />
            <h1 className="text-lg font-bold text-black">ZKAP Store Assets</h1>
          </div>
          <div className="flex items-center gap-2">
            {/* TODO: UX 개선 ver 준비되면 주석 해제
            <div className="flex rounded-lg border overflow-hidden mr-2">
              {VERSIONS.map((v) => (
                <button
                  key={v}
                  onClick={() => setVersion(v)}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                    version === v ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {v === "current" ? "UX 개선 ver" : "기존 ver"}
                </button>
              ))}
            </div>
            */}
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                {s.label}
              </a>
            ))}
            <button
              onClick={handleExportAll}
              disabled={exporting}
              className="ml-2 px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {exporting ? "Exporting..." : "Export All"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8 space-y-16">

        {/* ══════════ 1. App Icon ══════════ */}
        <section id="icon">
          <div className="flex items-baseline gap-3 mb-1">
            <h2 className="text-lg font-bold text-black">App Icon</h2>
          </div>
          <p className="text-xs text-gray-500 mb-6">Google Play: 512x512 PNG (32-bit, with alpha) · App Store: 1024x1024 PNG (no alpha)</p>
          <div className="flex gap-8 items-end">
            {/* Play Store Icon */}
            <div className="flex flex-col items-center gap-3">
              <div className="w-[120px] h-[120px] rounded-2xl overflow-hidden border border-gray-200 cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all" onClick={handleExportIconPlay}>
                <img src={img("/app-icon-play.png")} alt="Play Store Icon" className="w-full h-full object-cover" />
              </div>
              <p className="text-xs text-gray-500">Google Play — {ICON_PLAY}x{ICON_PLAY}</p>
            </div>
            {/* iOS Icon */}
            <div className="flex flex-col items-center gap-3">
              <div className="w-[120px] h-[120px] rounded-2xl overflow-hidden border border-gray-200 cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all" onClick={handleExportIconIos}>
                <img src={img("/app-icon.png")} alt="App Store Icon" className="w-full h-full object-cover" />
              </div>
              <p className="text-xs text-gray-500">App Store — {ICON_IOS}x{ICON_IOS}</p>
            </div>
          </div>
        </section>

        {/* ══════════ 2. Feature Graphic ══════════ */}
        <section id="feature-graphic">
          <h2 className="text-lg font-bold text-black mb-1">Feature Graphic</h2>
          <p className="text-xs text-gray-500 mb-6">Google Play — {FG_W}x{FG_H} · JPG or 24-bit PNG (no alpha) · Max 1MB</p>
          <div className="max-w-2xl">
            <ScaledPreview canvasW={FG_W} canvasH={FG_H} onClick={handleExportFG} label={`${FG_W}x${FG_H} — click to export`}>
              <FeatureGraphic canvasW={FG_W} canvasH={FG_H} />
            </ScaledPreview>
            <div ref={(el) => { fgRef.current = el; }} style={{ position: "absolute", left: -9999, opacity: 0, width: FG_W, height: FG_H }}>
              <FeatureGraphic canvasW={FG_W} canvasH={FG_H} />
            </div>
          </div>
        </section>

        {/* ══════════ 3. iOS Screenshots ══════════ */}
        <section id="ios-screenshots">
          <div className="flex items-center gap-4 mb-1">
            <h2 className="text-lg font-bold text-black">iOS Screenshots</h2>
            <select
              value={iosSizeIdx}
              onChange={(e) => setIosSizeIdx(Number(e.target.value))}
              className="px-3 py-1.5 rounded-lg border text-xs font-medium text-gray-700"
            >
              {IOS_SIZES.map((s, i) => (
                <option key={i} value={i}>{s.label} ({s.w}x{s.h})</option>
              ))}
            </select>
          </div>
          <p className="text-xs text-gray-500 mb-2">App Store Connect — 6.9" 기준 업로드 시 자동 다운스케일</p>
          <p className="text-xs text-blue-600 font-medium mb-6">Export 사이즈: {iosSize.w}x{iosSize.h}px ({IOS_SIZES[iosSizeIdx].label}) — 프리뷰 비율은 거의 동일하나 export 픽셀이 다릅니다</p>
          <div className="grid grid-cols-4 gap-6">
            {SLIDES.map((s, i) => (
              <div key={`ios-${i}-${iosSizeIdx}`}>
                <ScaledPreview canvasW={iosSize.w} canvasH={iosSize.h} onClick={() => handleExportIos(i)} label={`${s.id} — ${iosSize.w}x${iosSize.h}`}>
                  <Slide index={i} canvasW={iosSize.w} canvasH={iosSize.h} slides={slides} />
                </ScaledPreview>
                <div
                  ref={(el) => { iosRefs.current[i] = el; }}
                  style={{ position: "absolute", left: -9999, opacity: 0, width: iosSize.w, height: iosSize.h }}
                >
                  <Slide index={i} canvasW={iosSize.w} canvasH={iosSize.h} slides={slides} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════ 4. Google Play Screenshots ══════════ */}
        <section id="play-screenshots">
          <h2 className="text-lg font-bold text-black mb-1">Google Play Screenshots</h2>
          <p className="text-xs text-gray-500 mb-6">{PLAY_SS.w}x{PLAY_SS.h} · JPEG or 24-bit PNG (no alpha) · 2~8장 · Max 8MB each</p>
          <div className="grid grid-cols-4 gap-6">
            {SLIDES.map((s, i) => (
              <div key={`play-${i}`}>
                <ScaledPreview canvasW={PLAY_SS.w} canvasH={PLAY_SS.h} onClick={() => handleExportPlay(i)} label={`${s.id} — ${PLAY_SS.w}x${PLAY_SS.h}`}>
                  <Slide index={i} canvasW={PLAY_SS.w} canvasH={PLAY_SS.h} slides={slides} />
                </ScaledPreview>
                <div
                  ref={(el) => { playRefs.current[i] = el; }}
                  style={{ position: "absolute", left: -9999, opacity: 0, width: PLAY_SS.w, height: PLAY_SS.h }}
                >
                  <Slide index={i} canvasW={PLAY_SS.w} canvasH={PLAY_SS.h} slides={slides} />
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
