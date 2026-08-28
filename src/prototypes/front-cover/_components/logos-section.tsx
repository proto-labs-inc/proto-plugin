import { PrototypeComponent } from "proto-plugin";

import { TRUSTED_LOGOS } from "./front-cover-mock-data";

export function LogosSection() {
  return (
    <PrototypeComponent id="logos-section">
      <div className="section-container py-6">
        <p className="text-sm text-foreground-lighter">
          Trusted by fast-growing companies worldwide
        </p>
      </div>
      <div className="border-y border-border">
        <div className="section-container border-x border-border py-10">
          <ul
            aria-label="Trusted by fast-growing companies worldwide"
            className="grid list-none grid-cols-3 gap-x-6 gap-y-10 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6"
          >
            {TRUSTED_LOGOS.map((name) => (
              <li
                key={name}
                className="flex h-10 items-center justify-center text-sm font-medium tracking-tight text-foreground-lighter"
              >
                {name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </PrototypeComponent>
  );
}
