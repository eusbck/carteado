// Crumbling Necropolis
// This land enters tapped.
// {T}: Add {U}, {B}, or {R}.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Crumbling Necropolis",
  faces: [{ abilities: [
    land.tapped(),
    mana(['U', 'B', 'R']),
  ] }],
  rulings: {},
});
