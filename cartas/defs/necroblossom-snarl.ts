// Necroblossom Snarl
// As this land enters, you may reveal a Swamp or Forest card from your hand. If you don't, this land enters tapped.
// {T}: Add {B} or {G}.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Necroblossom Snarl",
  faces: [{ abilities: [
    land.snarl('Swamp', 'Forest'),
    mana(['B', 'G']),
  ] }],
  rulings: {
    1: "regra geral: o snarl não tem subtipos; a revelação filtra por subtipo (land.snarl)",
    2: "regra geral: qualquer carta da mão com um dos subtipos serve (land.snarl filtra por subtipo, não por básico)",
    3: "regra geral: a substituição do snarl só vira o terreno, nunca o desvira (asEnters só põe tapped = true)",
    4: "não se aplica: nenhuma carta dos decks põe dois terrenos da mão no campo ao mesmo tempo",
  },
});
