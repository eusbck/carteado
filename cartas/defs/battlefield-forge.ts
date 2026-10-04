// Battlefield Forge
// {T}: Add {C}.
// {T}: Add {R} or {W}. This land deals 1 damage to you.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Battlefield Forge",
  faces: [{ abilities: [
    mana('C'),
    land.pain(['R', 'W']),
  ] }],
});
