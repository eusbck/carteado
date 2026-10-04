// Llanowar Wastes
// {T}: Add {C}.
// {T}: Add {B} or {G}. This land deals 1 damage to you.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Llanowar Wastes",
  faces: [{ abilities: [
    mana('C'),
    land.pain(['B', 'G']),
  ] }],
});
