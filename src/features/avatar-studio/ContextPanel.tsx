import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Wand2, Save, FileText, Quote, AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [confirmMode, setConfirmMode] = useState<"save" | "reinfer" | null>(null);

  useEffect(() => { setStory(shortStory ?? ""); }, [shortStory]);
  useEffect(() => { setSentence(emotionalSentence ?? ""); }, [emotionalSentence]);

  const storyChanged = story !== (shortStory ?? "");
  const sentenceChanged = sentence !== (emotionalSentence ?? "");
  const dirty = storyChanged || sentenceChanged;

  const buildPatch = () => {
    const p: { short_story?: string; emotional_sentence?: string } = {};
    if (storyChanged) p.short_story = story;
    if (sentenceChanged) p.emotional_sentence = sentence;
    return p;
  };

  const handleConfirm = async () => {
    const mode = confirmMode;
    if (!mode) return;
    setConfirmMode(null);
    setSaving(mode);
    try {
      const patch = buildPatch();
      if (mode === "save") await onSave(patch);
      else await onReinferAndSave(patch);
    } finally {
      setSaving("none");
    }
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
            onClick={() => setConfirmMode("save")}
          >
            <Save className="h-3.5 w-3.5 mr-1" />
            {saving === "save" ? "Sauvegarde…" : "Enregistrer"}
          </Button>
          <Button
            size="sm"
            disabled={!!saving || disabled}
            onClick={() => setConfirmMode("reinfer")}
            title="Sauvegarder le texte puis re-déduire tous les attributs"
          >
            <Wand2 className="h-3.5 w-3.5 mr-1" />
            {saving === "reinfer" ? "Re-déduction…" : "Enregistrer + re-déduire"}
          </Button>
          <span className="text-[10px] text-muted-foreground ml-1">Texte modifié</span>
        </div>
      )}

      <AlertDialog open={confirmMode !== null} onOpenChange={(o) => { if (!o) setConfirmMode(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Publier ces modifications sur la fiche publique ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Ce texte sera <strong>immédiatement visible</strong> par les donateurs sur la fiche du bénéficiaire (sélection, page de don, badges contextuels).
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-3">
            {storyChanged && (
              <div className="space-y-1.5">
                <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">Histoire courte</div>
                <div className="rounded border bg-muted/40 p-2 text-xs line-through text-muted-foreground whitespace-pre-wrap">
                  {shortStory || <em>(vide)</em>}
                </div>
                <div className="rounded border border-primary/40 bg-primary/5 p-2 text-xs whitespace-pre-wrap">
                  {story || <em>(vide)</em>}
                </div>
              </div>
            )}

            {sentenceChanged && (
              <div className="space-y-1.5">
                <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">Phrase émotionnelle</div>
                <div className="rounded border bg-muted/40 p-2 text-xs italic line-through text-muted-foreground whitespace-pre-wrap">
                  {emotionalSentence || <em>(vide)</em>}
                </div>
                <div className="rounded border border-primary/40 bg-primary/5 p-2 text-xs italic whitespace-pre-wrap">
                  {sentence || <em>(vide)</em>}
                </div>
              </div>
            )}

            {confirmMode === "reinfer" && (
              <p className="text-xs text-muted-foreground">
                Les attributs visuels (expression, posture, fatigue…) seront également recalculés à partir du nouveau récit.
              </p>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>
              Publier sur la fiche
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
