// Fortified Village
// As this land enters, you may reveal a Forest or Plains card from your hand. If you don't, this land enters tapped.
// {T}: Add {G} or {W}.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Fortified Village",
  faces: [{ abilities: [
    land.snarl('Forest', 'Plains'),
    mana(['G', 'W']),
  ] }],
});
