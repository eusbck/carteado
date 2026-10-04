// Shivan Reef
// {T}: Add {C}.
// {T}: Add {U} or {R}. This land deals 1 damage to you.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Shivan Reef",
  faces: [{ abilities: [
    mana('C'),
    land.pain(['U', 'R']),
  ] }],
});
