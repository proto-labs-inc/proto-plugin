"use client";

import { PrototypeComponent } from "proto-plugin";
import { cn } from "@/lib/cn";
import { ArrowRight } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { useSyncExternalStore } from "react";

import {
  getIsMobileViewport,
  PartnerShapeCanvas,
  subscribeToMobileViewport,
} from "../partner-shape-canvas";
import { submitModalActionsClass } from "./invite-layout-classes";
import { SubmitModalCardTextureBackground } from "./submit-modal-card-texture-background";
import type { ProtoShapeSelection } from "./proto-shape-customizer-block";
import {
  getProtoColor,
  type ProtoColorId,
  type ProtoRgb,
} from "./proto-shape-content";
import {
  SUBMIT_MODAL_TITLE_BOLD_PREFIX,
  SUBMIT_MODAL_TITLE_SECOND_LINE,
} from "./submit-modal-content";

export type SubmitModalLayoutVariant =
  | "square-cap"
  | "square-cap-full-bleed"
  | "grey-title-top"
  | "poster-scrim"
  | "split-pane"
  | "orbit-halo"
  | "ticket-notch"
  | "glass-mesh";

const CANVAS_WHITE = "#ffffff";
const GREY_CARD_MAX_WIDTH = "18.5rem";
/** Portrait card — wider than golden ratio, less extreme profile. */
const GREY_CARD_ASPECT = "3 / 4";
/** Multiplies partner-page layout scale (~1.75 desktop); ~0.55 ≈ 55% of full fill. */
const SUBMIT_MODAL_SHAPE_SCALE = 0.55;
/** Mobile card shapes get extra room — keyed to viewport width, not prototype preview mode. */
const SUBMIT_MODAL_SHAPE_SCALE_MOBILE = 0.72;
const SUBMIT_MODAL_SHAPE_MARGIN = 4;
const GREY_CARD_SHELL_CLASS =
  "pointer-events-none mx-auto flex w-full max-w-[min(23rem,calc(100%-2rem))] flex-col gap-4";
const GREY_CARD_ACTIONS_CLASS = "mx-auto w-full max-w-[18.5rem] justify-center";

type SubmitModalLayoutProps = {
  selection: ProtoShapeSelection;
  title: string;
  onKeepEditing: () => void;
  onSeeOnHomepage: () => void;
  dragAttributionLabel?: string;
};

function mixRgb(from: ProtoRgb, to: ProtoRgb, amount: number): ProtoRgb {
  const t = Math.min(1, Math.max(0, amount));
  return [
    Math.round(from[0] + (to[0] - from[0]) * t),
    Math.round(from[1] + (to[1] - from[1]) * t),
    Math.round(from[2] + (to[2] - from[2]) * t),
  ];
}

const WHITE_RGB: ProtoRgb = [255, 255, 255];
const BLACK_RGB: ProtoRgb = [0, 0, 0];

function rgbCss(rgb: ProtoRgb): string {
  return `rgb(${rgb.join(", ")})`;
}

function getSubmitModalDeepAccent(rgb: ProtoRgb): string {
  return rgbCss(mixRgb(rgb, BLACK_RGB, 0.58));
}

function getSubmitModalMellowAccent(rgb: ProtoRgb): string {
  return rgbCss(mixRgb(rgb, WHITE_RGB, 0.86));
}

function getSubmitModalAccentButtonStyles(
  rgb: ProtoRgb,
  colorId: ProtoColorId,
) {
  return {
    background: rgbCss(rgb),
    hoverBackground: rgbCss(mixRgb(rgb, BLACK_RGB, 0.12)),
    text: colorId === "gold" || colorId === "pink" ? "#1a1a1a" : "#ffffff",
  };
}

const SUBMIT_MODAL_ACTION_BUTTON_CLASS =
  "group inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-3 text-[1rem] font-medium tracking-[-0.01em] transition-opacity hover:opacity-90 md:text-[0.875rem]";

