// Tarcísio, o Plano B (carta própria da mesa)
// Other creatures you control get +1/+1.
// As long as you don't control your commander, Tarcísio gets +3/+3 and has vigilance.
import { and, anthem, defineCard, is, selfGets } from '../../motor/api.ts';
import { controlaComandante } from '../wakanda.ts';

export default defineCard({
  name: 'Tarcísio, o Plano B',
  faces: [{
    abilities: [
      anthem(and(is.creature, is.yours, is.other), () => [{ k: 'pt', p: 1, t: 1 }], 'As outras criaturas que você controla recebem +1/+1.'),
      selfGets((c) => (controlaComandante(c.g, c.you) ? [] : [{ k: 'pt', p: 3, t: 3 }, { k: 'addKeyword', kw: 'vigilance' }]),
        'Enquanto você não controlar o seu comandante, Tarcísio recebe +3/+3 e tem vigilância.'),
    ],
  }],
  rulings: {},
});
