"use client";

import Image from "next/image";
import Link from "next/link";

import type { PrototypeMetadata } from "@prototype/lib/prototypes/prototype-config-types";
import { screenshotSrc } from "@prototype/lib/prototypes/screenshot-src";
import { cn } from "@prototype/lib/utils";

type PrototypeGalleryClientProps = {
  prototypes: PrototypeMetadata[];
  screenshotVersions: Record<string, number>;
};

export function PrototypeGalleryClient({
  prototypes,
  screenshotVersions,
}: PrototypeGalleryClientProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {prototypes.map((prototype) => (
        <Link
          key={prototype.slug}
          href={`/prototypes/${prototype.slug}`}
          className="group"
        >
          <div
            className={cn(
              "rounded-xl",
              "shadow-[0_1px_3px_0_rgb(0_0_0/0.06)]",
              "translate-y-0 transition-[translate,box-shadow] duration-300 ease-out will-change-[translate]",
              "group-hover:-translate-y-1 group-hover:shadow-[0_4px_12px_-4px_rgb(0_0_0/0.10)]",
            )}
          >
            <div className="border-border bg-background relative aspect-video overflow-hidden rounded-xl border">
              <Image
                src={screenshotSrc(
                  prototype.screenshot,
                  screenshotVersions[prototype.slug],
                )}
                alt={prototype.title}
                width={1600}
                height={900}
                quality={90}
                sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                className="h-full w-full object-cover object-top"
              />
            </div>
          </div>
          <p className="text-sm text-muted-foreground group-hover:text-foreground mt-2 transition-colors duration-300 ease-out">
            {prototype.title}
          </p>
        </Link>
      ))}
    </div>
  );
}
