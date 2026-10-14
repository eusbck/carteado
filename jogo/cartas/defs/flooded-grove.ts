// Flooded Grove
// {T}: Add {C}.
// {G/U}, {T}: Add {G}{G}, {G}{U}, or {U}{U}.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Flooded Grove",
  faces: [{ abilities: [
    mana('C'),
    land.filter('G', 'U'),
  ] }],
  rulings: {},
});
