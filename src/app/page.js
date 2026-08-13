"use client";
import { useEffect, useRef, useState } from "react";
import NavTabs from "@/components/NavTabs";
import PhotoDropzone from "@/components/PhotoDropzone";
import ShareBar from "@/components/ShareBar";
import { drawFrame, FRAME_SIZE } from "@/lib/drawFrame";
import { usePhotoTransform } from "@/lib/usePhotoTransform";
import { useBrandFonts } from "@/lib/useBrandFonts";

const CAPTION = "Just framed my profile for HH Goa 2026 🌅🛠️ #FrameInGoa";

export default function FramePage() {
  const canvasRef = useRef(null);
  const [img, setImg] = useState(null);
  const t = usePhotoTransform();
  const fontsReady = useBrandFonts();

  const photoR = FRAME_SIZE / 2 - 74;
  const photoDim = photoR * 2;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = FRAME_SIZE;
    canvas.height = FRAME_SIZE;
    const ctx = canvas.getContext("2d");
    drawFrame(ctx, { img, transform: { ...t.pan, zoom: t.zoom } });
  }, [img, t.pan, t.zoom, fontsReady]);

  return (
    <div className="flex-1 flex flex-col sunset-bg">
      <NavTabs />
      <main className="flex-1 w-full max-w-md mx-auto flex flex-col gap-6 px-4 pb-16">
        <div className="rounded-3xl overflow-hidden bg-black/20 flex items-center justify-center">
          <canvas
            ref={canvasRef}
            className="w-full h-auto touch-none select-none"
            style={{ aspectRatio: "1 / 1" }}
            onPointerDown={t.onPointerDown}
            onPointerMove={(e) => t.onPointerMove(e, img, photoDim, photoDim)}
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
              onChange={(e) => t.onZoomChange(parseFloat(e.target.value), img, photoDim, photoDim)}
            />
          </div>
        )}

        <ShareBar
          canvasRef={canvasRef}
          filename="hh-goa-2026-frame.png"
          caption={CAPTION}
          disabled={!img}
        />

        <p className="text-xs text-center text-[#FFFBE8]/40">
          No login needed. Your photo is processed in your browser.
        </p>
      </main>
    </div>
  );
}
