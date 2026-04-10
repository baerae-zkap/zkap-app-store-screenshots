"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { toPng } from "html-to-image";
import JSZip from "jszip";

/* ── Constants ── */
const MK_W = 1022;
const MK_H = 2082;
const SC_L = (52 / MK_W) * 100;
const SC_T = (46 / MK_H) * 100;
const SC_W = (918 / MK_W) * 100;
const SC_H = (1990 / MK_H) * 100;
const SC_RX = (126 / 918) * 100;
const SC_RY = (126 / 1990) * 100;

const IOS_SIZES = [
  { label: 'iPhone 6.9"', w: 1320, h: 2868 },
  { label: 'iPhone 6.5"', w: 1284, h: 2778 },
  { label: 'iPhone 6.3"', w: 1206, h: 2622 },
  { label: 'iPhone 6.1"', w: 1125, h: 2436 },
] as const;

const IPAD_SIZE = { w: 2064, h: 2752 };
const PLAY_SS = { w: 1080, h: 1920 };
const FG = { w: 1024, h: 500 };
const ICON_PLAY = 512;
const ICON_IOS = 1024;

type Lang = "ko" | "en";
type Store = "appstore" | "playstore";

const BASE_PATH = process.env.NODE_ENV === "production" ? "/zkap-app-store-screenshots" : "";

/* ── Image Preloader ── */
const IMAGE_PATHS = [
  "/mockup.png", "/app-icon.png", "/app-icon-play.png",
  "/screenshots-develop/home.png", "/screenshots-develop/exchange.png", "/screenshots-develop/tax-confirm.png", "/screenshots-develop/agent-select.png",
  "/screenshots-en/home.png", "/screenshots-en/exchange.png", "/screenshots-en/tax-confirm.png", "/screenshots-en/agent-select.png",
  "/screenshots-ipad-ko/home.png", "/screenshots-ipad-ko/exchange.png", "/screenshots-ipad-ko/tax-confirm.png", "/screenshots-ipad-ko/complete.png",
  "/screenshots-ipad-en/home.png", "/screenshots-ipad-en/exchange.png", "/screenshots-ipad-en/tax-confirm.png", "/screenshots-ipad-en/complete.png",
];

const imageCache: Record<string, string> = {};

async function preloadAllImages() {
  await Promise.all(
    IMAGE_PATHS.map(async (path) => {
      try {
        const resp = await fetch(`${BASE_PATH}${path}`);
        const blob = await resp.blob();
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
        imageCache[path] = dataUrl;
      } catch { /* skip missing */ }
    })
  );
}

function img(path: string): string {
  return imageCache[path] || `${BASE_PATH}${path}`;
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)?.[1] || "image/png";
  const bytes = atob(base64);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

/* ── Helpers ── */
function getIosDir(lang: Lang) { return lang === "en" ? "/screenshots-en" : "/screenshots-develop"; }
function getIpadDir(lang: Lang) { return lang === "en" ? "/screenshots-ipad-en" : "/screenshots-ipad-ko"; }

const IOS_SCREENS = ["home", "exchange", "tax-confirm", "agent-select"] as const;
const IPAD_SCREENS = ["home", "exchange", "tax-confirm", "complete"] as const;

const LABELS: Record<string, Record<Lang, string>> = {
  home: { ko: "홈", en: "Home" },
  exchange: { ko: "거래소 연동", en: "Exchanges" },
  "tax-confirm": { ko: "해외자산 확인", en: "Tax Report" },
  "agent-select": { ko: "접수 완료", en: "Submission Complete" },
  complete: { ko: "접수 완료", en: "Submission Complete" },
};

/* ── Download helpers ── */
async function downloadZip(files: { name: string; src: string }[], zipName: string) {
  const zip = new JSZip();
  for (const f of files) {
    try {
      const resp = await fetch(f.src);
      const blob = await resp.blob();
      zip.file(f.name, blob);
    } catch { /* skip */ }
  }
  const blob = await zip.generateAsync({ type: "blob" });
  const link = document.createElement("a");
  link.download = zipName;
  link.href = URL.createObjectURL(blob);
  link.click();
  URL.revokeObjectURL(link.href);
}

