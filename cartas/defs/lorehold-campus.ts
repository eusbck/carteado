// Lorehold Campus
// This land enters tapped.
// {T}: Add {R} or {W}.
// {4}, {T}: Scry 1. (Look at the top card of your library. You may put that card on the bottom.)
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Lorehold Campus",
  faces: [{ abilities: [
    land.tapped(),
    mana(['R', 'W']),
    land.scryAbility('{4}'),
  ] }],
});
