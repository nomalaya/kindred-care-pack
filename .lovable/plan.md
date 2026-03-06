

## Deux nouvelles palettes inspirées de l'image

L'image présente un univers graphique pop/afro-contemporain avec des aplats francs : rose bonbon, jaune soleil, vert émeraude, orange chaud et violet profond. Voici deux interprétations adaptées au neurodesign de CashForCause (primary toujours plus foncé que secondary, backgrounds/cards inchangés).

---

### Palette 8 — "Soleil Émeraude"

Axe émotionnel : **énergie solaire + ancrage naturel**. Le vert émeraude inspire confiance et croissance, le jaune doré apporte optimisme et urgence douce sur le CTA, l'orange réchauffe en accent.

| Rôle | Couleur | Hex | Justification neurodesign |
|------|---------|-----|--------------------------|
| Primary | Vert émeraude foncé | `#1A8C6A` | Ancrage, confiance, stabilité |
| Secondary | Rose doux | `#D98CB8` | Empathie, care, chaleur humaine |
| CTA | Jaune soleil profond | `#D4A800` | Optimisme, action positive sans agressivité |
| Accent | Orange chaud | `#D4782A` | Chaleur, énergie, reward |

Swatches : `["#1A8C6A", "#D98CB8", "#D4A800"]`

---

### Palette 9 — "Violet Pop"

Axe émotionnel : **dignité spirituelle + vitalité**. Le violet profond évoque la dignité et la profondeur, le vert vif apporte la vitalité et l'espoir, le rose comme CTA crée une urgence empathique.

| Rôle | Couleur | Hex | Justification neurodesign |
|------|---------|-----|--------------------------|
| Primary | Violet profond | `#6B4D8A` | Dignité, profondeur, spiritualité |
| Secondary | Vert émeraude | `#2EAE7D` | Espoir, renouveau, croissance |
| CTA | Rose corail chaud | `#D4637A` | Urgence empathique, care |
| Accent | Jaune doré | `#D9B84A` | Récompense, accomplissement |

Swatches : `["#6B4D8A", "#2EAE7D", "#D4637A"]`

---

### Implémentation

Ajout de ces 2 entrées dans le tableau `themes` de `src/lib/themes.ts` avec les valeurs HSL correspondantes, en conservant background (`25 27% 96%`), card (`0 0% 100%`), muted, border et input identiques au défaut — conformément à la contrainte du theme engine.

