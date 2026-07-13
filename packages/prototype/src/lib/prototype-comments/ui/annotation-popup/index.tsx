"use client";

import { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
import styles from "./styles.module.scss";
import { originalSetTimeout } from "../../core/freeze-animations";
import { IconTrash } from "../icons";

// =============================================================================
// Helpers
// =============================================================================

/** Focus an element while temporarily blocking focus-trap libraries (e.g. Radix
 *  FocusScope) from reclaiming focus via focusin/focusout handlers. */
function focusBypassingTraps(el: HTMLElement | null) {
  if (!el) return;
  const trap = (e: Event) => e.stopImmediatePropagation();
  document.addEventListener("focusin", trap, true);
  document.addEventListener("focusout", trap, true);
  try {
    el.focus();
  } finally {
    document.removeEventListener("focusin", trap, true);
    document.removeEventListener("focusout", trap, true);
  }
}

// =============================================================================
// Types
// =============================================================================

export interface AnnotationPopupCSSProps {
  /** Element name to display in header */
  element: string;
  /** Optional timestamp display (e.g., "@ 1.23s" for animation feedback) */
  timestamp?: string;
  /** Optional selected/highlighted text */
  selectedText?: string;
  /** Placeholder text for the textarea */
  placeholder?: string;
  /** Initial value for textarea (for edit mode) */
  initialValue?: string;
  /** Label for submit button (default: "Add") */
  submitLabel?: string;
  /** Called when annotation is submitted with text */
  onSubmit: (text: string) => void;
  /** Called when popup is cancelled/dismissed */
  onCancel: () => void;
  /** Called when delete button is clicked (only shown if provided) */
  onDelete?: () => void;
  /** Read-only preview mode — shows comment text with a single Close button */
  readOnly?: boolean;
  /** Position styles (left, top) */
  style?: React.CSSProperties;
  /** Custom color for submit button and textarea focus (hex) */
  accentColor?: string;
  /** External exit state (parent controls exit animation) */
  isExiting?: boolean;
  /** Light mode styling */
  lightMode?: boolean;
  /** Show the element/component path header (default: true) */
  showElementPath?: boolean;
  /** Computed styles for the selected element */
  computedStyles?: Record<string, string>;
}

export interface AnnotationPopupCSSHandle {
  /** Shake the popup (e.g., when user clicks outside) */
  shake: () => void;
}

// =============================================================================
// Component
// =============================================================================

export const AnnotationPopupCSS = forwardRef<AnnotationPopupCSSHandle, AnnotationPopupCSSProps>(
  
  function AnnotationPopupCSS(
    {
      element,
      timestamp,
      selectedText,
      placeholder = "Add a comment...",
      initialValue = "",
      submitLabel = "Add",
      onSubmit,
      onCancel,
      onDelete,
      readOnly = false,
      style,
      accentColor = "#3c82f7",
      isExiting = false,
      lightMode = false,
      showElementPath = true,
      computedStyles,
    },
    ref
  ) {
    const [text, setText] = useState(initialValue);
    const [isShaking, setIsShaking] = useState(false);

    useEffect(() => {
      setText(initialValue);
    }, [initialValue]);
    const [animState, setAnimState] = useState<"initial" | "enter" | "entered" | "exit">("initial");
    const [isFocused, setIsFocused] = useState(false);
    const [isStylesExpanded, setIsStylesExpanded] = useState(false); // Computed styles accordion state
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const popupRef = useRef<HTMLDivElement>(null);
    const cancelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const shakeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Sync with parent exit state
    useEffect(() => {
      if (isExiting && animState !== "exit") {
        setAnimState("exit");
      }
    }, [isExiting, animState]);

    // Animate in on mount and focus textarea
    useEffect(() => {
      // Start enter animation (use originalSetTimeout to bypass freeze patch)
      originalSetTimeout(() => {
        setAnimState("enter");
      }, 0);
      // Transition to entered state after animation completes
      const enterTimer = originalSetTimeout(() => {
        setAnimState("entered");
      }, 200); // Match animation duration
      const focusTimer = originalSetTimeout(() => {
        if (readOnly) return;
        const textarea = textareaRef.current;
        if (textarea) {
          focusBypassingTraps(textarea);
          textarea.selectionStart = textarea.selectionEnd = textarea.value.length;
          textarea.scrollTop = textarea.scrollHeight;
        }
      }, 50);
      return () => {
        clearTimeout(enterTimer);
        clearTimeout(focusTimer);
        if (cancelTimerRef.current) clearTimeout(cancelTimerRef.current);
        if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
      };
    }, [readOnly]);

    // Shake animation
    const shake = useCallback(() => {
      if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
      setIsShaking(true);
      shakeTimerRef.current = originalSetTimeout(() => {
        setIsShaking(false);
        focusBypassingTraps(textareaRef.current);
      }, 250);
    }, []);

    // Expose shake to parent via ref
    useImperativeHandle(ref, () => ({
      shake,
    }), [shake]);

    // Handle cancel with exit animation
    const handleCancel = useCallback(() => {
      setAnimState("exit");
      cancelTimerRef.current = originalSetTimeout(() => {
        onCancel();
      }, 150); // Match exit animation duration
    }, [onCancel]);

    // Handle submit
    const handleSubmit = useCallback(() => {
      if (!text.trim()) return;
      onSubmit(text.trim());
    }, [text, onSubmit]);

    // Handle keyboard
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        e.stopPropagation();
        if (e.nativeEvent.isComposing) return;
        if (!readOnly && e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          handleSubmit();
        }
        if (e.key === "Escape") {
          handleCancel();
        }
      },
      [readOnly, handleSubmit, handleCancel]
    );

    const popupClassName = [
      styles.popup,
      lightMode ? styles.light : "",
      animState === "enter" ? styles.enter : "",
      animState === "entered" ? styles.entered : "",
      animState === "exit" ? styles.exit : "",
      isShaking ? styles.shake : "",
    ].filter(Boolean).join(" ");

    return (
      <div
        ref={popupRef}
        className={popupClassName}
        data-annotation-popup
        style={style}
        onClick={(e) => e.stopPropagation()}
      >
        {!readOnly && showElementPath && (
          <>
            <div className={styles.header}>
              {computedStyles && Object.keys(computedStyles).length > 0 ? (
                <button
                  className={styles.headerToggle}
                  onClick={() => {
                    const wasExpanded = isStylesExpanded;
                    setIsStylesExpanded(!isStylesExpanded);
                    if (wasExpanded) {
                      // Refocus textarea when closing
                      originalSetTimeout(() => focusBypassingTraps(textareaRef.current), 0);
                    }
                  }}
                  type="button"
                >
                  <svg
                    className={`${styles.chevron} ${isStylesExpanded ? styles.expanded : ""}`}
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5.5 10.25L9 7.25L5.75 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className={styles.element}>{element}</span>
                </button>
              ) : (
                <span className={styles.element}>{element}</span>
              )}
              {timestamp && <span className={styles.timestamp}>{timestamp}</span>}
            </div>

            {/* Collapsible computed styles section - uses grid-template-rows for smooth animation */}
            {computedStyles && Object.keys(computedStyles).length > 0 && (
              <div className={`${styles.stylesWrapper} ${isStylesExpanded ? styles.expanded : ""}`}>
                <div className={styles.stylesInner}>
                  <div className={styles.stylesBlock}>
                    {Object.entries(computedStyles).map(([key, value]) => (
                      <div key={key} className={styles.styleLine}>
                        <span className={styles.styleProperty}>
                          {key.replace(/([A-Z])/g, "-$1").toLowerCase()}
                        </span>
                        : <span className={styles.styleValue}>{value}</span>;
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {selectedText && (
          <div className={styles.quote}>
            &ldquo;{selectedText.slice(0, 80)}
            {selectedText.length > 80 ? "..." : ""}&rdquo;
          </div>
        )}

        {readOnly ? (
          <p className={styles.commentText}>{text}</p>
        ) : (
          <textarea
            ref={textareaRef}
            className={styles.textarea}
            style={{ borderColor: isFocused ? accentColor : undefined }}
            placeholder={placeholder}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            rows={2}
            onKeyDown={handleKeyDown}
          />
        )}

        <div className={styles.actions}>
          {readOnly ? (
            <button className={styles.cancel} onClick={handleCancel} type="button">
              Close
            </button>
          ) : (
            <>
              {onDelete && (
                <div className={styles.deleteWrapper}>
                  <button className={styles.deleteButton} onClick={onDelete} type="button">
                    <IconTrash size={22} />
                  </button>
                </div>
              )}
              <button className={styles.cancel} onClick={handleCancel} type="button">
                Cancel
              </button>
              <button
                className={styles.submit}
                style={
                  lightMode
                    ? {
                        color: text.trim() ? accentColor : undefined,
                        opacity: text.trim() ? 1 : 0.4,
                      }
                    : {
                        backgroundColor: accentColor,
                        opacity: text.trim() ? 1 : 0.4,
                      }
                }
                onClick={handleSubmit}
                disabled={!text.trim()}
                type="button"
              >
                {submitLabel}
              </button>
            </>
          )}
        </div>
      </div>
    );
  }
);

export default AnnotationPopupCSS;