export function SubmitModalActions({
  colorId,
  selection,
  onSeeOnHomepage,
  className,
  buttonClassName,
  backgroundVariant = "solid",
}: Pick<SubmitModalLayoutProps, "onSeeOnHomepage"> & {
  colorId: ProtoColorId;
  selection?: ProtoShapeSelection;
  backgroundVariant?: "solid" | "footer-texture";
  className?: string;
  buttonClassName?: string;
}) {
  const { rgb } = getProtoColor(colorId);
  const accentStyles = getSubmitModalAccentButtonStyles(rgb, colorId);
  const footerBackground = getSubmitModalMellowAccent(rgb);
  const footerTextColor = getSubmitModalDeepAccent(rgb);

  const buttonLabel = (
    <>
      <span>Publish your proto shape</span>
      <ArrowRight
        className="size-4 shrink-0 transition-transform duration-200 ease-out group-hover:translate-x-1"
        aria-hidden
      />
    </>
  );

  if (backgroundVariant === "footer-texture" && selection) {
    return (
      <PrototypeComponent id="submit-modal-layouts.submit-modal-actions">
        <div
          className={cn(
            "pointer-events-auto",
            submitModalActionsClass,
            className,
          )}
        >
        {/* Shadow on a non-clipping wrapper — see full-bleed card note; the
            inner texture layer keeps `overflow:hidden` for the rounded clip. */}
        <div className={cn("rounded-xl shadow-lg", buttonClassName)}>
          <SubmitModalCardTextureBackground
            selection={selection}
            backgroundColor={footerBackground}
            emanationRegion="footer"
            textureIntensity={0.45}
            className="overflow-hidden rounded-xl transition-opacity hover:opacity-90"
          >
            <button
              type="button"
              onClick={onSeeOnHomepage}
              className={SUBMIT_MODAL_ACTION_BUTTON_CLASS}
              style={{ color: footerTextColor, backgroundColor: "transparent" }}
            >
              {buttonLabel}
            </button>
          </SubmitModalCardTextureBackground>
        </div>
        </div>
      </PrototypeComponent>
    );
  }

  return (
    <PrototypeComponent id="submit-modal-layouts.submit-modal-actions">
      <div
        className={cn("pointer-events-auto", submitModalActionsClass, className)}
      >
      <button
        type="button"
        onClick={onSeeOnHomepage}
        style={
          {
            "--btn-bg": accentStyles.background,
            "--btn-bg-hover": accentStyles.hoverBackground,
            "--btn-text": accentStyles.text,
            backgroundColor: "var(--btn-bg)",
            color: "var(--btn-text)",
          } as CSSProperties
        }
        className={cn(
          SUBMIT_MODAL_ACTION_BUTTON_CLASS,
          "transition-colors hover:[background-color:var(--btn-bg-hover)] hover:opacity-100",
          buttonClassName,
        )}
      >
        {buttonLabel}
      </button>
      </div>
    </PrototypeComponent>
  );
}

function SubmitModalInviteAcceptedLabel({
  colorId,
  placement = "overlay",
}: {
  colorId: ProtoColorId;
  placement?: "overlay" | "above";
}) {
  const textColor =
    placement === "above"
      ? "#ffffff"
      : getSubmitModalDeepAccent(getProtoColor(colorId).rgb);

  return (
    <p
      className={cn(
        "pointer-events-none text-center tracking-[-0.02em] leading-[1.35]",
        placement === "overlay"
          ? "absolute inset-x-0 top-3 z-10 text-[1.25rem] font-medium md:text-[1.125rem]"
          : "text-[1.25rem] font-bold md:text-[1.375rem]",
      )}
      style={{ color: textColor }}
    >
      Shape Preview
    </p>
  );
}

function useMobileViewport() {
  return useSyncExternalStore(
    subscribeToMobileViewport,
    getIsMobileViewport,
    () => false,
  );
}

