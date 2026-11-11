// Vineglimmer Snarl
// As this land enters, you may reveal a Forest or Island card from your hand. If you don't, this land enters tapped.
// {T}: Add {G} or {U}.
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Vineglimmer Snarl",
  faces: [{ abilities: [
    land.snarl('Forest', 'Island'),
    mana(['G', 'U']),
  ] }],
  rulings: {
    1: "regra geral: o snarl não tem subtipos; a revelação filtra por subtipo (land.snarl)",
    2: "não se aplica: nenhuma carta dos decks põe dois terrenos da mão no campo ao mesmo tempo",
    3: "regra geral: a substituição do snarl só vira o terreno, nunca o desvira (asEnters só põe tapped = true)",
    4: "regra geral: qualquer carta da mão com um dos subtipos serve (land.snarl filtra por subtipo, não por básico)",
  },
});
