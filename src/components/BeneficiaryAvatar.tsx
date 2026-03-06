interface AvatarProps {
  gender?: string;
  ageRange?: string;
  skinTone?: string;
  hairType?: string;
  size?: "sm" | "md" | "lg";
  name: string;
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
  covered: "#7B9E87",
};

const BeneficiaryAvatar = ({ gender, ageRange, skinTone, hairType, size = "md", name }: AvatarProps) => {
  const dimensions = { sm: 48, md: 80, lg: 120 };
  const dim = dimensions[size];
  const skin = skinColors[skinTone || "medium"] || skinColors.medium;
  const hair = hairColors[hairType || "straight"] || hairColors.straight;
  const isElderly = ageRange?.includes("70") || ageRange?.includes("80");

  return (
    <svg width={dim} height={dim} viewBox="0 0 100 100" className="rounded-full" aria-label={`Avatar of ${name}`}>
      {/* Background */}
      <circle cx="50" cy="50" r="50" fill="hsl(160, 44%, 93%)" />
      {/* Head */}
      <circle cx="50" cy="40" r="22" fill={skin} />
      {/* Hair */}
      {hairType !== "bald" && hairType !== "covered" && (
        <ellipse cx="50" cy="28" rx={hairType === "curly" || hairType === "coily" ? 24 : 22} ry={hairType === "curly" || hairType === "coily" ? 16 : 12} fill={hair} />
      )}
      {hairType === "covered" && (
        <path d="M28 35 Q50 10 72 35 Q72 20 50 15 Q28 20 28 35Z" fill={hair} />
      )}
      {/* Eyes */}
      <circle cx="42" cy="40" r="2.5" fill="#333" />
      <circle cx="58" cy="40" r="2.5" fill="#333" />
      {/* Smile */}
      <path d="M42 48 Q50 55 58 48" fill="none" stroke="#333" strokeWidth="1.5" strokeLinecap="round" />
      {/* Body */}
      <ellipse cx="50" cy="82" rx="22" ry="18" fill="hsl(160, 60%, 30%)" />
      {/* Elderly wrinkles */}
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
