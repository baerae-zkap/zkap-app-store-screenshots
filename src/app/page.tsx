"use client";

import { useEffect, useState, useCallback } from "react";
import JSZip from "jszip";

const IPAD_SIZE = { w: 2064, h: 2752 };
const ICON_PLAY = 512;
const ICON_IOS = 1024;

type Lang = "ko" | "en";
const BASE_PATH = process.env.NODE_ENV === "production" ? "/zkap-app-store-screenshots" : "";

/* ── Preload ── */
const IMAGE_PATHS = [
  "/app-icon.png", "/app-icon-play.png",
  "/screenshots-develop/home.png", "/screenshots-develop/exchange.png", "/screenshots-develop/tax-confirm.png", "/screenshots-develop/agent-select.png",
  "/screenshots-en/home.png", "/screenshots-en/exchange.png", "/screenshots-en/tax-confirm.png", "/screenshots-en/agent-select.png",
  "/screenshots-ipad-ko/home.png", "/screenshots-ipad-ko/exchange.png", "/screenshots-ipad-ko/tax-confirm.png", "/screenshots-ipad-ko/complete.png",
  "/screenshots-ipad-en/home.png", "/screenshots-ipad-en/exchange.png", "/screenshots-ipad-en/tax-confirm.png", "/screenshots-ipad-en/complete.png",
  "/feature-graphic-ko.png", "/feature-graphic-en.png",
];

const imageCache: Record<string, string> = {};
async function preloadAllImages() {
  await Promise.all(IMAGE_PATHS.map(async (path) => {
    try {
      const resp = await fetch(`${BASE_PATH}${path}`);
      const blob = await resp.blob();
      imageCache[path] = await new Promise<string>((r) => { const fr = new FileReader(); fr.onloadend = () => r(fr.result as string); fr.readAsDataURL(blob); });
    } catch {}
  }));
}
function img(path: string) { return imageCache[path] || `${BASE_PATH}${path}`; }

/* ── Data ── */
function getIosDir(lang: Lang) { return lang === "en" ? "/screenshots-en" : "/screenshots-develop"; }
function getIpadDir(lang: Lang) { return lang === "en" ? "/screenshots-ipad-en" : "/screenshots-ipad-ko"; }
const IOS_SCREENS = ["home", "exchange", "tax-confirm", "agent-select"] as const;
const IPAD_SCREENS = ["home", "exchange", "tax-confirm", "complete"] as const;
const LABELS: Record<string, Record<Lang, string>> = {
  home: { ko: "홈", en: "Home" }, exchange: { ko: "거래소 연동", en: "Exchanges" },
  "tax-confirm": { ko: "해외자산 확인", en: "Tax Report" }, "agent-select": { ko: "접수 완료", en: "Complete" },
  complete: { ko: "접수 완료", en: "Complete" },
};

/* ── Download ── */
async function downloadZip(files: { name: string; src: string }[], zipName: string) {
  const zip = new JSZip();
  for (const f of files) { try { zip.file(f.name, await (await fetch(f.src)).blob()); } catch {} }
  const a = document.createElement("a"); a.download = zipName; a.href = URL.createObjectURL(await zip.generateAsync({ type: "blob" })); a.click();
}
function dl(src: string, name: string) { const a = document.createElement("a"); a.download = name; a.href = src; a.click(); }

/* ── Nav items ── */
const NAV = [
  { id: "brand", label: "브랜드 아이덴티티" },
  { id: "appstore", label: "App Store" },
  { id: "playstore", label: "Play Store" },
];

