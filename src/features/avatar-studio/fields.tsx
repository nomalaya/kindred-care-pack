import React from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Sparkles, UserCircle, CalendarDays, Smile, Palette, Ruler, Layers, Scissors,
  Waves, User, ArrowUp, Crown, Globe, Shirt, PersonStanding, Accessibility,
  Baby, Eye, type LucideIcon,
} from "lucide-react";
import type { FieldReason } from "@/lib/avatarAutoInfer";

export const FIELD_LABELS: Record<string, string> = {
  avatar_gender: "Genre",
  avatar_age_range: "Tranche d'âge",
  avatar_face_shape: "Forme du visage",
  avatar_skin_tone: "Teint",
  avatar_eye_shape: "Forme des yeux",
  avatar_eye_color: "Couleur des yeux",
  avatar_hair_color: "Couleur de cheveux",
  avatar_hair_length: "Longueur",
  avatar_hair_volume: "Volume",
  avatar_hair_style: "Coiffure",
  avatar_hair_type: "Type de cheveux",
  avatar_beard: "Barbe",
  avatar_moustache: "Moustache",
  avatar_hair_recession: "Recul des cheveux",
  avatar_head_covering: "Couvre-chef",
  avatar_cultural_style_override: "Style culturel (override)",
  avatar_clothing_style: "Style vêtements",
  avatar_clothing_color_palette: "Palette vêtements",
  avatar_posture: "Posture",
  avatar_expression: "Expression",
  avatar_parent_energy: "Énergie parentale",
  avatar_mobility_aid: "Aide à la mobilité",
};

export const FIELD_ICONS: Record<string, LucideIcon> = {
  avatar_gender: UserCircle,
  avatar_age_range: CalendarDays,
  avatar_face_shape: Smile,
  avatar_skin_tone: Palette,
  avatar_eye_shape: Eye,
  avatar_eye_color: Eye,
  avatar_hair_color: Palette,
  avatar_hair_length: Ruler,
  avatar_hair_volume: Layers,
  avatar_hair_style: Scissors,
  avatar_hair_type: Waves,
  avatar_beard: User,
  avatar_moustache: User,
  avatar_hair_recession: ArrowUp,
  avatar_head_covering: Crown,
  avatar_cultural_style_override: Globe,
  avatar_clothing_style: Shirt,
  avatar_clothing_color_palette: Palette,
  avatar_posture: PersonStanding,
  avatar_mobility_aid: Accessibility,
  avatar_expression: Smile,
  avatar_parent_energy: Baby,
};

export const TAB_FIELDS: Record<string, string[]> = {
  face: ["avatar_gender", "avatar_age_range", "avatar_face_shape", "avatar_skin_tone", "avatar_expression"],
  eyes: ["avatar_eye_shape", "avatar_eye_color", "avatar_tired_level", "avatar_emotional_brightness"],
  hair: ["avatar_hair_type", "avatar_hair_color", "avatar_hair_length", "avatar_hair_volume", "avatar_hair_style"],
  male: ["avatar_beard", "avatar_moustache", "avatar_bald_level", "avatar_hair_recession"],
  cultural: ["avatar_head_covering", "avatar_cultural_style_override"],
  clothing: ["avatar_clothing_style", "avatar_clothing_color_palette"],
  posture: ["avatar_posture", "avatar_mobility_aid", "avatar_resilience_level"],
  social: ["avatar_parent_energy", "avatar_fatigue_level", "avatar_dignity_level"],
};

export function InferredPastille({ reasons }: { reasons?: FieldReason[] }) {
  if (!reasons || reasons.length === 0) return null;
  const txt = reasons.map(r => `${r.signalLabel} ← « ${r.keyword} »`).join(" · ");
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center" aria-label={`Champ déduit : ${txt}`}>
          <Sparkles className="h-3 w-3 text-primary/70" />
        </span>
      </TooltipTrigger>
      <TooltipContent className="text-xs max-w-[260px]">
        <div className="font-medium mb-0.5">Déduit du récit</div>
        <div className="text-muted-foreground">{txt}</div>
      </TooltipContent>
    </Tooltip>
  );
}

export function FieldLabel({
  icon: Icon, children, right, reasons,
}: { icon?: LucideIcon; children: React.ReactNode; right?: React.ReactNode; reasons?: FieldReason[] }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
        {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground/80 shrink-0" />}
        <span>{children}</span>
        <InferredPastille reasons={reasons} />
      </Label>
      {right}
    </div>
  );
}

export function SelectField({
  label, value, options, onChange, disabled, icon, reasons,
}: {
  label: string;
  value: string | null;
  options: readonly string[];
  onChange: (v: string) => void;
  disabled?: boolean;
  icon?: LucideIcon;
  reasons?: FieldReason[];
}) {
  return (
    <div className="space-y-1.5">
      <FieldLabel icon={icon} reasons={reasons}>{label}</FieldLabel>
      <Select value={value ?? ""} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="h-9"><SelectValue placeholder="—" /></SelectTrigger>
        <SelectContent>
          {options.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

export function SliderField({
  label, value, min = 0, max = 5, step = 1, onChange, disabled, icon, reasons,
}: {
  label: string; value: number; min?: number; max?: number; step?: number;
  onChange: (v: number) => void; disabled?: boolean; icon?: LucideIcon; reasons?: FieldReason[];
}) {
  return (
    <div className="space-y-1.5">
      <FieldLabel icon={icon} reasons={reasons} right={<span className="text-xs font-mono text-foreground">{value}</span>}>{label}</FieldLabel>
      <Slider
        value={[value]}
        min={min} max={max} step={step}
        onValueChange={(v) => onChange(v[0])}
        disabled={disabled}
      />
    </div>
  );
}
