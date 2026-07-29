import { cn } from "@/lib/utils";
import { gradientForName, initialsForName } from "@/lib/color";

export function MemberAvatar({
  name,
  photoUrl,
  className,
  style,
}: {
  name: string;
  photoUrl?: string | null;
  className?: string;
  style?: React.CSSProperties;
}) {
  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl}
        alt={name}
        style={style}
        className={cn(
          "size-9 shrink-0 rounded-full object-cover ring-1 ring-foreground/10",
          className,
        )}
      />
    );
  }

  return (
    <div
      style={style}
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-semibold text-white",
        gradientForName(name),
        className,
      )}
    >
      {initialsForName(name)}
    </div>
  );
}
