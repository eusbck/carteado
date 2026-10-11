// Storm, Queen of Wakanda
// Flying
// Whenever Storm attacks, until end of turn, another target attacking creature gains flying and gets +X/+0, where X is
// Storm's power.
// Whenever a creature with flying attacks you, Storm deals damage equal to her power to that creature.
import { dealDamage, defineCard, hasKw, is, isAttacking, keyword, lkiChars, on, t, tgt, triggered, untilEndOfTurn } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Storm, Queen of Wakanda',
  faces: [{
    abilities: [
      keyword('flying'),
      triggered(on.selfAttacks(), function* (c) {
        const id = tgt(c);
        if (id === null) return;
        // X é a força de Storm na resolução (ou a última conhecida)
        const x = Math.max(0, lkiChars(c.g, c.source)?.power ?? 0);
        untilEndOfTurn(c, [id], [{ k: 'addKeyword', kw: 'flying' }, { k: 'pt', p: x, t: 0 }]);
      }, {
        targets: [t.creature((c, id) => is.other(c, id) && isAttacking(c.g, id), 'outra criatura atacante alvo')],
        text: 'Sempre que Storm ataca, até o fim do turno, outra criatura atacante alvo ganha voar e recebe +X/+0, onde X é a força de Storm.',
      }),
      // um gatilho por criatura com voar que ataca você
      triggered(on.custom((e, c) => (e.type === 'attackers'
        ? e.attackers.filter((a) => a.target.kind === 'player' && a.target.id === c.you && !!c.g.state.objects[a.obj] && hasKw(c.g, a.obj, 'flying')).map((a) => ({ criatura: a.obj }))
        : false)), function* (c) {
        const id = c.event.criatura as ObjId;
        const x = c.g.state.objects[c.source]?.zone === 'battlefield' ? Math.max(0, lkiChars(c.g, c.source)?.power ?? 0) : 0;
        if (x > 0 && c.g.state.objects[id]?.zone === 'battlefield') dealDamage(c.g, [{ source: c.source, target: { kind: 'obj', id }, amount: x, combat: false }]);
      }, { text: 'Sempre que uma criatura com voar ataca você, Storm causa dano igual à força dela a essa criatura.' }),
    ],
  }],
  rulings: {},
});