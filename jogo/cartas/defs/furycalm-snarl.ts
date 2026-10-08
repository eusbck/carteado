// Furycalm Snarl
// As this land enters, you may reveal a Mountain or Plains card from your hand. If you don't, this land enters tapped.
// {T}: Add {R} or {W}.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Furycalm Snarl",
  faces: [{ abilities: [
    land.snarl('Mountain', 'Plains'),
    mana(['R', 'W']),
  ] }],
  rulings: {
    1: "regra geral: a substituição do snarl só vira o terreno, nunca o desvira (asEnters só põe tapped = true)",
    2: "regra geral: o snarl não tem subtipos; a revelação filtra por subtipo (land.snarl)",
    3: "não se aplica: nenhuma carta dos decks põe dois terrenos da mão no campo ao mesmo tempo",
    4: "regra geral: qualquer carta da mão com um dos subtipos serve (land.snarl filtra por subtipo, não por básico)",
  },
});