function ShapePreview({
  selection,
  className,
  canvasBackground = CANVAS_WHITE,
  shapeScale,
  transparentBackground = false,
  dragAttributionLabel,
}: {
  selection: ProtoShapeSelection;
  className?: string;
  canvasBackground?: string;
  shapeScale?: number;
  transparentBackground?: boolean;
  dragAttributionLabel?: string;
}) {
  const isMobileViewport = useMobileViewport();
  const resolvedShapeScale =
    shapeScale ??
    (isMobileViewport
      ? SUBMIT_MODAL_SHAPE_SCALE_MOBILE
      : SUBMIT_MODAL_SHAPE_SCALE);

  return (
    <PartnerShapeCanvas
      prototypeId="submit-shape-modal.partner-shape-canvas"
      shapeId={selection.shapeId}
      colorId={selection.colorId}
      textureId={selection.textureId}
      backgroundColor={canvasBackground}
      transparentBackground={transparentBackground}
      shapeScale={resolvedShapeScale}
      shapeMargin={SUBMIT_MODAL_SHAPE_MARGIN}
      dragAttributionLabel={dragAttributionLabel}
      embedded
    />
  );
}

function SubmitModalCardTitle({
  title,
  colorId,
  className,
  align = "left",
}: {
  title: string;
  colorId: ProtoColorId;
  className?: string;
  align?: "left" | "center";
}) {
  const usesDefaultTitle = title.startsWith(SUBMIT_MODAL_TITLE_BOLD_PREFIX);
  const secondLine = usesDefaultTitle
    ? SUBMIT_MODAL_TITLE_SECOND_LINE
    : title.slice(SUBMIT_MODAL_TITLE_BOLD_PREFIX.length).trim() || title;
  const textColor = getSubmitModalDeepAccent(getProtoColor(colorId).rgb);

  return (
    <h2
      className={cn(
        align === "center" ? "text-center" : "text-left",
        className,
      )}
      style={{ color: textColor }}
    >
      <span className="block font-bold">
        {usesDefaultTitle ? SUBMIT_MODAL_TITLE_BOLD_PREFIX : title}
      </span>
      {usesDefaultTitle ? <span className="block">{secondLine}</span> : null}
    </h2>
  );
}

function ShapeInsetFrame({
  selection,
  className,
}: {
  selection: ProtoShapeSelection;
  className?: string;
}) {
  const canvasBorder = getSubmitModalDeepAccent(
    getProtoColor(selection.colorId).rgb,
  );

  return (
    <div
      className={cn(
        "pointer-events-auto relative aspect-square w-full shrink-0 overflow-hidden rounded-[0.75rem] border bg-transparent",
        className,
      )}
      style={{ borderColor: canvasBorder }}
    >
      <SubmitModalInviteAcceptedLabel colorId={selection.colorId} />
      <ShapePreview selection={selection} transparentBackground />
    </div>
  );
}

function SquareCapLayout({
  selection,
  title,
  onKeepEditing,
  onSeeOnHomepage,
}: SubmitModalLayoutProps) {
  return (
    <div className={GREY_CARD_SHELL_CLASS}>
      <SubmitModalCardTextureBackground
        selection={selection}
        className="border-border mx-auto flex w-full flex-col rounded-[1rem] border p-3.5 shadow-lg"
        style={{
          aspectRatio: GREY_CARD_ASPECT,
          maxWidth: GREY_CARD_MAX_WIDTH,
        }}
      >
        <ShapeInsetFrame selection={selection} />
        <div className="mt-auto">
          <SubmitModalCardTitle
            title={title}
            colorId={selection.colorId}
            className="font-serif text-[1.625rem] leading-[1.08] tracking-[-0.025em]"
          />
        </div>
      </SubmitModalCardTextureBackground>
      <SubmitModalActions
        colorId={selection.colorId}
        onSeeOnHomepage={onSeeOnHomepage}
        className={GREY_CARD_ACTIONS_CLASS}
      />
    </div>
  );
}

function ShapeFullBleedFrame({
  selection,
  className,
  dragAttributionLabel,
}: {
  selection: ProtoShapeSelection;
  className?: string;
  dragAttributionLabel?: string;
}) {
  return (
    <div
      className={cn(
        "relative w-full shrink-0 overflow-hidden bg-transparent",
        className,
      )}
    >
      <ShapePreview
        selection={selection}
        transparentBackground
        dragAttributionLabel={dragAttributionLabel}
      />
    </div>
  );
}

