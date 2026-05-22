import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Wand2, Save, FileText, Quote, AlertTriangle, Lock } from "lucide-react";
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

type Patch = {
  short_story?: string;
  emotional_sentence?: string;
  avatar_private_notes?: string;
};

interface Props {
  shortStory: string | null;
  emotionalSentence: string | null;
  privateNotes?: string | null;
  disabled?: boolean;
  onSave: (patch: Patch) => Promise<void>;
  onReinferAndSave: (patch: Patch) => Promise<void>;
}

export function ContextPanel({
  shortStory, emotionalSentence, privateNotes, disabled, onSave, onReinferAndSave,
}: Props) {
  const [story, setStory] = useState(shortStory ?? "");
  const [sentence, setSentence] = useState(emotionalSentence ?? "");
  const [notes, setNotes] = useState(privateNotes ?? "");
  const [saving, setSaving] = useState<"none" | "save" | "reinfer">("none");
  const [confirmMode, setConfirmMode] = useState<"save" | "reinfer" | null>(null);

  useEffect(() => { setStory(shortStory ?? ""); }, [shortStory]);
  useEffect(() => { setSentence(emotionalSentence ?? ""); }, [emotionalSentence]);
  useEffect(() => { setNotes(privateNotes ?? ""); }, [privateNotes]);

  const storyChanged = story !== (shortStory ?? "");
  const sentenceChanged = sentence !== (emotionalSentence ?? "");
  const notesChanged = notes !== (privateNotes ?? "");
  const publicChanged = storyChanged || sentenceChanged;
  const dirty = publicChanged || notesChanged;

  const buildPatch = (): Patch => {
    const p: Patch = {};
    if (storyChanged) p.short_story = story;
    if (sentenceChanged) p.emotional_sentence = sentence;
    if (notesChanged) p.avatar_private_notes = notes;
    return p;
  };

  const doSave = async (mode: "save" | "reinfer") => {
    setSaving(mode);
    try {
      const patch = buildPatch();
      if (mode === "save") await onSave(patch);
      else await onReinferAndSave(patch);
    } finally {
      setSaving("none");
    }
  };

  const handleConfirm = async () => {
    const mode = confirmMode;
    if (!mode) return;
    setConfirmMode(null);
    await doSave(mode);
  };

  const triggerSave = (mode: "save" | "reinfer") => {
    // Si seuls les notes privées ont changé → pas de confirmation publique
    if (!publicChanged && notesChanged) {
      void doSave(mode);
      return;
    }
    setConfirmMode(mode);
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

      <div className="space-y-1 rounded-md border border-dashed border-amber-400/60 bg-amber-50/40 dark:bg-amber-950/10 p-2">
        <Label className="text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-1 font-semibold">
          <Lock className="h-3 w-3" /> Notes privées (jamais publiées)
        </Label>
        <Textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          disabled={disabled}
          rows={3}
          className="text-xs leading-relaxed bg-background"
          placeholder="Indices factuels pour le pré-remplissage : yeux marrons, barbe musulmane, porte des lunettes, cheveux gris…"
        />
        <p className="text-[10px] text-muted-foreground leading-snug">
          Visible <strong>uniquement</strong> par les administrateurs. Influence le pré-remplissage des attributs visuels (couleur d'yeux, barbe, couvre-chef, lunettes, cheveux). Jamais affiché sur la fiche donateur.
        </p>
      </div>

      {dirty && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              disabled={!!saving || disabled}
              onClick={() => triggerSave("save")}
            >
              <Save className="h-3.5 w-3.5 mr-1" />
              {saving === "save" ? "Sauvegarde…" : "Enregistrer"}
            </Button>
            <Button
              size="sm"
              disabled={!!saving || disabled}
              onClick={() => triggerSave("reinfer")}
            >
              <Wand2 className="h-3.5 w-3.5 mr-1" />
              {saving === "reinfer" ? "Re-déduction…" : "Enregistrer + re-déduire"}
            </Button>
            <span className="text-[10px] text-muted-foreground ml-1">
              {publicChanged ? "Texte modifié" : "Notes privées modifiées"}
            </span>
          </div>

          {publicChanged && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="rounded border bg-background/60 p-2 text-[11px] leading-snug">
                <div className="flex items-center gap-1 font-semibold mb-1">
                  <Save className="h-3 w-3" /> Enregistrer
                </div>
                <p className="text-muted-foreground">
                  Sauvegarde <strong>uniquement les textes</strong>. Les attributs visuels (expression, posture, fatigue, vêtements…) restent inchangés.
                </p>
              </div>
              <div className="rounded border bg-background/60 p-2 text-[11px] leading-snug">
                <div className="flex items-center gap-1 font-semibold mb-1">
                  <Wand2 className="h-3 w-3" /> Enregistrer + re-déduire
                </div>
                <p className="text-muted-foreground">
                  Sauvegarde les textes <strong>puis recalcule</strong> tous les attributs visuels à partir du nouveau récit et des notes privées.
                </p>
              </div>
            </div>
          )}

          {publicChanged && (
            <p className="text-[11px] text-amber-700 dark:text-amber-400 flex items-start gap-1">
              <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <span>L'image avatar n'est pas régénérée automatiquement — cliquez ensuite sur « Générer » pour produire un nouveau portrait cohérent.</span>
            </p>
          )}
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

            {notesChanged && (
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Lock className="h-3 w-3" /> Les notes privées seront enregistrées mais ne seront pas publiées.
              </p>
            )}

            {confirmMode === "reinfer" && (
              <p className="text-xs text-muted-foreground">
                Les attributs visuels (expression, posture, fatigue, couleur d'yeux, barbe…) seront recalculés.
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
