// Prismari Campus
// This land enters tapped.
// {T}: Add {U} or {R}.
// {4}, {T}: Scry 1. (Look at the top card of your library. You may put that card on the bottom.)
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Prismari Campus",
  faces: [{ abilities: [
    land.tapped(),
    mana(['U', 'R']),
    land.scryAbility('{4}'),
  ] }],
  rulings: {},
});
