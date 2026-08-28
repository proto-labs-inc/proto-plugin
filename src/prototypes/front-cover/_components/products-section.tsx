import { Check } from "lucide-react";
import { PrototypeComponent } from "proto-plugin";
import { cn } from "ui";

import { PRODUCT_CARDS } from "./front-cover-mock-data";
import { ProductIcon } from "./product-icon";
import { ProductVisual } from "./product-visuals";

export function ProductsSection() {
  return (
    <PrototypeComponent id="products-section" className="relative">
      <div className="section-container grid grid-cols-1 gap-4 pt-0 sm:grid-cols-2 md:grid-cols-12 md:gap-4 xl:gap-3 2xl:gap-6">
        {PRODUCT_CARDS.map((card) => (
          <PrototypeComponent
            key={card.id}
            id={`products-section.${card.id}`}
            className={cn(
              "group relative flex h-auto w-full flex-col sm:h-[400px]",
              card.span === "wide"
                ? "col-span-6 md:col-span-12 xl:col-span-6"
                : "col-span-6 xl:col-span-3",
            )}
          >
            <div className="relative flex h-full w-full flex-1 flex-row items-start justify-between gap-4 overflow-hidden rounded-xl border border-border bg-surface-75 p-4 text-foreground-lighter sm:flex-col sm:items-center sm:py-6 lg:items-start">
              <div
                className={cn(
                  "relative z-10 flex h-full w-full flex-col items-start gap-2 text-left sm:items-center sm:gap-4 sm:text-center lg:items-start lg:text-left",
                  card.id === "database" && "md:max-w-[250px] md:items-start md:text-left",
                )}
              >
                <div className="flex items-center gap-2 text-foreground">
                  <ProductIcon path={card.icon} />
                  <h2>{card.title}</h2>
                </div>
                <p className="text-sm">{card.subtitle}</p>
                {"highlights" in card && card.highlights ? (
                  <ul className="hidden flex-col gap-1 text-sm text-foreground lg:flex">
                    {card.highlights.map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <Check className="inline h-4 w-4" />
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
              <ProductVisual visual={card.visual} />
            </div>
          </PrototypeComponent>
        ))}
        <p className="col-span-full tracking-[-.01rem] text-xl text-foreground-lighter sm:text-2xl">
          <span className="text-foreground">Use one or all.</span> Best of breed products. Integrated
          as a platform.
        </p>
      </div>
    </PrototypeComponent>
  );
}
