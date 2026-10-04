// Titan's Grave
// This land enters tapped.
// {T}: Add {B} or {G}.
// {2}{B}{G}, {T}: Surveil 1. (Look at the top card of your library. You may put it into your graveyard.)
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Titan's Grave",
  faces: [{ abilities: [
    land.tapped(),
    mana(['B', 'G']),
    land.surveilAbility('{2}{B}{G}'),
  ] }],
});