function SquareCapFullBleedLayout({
  selection,
  onSeeOnHomepage,
  dragAttributionLabel,
}: SubmitModalLayoutProps) {
  return (
    <div className={GREY_CARD_SHELL_CLASS}>
      <SubmitModalInviteAcceptedLabel
        colorId={selection.colorId}
        placement="above"
      />
      {/* Shadow lives on this non-clipping wrapper. iOS Safari drops box-shadow
          on a rounded `overflow:hidden` element nested inside a transformed
          ancestor (the modal entrance), so the clip and the shadow must sit on
          separate elements. */}
      <div
        className="pointer-events-auto mx-auto w-full rounded-xl shadow-lg"
        style={{ maxWidth: GREY_CARD_MAX_WIDTH }}
      >
        <SubmitModalCardTextureBackground
          selection={selection}
          className="relative aspect-square w-full overflow-hidden rounded-xl"
        >
          <ShapeFullBleedFrame
            selection={selection}
            className="absolute inset-0"
            dragAttributionLabel={dragAttributionLabel}
          />
        </SubmitModalCardTextureBackground>
      </div>
      <SubmitModalActions
        colorId={selection.colorId}
        selection={selection}
        backgroundVariant="footer-texture"
        onSeeOnHomepage={onSeeOnHomepage}
        className={GREY_CARD_ACTIONS_CLASS}
      />
    </div>
  );
}

function GreyTitleTopLayout({
  selection,
  title,
  onKeepEditing,
  onSeeOnHomepage,
}: SubmitModalLayoutProps) {
  return (
    <div className={GREY_CARD_SHELL_CLASS}>
      <SubmitModalCardTextureBackground
        selection={selection}
        className="border-border mx-auto flex w-full flex-col rounded-[1rem] border p-3.5 shadow-lg"
        style={{
          aspectRatio: GREY_CARD_ASPECT,
          maxWidth: GREY_CARD_MAX_WIDTH,
        }}
      >
        <SubmitModalCardTitle
          title={title}
          colorId={selection.colorId}
          align="center"
          className="font-serif shrink-0 text-[1.3125rem] leading-[1.12] tracking-[-0.02em]"
        />
        <div className="mt-3 flex min-h-0 flex-1 items-start">
          <ShapeInsetFrame selection={selection} />
        </div>
      </SubmitModalCardTextureBackground>
      <SubmitModalActions
        colorId={selection.colorId}
        onSeeOnHomepage={onSeeOnHomepage}
        className={GREY_CARD_ACTIONS_CLASS}
      />
    </div>
  );
}

function PosterScrimLayout({
  selection,
  title,
  onKeepEditing,
  onSeeOnHomepage,
}: SubmitModalLayoutProps) {
  return (
    <div className="flex flex-col gap-4">
      <div
        className="overflow-hidden rounded-[1.35rem] p-1 shadow-2xl"
        style={{
          background:
            "radial-gradient(120% 80% at 20% 0%, #6366f1 0%, #312e81 45%, #0f0a2e 100%)",
        }}
      >
        <div className="relative h-[min(58vw,18rem)] min-h-[13rem] overflow-hidden rounded-[1.15rem]">
          <ShapePreview selection={selection} />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%]"
            style={{
              background:
                "linear-gradient(to top, rgba(8, 6, 24, 0.92) 0%, rgba(8, 6, 24, 0.55) 45%, transparent 100%)",
            }}
          />
          <div className="absolute inset-x-0 bottom-0 px-5 pb-5">
            <p className="mb-1 text-[0.6875rem] font-medium tracking-[0.22em] text-indigo-200/80 uppercase">
              Ready to share
            </p>
            <h2 className="font-serif text-[1.5rem] leading-[1.05] tracking-[-0.03em] text-white">
              {title}
            </h2>
          </div>
        </div>
      </div>
      <SubmitModalActions
        colorId={selection.colorId}
        onSeeOnHomepage={onSeeOnHomepage}
      />
    </div>
  );
}

