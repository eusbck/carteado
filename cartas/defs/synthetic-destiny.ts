// Synthetic Destiny
// Exile all creatures you control. At the beginning of the next end step, reveal cards from the top of your library
// until you reveal that many creature cards, put all creature cards revealed this way onto the battlefield, then shuffle
// the rest of the revealed cards into your library.
import { creaturesOf, defineAbility, defineCard, delayed, exile, isCreature, nameOf, nextEndStepTrigger, putOntoBattlefield, shuffleLibrary } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

/** CR 603.7: gatilho atrasado criado na resolução; "você" é quem controlava a mágica (603.7d) */
const REVELA = defineAbility('Synthetic Destiny:revela', nextEndStepTrigger(function* (c) {
  const s = c.g.state;
  const n = Number(c.data.n ?? 0);
  // CR 701.20: revela do topo até revelar n cartas de criatura (ruling 6: ou o grimório todo)
  const grimorio = s.zones.library[c.you];
  const criaturas: ObjId[] = [];
  let i = 0;
  for (; i < grimorio.length && criaturas.length < n; i++) if (isCreature(c.g, grimorio[i])) criaturas.push(grimorio[i]);
  const reveladas = grimorio.slice(0, i);
  if (n > 0) c.g.log(`${s.players[c.you].name} revela ${reveladas.map((x) => nameOf(c.g, x)).join(', ') || 'nada (grimório vazio)'}.`, { rule: '701.20' });
  // ruling 1: entram ao mesmo tempo
  if (criaturas.length) yield* putOntoBattlefield(c.g, criaturas.map((id) => ({ id, controller: c.you })), 'effect');
  // ruling 4: embaralha mesmo que só tenha revelado cartas de criatura
  shuffleLibrary(c.g, c.you);
}, 'No início da próxima etapa final, revele cartas do topo do seu grimório até revelar esse número de cartas de criatura, coloque-as no campo e embaralhe o resto no grimório.'));

export default defineCard({
  name: 'Synthetic Destiny',
  faces: [{
    spell: {
      *effect(c) {
        // rulings 2, 3, 5: as exiladas ficam no exílio; fichas e o comandante exilados contam
        const exiladas = (yield* exile(c.g, creaturesOf(c.g, c.you))).filter((x): x is ObjId => x !== null && c.g.state.objects[x]?.zone === 'exile');
        delayed(c, REVELA.id!, { data: { n: exiladas.length } });
      },
    },
  }],
  rulings: {
    1: 'teste: na etapa final, revela até o mesmo número de cartas de criatura e elas entram juntas',
    2: 'teste: na etapa final, revela até o mesmo número de cartas de criatura e elas entram juntas',
    3: 'teste: fichas exiladas contam para o número de cartas de criatura',
    4: 'teste: embaralha o grimório mesmo revelando só cartas de criatura',
    5: 'teste: o comandante exilado conta, mesmo indo para a zona de comando',
    6: 'teste: com menos cartas de criatura no grimório, revela o grimório todo',
  },
});
