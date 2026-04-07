"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { toPng } from "html-to-image";

/* ── Constants ── */
const W = 1320;
const H = 2868;

const SIZES = [
  { label: '6.9"', w: 1320, h: 2868 },
  { label: '6.5"', w: 1284, h: 2778 },
  { label: '6.3"', w: 1206, h: 2622 },
  { label: '6.1"', w: 1125, h: 2436 },
] as const;

/* Mockup measurements */
const MK_W = 1022;
const MK_H = 2082;
const SC_L = (52 / MK_W) * 100;
const SC_T = (46 / MK_H) * 100;
const SC_W = (918 / MK_W) * 100;
const SC_H = (1990 / MK_H) * 100;
const SC_RX = (126 / 918) * 100;
const SC_RY = (126 / 1990) * 100;

/* ── Image Preloader ── */
const IMAGE_PATHS = [
  "/mockup.png",
  "/app-icon.png",
  "/screenshots/home.png",
  "/screenshots/exchange.png",
  "/screenshots/tax-confirm.png",
  "/screenshots/agent-select.png",
];

const imageCache: Record<string, string> = {};

async function preloadAllImages() {
  await Promise.all(
    IMAGE_PATHS.map(async (path) => {
      const resp = await fetch(path);
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
const SLIDES = [
  {
    id: "home",
    label: "자산관리",
    headline: "내 모든 거래소\n자산, 한눈에",
    screenshot: "/screenshots/home.png",
    bg: "linear-gradient(165deg, #2570cc 0%, #4DA0F7 40%, #7fc0ff 100%)",
    textColor: "#fff",
  },
  {
    id: "exchange",
    label: "거래소 연동",
    headline: "국내·해외 거래소\n한 번에 연동",
    screenshot: "/screenshots/exchange.png",
    bg: "linear-gradient(165deg, #f8faff 0%, #e8f0fe 50%, #dbe7ff 100%)",
    textColor: "#1a1a2e",
  },
  {
    id: "tax-confirm",
    label: "해외자산 신고",
    headline: "해외 가상자산 신고\n자동으로 확인",
    screenshot: "/screenshots/tax-confirm.png",
    bg: "linear-gradient(165deg, #1a2744 0%, #2a4b7a 50%, #3d6aab 100%)",
    textColor: "#fff",
  },
  {
    id: "agent-select",
    label: "세무대리인",
    headline: "세무대리인 선택까지\n앱에서 바로",
    screenshot: "/screenshots/agent-select.png",
    bg: "linear-gradient(165deg, #f0f4ff 0%, #e4ecff 50%, #d8e4ff 100%)",
    textColor: "#1a1a2e",
  },
] as const;

/* ── Phone Component ── */
function Phone({
  src,
  alt,
  style,
  className = "",
}: {
  src: string;
  alt: string;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <div
      className={`relative ${className}`}
      style={{ aspectRatio: `${MK_W}/${MK_H}`, ...style }}
    >
      <img
        src={img("/mockup.png")}
        alt=""
        className="block w-full h-full"
        draggable={false}
      />
      <div
        className="absolute z-10 overflow-hidden"
        style={{
          left: `${SC_L}%`,
          top: `${SC_T}%`,
          width: `${SC_W}%`,
          height: `${SC_H}%`,
          borderRadius: `${SC_RX}% / ${SC_RY}%`,
        }}
      >
        <img
          src={img(src)}
          alt={alt}
          className="block w-full h-full object-cover object-top"
          draggable={false}
        />
      </div>
    </div>
  );
}

/* ── Caption Component ── */
function Caption({
  label,
  headline,
  color,
  canvasW,
}: {
  label: string;
  headline: string;
  color: string;
  canvasW: number;
}) {
  return (
    <div style={{ padding: `0 ${canvasW * 0.06}px` }}>
      <div
        style={{
          fontSize: canvasW * 0.032,
          fontWeight: 600,
          color,
          opacity: 0.7,
          marginBottom: canvasW * 0.015,
          letterSpacing: "0.02em",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: canvasW * 0.085,
          fontWeight: 700,
          color,
          lineHeight: 1.15,
          letterSpacing: "-0.01em",
          whiteSpace: "pre-line",
        }}
      >
        {headline}
      </div>
    </div>
  );
}

/* ── Slide Components ── */

function Slide1({ canvasW, canvasH }: { canvasW: number; canvasH: number }) {
  const s = SLIDES[0];
  return (
    <div
      style={{
        width: canvasW,
        height: canvasH,
        background: s.bg,
        position: "relative",
        overflow: "hidden",
        fontFamily: "Pretendard, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "15%",
          right: "-20%",
          width: canvasW * 0.8,
          height: canvasW * 0.8,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(107,155,255,0.3) 0%, transparent 70%)",
        }}
      />
      <div style={{ paddingTop: canvasH * 0.07 }}>
        <Caption
          label={s.label}
          headline={s.headline}
          color={s.textColor}
          canvasW={canvasW}
        />
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%) translateY(12%)",
          width: "84%",
        }}
      >
        <Phone src={s.screenshot} alt="Home" />
      </div>
    </div>
  );
}