function SplitPaneLayout({
  selection,
  title,
  onKeepEditing,
  onSeeOnHomepage,
}: SubmitModalLayoutProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="border-border flex overflow-hidden rounded-2xl border shadow-lg">
        <div
          className="relative flex w-[38%] shrink-0 flex-col justify-between px-3 py-4"
          style={{
            background:
              "linear-gradient(165deg, #ff6b4a 0%, #e11d48 55%, #881337 100%)",
          }}
        >
          <svg
            className="absolute inset-0 h-full w-full opacity-30"
            viewBox="0 0 120 280"
            preserveAspectRatio="none"
            aria-hidden
          >
            {Array.from({ length: 6 }, (_, index) => (
              <circle
                key={index}
                cx={20 + index * 18}
                cy={40 + index * 36}
                r={28 + (index % 2) * 8}
                fill="rgba(255,255,255,0.12)"
              />
            ))}
          </svg>
          <span className="relative text-[0.625rem] font-semibold tracking-[0.2em] text-white/70 uppercase">
            Proto
          </span>
          <h2
            className="relative font-serif text-[1.125rem] leading-[1.1] tracking-[-0.02em] text-white"
            style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
          >
            {title}
          </h2>
        </div>
        <div className="bg-background relative min-h-[13rem] flex-1">
          <div className="relative h-full min-h-[13rem] touch-none">
            <ShapePreview selection={selection} />
          </div>
        </div>
      </div>
      <SubmitModalActions
        colorId={selection.colorId}
        onSeeOnHomepage={onSeeOnHomepage}
      />
    </div>
  );
}

function OrbitHaloLayout({
  selection,
  title,
  onKeepEditing,
  onSeeOnHomepage,
}: SubmitModalLayoutProps) {
  return (
    <div className="flex flex-col gap-4">
      <div
        className="relative overflow-hidden rounded-2xl px-5 pt-6 pb-5 shadow-xl"
        style={{
          background:
            "radial-gradient(circle at 50% 120%, #1e3a5f 0%, #0b1220 55%, #020617 100%)",
        }}
      >
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 320 320"
          aria-hidden
        >
          {[72, 104, 136].map((radius, index) => (
            <circle
              key={radius}
              cx="160"
              cy="168"
              r={radius}
              fill="none"
              stroke="rgba(96,165,250,0.18)"
              strokeWidth={index === 1 ? 1.5 : 1}
              strokeDasharray={index === 0 ? "4 6" : undefined}
            />
          ))}
        </svg>
        <div className="relative mb-4 text-center">
          <p className="mb-1 font-mono text-[0.625rem] tracking-[0.28em] text-sky-300/70 uppercase">
            Submission preview
          </p>
          <h2 className="font-serif text-[1.25rem] leading-[1.15] tracking-[-0.02em] text-sky-50">
            {title}
          </h2>
        </div>
        <div className="relative mx-auto h-[min(48vw,14rem)] w-[min(48vw,14rem)] min-h-[11rem] min-w-[11rem]">
          <div
            className="absolute inset-[-8%] rounded-full blur-xl"
            style={{
              background:
                "radial-gradient(circle, rgba(56,189,248,0.35) 0%, transparent 70%)",
            }}
          />
          <div className="border border-sky-400/25 bg-slate-950/40 relative h-full overflow-hidden rounded-full shadow-[0_0_40px_rgba(56,189,248,0.15)]">
            <ShapePreview selection={selection} />
          </div>
        </div>
      </div>
      <SubmitModalActions
        colorId={selection.colorId}
        onSeeOnHomepage={onSeeOnHomepage}
      />
    </div>
  );
}

