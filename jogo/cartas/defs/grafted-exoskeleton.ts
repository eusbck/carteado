// Grafted Exoskeleton
// Equipped creature gets +2/+2 and has infect. (It deals damage to creatures in the form of -1/-1 counters and to players
// in the form of poison counters.)
// Whenever this Equipment becomes unattached from a permanent, sacrifice that permanent.
// Equip {2}
import { attachedGets, controllerOf, defineCard, equip, on, sacrifice, triggered } from '../../motor/api.ts';
import { INFECTAR } from '../jin.ts';

export default defineCard({
  name: 'Grafted Exoskeleton',
  faces: [{
    abilities: [
      attachedGets(() => [{ k: 'pt', p: 2, t: 2 }, { k: 'addKeyword', kw: 'infect' }], 'A criatura equipada recebe +2/+2 e tem infectar.'),
      // ruling 7: vale para qualquer forma de desanexar, inclusive equipar em outra criatura ou o Equipamento sair do campo
      triggered(on.custom((e, c) => (e.type === 'unattach' && e.obj === c.source ? { de: e.from } : false)), function* (c) {
        const id = c.event.de as number;
        // ruling 8: só sacrifica se você ainda controla a permanente
        if (c.g.state.objects[id]?.zone === 'battlefield' && controllerOf(c.g, id) === c.you) yield* sacrifice(c.g, [id]);
      }, { text: 'Sempre que este Equipamento é desanexado de uma permanente, sacrifique essa permanente.' }),
      equip('{2}'),
    ],
  }],
  rulings: {
    1: INFECTAR.veneno,
    2: INFECTAR.qualquer,
    3: INFECTAR.ficam,
    4: INFECTAR.eDano,
    5: INFECTAR.prevenido,
    6: INFECTAR.planeswalker,
    7: 'teste: equipando outra criatura, a anterior é sacrificada',
    8: 'regra geral: CR 701.21a — só se sacrifica a permanente que se controla; se outro jogador a controla, nada acontece (cartas/defs/grafted-exoskeleton.ts)',
  },
});