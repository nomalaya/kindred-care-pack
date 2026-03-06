

## Problème

Palette 7 : le **primary** (`272 40% 30%` — aubergine foncé) et le **secondary** (`272 35% 47%` — violet moyen) partagent la même teinte ~272°. Sur les barres de progression et indicateurs, la différence de luminosité seule ne suffit pas à les distinguer visuellement.

## Analyse neurodesign

Pour créer un contraste perceptif fort avec l'aubergine tout en restant harmonieux avec le CTA orange ambre (`31°`), trois pistes :

### Option A — Terracotta rosé `350 38% 55%` (~`#B56878`)
- Complémentaire split du violet, crée une tension chromatique douce
- Pont visuel entre l'aubergine et l'orange CTA
- Swatch : `#B56878`

### Option B — Bleu ardoise chaud `210 30% 45%` (~`#506B8A`)
- Triade avec le violet et l'orange
- Apporte de la profondeur sans surcharger la palette
- Swatch : `#506B8A`

### Option C — Vert sauge `160 28% 45%` (~`#537A6E`)
- Opposition directe au violet, distinction maximale
- Évoque la confiance et le naturel
- Swatch : `#537A6E`

## Recommandation

**Option A (Terracotta rosé)** — meilleur équilibre entre distinction visuelle sur les indicateurs et cohérence émotionnelle avec la palette aubergine/orange.

## Changement technique

**Fichier** : `src/lib/themes.ts`, Palette 7 (ligne 163, 167)

- `swatches[1]` : `"#7B4FA2"` → `"#B56878"`
- `--secondary` : `"272 35% 47%"` → `"350 38% 55%"`

