// King of the Pride
// Other Cats you control get +2/+1.
import { and, anthem, defineCard, is } from '../../motor/api.ts';

export default defineCard({
  name: 'King of the Pride',
  faces: [{
    abilities: [anthem(and(is.subtype('Cat'), is.yours, is.other), () => [{ k: 'pt', p: 2, t: 1 }], 'Os outros Cats que você controla recebem +2/+1.')],
  }],
  rulings: {
    1: 'regra geral: CR 120.6 — o dano fica marcado até a limpeza; sem o bônus, pode virar letal (motor/sba.ts)',
  },
});
