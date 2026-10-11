// Okoye, Mighty and Adored
// When Okoye enters, you become the monarch.
// At the beginning of combat on your turn, put a +1/+1 counter on target creature. Whenever that creature attacks the
// monarch this turn, it gains double strike and trample until end of turn.
import { addCounters, becomeMonarch, defineAbility, defineCard, delayed, etb, on, t, tgt, triggered, untilEndOfTurn } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

// gatilho atrasado que vale até o fim do turno: a criatura marcada atacando o monarca
const ATACA_O_MONARCA = defineAbility('Okoye, Mighty and Adored:ataca', triggered(on.custom((e, c) => {
  const criatura = (c as unknown as { delayed?: { data: { criatura?: ObjId } } }).delayed?.data.criatura;
  const monarca = c.g.state.monarch;
  return e.type === 'attackers' && monarca !== null && e.attackers.some((a) => a.obj === criatura && a.target.kind === 'player' && a.target.id === monarca);
}), function* (c) {
  const id = c.data.criatura as ObjId;
  if (c.g.state.objects[id]?.zone === 'battlefield') untilEndOfTurn(c, [id], [{ k: 'addKeyword', kw: 'double strike' }, { k: 'addKeyword', kw: 'trample' }]);
}, { text: 'Sempre que essa criatura ataca o monarca neste turno, ela ganha golpe duplo e atropelar até o fim do turno.' }));

export default defineCard({
  name: 'Okoye, Mighty and Adored',
  faces: [{
    abilities: [
      etb(function* (c) { becomeMonarch(c.g, c.you); }, { text: 'Quando Okoye entra, você se torna o monarca.' }),
      triggered(on.beginCombat('you'), function* (c) {
        const id = tgt(c);
        if (id === null) return;
        addCounters(c.g, { kind: 'obj', id }, '+1/+1', 1, c.you);
        delayed(c, ATACA_O_MONARCA.id!, { data: { criatura: id }, once: false, expiresTurn: c.g.state.turn.number });
      }, { targets: [t.creature()], text: 'No início do combate no seu turno, coloque um marcador +1/+1 na criatura alvo. Sempre que essa criatura atacar o monarca neste turno, ela ganha golpe duplo e atropelar até o fim do turno.' }),
    ],
  }],
  rulings: {},
});