// Millikin — {T}, Mill a card: Add {C}. (Activate only as an instant.)
// CR 605.1a: um custo que move carta do grimório impede que seja habilidade de mana,
// então esta habilidade usa a pilha e a mana só entra quando ela resolve.
import { activated, addMana, defineCard } from '../../motor/api.ts';

export default defineCard({
  name: 'Millikin',
  faces: [{ abilities: [activated('{T}, Mill a card', function* (c) { addMana(c.g, c.you, ['C'], { source: c.source }); }, { timing: 'instant', text: '{T}, Moa uma carta: Adicione {C}. (Ative só como instantânea.)' })] }],
  rulings: {
    1: "teste: CR 605.1a: mói como custo, usa a pilha e adiciona {C} ao resolver",
  },
});
