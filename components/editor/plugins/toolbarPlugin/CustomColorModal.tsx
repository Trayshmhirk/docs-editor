"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CustomColorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectColor: (hexColor: string) => void;
  initialColor?: string;
}

// Utility: Convert HEX to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let cleaned = hex.replace(/^#/, "");
  if (cleaned.length === 3) {
    cleaned = cleaned
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const num = parseInt(cleaned, 16);
  if (isNaN(num) || cleaned.length !== 6) {
    return { r: 0, g: 0, b: 0 };
  }
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

// Utility: Convert RGB to HEX
function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (val: number) => Math.max(0, Math.min(255, Math.round(val)));
  return (
    "#" +
    [clamp(r), clamp(g), clamp(b)]
      .map((x) => x.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

// Utility: Convert RGB to HSV
function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (max !== min) {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return { h: h * 360, s, v };
}

// Utility: Convert HSV to RGB
function hsvToRgb(h: number, s: number, v: number): { r: number; g: number; b: number } {
  h = (h % 360) / 60;
  if (h < 0) h += 6;
  const i = Math.floor(h);
  const f = h - i;
  const p = v * (1 - s);
  const q = v * (1 - s * f);
  const t = v * (1 - s * (1 - f));

  let r = 0,
    g = 0,
    b = 0;
  switch (i) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    case 5:
      r = v;
      g = p;
      b = q;
      break;
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

export default function CustomColorModal({
  isOpen,
  onClose,
  onSelectColor,
  initialColor = "#000000",
}: CustomColorModalProps): React.JSX.Element | null {
  const initialRgb = hexToRgb(initialColor);
  const initialHsv = rgbToHsv(initialRgb.r, initialRgb.g, initialRgb.b);

  const [hue, setHue] = useState<number>(initialHsv.h);
  const [saturation, setSaturation] = useState<number>(initialHsv.s);
  const [value, setValue] = useState<number>(initialHsv.v);

  const [hexInput, setHexInput] = useState<string>(initialColor);
  const [rgbState, setRgbState] = useState<{ r: number; g: number; b: number }>(initialRgb);

  const satValRef = useRef<HTMLDivElement>(null);
  const isDraggingSatVal = useRef(false);
  const isDraggingHue = useRef(false);

  // Sync inputs when HSV changes
  const updateFromHsv = useCallback((h: number, s: number, v: number) => {
    const rgb = hsvToRgb(h, s, v);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    setHue(h);
    setSaturation(s);
    setValue(v);
    setRgbState(rgb);
    setHexInput(hex);
  }, []);

  // Initialize on open
  useEffect(() => {
    if (isOpen) {
      const rgb = hexToRgb(initialColor);
      const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
      setHue(hsv.h);
      setSaturation(hsv.s);
      setValue(hsv.v);
      setRgbState(rgb);
      setHexInput(initialColor.startsWith("#") ? initialColor : `#${initialColor}`);
    }
  }, [isOpen, initialColor]);

  // Handle saturation/value canvas drag
  const handleSatValPointer = useCallback(
    (e: React.PointerEvent | PointerEvent) => {
      if (!satValRef.current) return;
      const rect = satValRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
      const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

      const s = x / rect.width;
      const v = 1 - y / rect.height;
      updateFromHsv(hue, s, v);
    },
    [hue, updateFromHsv],
  );

  // Handle hue slider drag
  const handleHuePointer = useCallback(
    (e: React.PointerEvent | PointerEvent, sliderElem: HTMLElement) => {
      const rect = sliderElem.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
      const h = (x / rect.width) * 360;
      updateFromHsv(h, saturation, value);
    },
    [saturation, value, updateFromHsv],
  );

  // Global mouseup / pointermove listeners for smooth dragging
  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      if (isDraggingSatVal.current) {
        handleSatValPointer(e);
      }
    };
    const onPointerUp = () => {
      isDraggingSatVal.current = false;
      isDraggingHue.current = false;
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [handleSatValPointer]);

  // Handle HEX input change
  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (!val.startsWith("#")) val = "#" + val;
    setHexInput(val);
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      const rgb = hexToRgb(val);
      const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
      setHue(hsv.h);
      setSaturation(hsv.s);
      setValue(hsv.v);
      setRgbState(rgb);
    }
  };

  // Handle RGB input changes
  const handleRgbChange = (channel: "r" | "g" | "b", val: number) => {
    const clamped = isNaN(val) ? 0 : Math.max(0, Math.min(255, val));
    const newRgb = { ...rgbState, [channel]: clamped };
    const hsv = rgbToHsv(newRgb.r, newRgb.g, newRgb.b);
    const hex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    setRgbState(newRgb);
    setHue(hsv.h);
    setSaturation(hsv.s);
    setValue(hsv.v);
    setHexInput(hex);
  };

  const handleConfirm = () => {
    onSelectColor(hexInput);
    onClose();
  };

  if (!isOpen) return null;

  // Background color of the saturation canvas at 100% saturation and 100% value for the current hue
  const pureHueRgb = hsvToRgb(hue, 1, 1);
  const pureHueHex = rgbToHex(pureHueRgb.r, pureHueRgb.g, pureHueRgb.b);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs">
      <div className="border-border bg-surface text-foreground animate-in fade-in zoom-in-95 relative w-full max-w-sm rounded-xl border p-5 shadow-2xl duration-150">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Custom Color</h3>
          <button
            type="button"
            onClick={onClose}
            className="hover:bg-muted text-muted-foreground hover:text-foreground rounded-md p-1 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* 2D Saturation / Value Gradient Canvas */}
        <div
          ref={satValRef}
          onPointerDown={(e) => {
            isDraggingSatVal.current = true;
            handleSatValPointer(e);
          }}
          className="relative h-44 w-full cursor-crosshair rounded-lg select-none"
          style={{
            backgroundColor: pureHueHex,
            backgroundImage: `linear-gradient(to right, #fff, transparent), linear-gradient(to top, #000, transparent)`,
          }}
        >
          {/* Draggable Circle Handle */}
          <div
            className="pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md ring-1 ring-black/40"
            style={{
              left: `${saturation * 100}%`,
              top: `${(1 - value) * 100}%`,
              backgroundColor: hexInput,
            }}
          />
        </div>

        {/* Hue Slider */}
        <div className="mt-4">
          <div
            onPointerDown={(e) => {
              isDraggingHue.current = true;
              handleHuePointer(e, e.currentTarget);
            }}
            className="relative h-4 w-full cursor-pointer rounded-full select-none"
            style={{
              backgroundImage:
                "linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)",
            }}
          >
            <div
              className="pointer-events-none absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md ring-1 ring-black/40"
              style={{
                left: `${(hue / 360) * 100}%`,
                backgroundColor: pureHueHex,
              }}
            />
          </div>
        </div>

        {/* Swatch & Numerical Inputs */}
        <div className="mt-4 flex items-center gap-3">
          {/* Live Swatch Preview */}
          <div
            className="border-border size-10 shrink-0 rounded-lg border shadow-inner"
            style={{ backgroundColor: hexInput }}
          />

          {/* Hex Input */}
          <div className="flex-1">
            <label className="text-muted-foreground block text-[10px] font-medium uppercase">
              Hex
            </label>
            <input
              type="text"
              value={hexInput}
              onChange={handleHexChange}
              maxLength={7}
              className="border-border bg-surface-canvas text-foreground mt-0.5 w-full rounded-md border px-2 py-1 font-mono text-xs uppercase outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* RGB Inputs */}
          <div className="flex gap-1.5">
            <div>
              <label className="text-muted-foreground block text-[10px] font-medium">R</label>
              <input
                type="number"
                min={0}
                max={255}
                value={rgbState.r}
                onChange={(e) => handleRgbChange("r", parseInt(e.target.value, 10))}
                className="border-border bg-surface-canvas text-foreground mt-0.5 w-11 rounded-md border px-1 py-1 text-center font-mono text-xs outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-muted-foreground block text-[10px] font-medium">G</label>
              <input
                type="number"
                min={0}
                max={255}
                value={rgbState.g}
                onChange={(e) => handleRgbChange("g", parseInt(e.target.value, 10))}
                className="border-border bg-surface-canvas text-foreground mt-0.5 w-11 rounded-md border px-1 py-1 text-center font-mono text-xs outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-muted-foreground block text-[10px] font-medium">B</label>
              <input
                type="number"
                min={0}
                max={255}
                value={rgbState.b}
                onChange={(e) => handleRgbChange("b", parseInt(e.target.value, 10))}
                className="border-border bg-surface-canvas text-foreground mt-0.5 w-11 rounded-md border px-1 py-1 text-center font-mono text-xs outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="border-border mt-5 flex items-center justify-end gap-2 border-t pt-3">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleConfirm}
            className="bg-blue-600 text-xs text-white hover:bg-blue-700"
          >
            OK
          </Button>
        </div>
      </div>
    </div>
  );
}