function Slide2({ canvasW, canvasH }: { canvasW: number; canvasH: number }) {
  const s = SLIDES[1];
  return (
    <div
      style={{
        width: canvasW,
        height: canvasH,
        background: s.bg,
        position: "relative",
        overflow: "hidden",
        fontFamily: "Pretendard, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          left: "-15%",
          width: canvasW * 0.6,
          height: canvasW * 0.6,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(59,107,245,0.08) 0%, transparent 70%)",
        }}
      />
      <div style={{ paddingTop: canvasH * 0.07 }}>
        <Caption
          label={s.label}
          headline={s.headline}
          color={s.textColor}
          canvasW={canvasW}
        />
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%) translateY(12%)",
          width: "84%",
        }}
      >
        <Phone src={s.screenshot} alt="Exchange" />
      </div>
    </div>
  );
}

function Slide3({ canvasW, canvasH }: { canvasW: number; canvasH: number }) {
  const s = SLIDES[2];
  return (
    <div
      style={{
        width: canvasW,
        height: canvasH,
        background: s.bg,
        position: "relative",
        overflow: "hidden",
        fontFamily: "Pretendard, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "40%",
          left: "-10%",
          width: canvasW * 0.7,
          height: canvasW * 0.7,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(59,107,245,0.2) 0%, transparent 70%)",
        }}
      />
      <div style={{ paddingTop: canvasH * 0.07 }}>
        <Caption
          label={s.label}
          headline={s.headline}
          color={s.textColor}
          canvasW={canvasW}
        />
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%) translateY(12%)",
          width: "84%",
        }}
      >
        <Phone src={s.screenshot} alt="Tax Confirm" />
      </div>
    </div>
  );
}

function Slide4({ canvasW, canvasH }: { canvasW: number; canvasH: number }) {
  const s = SLIDES[3];
  return (
    <div
      style={{
        width: canvasW,
        height: canvasH,
        background: s.bg,
        position: "relative",
        overflow: "hidden",
        fontFamily: "Pretendard, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "20%",
          right: "-15%",
          width: canvasW * 0.6,
          height: canvasW * 0.6,
          borderRadius: "50%",
          border: "2px solid rgba(59,107,245,0.1)",
        }}
      />
      <div style={{ paddingTop: canvasH * 0.07 }}>
        <Caption
          label={s.label}
          headline={s.headline}
          color={s.textColor}
          canvasW={canvasW}
        />
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%) translateY(12%)",
          width: "84%",
        }}
      >
        <Phone src={s.screenshot} alt="Agent Select" />
      </div>
    </div>
  );
}

const SLIDE_COMPONENTS = [Slide1, Slide2, Slide3, Slide4];

