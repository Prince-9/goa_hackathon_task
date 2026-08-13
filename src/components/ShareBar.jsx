"use client";
import { useState } from "react";
import { canvasToBlob, downloadBlob } from "@/lib/canvasEngine";

export default function ShareBar({ canvasRef, filename, caption, disabled }) {
  const [status, setStatus] = useState("idle"); // idle | working | done | error
  const [message, setMessage] = useState("");

  async function handleDownload() {
    if (!canvasRef.current) return;
    const blob = await canvasToBlob(canvasRef.current, "image/png");
    downloadBlob(blob, filename);
  }

  async function handleShare() {
    if (!canvasRef.current) return;
    setStatus("working");
    setMessage("Preparing your share link…");
    try {
      const blob = await canvasToBlob(canvasRef.current, "image/png");
      const form = new FormData();
      form.append("file", blob, filename);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "upload failed");

      const shareUrl = `${window.location.origin}/share?img=${encodeURIComponent(
        data.url
      )}&text=${encodeURIComponent(caption)}`;

      const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        caption
      )}&url=${encodeURIComponent(shareUrl)}`;

      window.open(intent, "_blank", "noopener,noreferrer");
      setStatus("done");
      setMessage("Opened X — your graphic will show as the link preview.");
    } catch (e) {
      console.error(e);
      // Fallback: still let them post, just without an auto-attached preview image.
      const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(caption)}`;
      window.open(intent, "_blank", "noopener,noreferrer");
      setStatus("error");
      setMessage("Couldn't attach a live preview, so we opened X with just your caption — download the image above and attach it manually for the best result.");
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleDownload}
          disabled={disabled}
          className="flex-1 rounded-full bg-[#FEE101] text-[#0B6839] font-bold py-3 px-6 disabled:opacity-40 transition hover:opacity-90 border-2 border-black"
        >
          Download image
        </button>
        <button
          onClick={handleShare}
          disabled={disabled || status === "working"}
          className="flex-1 rounded-full py-3 px-6 font-bold text-[#FFFBE8] transition hover:opacity-90 disabled:opacity-40 border-2 border-black"
          style={{ background: "#FF0080" }}
        >
          {status === "working" ? "Preparing…" : "Share to X"}
        </button>
      </div>
      {message && (
        <p className={`text-sm ${status === "error" ? "text-[#FEE101]" : "text-[#FFFBE8]/60"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