/* ── Asset Card ── */
function AssetCard({ src, label, filename, size }: { src: string; label: string; filename: string; size: string }) {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.download = filename;
    link.href = src;
    link.click();
  };

  return (
    <div className="group">
      <div className="bg-[#1a1a2e] rounded-2xl overflow-hidden border border-white/5 hover:border-white/15 transition-all cursor-pointer" onClick={handleDownload}>
        <div className="p-4 flex items-center justify-center" style={{ aspectRatio: "9/16", maxHeight: 320 }}>
          <img src={src} alt={label} className="max-w-full max-h-full object-contain rounded-lg" draggable={false} />
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div>
          <p className="text-sm text-white/90 font-medium">{label}</p>
          <p className="text-xs text-white/40">{size}</p>
        </div>
        <button onClick={handleDownload} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">Download</button>
      </div>
    </div>
  );
}

function IconCard({ src, label, filename, size }: { src: string; label: string; filename: string; size: string }) {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.download = filename;
    link.href = src;
    link.click();
  };

  return (
    <div className="group">
      <div className="bg-[#1a1a2e] rounded-2xl overflow-hidden border border-white/5 hover:border-white/15 transition-all cursor-pointer p-8 flex items-center justify-center" onClick={handleDownload}>
        <img src={src} alt={label} className="w-32 h-32 rounded-3xl" draggable={false} />
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div>
          <p className="text-sm text-white/90 font-medium">{label}</p>
          <p className="text-xs text-white/40">{size}</p>
        </div>
        <button onClick={handleDownload} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">Download</button>
      </div>
    </div>
  );
}

/* ── Section Header ── */
function SectionHeader({ title, description, onDownloadAll }: { title: string; description: string; onDownloadAll?: () => void }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        {onDownloadAll && (
          <button onClick={onDownloadAll} className="px-4 py-2 text-sm font-medium text-blue-400 hover:text-blue-300 border border-blue-400/30 hover:border-blue-300/50 rounded-lg transition-all">
            Download All
          </button>
        )}
      </div>
      <p className="text-sm text-white/40">{description}</p>
    </div>
  );
}

/* ── Sidebar ── */
const SIDEBAR_ITEMS: { store: Store; id: string; label: string }[] = [
  { store: "appstore", id: "ios-screenshots", label: "iOS Screenshots" },
  { store: "appstore", id: "ipad-screenshots", label: "iPad Screenshots" },
  { store: "appstore", id: "app-icon-ios", label: "App Icon" },
  { store: "playstore", id: "play-screenshots", label: "Screenshots" },
  { store: "playstore", id: "feature-graphic", label: "Feature Graphic" },
  { store: "playstore", id: "app-icon-play", label: "App Icon" },
];

