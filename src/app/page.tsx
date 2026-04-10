"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { toPng } from "html-to-image";
import JSZip from "jszip";

/* ── Constants ── */
const MK_W = 1022, MK_H = 2082;
const SC_L = (52/MK_W)*100, SC_T = (46/MK_H)*100, SC_W = (918/MK_W)*100, SC_H = (1990/MK_H)*100;
const SC_RX = (126/918)*100, SC_RY = (126/1990)*100;
const IPAD_SIZE = { w: 2064, h: 2752 };
const ICON_PLAY = 512, ICON_IOS = 1024;
const SLIDE_W = 1320, SLIDE_H = 2868;
const IPAD_SLIDE_W = 2064, IPAD_SLIDE_H = 2752;

type Lang = "ko" | "en";
const BASE_PATH = process.env.NODE_ENV === "production" ? "/zkap-app-store-screenshots" : "";

/* ── Preload ── */
const IMAGE_PATHS = [
  "/mockup.png", "/app-icon.png", "/app-icon-play.png",
  "/screenshots-develop/home.png", "/screenshots-develop/exchange.png", "/screenshots-develop/tax-confirm.png", "/screenshots-develop/agent-select.png",
  "/screenshots-en/home.png", "/screenshots-en/exchange.png", "/screenshots-en/tax-confirm.png", "/screenshots-en/agent-select.png",
  "/screenshots-ipad-ko/home.png", "/screenshots-ipad-ko/exchange.png", "/screenshots-ipad-ko/tax-confirm.png", "/screenshots-ipad-ko/complete.png",
  "/screenshots-ipad-en/home.png", "/screenshots-ipad-en/exchange.png", "/screenshots-ipad-en/tax-confirm.png", "/screenshots-ipad-en/complete.png",
];
const imageCache: Record<string, string> = {};
async function preloadAllImages() {
  await Promise.all(IMAGE_PATHS.map(async (p) => {
    try { const r = await fetch(`${BASE_PATH}${p}`); const b = await r.blob(); imageCache[p] = await new Promise<string>((res) => { const fr = new FileReader(); fr.onloadend = () => res(fr.result as string); fr.readAsDataURL(b); }); } catch {}
  }));
}
function img(p: string) { return imageCache[p] || `${BASE_PATH}${p}`; }

/* ── Slide Data ── */
function getSlides(lang: Lang, device: "ios" | "ipad") {
  const iosDir = lang === "en" ? "/screenshots-en" : "/screenshots-develop";
  const ipadDir = lang === "en" ? "/screenshots-ipad-en" : "/screenshots-ipad-ko";
  const dir = device === "ipad" ? ipadDir : iosDir;
  const isEn = lang === "en";
  const screens = device === "ipad"
    ? [{ id: "home", ss: "home" }, { id: "exchange", ss: "exchange" }, { id: "tax-confirm", ss: "tax-confirm" }, { id: "complete", ss: "complete" }]
    : [{ id: "home", ss: "home" }, { id: "exchange", ss: "exchange" }, { id: "tax-confirm", ss: "tax-confirm" }, { id: "agent-select", ss: "agent-select" }];

  const copy = [
    { label: isEn ? "Portfolio" : "자산관리", headline: isEn ? "All Your Exchange\nAssets, At a Glance" : "내 모든 거래소\n자산, 한눈에" },
    { label: isEn ? "Exchanges" : "거래소 연동", headline: isEn ? "Connect All Your\nExchanges at Once" : "국내·해외 거래소\n한곳에서 연동" },
    { label: isEn ? "Tax Report" : "자산 수집", headline: isEn ? "Overseas Crypto\nTax Made Simple" : "해외 거래소 자산\n간편하게 수집" },
    { label: isEn ? "Tax Filing" : "세무대리인", headline: isEn ? "From Tax Agent\nto Filing, All in App" : "세무대리인 선택부터\n신고까지 간편하게" },
  ];
  const bgs = [
    { bg: "linear-gradient(165deg, #2570cc 0%, #4DA0F7 40%, #7fc0ff 100%)", color: "#fff" },
    { bg: "linear-gradient(165deg, #f8faff 0%, #e8f0fe 50%, #dbe7ff 100%)", color: "#1a1a2e" },
    { bg: "linear-gradient(165deg, #1a2744 0%, #2a4b7a 50%, #3d6aab 100%)", color: "#fff" },
    { bg: "linear-gradient(165deg, #f0f4ff 0%, #e4ecff 50%, #d8e4ff 100%)", color: "#1a1a2e" },
  ];
  return screens.map((s, i) => ({ ...s, ...copy[i], ...bgs[i], screenshot: `${dir}/${s.ss}.png` }));
}

