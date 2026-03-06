

## Rendre le CTA de "Soleil Émeraude" plus engageant

**Problème** : Le CTA actuel `330 46% 70%` est un rose pastel désaturé — manque de contraste et d'urgence émotionnelle sur fond clair.

**Solution** : Augmenter la saturation et baisser la luminosité pour un rose plus vif et affirmé, tout en restant dans la tonalité rose de la palette.

**Modification dans `src/lib/themes.ts`, ligne 194** :

```
"--cta": "330 46% 70%"  →  "--cta": "330 65% 52%"
```

Cela donne un rose plus profond (~#C93B8C), nettement plus visible et engageant sur fond off-white, tout en restant cohérent avec les swatches de la palette.

