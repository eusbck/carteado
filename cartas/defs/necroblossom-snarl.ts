// Necroblossom Snarl
// As this land enters, you may reveal a Swamp or Forest card from your hand. If you don't, this land enters tapped.
// {T}: Add {B} or {G}.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Necroblossom Snarl",
  faces: [{ abilities: [
    land.snarl('Swamp', 'Forest'),
    mana(['B', 'G']),
  ] }],
});
