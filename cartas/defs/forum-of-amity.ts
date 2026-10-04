// Forum of Amity
// This land enters tapped.
// {T}: Add {W} or {B}.
// {2}{W}{B}, {T}: Surveil 1. (Look at the top card of your library. You may put it into your graveyard.)
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Forum of Amity",
  faces: [{ abilities: [
    land.tapped(),
    mana(['W', 'B']),
    land.surveilAbility('{2}{W}{B}'),
  ] }],
});