const DECO = [
  { top: "15%", right: "-20%", size: 0.8, bg: "rgba(107,155,255,0.3)" },
  { top: "auto", left: "-15%", size: 0.6, bg: "rgba(59,107,245,0.08)" },
  { top: "40%", left: "-10%", size: 0.7, bg: "rgba(59,107,245,0.2)" },
  { top: "20%", right: "-15%", size: 0.6, bg: "rgba(59,107,245,0.1)" },
];

/* ── Phone Mockup ── */
function Phone({ src, alt, style, className = "" }: { src: string; alt: string; style?: React.CSSProperties; className?: string }) {
  return (
    <div className={`relative ${className}`} style={{ aspectRatio: `${MK_W}/${MK_H}`, ...style }}>
      <img src={img("/mockup.png")} alt="" className="block w-full h-full" draggable={false} />
      <div className="absolute z-10 overflow-hidden" style={{ left: `${SC_L}%`, top: `${SC_T}%`, width: `${SC_W}%`, height: `${SC_H}%`, borderRadius: `${SC_RX}% / ${SC_RY}%` }}>
        <img src={img(src)} alt={alt} className="block w-full h-full object-cover object-top" draggable={false} />
      </div>
    </div>
  );
}

/* ── iPad Mockup (CSS-only) ── */
function IPad({ src, alt, style, className = "" }: { src: string; alt: string; style?: React.CSSProperties; className?: string }) {
  return (
    <div className={`relative ${className}`} style={{ aspectRatio: "770/1000", ...style }}>
      <div style={{ width: "100%", height: "100%", borderRadius: "5%/3.6%", background: "linear-gradient(180deg,#2C2C2E,#1C1C1E)", position: "relative", overflow: "hidden", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.1),0 8px 40px rgba(0,0,0,0.6)" }}>
        <div style={{ position: "absolute", top: "1.2%", left: "50%", transform: "translateX(-50%)", width: "0.9%", height: "0.65%", borderRadius: "50%", background: "#111113", border: "1px solid rgba(255,255,255,0.08)", zIndex: 20 }} />
        <div style={{ position: "absolute", left: "2.5%", top: "2%", width: "95%", height: "96%", borderRadius: "2.2%/1.6%", overflow: "hidden", background: "#000" }}>
          <img src={img(src)} alt={alt} style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} draggable={false} />
        </div>
      </div>
    </div>
  );
}

/* ── Marketing Slide (live rendered) ── */
function MarketingSlide({ index, slides, device }: { index: number; slides: ReturnType<typeof getSlides>; device: "ios" | "ipad" }) {
  const s = slides[index];
  const d = DECO[index];
  const W = device === "ipad" ? IPAD_SLIDE_W : SLIDE_W;
  const H = device === "ipad" ? IPAD_SLIDE_H : SLIDE_H;
  const phoneW = device === "ipad" ? "78%" : "88%";
  const phoneY = device === "ipad" ? "6%" : "10%";
  const labelSize = W * (device === "ipad" ? 0.028 : 0.036);
  const headSize = W * (device === "ipad" ? 0.065 : 0.095);

  return (
    <div style={{ width: W, height: H, background: s.bg, position: "relative", overflow: "hidden", fontFamily: "Pretendard,-apple-system,sans-serif" }}>
      <div style={{ position: "absolute", top: d.top === "auto" ? undefined : d.top, bottom: d.top === "auto" ? "10%" : undefined, left: d.left, right: d.right, width: W * d.size, height: W * d.size, borderRadius: "50%", background: index === 3 ? undefined : `radial-gradient(circle,${d.bg} 0%,transparent 70%)`, border: index === 3 ? `2px solid ${d.bg}` : undefined }} />
      <div style={{ paddingTop: H * 0.07 }}>
        <div style={{ padding: `0 ${W * 0.06}px` }}>
          <div style={{ fontSize: labelSize, fontWeight: 600, color: s.color, opacity: 0.7, marginBottom: W * 0.015, letterSpacing: "0.02em" }}>{s.label}</div>
          <div style={{ fontSize: headSize, fontWeight: 700, color: s.color, lineHeight: 1.15, letterSpacing: "-0.01em", whiteSpace: "pre-line" }}>{s.headline}</div>
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 0, left: "50%", transform: `translateX(-50%) translateY(${phoneY})`, width: phoneW }}>
        {device === "ipad" ? <IPad src={s.screenshot} alt={s.id} /> : <Phone src={s.screenshot} alt={s.id} />}
      </div>
    </div>
  );
}

