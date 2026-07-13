import { PrototypeComponent } from "proto-plugin";

export function SqlEditorIcon({
  className,
  size = 20,
  strokeWidth = 1.5,
}: {
  className?: string;
  size?: number;
  strokeWidth?: number;
}) {
  return (
    <PrototypeComponent id="table-editor-icons.sql-editor-icon">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        <path d="M7.89844 8.4342L11.5004 12.0356L7.89844 15.6375M12 15.3292H16.5M5 21.1055H19C20.1046 21.1055 21 20.21 21 19.1055V5.10547C21 4.0009 20.1046 3.10547 19 3.10547H5C3.89543 3.10547 3 4.0009 3 5.10547V19.1055C3 20.21 3.89543 21.1055 5 21.1055Z" />
      </svg>
    </PrototypeComponent>
  );
}
