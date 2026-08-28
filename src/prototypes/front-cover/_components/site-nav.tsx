import { ChevronDown, Github, Menu, X } from "lucide-react";
import { PrototypeComponent } from "proto-plugin";
import { Button, cn } from "ui";

import {
  DEVELOPER_NAV_ITEMS,
  DEVELOPER_RESOURCE_ITEMS,
  GITHUB_STAR_LABEL,
  PRODUCT_MODULE_NAV_ITEMS,
  PRODUCT_NAV_ITEMS,
  SOLUTION_NAV_ITEMS,
} from "./front-cover-mock-data";
import type { FrontCoverNavMenu } from "./front-cover-types";
import { ProductIcon } from "./product-icon";
import { SupabaseWordmark } from "./supabase-wordmark";

type SiteNavProps = {
  navMenu: FrontCoverNavMenu;
  onNavMenuChange: (menu: FrontCoverNavMenu) => void;
};

const PRIMARY_LINKS = [
  { id: "product" as const, label: "Product" },
  { id: "developers" as const, label: "Developers" },
  { id: "solutions" as const, label: "Solutions" },
];

function MenuRow({
  title,
  description,
  icon,
}: {
  title: string;
  description?: string;
  icon?: string;
}) {
  return (
    <div className="flex items-start gap-2 text-foreground-light">
      {icon ? (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-background">
          <ProductIcon path={icon} />
        </div>
      ) : null}
      <div className="flex flex-col">
        <span className="text-sm text-foreground">{title}</span>
        {description ? (
          <span className="text-xs leading-snug text-foreground-lighter">{description}</span>
        ) : null}
      </div>
    </div>
  );
}

function ProductMenu() {
  return (
    <PrototypeComponent
      id="site-nav.product-menu"
      className="absolute left-0 top-full z-30 mt-px w-[min(720px,calc(100vw-2rem))] rounded-xl border border-border bg-background p-6 shadow-lg"
    >
      <div className="flex flex-col gap-6 xl:flex-row">
        <ul className="flex w-full flex-col gap-4 xl:w-[250px]">
          {PRODUCT_NAV_ITEMS.map((item) => (
            <li key={item.title}>
              <MenuRow {...item} />
            </li>
          ))}
        </ul>
        <div className="flex flex-1 flex-col gap-4">
          <p className="font-mono text-xs uppercase tracking-widest text-foreground-lighter">
            Modules
          </p>
          <ul className="flex flex-col gap-4">
            {PRODUCT_MODULE_NAV_ITEMS.map((item) => (
              <li key={item.title}>
                <MenuRow {...item} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </PrototypeComponent>
  );
}

function DevelopersMenu() {
  return (
    <PrototypeComponent
      id="site-nav.developers-menu"
      className="absolute left-0 top-full z-30 mt-px w-[min(560px,calc(100vw-2rem))] rounded-xl border border-border bg-background p-6 shadow-lg"
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-3">
          <p className="text-xs uppercase tracking-widest text-foreground-lighter">Developers</p>
          {DEVELOPER_NAV_ITEMS.map((item) => (
            <MenuRow key={item.title} {...item} />
          ))}
        </div>
        <div className="flex flex-col gap-3">
          <p className="text-xs uppercase tracking-widest text-foreground-lighter">Resources</p>
          {DEVELOPER_RESOURCE_ITEMS.map((item) => (
            <MenuRow key={item.title} {...item} />
          ))}
        </div>
      </div>
    </PrototypeComponent>
  );
}

function SolutionsMenu() {
  return (
    <PrototypeComponent
      id="site-nav.solutions-menu"
      className="absolute left-0 top-full z-30 mt-px w-[min(420px,calc(100vw-2rem))] rounded-xl border border-border bg-background p-6 shadow-lg"
    >
      <ul className="grid grid-cols-2 gap-3">
        {SOLUTION_NAV_ITEMS.map((item) => (
          <li key={item.title} className="text-sm text-foreground">
            {item.title}
          </li>
        ))}
      </ul>
    </PrototypeComponent>
  );
}

function MobileMenu() {
  return (
    <PrototypeComponent
      id="site-nav.mobile-menu"
      className="absolute inset-x-0 top-16 z-30 border-b border-border bg-background px-6 py-6 lg:hidden"
    >
      <div className="flex flex-col gap-5">
        <p className="text-sm font-medium text-foreground">Product</p>
        {PRODUCT_NAV_ITEMS.map((item) => (
          <MenuRow key={item.title} {...item} />
        ))}
        <p className="text-sm font-medium text-foreground">Developers</p>
        {DEVELOPER_NAV_ITEMS.map((item) => (
          <MenuRow key={item.title} {...item} />
        ))}
        <div className="flex flex-col gap-2 pt-2">
          <Button variant="default" className="w-full">
            Sign in
          </Button>
          <Button className="w-full">Start your project</Button>
        </div>
      </div>
    </PrototypeComponent>
  );
}

export function SiteNav({ navMenu, onNavMenuChange }: SiteNavProps) {
  const toggle = (menu: FrontCoverNavMenu) => {
    onNavMenuChange(navMenu === menu ? "none" : menu);
  };

  return (
    <PrototypeComponent id="site-nav" className="sticky top-0 z-40">
      <div className="absolute inset-0 bg-background/90 backdrop-blur-xs" />
      <nav className="relative z-40 border-b border-default">
        <div className="section-container relative flex h-16 justify-between">
          <div className="flex flex-1 items-center justify-between">
            <div className="flex items-center">
              <button type="button" onClick={() => onNavMenuChange("none")} className="shrink-0">
                <SupabaseWordmark className="text-foreground" />
              </button>
              <PrototypeComponent
                id="site-nav.primary"
                className="relative hidden h-16 items-center pl-8 lg:flex"
              >
                {PRIMARY_LINKS.map((link) => (
                  <button
                    key={link.id}
                    type="button"
                    onClick={() => toggle(link.id)}
                    className={cn(
                      "flex items-center gap-1 px-2 text-sm font-medium text-foreground hover:text-brand-link",
                      navMenu === link.id && "text-brand-link",
                    )}
                  >
                    {link.label}
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                ))}
                <span className="px-2 text-sm font-medium text-foreground">Pricing</span>
                <span className="px-2 text-sm font-medium text-foreground">Docs</span>
                <span className="px-2 text-sm font-medium text-foreground">Blog</span>
                {navMenu === "product" ? <ProductMenu /> : null}
                {navMenu === "developers" ? <DevelopersMenu /> : null}
                {navMenu === "solutions" ? <SolutionsMenu /> : null}
              </PrototypeComponent>
            </div>
            <PrototypeComponent id="site-nav.actions" className="flex items-center gap-2">
              <Button variant="text" size="tiny" className="hidden sm:inline-flex gap-1.5">
                <Github className="h-4 w-4" />
                {GITHUB_STAR_LABEL}
              </Button>
              <Button variant="default" className="hidden lg:inline-flex">
                Sign in
              </Button>
              <Button className="hidden lg:inline-flex">Start your project</Button>
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center text-foreground lg:hidden"
                onClick={() => toggle("mobile")}
                aria-label={navMenu === "mobile" ? "Close menu" : "Open menu"}
              >
                {navMenu === "mobile" ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </PrototypeComponent>
          </div>
        </div>
      </nav>
      {navMenu === "mobile" ? <MobileMenu /> : null}
    </PrototypeComponent>
  );
}
