import { useAvatarBackground } from "@/lib/avatarBackground";
import { framingToTransform, type AvatarFraming } from "@/lib/avatarFraming";

interface AvatarProps {
  gender?: string;
  ageRange?: string;
  skinTone?: string;
  hairType?: string;
  size?: "sm" | "md" | "lg";
  name: string;
  avatarUrl?: string | null;
  previewUrl?: string | null;
  /**
   * Deterministic seed used to pick a personalised background from the
   * `avatar-backgrounds` bucket. Pass the beneficiary id or avatar_seed.
   */
  backgroundSeed?: string | number | null;
  /**
   * Non-destructive display transform (zoom + offset). Read from the
   * beneficiary row via `readFramingFromRow`. When omitted, native object-cover
   * is used (identical to legacy behaviour).
   */
  framing?: AvatarFraming;
}

// Premium fallback — warm gradient circle with initial.
// Used only when no AI portrait (final or preview) is available yet.
const BeneficiaryAvatar = ({
  size = "md",
  name,
  avatarUrl,
  previewUrl,
  backgroundSeed,
  framing,
}: AvatarProps) => {
  const dimensions = { sm: 48, md: 80, lg: 120 };
  const dim = dimensions[size];

  const resolved = avatarUrl || previewUrl;
  const isPreview = !avatarUrl && !!previewUrl;
  const bgUrl = useAvatarBackground(backgroundSeed ?? null);

  if (resolved) {
    const transformStyle = framing ? framingToTransform(framing) : undefined;
    return (
      <div
        className="relative rounded-full overflow-hidden ring-1 ring-black/5"
        style={{
          width: dim,
          height: dim,
          backgroundImage: bgUrl ? `url(${bgUrl})` : undefined,
          backgroundColor: bgUrl ? undefined : "#ffffff",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <img
          src={resolved}
          alt={`Portrait de ${name}`}
          width={dim}
          height={dim}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            objectPosition: "center top",
            ...(transformStyle ?? {}),
          }}
        />
        {isPreview && (
          <span
            className="absolute -bottom-0.5 -right-0.5 rounded-full bg-amber-400/90 ring-2 ring-background"
            style={{ width: Math.max(8, dim * 0.14), height: Math.max(8, dim * 0.14) }}
            aria-label="Aperçu IA"
            title="Aperçu IA — non validé"
          />
        )}
      </div>
    );
  }

  // Premium gradient fallback
  const initial = (name?.trim()?.[0] ?? "•").toUpperCase();
  const fontSize = Math.round(dim * 0.42);

  return (
    <div
      role="img"
      aria-label={`Avatar de ${name}`}
      className="rounded-full flex items-center justify-center select-none ring-1 ring-black/5 overflow-hidden relative"
      style={{
        width: dim,
        height: dim,
        background:
          "radial-gradient(120% 120% at 25% 20%, hsl(36 60% 88%) 0%, hsl(28 55% 76%) 45%, hsl(15 45% 58%) 100%)",
      }}
    >
      <span
        className="font-semibold text-white/95 tracking-tight"
        style={{
          fontSize,
          fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
          textShadow: "0 1px 2px rgba(60,30,10,0.18)",
        }}
      >
        {initial}
      </span>
      <svg className="absolute inset-0 w-full h-full opacity-[0.12] mix-blend-overlay" aria-hidden>
        <filter id="ba-noise">
          <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.6 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#ba-noise)" />
      </svg>
    </div>
  );
};

export default BeneficiaryAvatar;
