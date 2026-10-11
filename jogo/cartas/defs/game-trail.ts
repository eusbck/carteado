// Game Trail
// As this land enters, you may reveal a Mountain or Forest card from your hand. If you don't, this land enters tapped.
// {T}: Add {R} or {G}.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Game Trail",
  faces: [{ abilities: [
    land.snarl('Mountain', 'Forest'),
    mana(['R', 'G']),
  ] }],
  rulings: {
    1: "não se aplica: nenhuma carta dos decks põe dois terrenos da mão no campo ao mesmo tempo",
    2: "regra geral: a substituição do snarl só vira o terreno, nunca o desvira (asEnters só põe tapped = true)",
    3: "teste: revelando uma carta não básica com o subtipo (Cinder Glade), entra desvirado",
    4: "teste: outro Game Trail na mão não serve para revelar",
  },
});
