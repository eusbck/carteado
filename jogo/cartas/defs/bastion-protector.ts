// Bastion Protector
// Commander creatures you control get +2/+2 and have indestructible.
import { and, anthem, defineCard, is } from '../../motor/api.ts';
import { ehComandante } from '../vingadores.ts';

export default defineCard({
  name: 'Bastion Protector',
  faces: [{
    abilities: [
      // rulings 1-3: qualquer comandante que você controla, seu ou de outro jogador, enquanto for criatura
      anthem(and(is.creature, is.yours, (c, id) => ehComandante(c.g, id)), () => [{ k: 'pt', p: 2, t: 2 }, { k: 'addKeyword', kw: 'indestructible' }],
        'As criaturas comandantes que você controla recebem +2/+2 e têm indestrutível.'),
    ],
  }],
  rulings: {
    1: 'teste: as criaturas comandantes que você controla recebem +2/+2 e têm indestrutível, sejam de quem forem',
    2: 'regra geral: CR 903.3 — "criatura comandante" é a permanente que é comandante de alguém e é criatura (cartas/vingadores.ts ehComandante)',
    3: 'regra geral: CR 903.3 — o comandante que não é criatura no momento não recebe o bônus (cartas/defs/bastion-protector.ts)',
  },
});