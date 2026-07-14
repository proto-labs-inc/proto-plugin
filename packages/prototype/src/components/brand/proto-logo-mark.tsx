import protoLogo from "../../../assets/proto-logo.png";
import { cn } from "@prototype/lib/utils";

type ProtoLogoMarkProps = {
  className?: string;
  size?: number;
};

export function ProtoLogoMark({ className, size = 14 }: ProtoLogoMarkProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- bundled brand mark, not a remote asset
    <img
      src={protoLogo.src}
      alt=""
      width={size}
      height={size}
      className={cn("shrink-0 object-contain", className)}
    />
  );
}
