// Adarkar Wastes
// {T}: Add {C}.
// {T}: Add {W} or {U}. This land deals 1 damage to you.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Adarkar Wastes",
  faces: [{ abilities: [
    mana('C'),
    land.pain(['W', 'U']),
  ] }],
  rulings: {},
});
