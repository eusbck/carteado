// Human Torch
// At the beginning of combat on your turn, if you've cast a noncreature spell this turn, Human Torch gains flying,
// double strike, and haste until end of turn.
// Whenever Human Torch attacks, you may pay {R}{G}{W}{U}. If you do, until end of turn, whenever he deals combat damage
// to an opponent, he deals that much damage to each other opponent.
import { dealDamage, defineAbility, defineCard, delayed, mayPay, on, triggered, untilEndOfTurn } from '../../motor/api.ts';
import type { PlayerId } from '../../motor/types.ts';
import { noCombateSeConjurou } from '../quarteto.ts';

const ESPALHA = defineAbility('Human Torch:espalha', triggered({
  kind: 'event',
  match: (e, c) => (e.type === 'damage' && e.combat && e.source === c.source && e.target.kind === 'player' && c.g.isOpponent(c.you, e.target.id) ? { jogador: e.target.id, n: e.amount } : false),
}, function* (c) {
  const n = c.event.n as number;
  const outros = c.g.opponents(c.you).filter((p) => p !== (c.event.jogador as PlayerId));
  if (n > 0 && outros.length) dealDamage(c.g, outros.map((p) => ({ source: c.source, target: { kind: 'player' as const, id: p }, amount: n, combat: false })));
}, { text: 'Sempre que Human Torch causa dano de combate a um oponente, ele causa essa quantidade de dano a cada outro oponente.' }));

export default defineCard({
  name: 'Human Torch',
  faces: [{
    abilities: [
      noCombateSeConjurou(function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') untilEndOfTurn(c, [c.source], [{ k: 'addKeyword', kw: 'flying' }, { k: 'addKeyword', kw: 'double strike' }, { k: 'addKeyword', kw: 'haste' }]);
      }, { text: 'No início do combate no seu turno, se você conjurou uma mágica que não é de criatura neste turno, Human Torch ganha voar, golpe duplo e ímpeto até o fim do turno.' }),
      triggered(on.selfAttacks(), function* (c) {
        // dura até o fim do turno e dispara a cada dano de combate (duas vezes com golpe duplo)
        if (yield* mayPay(c, c.you, '{R}{G}{W}{U}', 'Human Torch causar a cada outro oponente o dano de combate que causar a um oponente')) delayed(c, ESPALHA.id!, { once: false, expiresTurn: c.g.state.turn.number });
      }, { text: 'Sempre que Human Torch ataca, você pode pagar {R}{G}{W}{U}. Se fizer isso, até o fim do turno, sempre que ele causar dano de combate a um oponente, ele causa essa quantidade de dano a cada outro oponente.' }),
    ],
  }],
  rulings: {},
});
