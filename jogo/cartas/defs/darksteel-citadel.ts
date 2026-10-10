// Darksteel Citadel
// Indestructible
// {T}: Add {C}.
import { defineCard, keyword, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Darksteel Citadel",
  faces: [{ abilities: [keyword('indestructible'), mana('C')] }],
  rulings: {
    "1": "CR 305.9: é terreno artefato; teste: só aparece a ação jogar, nunca conjurar."
  },
});
