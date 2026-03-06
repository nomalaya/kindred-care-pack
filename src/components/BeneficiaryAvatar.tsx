interface AvatarProps {
  gender?: string;
  ageRange?: string;
  skinTone?: string;
  hairType?: string;
  size?: "sm" | "md" | "lg";
  name: string;
  avatarUrl?: string;
}

const skinColors: Record<string, string> = {
  light: "#FFDAB9",
  medium: "#D2A679",
  dark: "#8D5524",
};

const hairColors: Record<string, string> = {
  straight: "#2C1B0E",
  wavy: "#4A3222",
  curly: "#1A0E05",
  coily: "#0D0705",
  short: "#3D2914",
  bald: "transparent",
  covered: "#2A9D6E",
};

const BeneficiaryAvatar = ({ gender, ageRange, skinTone, hairType, size = "md", name, avatarUrl }: AvatarProps) => {
  const dimensions = { sm: 48, md: 80, lg: 120 };
  const dim = dimensions[size];

  // If we have an AI-generated avatar URL, use it
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={`Portrait de ${name}`}
        width={dim}
        height={dim}
        className="rounded-full object-cover"
        style={{ width: dim, height: dim }}
      />
    );
  }

  const skin = skinColors[skinTone || "medium"] || skinColors.medium;
  const hair = hairColors[hairType || "straight"] || hairColors.straight;
  const isElderly = ageRange?.includes("70") || ageRange?.includes("80");

  return (
    <svg width={dim} height={dim} viewBox="0 0 100 100" className="rounded-full" aria-label={`Avatar de ${name}`}>
      <circle cx="50" cy="50" r="50" fill="hsl(157, 68%, 93%)" />
      <circle cx="50" cy="40" r="22" fill={skin} />
      {hairType !== "bald" && hairType !== "covered" && (
        <ellipse cx="50" cy="28" rx={hairType === "curly" || hairType === "coily" ? 24 : 22} ry={hairType === "curly" || hairType === "coily" ? 16 : 12} fill={hair} />
      )}
      {hairType === "covered" && (
        <path d="M28 35 Q50 10 72 35 Q72 20 50 15 Q28 20 28 35Z" fill={hair} />
      )}
      <circle cx="42" cy="40" r="2.5" fill="#333" />
      <circle cx="58" cy="40" r="2.5" fill="#333" />
      <path d="M42 48 Q50 55 58 48" fill="none" stroke="#333" strokeWidth="1.5" strokeLinecap="round" />
      <ellipse cx="50" cy="82" rx="22" ry="18" fill="hsl(160, 60%, 30%)" />
      {isElderly && (
        <>
          <line x1="36" y1="44" x2="40" y2="44" stroke="#999" strokeWidth="0.5" />
          <line x1="60" y1="44" x2="64" y2="44" stroke="#999" strokeWidth="0.5" />
        </>
      )}
    </svg>
  );
};

export default BeneficiaryAvatar;