/* ── Capture helper ── */
async function captureAndDownload(el: HTMLDivElement, w: number, h: number, filename: string) {
  el.style.position = "fixed";
  el.style.left = "0px";
  el.style.top = "0px";
  el.style.opacity = "1";
  el.style.zIndex = "-9999";
  el.style.pointerEvents = "none";
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  await new Promise((r) => setTimeout(r, 200));
  const opts = { width: w, height: h, pixelRatio: 1, cacheBust: true };
  await toPng(el, opts);
  const dataUrl = await toPng(el, opts);
  el.style.position = "absolute";
  el.style.left = "-9999px";
  el.style.top = "";
  el.style.opacity = "0";
  el.style.zIndex = "";
  el.style.pointerEvents = "";
  const a = document.createElement("a");
  a.download = filename;
  a.href = dataUrl;
  a.click();
}

/* ── Scaled Slide Preview ── */
function SlidePreview({ index, slides, device, setExportRef }: { index: number; slides: ReturnType<typeof getSlides>; device: "ios" | "ipad"; setExportRef?: (i: number, el: HTMLDivElement | null) => void }) {
  const previewRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.15);
  const W = device === "ipad" ? IPAD_SLIDE_W : SLIDE_W;
  const H = device === "ipad" ? IPAD_SLIDE_H : SLIDE_H;

  useEffect(() => {
    const el = previewRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([e]) => setScale(e.contentRect.width / W));
    obs.observe(el);
    return () => obs.disconnect();
  }, [W]);

  const handleExport = async () => {
    if (!exportRef.current) return;
    await captureAndDownload(exportRef.current, W, H, `${device}-${String(index + 1).padStart(2, "0")}-${slides[index].id}-${W}x${H}.png`);
  };

  return (
    <div className="group">
      <div ref={previewRef} className="relative overflow-hidden rounded-2xl border border-white/[0.04] hover:border-white/15 hover:shadow-lg hover:shadow-white/5 transition-all cursor-pointer" style={{ aspectRatio: `${W}/${H}` }} onClick={handleExport}>
        <div style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: W, height: H }}>
          <MarketingSlide index={index} slides={slides} device={device} />
        </div>
      </div>
      {/* Offscreen export target */}
      <div ref={(el) => { exportRef.current = el; setExportRef?.(index, el); }} style={{ position: "absolute", left: -9999, opacity: 0, width: W, height: H }}>
        <MarketingSlide index={index} slides={slides} device={device} />
      </div>
      <p className="text-[12px] text-white/50 mt-2.5 px-1">{slides[index].label}</p>
    </div>
  );
}

/* ── Download helpers ── */
async function downloadZip(files: { name: string; src: string }[], zipName: string) {
  const zip = new JSZip();
  for (const f of files) { try { zip.file(f.name, await (await fetch(f.src)).blob()); } catch {} }
  const a = document.createElement("a"); a.download = zipName; a.href = URL.createObjectURL(await zip.generateAsync({ type: "blob" })); a.click();
}
function dl(src: string, name: string) { const a = document.createElement("a"); a.download = name; a.href = src; a.click(); }

