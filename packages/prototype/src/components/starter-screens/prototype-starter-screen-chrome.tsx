"use client";

import { ProtoLogoMark } from "@prototype/components/brand/proto-logo-mark";
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
          <ProtoLogoMark className={styles.footerBrandLogo} />
          <span className={styles.footerBrandName}>Proto</span>
        </Link>
      </div>
    </div>
  );
}
