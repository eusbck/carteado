// Shimmer Myr
// Flash
// You may cast artifact spells as though they had flash.
import { defineCard, isType, keyword, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: "Shimmer Myr",
  faces: [{ abilities: [keyword('flash'), staticAbility({ rules: { castAsThoughFlash: (c, player, card) => player === c.you && isType(c.g, card, 'Artifact') }, text: 'Você pode conjurar mágicas de artefato como se tivessem lampejo.' })] }],
  rulings: {
    "1": "CR 601.2: a legalidade é determinada ao anunciar; não há prioridade para remover Shimmer Myr no meio da conjuração.",
    "2": "CR 305.9: teste: artefatos terreno continuam obedecendo o tempo e o limite de jogar terrenos."
  },
});