/* ── Preview with ResizeObserver ── */
function ScreenshotPreview({
  index,
  onExport,
  exportRef,
  canvasW,
  canvasH,
}: {
  index: number;
  onExport: (index: number) => void;
  exportRef: (el: HTMLDivElement | null) => void;
  canvasW: number;
  canvasH: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.2);
  const SlideComponent = SLIDE_COMPONENTS[index];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const obs = new ResizeObserver(([entry]) => {
      const cw = entry.contentRect.width;
      setScale(cw / canvasW);
    });
    obs.observe(container);
    return () => obs.disconnect();
  }, [canvasW]);

  return (
    <div className="flex flex-col gap-2">
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-xl border border-gray-200 cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all"
        style={{ aspectRatio: `${canvasW}/${canvasH}` }}
        onClick={() => onExport(index)}
      >
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            width: canvasW,
            height: canvasH,
          }}
        >
          <SlideComponent canvasW={canvasW} canvasH={canvasH} />
        </div>
      </div>
      <div
        ref={exportRef}
        style={{
          position: "absolute",
          left: -9999,
          opacity: 0,
          width: canvasW,
          height: canvasH,
        }}
      >
        <SlideComponent canvasW={canvasW} canvasH={canvasH} />
      </div>
      <p className="text-xs text-gray-500 text-center">
        {SLIDES[index].id} — click to export
      </p>
    </div>
  );
}

/* ── Main Page ── */
export default function ScreenshotsPage() {
  const [ready, setReady] = useState(false);
  const [sizeIdx, setSizeIdx] = useState(0);
  const [exporting, setExporting] = useState<number | null>(null);
  const exportRefs = useRef<(HTMLDivElement | null)[]>([]);

  const size = SIZES[sizeIdx];

  useEffect(() => {
    preloadAllImages().then(() => setReady(true));
  }, []);

  const handleExport = useCallback(
    async (index: number) => {
      const el = exportRefs.current[index];
      if (!el) return;
      setExporting(index);

      el.style.left = "0px";
      el.style.opacity = "1";
      el.style.zIndex = "-1";
      el.style.width = `${size.w}px`;
      el.style.height = `${size.h}px`;

      const opts = {
        width: size.w,
        height: size.h,
        pixelRatio: 1,
        cacheBust: true,
      };

      await toPng(el, opts);
      const dataUrl = await toPng(el, opts);

      el.style.left = "-9999px";
      el.style.opacity = "0";
      el.style.zIndex = "";
      el.style.width = `${W}px`;
      el.style.height = `${H}px`;

      const link = document.createElement("a");
      link.download = `${String(index + 1).padStart(2, "0")}-${SLIDES[index].id}-${size.w}x${size.h}.png`;
      link.href = dataUrl;
      link.click();

      setExporting(null);
    },
    [size]
  );

  const handleExportAll = useCallback(async () => {
    for (let i = 0; i < SLIDES.length; i++) {
      await handleExport(i);
      await new Promise((r) => setTimeout(r, 300));
    }
  }, [handleExport]);

  if (!ready) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500 text-lg">Loading images...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex items-center justify-between mb-8 max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <img
            src={img("/app-icon.png")}
            alt="ZKAP"
            className="w-10 h-10 rounded-lg"
          />
          <h1 className="text-xl font-bold text-black">ZKAP App Store Screenshots</h1>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={sizeIdx}
            onChange={(e) => setSizeIdx(Number(e.target.value))}
            className="px-3 py-2 rounded-lg border text-sm"
          >
            {SIZES.map((s, i) => (
              <option key={i} value={i}>
                {s.label} ({s.w}x{s.h})
              </option>
            ))}
          </select>
          <button
            onClick={handleExportAll}
            disabled={exporting !== null}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {exporting !== null
              ? `Exporting ${exporting + 1}/4...`
              : "Export All"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6 max-w-6xl mx-auto">
        {SLIDES.map((_, i) => (
          <ScreenshotPreview
            key={i}
            index={i}
            onExport={handleExport}
            exportRef={(el) => {
              exportRefs.current[i] = el;
            }}
            canvasW={W}
            canvasH={H}
          />
        ))}
      </div>
    </div>
  );
}
