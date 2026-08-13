"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import NavTabs from "@/components/NavTabs";
import PhotoDropzone from "@/components/PhotoDropzone";
import ShareBar from "@/components/ShareBar";
import { drawCard, CARD_W, CARD_H } from "@/lib/drawCard";
import { usePhotoTransform } from "@/lib/usePhotoTransform";
import { pickBuilderTitle, BUILDER_TITLES } from "@/lib/theme";
import { useBrandFonts } from "@/lib/useBrandFonts";

export default function CardPage() {
  const canvasRef = useRef(null);
  const [img, setImg] = useState(null);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [title, setTitle] = useState("");
  const t = usePhotoTransform();
  const fontsReady = useBrandFonts();

  const photoSize = 380;

  const suggestedTitle = useMemo(() => pickBuilderTitle(name + role), [name, role]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!canvas.width) canvas.width = CARD_W;
    if (!canvas.height) canvas.height = CARD_H;
    const ctx = canvas.getContext("2d");
    // drawCard resizes the canvas itself to fit the actual content height —
    // no leftover empty space below a short name/role/title.
    drawCard(ctx, {
      img,
      transform: { ...t.pan, zoom: t.zoom },
      name,
      role,
      title: title || suggestedTitle,
    });
  }, [img, t.pan, t.zoom, name, role, title, suggestedTitle, fontsReady]);

  const caption = `${name ? name + " is " : "I'm "}building at HH Goa 2026 as "${
    title || suggestedTitle
  }" 🛠️🌅 #FrameInGoa`;

  return (
    <div className="flex-1 flex flex-col sunset-bg">
      <NavTabs />
      <main className="flex-1 w-full max-w-md mx-auto flex flex-col gap-6 px-4 pb-16">
        <div className="rounded-3xl overflow-hidden bg-black/20 flex items-center justify-center">
          <canvas
            ref={canvasRef}
            className="w-full h-auto touch-none select-none block"
            onPointerDown={t.onPointerDown}
            onPointerMove={(e) => t.onPointerMove(e, img, photoSize, photoSize)}
            onPointerUp={t.onPointerUp}
            onPointerLeave={t.onPointerUp}
          />
        </div>

        <PhotoDropzone
          onImage={(image) => {
            setImg(image);
            t.reset();
          }}
        />

        {img && (
          <div className="flex flex-col gap-2">
            <label className="text-sm text-[#FFFBE8]/70 flex justify-between">
              <span>Zoom</span>
              <span>Drag photo to reposition</span>
            </label>
            <input
              type="range"
              min="1"
              max="2.5"
              step="0.01"
              value={t.zoom}
              onChange={(e) => t.onZoomChange(parseFloat(e.target.value), img, photoSize, photoSize)}
            />
          </div>
        )}

        <div className="flex flex-col gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={28}
            placeholder="Your name"
            className="w-full rounded-xl bg-[#FFFBE8]/10 border border-[#FFFBE8]/20 px-4 py-3 text-[#FFFBE8] placeholder:text-[#FFFBE8]/40 outline-none focus:border-[#FEE101]"
          />
          <input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            maxLength={28}
            placeholder="Your stack / role (e.g. Full-stack + design)"
            className="w-full rounded-xl bg-[#FFFBE8]/10 border border-[#FFFBE8]/20 px-4 py-3 text-[#FFFBE8] placeholder:text-[#FFFBE8]/40 outline-none focus:border-[#FEE101]"
          />
          <div className="flex gap-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={40}
              placeholder={`Builder title (auto: "${suggestedTitle}")`}
              className="flex-1 rounded-xl bg-[#FFFBE8]/10 border border-[#FFFBE8]/20 px-4 py-3 text-[#FFFBE8] placeholder:text-[#FFFBE8]/40 outline-none focus:border-[#FEE101]"
            />
            <button
              type="button"
              onClick={() => {
                const others = BUILDER_TITLES.filter((x) => x !== title);
                setTitle(others[Math.floor(Math.random() * others.length)]);
              }}
              className="rounded-xl px-4 py-3 bg-[#FFFBE8]/10 border border-[#FFFBE8]/20 text-sm font-semibold hover:bg-[#FFFBE8]/20"
            >
              🎲
            </button>
          </div>
        </div>

        <ShareBar
          canvasRef={canvasRef}
          filename="hh-goa-2026-builder-card.png"
          caption={caption}
          disabled={!img}
        />

        <p className="text-xs text-center text-[#FFFBE8]/40">
          No login needed. Your photo is processed in your browser.
        </p>
      </main>
    </div>
  );
}