/* ── Page ── */
export default function Page() {
  const [ready, setReady] = useState(false);
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("lang") === "en") return "en";
    return "ko";
  });
  const [activeNav, setActiveNav] = useState("brand");

  useEffect(() => { preloadAllImages().then(() => setReady(true)); }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setActiveNav(e.target.id); });
    }, { rootMargin: "-40% 0px -60% 0px" });
    NAV.forEach(({ id }) => { const el = document.getElementById(id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, [ready]);

  const iosDir = getIosDir(lang);
  const ipadDir = getIpadDir(lang);

  if (!ready) return (
    <div className="flex items-center justify-center h-screen bg-black">
      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      {/* ── Main ── */}
      <main className="max-w-[1100px] mx-auto px-6 py-16 flex gap-16">
        {/* ── Left Nav ── */}
        <nav className="w-44 shrink-0 sticky top-16 self-start">
          <div className="mb-8">
            <div className="flex items-center gap-2.5">
              <img src={img("/app-icon.png")} alt="" className="w-6 h-6 rounded-md" />
              <span className="text-[13px] font-semibold text-white/80">ZKAP</span>
            </div>
            <p className="text-[11px] text-white/25 mt-1">Brand Resources</p>
          </div>
          <div className="mb-8">
            {NAV.map(({ id, label }) => (
              <a
                key={id}
                href={`#${id}`}
                className={`block py-2 text-[13px] transition-colors ${activeNav === id ? "text-white" : "text-white/30 hover:text-white/60"}`}
              >
                {label}
              </a>
            ))}
          </div>
          <div className="flex rounded-lg overflow-hidden border border-white/[0.08]">
            {(["ko", "en"] as const).map((l) => (
              <button key={l} onClick={() => setLang(l)}
                className={`flex-1 py-1.5 text-[11px] font-medium transition-colors ${lang === l ? "bg-white/10 text-white" : "text-white/25 hover:text-white/40"}`}>
                {l === "ko" ? "한국어" : "English"}
              </button>
            ))}
          </div>
        </nav>

        {/* ── Content ── */}
        <div className="flex-1 min-w-0">

          {/* ══ Brand Identity ══ */}
          <section id="brand" className="pb-24">
            <h2 className="text-[28px] font-bold mb-2">브랜드 아이덴티티</h2>
            <p className="text-[14px] text-white/35 mb-12">ZKAP의 브랜드 로고 및 앱 아이콘 리소스입니다.<br />용도에 맞는 에셋을 다운로드하여 사용해주세요.</p>

            {/* App Icon */}
            <SubSection title="앱 아이콘" desc="앱스토어 및 플레이스토어 등록용 아이콘입니다." />
            <div className="grid grid-cols-2 gap-4 mb-16">
              <AssetBox label="App Store" desc={`${ICON_IOS}×${ICON_IOS} · PNG`} onClick={() => dl(img("/app-icon.png"), `zkap-icon-ios-${ICON_IOS}.png`)}>
                <img src={img("/app-icon.png")} alt="" className="w-24 h-24 rounded-[20px]" />
              </AssetBox>
              <AssetBox label="Google Play" desc={`${ICON_PLAY}×${ICON_PLAY} · PNG`} onClick={() => dl(img("/app-icon-play.png"), `zkap-icon-play-${ICON_PLAY}.png`)}>
                <img src={img("/app-icon-play.png")} alt="" className="w-24 h-24 rounded-[20px]" />
              </AssetBox>
            </div>
          </section>

          {/* ══ App Store ══ */}
          <section id="appstore" className="pb-24">
            <h2 className="text-[28px] font-bold mb-2">App Store</h2>
            <p className="text-[14px] text-white/35 mb-12">iOS 앱 심사에 필요한 스크린샷 및 에셋입니다.</p>

            {/* iOS Screenshots */}
            <SubSection title="iOS 스크린샷" desc="iPhone 6.3&quot; — 1206×2622px"
              onDownload={() => downloadZip(IOS_SCREENS.map(id => ({ name: `${id}.png`, src: img(`${iosDir}/${id}.png`) })), `zkap-ios-${lang}.zip`)} />
            <div className="grid grid-cols-4 gap-4 mb-16">
              {IOS_SCREENS.map((id) => (
                <ScreenshotCard key={id} src={img(`${iosDir}/${id}.png`)} label={LABELS[id][lang]} filename={`ios-${id}.png`} />
              ))}
            </div>

            {/* iPad Screenshots */}
            <SubSection title="iPad 스크린샷" desc={`13" iPad — ${IPAD_SIZE.w}×${IPAD_SIZE.h}px`}
              onDownload={() => downloadZip(IPAD_SCREENS.map(id => ({ name: `${id}.png`, src: img(`${ipadDir}/${id}.png`) })), `zkap-ipad-${lang}.zip`)} />
            <div className="grid grid-cols-4 gap-4 mb-16">
              {IPAD_SCREENS.map((id) => (
                <ScreenshotCard key={id} src={img(`${ipadDir}/${id}.png`)} label={LABELS[id][lang]} filename={`ipad-${id}.png`} />
              ))}
            </div>
          </section>

          {/* ══ Play Store ══ */}
          <section id="playstore" className="pb-24">
            <h2 className="text-[28px] font-bold mb-2">Play Store</h2>
            <p className="text-[14px] text-white/35 mb-12">Google Play 스토어 등록에 필요한 에셋입니다.</p>

            <SubSection title="스크린샷" desc="1206×2622px · iOS와 동일 이미지"
              onDownload={() => downloadZip(IOS_SCREENS.map(id => ({ name: `${id}.png`, src: img(`${iosDir}/${id}.png`) })), `zkap-play-${lang}.zip`)} />
            <div className="grid grid-cols-4 gap-4 mb-16">
              {IOS_SCREENS.map((id) => (
                <ScreenshotCard key={id} src={img(`${iosDir}/${id}.png`)} label={LABELS[id][lang]} filename={`play-${id}.png`} />
              ))}
            </div>
          </section>

          {/* Footer */}
          <div className="text-center text-white/15 text-[11px] py-12 border-t border-white/[0.04]">
            ZKAP Brand Resources · BaeRae Inc.
          </div>
        </div>
      </main>
    </div>
  );
}

/* ── Sub Components ── */
function SubSection({ title, desc, onDownload }: { title: string; desc: string; onDownload?: () => void }) {
  return (
    <div className="flex items-end justify-between mb-5">
      <div>
        <h3 className="text-[16px] font-semibold text-white/90 mb-1">{title}</h3>
        <p className="text-[12px] text-white/30">{desc}</p>
      </div>
      {onDownload && (
        <button onClick={onDownload} className="text-[12px] text-blue-400 hover:text-blue-300 transition-colors">
          ZIP 다운로드
        </button>
      )}
    </div>
  );
}

function AssetBox({ label, desc, children, onClick }: { label: string; desc: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <div className="group cursor-pointer" onClick={onClick}>
      <div className="bg-[#141420] rounded-2xl border border-white/[0.04] hover:border-white/[0.12] transition-all p-8 flex flex-col items-center justify-center gap-5 min-h-[200px]">
        {children}
      </div>
      <div className="flex items-center justify-between mt-3 px-1">
        <div>
          <p className="text-[13px] text-white/70">{label}</p>
          <p className="text-[11px] text-white/25 mt-0.5">{desc}</p>
        </div>
        <span className="text-[11px] text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">다운로드</span>
      </div>
    </div>
  );
}

function ScreenshotCard({ src, label, filename }: { src: string; label: string; filename: string }) {
  return (
    <div className="group cursor-pointer" onClick={() => dl(src, filename)}>
      <div className="bg-[#141420] rounded-2xl border border-white/[0.04] hover:border-white/[0.12] transition-all overflow-hidden">
        <div className="p-3" style={{ aspectRatio: "9/16" }}>
          <img src={src} alt={label} className="w-full h-full object-contain rounded-lg" draggable={false} />
        </div>
      </div>
      <div className="flex items-center justify-between mt-2.5 px-1">
        <p className="text-[12px] text-white/50">{label}</p>
        <span className="text-[11px] text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">다운로드</span>
      </div>
    </div>
  );
}