/* ── Nav ── */
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
    const obs = new IntersectionObserver((entries) => { entries.forEach((e) => { if (e.isIntersecting) setActiveNav(e.target.id); }); }, { rootMargin: "-40% 0px -60% 0px" });
    NAV.forEach(({ id }) => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, [ready]);

  const iosSlides = getSlides(lang, "ios");
  const ipadSlides = getSlides(lang, "ipad");

  const iosExportRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ipadExportRefs = useRef<(HTMLDivElement | null)[]>([]);

  const captureZip = useCallback(async (refs: React.RefObject<(HTMLDivElement | null)[]>, slides: ReturnType<typeof getSlides>, w: number, h: number, prefix: string) => {
    const zip = new JSZip();
    for (let i = 0; i < slides.length; i++) {
      const el = refs.current?.[i];
      if (!el) continue;
      el.style.position = "fixed"; el.style.left = "0px"; el.style.top = "0px"; el.style.opacity = "1"; el.style.zIndex = "-9999"; el.style.pointerEvents = "none";
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      await new Promise((r) => setTimeout(r, 200));
      const opts = { width: w, height: h, pixelRatio: 1, cacheBust: true };
      await toPng(el, opts);
      const dataUrl = await toPng(el, opts);
      el.style.position = "absolute"; el.style.left = "-9999px"; el.style.top = ""; el.style.opacity = "0"; el.style.zIndex = ""; el.style.pointerEvents = "";
      const [, base64] = dataUrl.split(",");
      zip.file(`${String(i+1).padStart(2,"0")}-${slides[i].id}-${w}x${h}.png`, base64, { base64: true });
      await new Promise((r) => setTimeout(r, 300));
    }
    const blob = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a"); a.download = `zkap-${prefix}-${lang}.zip`; a.href = URL.createObjectURL(blob); a.click();
  }, [lang]);

  const dlIos = useCallback(() => captureZip(iosExportRefs, iosSlides, SLIDE_W, SLIDE_H, "ios"), [captureZip, iosSlides]);
  const dlIpad = useCallback(() => captureZip(ipadExportRefs, ipadSlides, IPAD_SLIDE_W, IPAD_SLIDE_H, "ipad"), [captureZip, ipadSlides]);
  const dlPlay = useCallback(() => captureZip(iosExportRefs, iosSlides, SLIDE_W, SLIDE_H, "play"), [captureZip, iosSlides]);

  if (!ready) return <div className="flex items-center justify-center h-screen bg-black"><div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="max-w-[1100px] mx-auto px-6 py-16 flex gap-16">
        {/* Nav */}
        <nav className="w-44 shrink-0 sticky top-16 self-start">
          <div className="mb-8">
            <div className="flex items-center gap-2.5"><img src={img("/app-icon.png")} alt="" className="w-6 h-6 rounded-md" /><span className="text-[13px] font-semibold text-white/80">ZKAP</span></div>
            <p className="text-[11px] text-white/25 mt-1">Brand Resources</p>
          </div>
          <div className="mb-8">
            {NAV.map(({ id, label }) => (<a key={id} href={`#${id}`} className={`block py-2 text-[13px] transition-colors ${activeNav === id ? "text-white" : "text-white/30 hover:text-white/60"}`}>{label}</a>))}
          </div>
          <div className="flex rounded-lg overflow-hidden border border-white/[0.08]">
            {(["ko", "en"] as const).map((l) => (<button key={l} onClick={() => setLang(l)} className={`flex-1 py-1.5 text-[11px] font-medium transition-colors ${lang === l ? "bg-white/10 text-white" : "text-white/25 hover:text-white/40"}`}>{l === "ko" ? "한국어" : "English"}</button>))}
          </div>
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Brand */}
          <section id="brand" className="pb-24">
            <h2 className="text-[28px] font-bold mb-2">브랜드 아이덴티티</h2>
            <p className="text-[14px] text-white/35 mb-12">ZKAP의 브랜드 로고 및 앱 아이콘 리소스입니다.</p>
            <Sub title="앱 아이콘" desc="앱스토어 및 플레이스토어 등록용 아이콘" />
            <div className="grid grid-cols-2 gap-4 mb-16">
              <IconBox label="App Store" desc={`${ICON_IOS}×${ICON_IOS} · PNG`} onClick={() => dl(img("/app-icon.png"), `zkap-icon-ios.png`)}><img src={img("/app-icon.png")} alt="" className="w-24 h-24 rounded-[20px]" /></IconBox>
              <IconBox label="Google Play" desc={`${ICON_PLAY}×${ICON_PLAY} · PNG`} onClick={() => dl(img("/app-icon-play.png"), `zkap-icon-play.png`)}><img src={img("/app-icon-play.png")} alt="" className="w-24 h-24 rounded-[20px]" /></IconBox>
            </div>
          </section>

          {/* App Store */}
          <section id="appstore" className="pb-24">
            <h2 className="text-[28px] font-bold mb-2">App Store</h2>
            <p className="text-[14px] text-white/35 mb-12">iOS 앱 심사에 필요한 스크린샷 및 에셋</p>

            <Sub title="iOS 스크린샷" desc="iPhone 6.3&quot; — 1206×2622px" onDownload={dlIos} />
            <div className="grid grid-cols-4 gap-4 mb-16">
              {iosSlides.map((s, i) => (<SlidePreview key={s.id} index={i} slides={iosSlides} device="ios" setExportRef={(idx, el) => { iosExportRefs.current[idx] = el; }} />))}
            </div>

            <Sub title="iPad 스크린샷" desc={`13" iPad — ${IPAD_SIZE.w}×${IPAD_SIZE.h}px`} onDownload={dlIpad} />
            <div className="grid grid-cols-4 gap-4 mb-16">
              {ipadSlides.map((s, i) => (<SlidePreview key={s.id} index={i} slides={ipadSlides} device="ipad" setExportRef={(idx, el) => { ipadExportRefs.current[idx] = el; }} />))}
            </div>
          </section>

          {/* Play Store */}
          <section id="playstore" className="pb-24">
            <h2 className="text-[28px] font-bold mb-2">Play Store</h2>
            <p className="text-[14px] text-white/35 mb-12">Google Play 스토어 등록에 필요한 에셋</p>
            <Sub title="스크린샷" desc="1206×2622px" onDownload={dlPlay} />
            <div className="grid grid-cols-4 gap-4 mb-16">
              {iosSlides.map((s, i) => (<SlidePreview key={s.id} index={i} slides={iosSlides} device="ios" setExportRef={(idx, el) => { iosExportRefs.current[idx] = el; }} />))}
            </div>
          </section>

          <div className="text-center text-white/15 text-[11px] py-12 border-t border-white/[0.04]">ZKAP Brand Resources · BaeRae Inc.</div>
        </div>
      </main>
    </div>
  );
}

/* ── Sub Components ── */
function Sub({ title, desc, onDownload }: { title: string; desc: string; onDownload?: () => void }) {
  return (
    <div className="flex items-end justify-between mb-5">
      <div><h3 className="text-[16px] font-semibold text-white/90 mb-1">{title}</h3><p className="text-[12px] text-white/30">{desc}</p></div>
      {onDownload && <button onClick={onDownload} className="text-[12px] text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 border border-blue-400/20 hover:border-blue-400/40 px-3 py-1 rounded-full transition-all cursor-pointer">ZIP 다운로드</button>}
    </div>
  );
}

function IconBox({ label, desc, children, onClick }: { label: string; desc: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <div className="group cursor-pointer" onClick={onClick}>
      <div className="bg-[#141420] rounded-2xl border border-white/[0.04] hover:border-white/15 hover:shadow-lg hover:shadow-white/5 transition-all p-8 flex flex-col items-center justify-center gap-5 min-h-[200px] cursor-pointer">{children}</div>
      <div className="mt-3 px-1">
        <p className="text-[13px] text-white/70">{label}</p>
        <p className="text-[11px] text-white/25 mt-0.5">{desc}</p>
      </div>
    </div>
  );
}
