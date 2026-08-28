import { PrototypeComponent } from "proto-plugin";

export function ProductIcon({
  path,
  className,
}: {
  path: string;
  className?: string;
}) {
  return (
    <PrototypeComponent id="product-icon" className={className}>
      <svg
        aria-hidden="true"
        width="18"
        height="18"
        viewBox="0 0 25 25"
        fill="none"
      >
        <path
          d={path}
          stroke="currentColor"
          strokeMiterlimit="10"
          strokeLinejoin="round"
          strokeLinecap="round"
          strokeWidth="1.5"
        />
      </svg>
    </PrototypeComponent>
  );
}
