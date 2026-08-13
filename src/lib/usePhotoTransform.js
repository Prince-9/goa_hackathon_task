"use client";
import { useCallback, useRef, useState } from "react";
import { coverSlack, clampPan } from "./canvasEngine";

/**
 * Drag-to-reposition + zoom for a photo inside a fixed-size destination rect.
 * Works with mouse and touch (pointer events) so off-center / oddly cropped
 * photos can be recentered without any external cropping tool.
 */
export function usePhotoTransform() {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ panX: 0, panY: 0 });
  const dragRef = useRef(null);

  const reset = useCallback(() => {
    setZoom(1);
    setPan({ panX: 0, panY: 0 });
  }, []);

  const clampToRect = useCallback((img, dw, dh, z, p) => {
    if (!img) return p;
    const { slackX, slackY } = coverSlack(img, dw, dh, z);
    return clampPan(p.panX, p.panY, slackX, slackY);
  }, []);

  const onPointerDown = (e) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    dragRef.current = { x: e.clientX, y: e.clientY, pan };
  };

  const onPointerMove = (e, img, dw, dh) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.x;
    const dy = e.clientY - dragRef.current.y;
    const next = {
      panX: dragRef.current.pan.panX + dx,
      panY: dragRef.current.pan.panY + dy,
    };
    setPan(clampToRect(img, dw, dh, zoom, next));
  };

  const onPointerUp = () => {
    dragRef.current = null;
  };

  const onZoomChange = (nextZoom, img, dw, dh) => {
    setZoom(nextZoom);
    setPan((p) => clampToRect(img, dw, dh, nextZoom, p));
  };

  return {
    zoom,
    pan,
    reset,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onZoomChange,
  };
}
