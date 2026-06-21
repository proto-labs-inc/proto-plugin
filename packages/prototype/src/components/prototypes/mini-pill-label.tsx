import pillStyles from "@prototype/components/prototypes/prototype-floating-pill.module.scss";

type MiniPillLabelProps = {
  label: string;
};

/** Text after a leading symbol/emoji token in legacy "↕️ Label" mini pill copy. */
export function miniPillTextFromLabel(label: string): string {
  const spaceIndex = label.indexOf(" ");
  if (spaceIndex <= 0) return label;

  const prefix = label.slice(0, spaceIndex);
  if (!/[\p{L}\p{N}]/u.test(prefix)) {
    return label.slice(spaceIndex + 1);
  }

  return label;
}

/** Renders "emoji Label" mini pill copy with spacing between icon and text. */
export function MiniPillLabel({ label }: MiniPillLabelProps) {
  const spaceIndex = label.indexOf(" ");
  if (spaceIndex <= 0) {
    return <>{label}</>;
  }

  return (
    <>
      <span className={pillStyles.miniPillEmoji} aria-hidden>
        {label.slice(0, spaceIndex)}
      </span>
      <span className={pillStyles.miniPillText}>
        {miniPillTextFromLabel(label)}
      </span>
    </>
  );
}
