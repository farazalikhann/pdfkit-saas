"use client";

import * as React from "react";
import { X, Camera, Trash2, Check, ImageIcon, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Phase = "starting" | "live" | "denied" | "unsupported" | "error";

interface CapturedPage {
  id: string;
  blob: Blob;
  url: string;
}

interface ScanCameraDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called once with all pages the user wants to keep — from a scan session or the gallery fallback. */
  onFinish: (files: File[]) => void;
}

function pagesToFiles(pages: CapturedPage[]): File[] {
  const stamp = Date.now();
  return pages.map(
    (p, i) => new File([p.blob], `scan-${stamp}-${i + 1}.jpg`, { type: "image/jpeg" })
  );
}

export function ScanCameraDialog({ open, onOpenChange, onFinish }: ScanCameraDialogProps) {
  const [phase, setPhase] = React.useState<Phase>("starting");
  const [pages, setPages] = React.useState<CapturedPage[]>([]);
  const [flash, setFlash] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const galleryInputRef = React.useRef<HTMLInputElement | null>(null);
  const pagesRef = React.useRef<CapturedPage[]>([]);
  pagesRef.current = pages;

  function stopStream() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  function revokeAllPages() {
    pagesRef.current.forEach((p) => URL.revokeObjectURL(p.url));
  }

  // Requests the camera the moment the dialog opens; always releases the
  // camera (stops every track) on close or unmount so the device's camera
  // indicator doesn't stay lit after the user leaves this screen.
  React.useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setPhase("starting");
    setPages([]);

    if (!navigator.mediaDevices?.getUserMedia) {
      setPhase("unsupported");
      return;
    }

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        // Don't touch videoRef here — the <video> element only mounts once
        // phase flips to "live", so it doesn't exist in the DOM yet at this
        // point. A separate effect (keyed on `phase`) attaches the stream
        // once that render has actually happened.
        setPhase("live");
      })
      .catch((err: DOMException) => {
        if (cancelled) return;
        setPhase(err.name === "NotAllowedError" || err.name === "PermissionDeniedError" ? "denied" : "error");
      });

    return () => {
      cancelled = true;
      stopStream();
      revokeAllPages();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Attaches the already-acquired stream once the <video> element exists —
  // it only mounts when phase === "live", one render after getUserMedia resolves.
  React.useEffect(() => {
    if (phase === "live" && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [phase]);

  function handleCapture() {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        setPages((prev) => [...prev, { id: crypto.randomUUID(), blob, url }]);
      },
      "image/jpeg",
      0.92
    );
    setFlash(true);
    window.setTimeout(() => setFlash(false), 150);
  }

  function removePage(id: string) {
    setPages((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((p) => p.id !== id);
    });
  }

  function handleClose() {
    if (pages.length > 0 && !window.confirm(`Discard ${pages.length} scanned page${pages.length > 1 ? "s" : ""}?`)) {
      return;
    }
    stopStream();
    revokeAllPages();
    setPages([]);
    onOpenChange(false);
  }

  function handleDone() {
    if (pages.length === 0) return;
    const files = pagesToFiles(pages);
    stopStream();
    setPages([]);
    onOpenChange(false);
    onFinish(files);
  }

  function handleGalleryFallback(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    stopStream();
    onOpenChange(false);
    onFinish(files);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black" role="dialog" aria-modal="true" aria-label="Scan document">
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleGalleryFallback}
      />

      <div className="flex items-center justify-between px-4 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-3">
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close scanner"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white active:bg-white/20"
        >
          <X className="h-5 w-5" />
        </button>
        <p className="text-sm font-medium text-white">
          {phase === "live" ? `${pages.length} page${pages.length === 1 ? "" : "s"} scanned` : "Scan Document"}
        </p>
        <div className="w-10" />
      </div>

      <div className="relative flex-1 overflow-hidden">
        {phase === "live" && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover"
          />
        )}
        {phase === "starting" && (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-white/70">Starting camera…</p>
          </div>
        )}
        {flash && <div className="pointer-events-none absolute inset-0 bg-white/80" />}

        {(phase === "denied" || phase === "unsupported" || phase === "error") && (
          <div className="flex h-full flex-col items-center justify-center gap-4 px-8 text-center">
            <AlertCircle className="h-10 w-10 text-white/60" />
            <div className="space-y-1.5">
              <p className="text-base font-semibold text-white">
                {phase === "denied" && "Camera access was denied"}
                {phase === "unsupported" && "Camera isn't available"}
                {phase === "error" && "Couldn't start the camera"}
              </p>
              <p className="text-sm text-white/70">
                {phase === "denied" &&
                  "Allow camera access in your browser's site settings to scan a document, or pick photos from your gallery instead."}
                {phase === "unsupported" &&
                  "This browser doesn't support camera capture. Pick photos from your gallery instead."}
                {phase === "error" &&
                  "Something went wrong starting the camera. Try again, or pick photos from your gallery instead."}
              </p>
            </div>
            <Button
              variant="secondary"
              className="gap-2"
              onClick={() => galleryInputRef.current?.click()}
            >
              <ImageIcon className="h-4 w-4" />
              Choose from gallery
            </Button>
          </div>
        )}
      </div>

      {phase === "live" && (
        <div className="space-y-3 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3">
          {pages.length > 0 && (
            <ul className="flex gap-2 overflow-x-auto px-4">
              {pages.map((p) => (
                <li key={p.id} className="relative shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt="" className="h-16 w-12 rounded-md object-cover ring-1 ring-white/30" />
                  <button
                    type="button"
                    aria-label="Remove page"
                    onClick={() => removePage(p.id)}
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-white"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="grid grid-cols-3 items-center px-6">
            <div />
            <button
              type="button"
              onClick={handleCapture}
              aria-label="Capture page"
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-white/20 active:scale-95"
            >
              <Camera className="h-7 w-7 text-white" />
            </button>
            <div className="flex justify-end">
              {pages.length > 0 && (
                <Button onClick={handleDone} className="gap-1.5">
                  <Check className="h-4 w-4" />
                  Done
                </Button>
              )}
            </div>
          </div>
          <p className={cn("px-6 text-center text-xs text-white/50", pages.length > 0 && "sr-only")}>
            Capture each page one at a time — tap Done when you&apos;re finished.
          </p>
        </div>
      )}
    </div>
  );
}
