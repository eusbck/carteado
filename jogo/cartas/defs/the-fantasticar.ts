// The Fantasticar
// Flying
// Whenever you cast a noncreature spell, you may have The Fantasticar become an artifact creature until end of turn.
// Whenever you cast your fourth noncreature spell each turn, you may sacrifice The Fantasticar. If you do, create four
// 4/4 colorless Construct artifact creature tokens with flying and haste.
import { createTokens, defineCard, isCreature, keyword, on, sacrifice, triggered, untilEndOfTurn, yesNo } from '../../motor/api.ts';
import { aoConjurarNaoCriatura } from '../quarteto.ts';

export default defineCard({
  name: 'The Fantasticar',
  faces: [{
    abilities: [
      keyword('flying'),
      triggered(aoConjurarNaoCriatura(), function* (c) {
        if (c.g.state.objects[c.source]?.zone !== 'battlefield' || isCreature(c.g, c.source)) return;
        // continua sendo Veículo; a força e a resistência impressas (4/4) passam a valer (CR 301.7a)
        if (yield* yesNo(c.g, c.you, 'The Fantasticar: virar criatura artefato até o fim do turno?')) untilEndOfTurn(c, [c.source], [{ k: 'addTypes', types: ['Creature'] }]);
      }, { text: 'Sempre que você conjura uma mágica que não é de criatura, você pode fazer The Fantasticar virar uma criatura artefato até o fim do turno.' }),
      // a contagem do turno já inclui a mágica que acabou de ser conjurada
      triggered(on.custom((e, c) => (e.type === 'cast' && !e.copy && e.player === c.you && !!c.g.state.objects[e.obj] && !isCreature(c.g, e.obj)
        && (c.g.state.turnStats[c.you]?.noncreatureSpellsCast ?? 0) === 4)), function* (c) {
        if (c.g.state.objects[c.source]?.zone !== 'battlefield') return;
        if (!(yield* yesNo(c.g, c.you, 'The Fantasticar: sacrificar para criar quatro Constructs 4/4 com voar e ímpeto?'))) return;
        const [ok] = yield* sacrifice(c.g, [c.source]);
        if (ok !== null && ok !== undefined) yield* createTokens(c.g, c.you, 'Construct 4/4', 4);
      }, { text: 'Sempre que você conjura a sua quarta mágica que não é de criatura em cada turno, você pode sacrificar The Fantasticar. Se fizer isso, crie quatro fichas de criatura artefato Construct 4/4 incolores com voar e ímpeto.' }),
    ],
  }],
  rulings: {},
});