function TicketNotchLayout({
  selection,
  title,
  onKeepEditing,
  onSeeOnHomepage,
}: SubmitModalLayoutProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-2xl shadow-lg">
        <div
          className="relative px-5 py-4"
          style={{
            background: "linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%)",
          }}
        >
          <svg
            className="absolute inset-0 h-full w-full opacity-25"
            viewBox="0 0 320 80"
            preserveAspectRatio="none"
            aria-hidden
          >
            {Array.from({ length: 12 }, (_, index) => (
              <rect
                key={index}
                x={8 + index * 26}
                y={12 + (index % 2) * 8}
                width={14}
                height={14}
                fill="#78350f"
                opacity={0.35 + (index % 3) * 0.1}
                transform={`rotate(${(index % 2) * 12} ${15 + index * 26} ${19 + (index % 2) * 8})`}
              />
            ))}
          </svg>
          <h2 className="relative font-serif text-[1.25rem] leading-[1.1] tracking-[-0.02em] text-[#422006]">
            {title}
          </h2>
          <p className="relative mt-1 text-[0.75rem] font-medium text-[#78350f]/80">
            One-time preview ticket
          </p>
        </div>
        <div
          className="relative h-3"
          style={{ background: "#fef3c7" }}
          aria-hidden
        >
          <svg
            className="absolute inset-x-0 top-0 h-full w-full"
            viewBox="0 0 320 12"
            preserveAspectRatio="none"
          >
            <path
              d="M0 6 H320"
              stroke="#d97706"
              strokeWidth="1"
              strokeDasharray="6 5"
            />
            {Array.from({ length: 9 }, (_, index) => (
              <circle
                key={index}
                cx={18 + index * 36}
                cy={6}
                r={5}
                fill="#fef3c7"
                stroke="#d97706"
                strokeWidth="1"
              />
            ))}
          </svg>
        </div>
        <div
          className="relative h-[min(48vw,14rem)] min-h-[11rem] touch-none"
          style={{ background: "#fffbeb" }}
        >
          <ShapePreview selection={selection} />
        </div>
      </div>
      <SubmitModalActions
        colorId={selection.colorId}
        onSeeOnHomepage={onSeeOnHomepage}
      />
    </div>
  );
}

function GlassMeshLayout({
  selection,
  title,
  onKeepEditing,
  onSeeOnHomepage,
}: SubmitModalLayoutProps) {
  return (
    <div className="flex flex-col gap-4">
      <div
        className="rounded-[1.35rem] p-3"
        style={{
          background:
            "conic-gradient(from 210deg at 30% 20%, #fda4af, #c4b5fd, #67e8f9, #fde68a, #fda4af)",
        }}
      >
        <div className="border border-white/40 bg-white/55 relative overflow-hidden rounded-[1rem] shadow-[0_8px_32px_rgba(15,23,42,0.12)] backdrop-blur-xl">
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <span className="rounded-full border border-white/60 bg-white/70 px-2.5 py-1 text-[0.625rem] font-semibold tracking-[0.16em] text-slate-700 uppercase">
              Submit
            </span>
            <h2 className="font-serif text-[1.125rem] leading-[1.1] tracking-[-0.02em] text-slate-900">
              {title}
            </h2>
          </div>
          <div className="relative mx-3 mb-3 h-[min(50vw,15rem)] min-h-[11.5rem] overflow-hidden rounded-xl border border-white/50 bg-white/30">
            <ShapePreview selection={selection} />
          </div>
        </div>
      </div>
      <SubmitModalActions
        colorId={selection.colorId}
        onSeeOnHomepage={onSeeOnHomepage}
      />
    </div>
  );
}

const LAYOUT_RENDERERS: Record<
  SubmitModalLayoutVariant,
  (props: SubmitModalLayoutProps) => ReactNode
> = {
  "square-cap": SquareCapLayout,
  "square-cap-full-bleed": SquareCapFullBleedLayout,
  "grey-title-top": GreyTitleTopLayout,
  "poster-scrim": PosterScrimLayout,
  "split-pane": SplitPaneLayout,
  "orbit-halo": OrbitHaloLayout,
  "ticket-notch": TicketNotchLayout,
  "glass-mesh": GlassMeshLayout,
};

export function isSubmitModalLayoutVariant(
  variant: string,
): variant is SubmitModalLayoutVariant {
  return variant in LAYOUT_RENDERERS;
}

export function renderSubmitModalLayout(
  variant: SubmitModalLayoutVariant,
  props: SubmitModalLayoutProps,
) {
  const Renderer = LAYOUT_RENDERERS[variant];
  return <Renderer {...props} />;
}
