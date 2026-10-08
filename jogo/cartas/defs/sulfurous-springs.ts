// Sulfurous Springs
// {T}: Add {C}.
// {T}: Add {B} or {R}. This land deals 1 damage to you.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Sulfurous Springs",
  faces: [{ abilities: [
    mana('C'),
    land.pain(['B', 'R']),
  ] }],
  rulings: {},
});
