// Yavimaya Coast
// {T}: Add {C}.
// {T}: Add {G} or {U}. This land deals 1 damage to you.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Yavimaya Coast",
  faces: [{ abilities: [
    mana('C'),
    land.pain(['G', 'U']),
  ] }],
  rulings: {
    1: "não se aplica: nenhuma carta dos decks depende da cor da fonte desse dano",
    2: "teste: CR 120.3a: a mana colorida causa 1 de dano a você; {C} não (sem pilha, CR 605.3b)",
  },
});
