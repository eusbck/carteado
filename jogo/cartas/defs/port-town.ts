// Port Town
// As this land enters, you may reveal a Plains or Island card from your hand. If you don't, this land enters tapped.
// {T}: Add {W} or {U}.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Port Town",
  faces: [{ abilities: [
    land.snarl('Plains', 'Island'),
    mana(['W', 'U']),
  ] }],
  rulings: {
    1: "regra geral: a substituição do snarl só vira o terreno, nunca o desvira (asEnters só põe tapped = true)",
    2: "teste: outro Port Town na mão não serve para revelar",
    3: "teste: revelando uma carta não básica com o subtipo (Tundra), entra desvirado",
    4: "não se aplica: nenhuma carta dos decks põe dois terrenos da mão no campo ao mesmo tempo",
  },
});
