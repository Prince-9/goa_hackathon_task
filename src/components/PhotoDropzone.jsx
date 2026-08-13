"use client";
import { useCallback, useId, useState } from "react";
import { loadImageFromFile } from "@/lib/canvasEngine";

export default function PhotoDropzone({ onImage, compact }) {
  const inputId = useId();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(
    async (file) => {
      if (!file) return;
      setError("");
      setBusy(true);
      try {
        const { img } = await loadImageFromFile(file);
        onImage(img);
      } catch (e) {
        console.error("[PhotoDropzone] failed to load photo:", e);
        setError(`Couldn't read that photo (${e?.message || e}). Try a JPG or PNG.`);
      } finally {
        setBusy(false);
      }
    },
    [onImage]
  );

  return (
    <div>
      {/* A <label htmlFor=...> is the native browser way to open a file
          picker — it works even in environments where a JS-triggered
          input.click() gets blocked. */}
      <label
        htmlFor={inputId}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files?.[0];
          if (file) handleFile(file);
        }}
        className={`block cursor-pointer rounded-2xl border-2 border-dashed transition-colors flex flex-col items-center justify-center text-center px-6 ${
          compact ? "py-6" : "py-12"
        } ${
          dragOver
            ? "border-[#FEE101] bg-[#FEE101]/10"
            : "border-[#FFFBE8]/25 hover:border-[#FFFBE8]/50 bg-[#FFFBE8]/5"
        }`}
      >
        <p className="text-[#FFFBE8] font-semibold">
          {busy ? "Loading photo…" : "Tap to upload a photo"}
        </p>
        <p className="text-[#FFFBE8]/50 text-sm mt-1">JPG, PNG, or iPhone HEIC · any crop is fine</p>
      </label>
      {error && <p className="text-[#FEE101] text-sm mt-2 whitespace-pre-wrap">{error}</p>}
      <input
        id={inputId}
        type="file"
        accept="image/*,.heic,.heif"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          handleFile(file);
          // allow re-selecting the same file later
          e.target.value = "";
        }}
      />
    </div>
  );
}