/* ── Main Page ── */
export default function Page() {
  const [ready, setReady] = useState(false);
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      if (p.get("lang") === "en") return "en";
    }
    return "ko";
  });
  const [store, setStore] = useState<Store>(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      if (p.get("store") === "play") return "playstore";
    }
    return "appstore";
  });

  useEffect(() => { preloadAllImages().then(() => setReady(true)); }, []);

  const iosDir = getIosDir(lang);
  const ipadDir = getIpadDir(lang);

  const handleDownloadIos = useCallback(() => {
    const files = IOS_SCREENS.map((id) => ({
      name: `ios-${id}-1206x2622.png`,
      src: img(`${iosDir}/${id}.png`),
    }));
    downloadZip(files, `zkap-ios-screenshots-${lang}.zip`);
  }, [iosDir, lang]);

  const handleDownloadIpad = useCallback(() => {
    const files = IPAD_SCREENS.map((id) => ({
      name: `ipad-${id}-${IPAD_SIZE.w}x${IPAD_SIZE.h}.png`,
      src: img(`${ipadDir}/${id}.png`),
    }));
    downloadZip(files, `zkap-ipad-screenshots-${lang}.zip`);
  }, [ipadDir, lang]);

  const handleDownloadPlay = useCallback(() => {
    const files = IOS_SCREENS.map((id) => ({
      name: `play-${id}-1206x2622.png`,
      src: img(`${iosDir}/${id}.png`),
    }));
    downloadZip(files, `zkap-play-screenshots-${lang}.zip`);
  }, [iosDir, lang]);

  if (!ready) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0a0a14]">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-white/50">Loading assets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a14] text-white flex">
      {/* ── Sidebar ── */}
      <aside className="w-56 fixed top-0 left-0 h-full bg-[#0f0f1a] border-r border-white/5 flex flex-col z-50">
        <div className="p-5 flex items-center gap-3 border-b border-white/5">
          <img src={img("/app-icon.png")} alt="ZKAP" className="w-8 h-8 rounded-lg" />
          <span className="font-bold text-white/90">ZKAP</span>
          <span className="text-xs text-white/30">Store Assets</span>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          {(["appstore", "playstore"] as const).map((s) => (
            <div key={s} className="mb-2">
              <button
                onClick={() => setStore(s)}
                className={`w-full text-left px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${store === s ? "text-blue-400" : "text-white/30 hover:text-white/50"}`}
              >
                {s === "appstore" ? "App Store" : "Play Store"}
              </button>
              {store === s && SIDEBAR_ITEMS.filter((i) => i.store === s).map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="block px-5 py-1.5 text-sm text-white/60 hover:text-white/90 hover:bg-white/5 transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="flex rounded-lg overflow-hidden border border-white/10">
            {(["ko", "en"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`flex-1 py-1.5 text-xs font-medium transition-colors ${lang === l ? "bg-blue-600 text-white" : "text-white/40 hover:text-white/60"}`}
              >
                {l === "ko" ? "한국어" : "English"}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* ── Content ── */}
      <main className="flex-1 ml-56 p-12 max-w-5xl">

        {store === "appstore" && (
          <>
            {/* iOS Screenshots */}
            <section id="ios-screenshots" className="mb-20">
              <SectionHeader
                title="iOS Screenshots"
                description="iPhone 6.3&quot; — 1206x2622px · PNG (no alpha)"
                onDownloadAll={handleDownloadIos}
              />
              <div className="grid grid-cols-4 gap-6">
                {IOS_SCREENS.map((id) => (
                  <AssetCard
                    key={id}
                    src={img(`${iosDir}/${id}.png`)}
                    label={LABELS[id][lang]}
                    filename={`ios-${id}-1206x2622.png`}
                    size="1206 x 2622"
                  />
                ))}
              </div>
            </section>

            {/* iPad Screenshots */}
            <section id="ipad-screenshots" className="mb-20">
              <SectionHeader
                title="iPad Screenshots"
                description={`13" iPad — ${IPAD_SIZE.w}x${IPAD_SIZE.h}px · PNG`}
                onDownloadAll={handleDownloadIpad}
              />
              <div className="grid grid-cols-4 gap-6">
                {IPAD_SCREENS.map((id) => (
                  <AssetCard
                    key={id}
                    src={img(`${ipadDir}/${id}.png`)}
                    label={LABELS[id][lang]}
                    filename={`ipad-${id}-${IPAD_SIZE.w}x${IPAD_SIZE.h}.png`}
                    size={`${IPAD_SIZE.w} x ${IPAD_SIZE.h}`}
                  />
                ))}
              </div>
            </section>

            {/* App Icon */}
            <section id="app-icon-ios" className="mb-20">
              <SectionHeader title="App Icon" description="1024x1024px · PNG (no alpha)" />
              <div className="grid grid-cols-4 gap-6">
                <IconCard
                  src={img("/app-icon.png")}
                  label="App Store Icon"
                  filename={`app-icon-ios-${ICON_IOS}x${ICON_IOS}.png`}
                  size={`${ICON_IOS} x ${ICON_IOS}`}
                />
              </div>
            </section>
          </>
        )}

        {store === "playstore" && (
          <>
            {/* Play Screenshots */}
            <section id="play-screenshots" className="mb-20">
              <SectionHeader
                title="Screenshots"
                description="1206x2622px · PNG (same as iOS, resize in console if needed)"
                onDownloadAll={handleDownloadPlay}
              />
              <div className="grid grid-cols-4 gap-6">
                {IOS_SCREENS.map((id) => (
                  <AssetCard
                    key={id}
                    src={img(`${iosDir}/${id}.png`)}
                    label={LABELS[id][lang]}
                    filename={`play-${id}-1206x2622.png`}
                    size="1206 x 2622"
                  />
                ))}
              </div>
            </section>

            {/* Feature Graphic */}
            <section id="feature-graphic" className="mb-20">
              <SectionHeader title="Feature Graphic" description="1024x500px · JPG or 24-bit PNG (no alpha) · Max 1MB" />
              <p className="text-xs text-white/30 italic mb-4">Feature Graphic은 이전 버전의 생성기(Export All)에서 다운로드해주세요.</p>
            </section>

            {/* Play App Icon */}
            <section id="app-icon-play" className="mb-20">
              <SectionHeader title="App Icon" description="512x512px · 32-bit PNG (with alpha)" />
              <div className="grid grid-cols-4 gap-6">
                <IconCard
                  src={img("/app-icon-play.png")}
                  label="Google Play Icon"
                  filename={`app-icon-play-${ICON_PLAY}x${ICON_PLAY}.png`}
                  size={`${ICON_PLAY} x ${ICON_PLAY}`}
                />
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
