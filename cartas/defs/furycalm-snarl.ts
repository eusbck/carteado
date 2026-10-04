// Furycalm Snarl
// As this land enters, you may reveal a Mountain or Plains card from your hand. If you don't, this land enters tapped.
// {T}: Add {R} or {W}.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Furycalm Snarl",
  faces: [{ abilities: [
    land.snarl('Mountain', 'Plains'),
    mana(['R', 'W']),
  ] }],
});
