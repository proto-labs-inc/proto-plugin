"use client";

import Link from "next/link";

import styles from "../prototypes/prototype-review-chrome.module.scss";

export function PrototypeStarterScreenChrome() {
  return (
    <div
      data-prototype-root
      data-prototype-review-trigger
      className={styles.footerRoot}
    >
      <div className={styles.footerBar}>
        <Link
          href="/starter-screens"
          className={styles.footerBrand}
          aria-label="Back to starter screens"
        >
          <img
            src="/proto-logo.png"
            alt=""
            width={14}
            height={14}
            className={styles.footerBrandLogo}
          />
          <span className={styles.footerBrandName}>Proto</span>
        </Link>
      </div>
    </div>
  );
}
