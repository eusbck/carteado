// Fortified Village
// As this land enters, you may reveal a Forest or Plains card from your hand. If you don't, this land enters tapped.
// {T}: Add {G} or {W}.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Fortified Village",
  faces: [{ abilities: [
    land.snarl('Forest', 'Plains'),
    mana(['G', 'W']),
  ] }],
  rulings: {
    1: "não se aplica: nenhuma carta dos decks põe dois terrenos da mão no campo ao mesmo tempo",
    2: "regra geral: o snarl não tem subtipos; a revelação filtra por subtipo (land.snarl)",
    3: "regra geral: qualquer carta da mão com um dos subtipos serve (land.snarl filtra por subtipo, não por básico)",
    4: "regra geral: a substituição do snarl só vira o terreno, nunca o desvira (asEnters só põe tapped = true)",
  },
});
