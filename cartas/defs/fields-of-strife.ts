// Fields of Strife
// This land enters tapped.
// {T}: Add {R} or {W}.
// {2}{R}{W}, {T}: Surveil 1. (Look at the top card of your library. You may put it into your graveyard.)
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Fields of Strife",
  faces: [{ abilities: [
    land.tapped(),
    mana(['R', 'W']),
    land.surveilAbility('{2}{R}{W}'),
  ] }],
});
