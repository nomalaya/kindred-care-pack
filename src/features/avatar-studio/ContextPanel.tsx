import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Wand2, Save, FileText, Quote } from "lucide-react";

interface Props {
  shortStory: string | null;
  emotionalSentence: string | null;
  disabled?: boolean;
  onSave: (patch: { short_story?: string; emotional_sentence?: string }) => Promise<void>;
  onReinferAndSave: (patch: { short_story?: string; emotional_sentence?: string }) => Promise<void>;
}

export function ContextPanel({
  shortStory, emotionalSentence, disabled, onSave, onReinferAndSave,
}: Props) {
  const [story, setStory] = useState(shortStory ?? "");
  const [sentence, setSentence] = useState(emotionalSentence ?? "");
  const [saving, setSaving] = useState<"none" | "save" | "reinfer">("none");

  useEffect(() => { setStory(shortStory ?? ""); }, [shortStory]);
  useEffect(() => { setSentence(emotionalSentence ?? ""); }, [emotionalSentence]);

  const dirty = story !== (shortStory ?? "") || sentence !== (emotionalSentence ?? "");

  const buildPatch = () => {
    const p: { short_story?: string; emotional_sentence?: string } = {};
    if (story !== (shortStory ?? "")) p.short_story = story;
    if (sentence !== (emotionalSentence ?? "")) p.emotional_sentence = sentence;
    return p;
  };

  return (
    <div className="mx-4 mt-3 rounded-md border bg-muted/30 p-3 space-y-2">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
        Contexte psychosocial — source des déductions
      </div>

      <div className="space-y-1">
        <Label className="text-[11px] text-muted-foreground flex items-center gap-1">
          <FileText className="h-3 w-3" /> Histoire courte
        </Label>
        <Textarea
          value={story}
          onChange={e => setStory(e.target.value)}
          disabled={disabled}
          rows={3}
          className="text-xs leading-relaxed bg-background"
          placeholder="Décrire la situation en français…"
        />
      </div>

      <div className="space-y-1">
        <Label className="text-[11px] text-muted-foreground flex items-center gap-1">
          <Quote className="h-3 w-3" /> Phrase émotionnelle
        </Label>
        <Textarea
          value={sentence}
          onChange={e => setSentence(e.target.value)}
          disabled={disabled}
          rows={2}
          className="text-xs leading-relaxed bg-background italic"
          placeholder="« Citation à la première personne… »"
        />
      </div>

      {dirty && (
        <div className="flex items-center gap-1.5 pt-1">
          <Button
            size="sm"
            variant="outline"
            disabled={!!saving || disabled}
            onClick={async () => {
              setSaving("save");
              try { await onSave(buildPatch()); } finally { setSaving("none"); }
            }}
          >
            <Save className="h-3.5 w-3.5 mr-1" />
            {saving === "save" ? "Sauvegarde…" : "Enregistrer"}
          </Button>
          <Button
            size="sm"
            disabled={!!saving || disabled}
            onClick={async () => {
              setSaving("reinfer");
              try { await onReinferAndSave(buildPatch()); } finally { setSaving("none"); }
            }}
            title="Sauvegarder le texte puis re-déduire tous les attributs"
          >
            <Wand2 className="h-3.5 w-3.5 mr-1" />
            {saving === "reinfer" ? "Re-déduction…" : "Enregistrer + re-déduire"}
          </Button>
          <span className="text-[10px] text-muted-foreground ml-1">Texte modifié</span>
        </div>
      )}
    </div>
  );
}
