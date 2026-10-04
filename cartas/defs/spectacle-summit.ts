// Spectacle Summit
// This land enters tapped.
// {T}: Add {U} or {R}.
// {2}{U}{R}, {T}: Surveil 1. (Look at the top card of your library. You may put it into your graveyard.)
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Spectacle Summit",
  faces: [{ abilities: [
    land.tapped(),
    mana(['U', 'R']),
    land.surveilAbility('{2}{U}{R}'),
  ] }],
});
