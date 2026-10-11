// Arcane Sanctum
// This land enters tapped.
// {T}: Add {W}, {U}, or {B}.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Arcane Sanctum",
  faces: [{ abilities: [
    land.tapped(),
    mana(['W', 'U', 'B']),
  ] }],
  rulings: {},
});
