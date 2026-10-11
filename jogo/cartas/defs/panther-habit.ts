// Panther Habit
// If equipped creature would be dealt damage, prevent that damage and put that many +1/+1 counters on it.
// Equip {2}
import { addCounters, defineCard, equip, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Panther Habit',
  faces: [{
    abilities: [
      staticAbility({
        rules: {
          // CR 615.5: o dano é prevenido inteiro e, por isso, a criatura recebe essa quantidade de marcadores
          preventsSomeDamage: (c, alvo, _fonte, quantidade) => {
            const equipada = c.g.state.objects[c.source]?.attachedTo;
            if (alvo.kind !== 'obj' || equipada === null || equipada === undefined || alvo.id !== equipada) return 0;
            addCounters(c.g, { kind: 'obj', id: equipada }, '+1/+1', quantidade, c.you);
            return quantidade;
          },
        },
        text: 'Se a criatura equipada fosse receber dano, previna esse dano e coloque essa quantidade de marcadores +1/+1 nela.',
      }),
      equip('{2}'),
    ],
  }],
  rulings: {},
});