// Casey Jones, Back Alley Brute
// Menace
// Whenever Casey Jones attacks, put a +1/+1 counter on target attacking creature.
// Whenever you put one or more +1/+1 counters on a creature you control, Casey Jones deals that much damage to target
// opponent.
import { addCounters, controllerOf, dealDamage, defineCard, isCreature, keyword, on, t, tgt, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Casey Jones, Back Alley Brute',
  faces: [{
    abilities: [
      keyword('menace'),
      triggered(on.selfAttacks(), function* (c) {
        const id = tgt(c);
        if (id !== null) addCounters(c.g, { kind: 'obj', id }, '+1/+1', 1, c.you);
      }, { targets: [t.creature((c, id) => !!c.g.state.combat?.attackers.some((a) => a.id === id && !a.removed), 'criatura atacante alvo')], text: 'Sempre que Casey Jones ataca, coloque um marcador +1/+1 na criatura atacante alvo.' }),
      // conta os marcadores realmente postos (já com as substituições), inclusive os de quem entra com marcadores
      triggered(on.custom((e, c) => (e.type === 'counters' && e.kind === '+1/+1' && e.amount > 0 && e.by === c.you && e.target.kind === 'obj' && !!c.g.state.objects[e.target.id]
        && isCreature(c.g, e.target.id) && controllerOf(c.g, e.target.id) === c.you ? { n: e.amount } : false)), function* (c) {
        const r = c.targets[0]?.[0];
        if (r && r.kind === 'player') dealDamage(c.g, [{ source: c.source, target: r, amount: Number(c.event.n), combat: false }]);
      }, { targets: [t.opponent()], text: 'Sempre que você coloca um ou mais marcadores +1/+1 numa criatura que você controla, Casey Jones causa essa quantidade de dano ao oponente alvo.' }),
    ],
  }],
  rulings: {},
});