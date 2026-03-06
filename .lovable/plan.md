

## Problème

Palette 4 : `--primary` et `--cta` sont identiques (`163 55% 29%`), et le `--secondary` (`11 44% 60%`) est très éloigné du primary en teinte. Le gradient `primary → secondary` (vert émeraude → terracotta) crée un mélange boueux au centre.

## Solution

Deux changements pour Palette 4 :

1. **CTA distinct** — changer `--cta` vers un terracotta chaud `15 55% 48%` (~`#BE5C33`), en opposition chromatique directe au vert primary, créant un point focal d'action clair.

2. **Secondary harmonique pour le gradient** — changer `--secondary` vers un vert plus clair/lumineux `155 40% 50%` (~`#4DB88F`) pour que le gradient primary→secondary reste dans la famille verte et fonctionne visuellement. Le terracotta passe au rôle CTA où il a plus d'impact.

## Changements techniques

**Fichier** : `src/lib/themes.ts`, Palette 4

| Variable | Avant | Après |
|---|---|---|
| `swatches[1]` | `"#C97B6B"` | `"#4DB88F"` |
| `--secondary` | `"11 44% 60%"` | `"155 40% 50%"` |
| `--secondary-foreground` | `"0 0% 100%"` | `"0 0% 100%"` |
| `--cta` | `"163 55% 29%"` | `"15 55% 48%"` |

Résultat : gradient vert foncé → vert lumineux fluide, CTA terracotta distinct et visible.

