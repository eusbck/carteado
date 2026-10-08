// Graven Cairns
// {T}: Add {C}.
// {B/R}, {T}: Add {B}{B}, {B}{R}, or {R}{R}.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Graven Cairns",
  faces: [{ abilities: [
    mana('C'),
    land.filter('B', 'R'),
  ] }],
  rulings: {
    1: "teste: CR 605: mana que produz (custo híbrido pago com qualquer das cores, CR 107.4e)",
  },
});
