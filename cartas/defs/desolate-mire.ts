// Desolate Mire
// {1}, {T}: Add {W}{B}.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Desolate Mire",
  faces: [{ abilities: [
    mana('WB', { cost: '{1}, {T}' }),
  ] }],
});
