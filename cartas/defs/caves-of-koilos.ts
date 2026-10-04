// Caves of Koilos
// {T}: Add {C}.
// {T}: Add {W} or {B}. This land deals 1 damage to you.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Caves of Koilos",
  faces: [{ abilities: [
    mana('C'),
    land.pain(['W', 'B']),
  ] }],
});
