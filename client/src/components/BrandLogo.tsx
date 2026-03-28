import { Headphones } from "lucide-react";

type BrandLogoProps = {
  /** Nav bar: compact; login: larger mark */
  size?: "sm" | "lg";
  /** Show “Helpdesk” next to the mark (nav) */
  showWordmark?: boolean;
  className?: string;
};

const boxClass = {
  sm: "h-7 w-7 rounded-lg",
  lg: "h-12 w-12 rounded-2xl",
} as const;

const iconClass = {
  sm: "h-3.5 w-3.5",
  lg: "h-6 w-6",
} as const;

export default function BrandLogo({
  size = "sm",
  showWordmark = false,
  className = "",
}: BrandLogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className={`${boxClass[size]} bg-primary flex items-center justify-center shadow-sm`}
      >
        <Headphones
          className={`${iconClass[size]} text-primary-foreground`}
          aria-hidden
        />
      </div>
      {showWordmark && (
        <span className="text-[15px] font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary">
          Helpdesk
        </span>
      )}
    </div>
  );
}
