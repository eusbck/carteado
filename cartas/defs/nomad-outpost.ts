// Nomad Outpost
// This land enters tapped.
// {T}: Add {R}, {W}, or {B}.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Nomad Outpost",
  faces: [{ abilities: [
    land.tapped(),
    mana(['R', 'W', 'B']),
  ] }],
});
