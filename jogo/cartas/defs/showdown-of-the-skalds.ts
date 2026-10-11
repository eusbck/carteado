// Showdown of the Skalds
// (As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)
// I — Exile the top four cards of your library. Until the end of your next turn, you may play those cards.
// II, III — Whenever you cast a spell this turn, put a +1/+1 counter on target creature you control.
import { addCounters, allowPlay, chapter, defineAbility, defineCard, delayed, exile, is, sagaEnters, t, tgt, triggered } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

// gatilho atrasado que vale até o fim do turno e dispara a cada mágica (CR 603.7); o alvo é escolhido a cada disparo
const MARCADOR = defineAbility('Showdown of the Skalds:marcador', triggered({
  kind: 'event',
  match: (e, c) => e.type === 'cast' && !e.copy && e.player === c.you,
}, function* (c) {
  const id = tgt(c);
  if (id !== null) addCounters(c.g, { kind: 'obj', id }, '+1/+1', 1, c.you);
}, { targets: [t.creature(is.yours, 'criatura alvo que você controla')], text: 'Sempre que você conjurar uma mágica neste turno, coloque um marcador +1/+1 na criatura alvo que você controla.' }));

export default defineCard({
  name: 'Showdown of the Skalds',
  faces: [{
    abilities: [
      // CR 714.3a
      sagaEnters(),
      chapter([1], function* (c) {
        const s = c.g.state;
        // ruling 2: exiladas viradas para cima
        const exiladas = (yield* exile(c.g, s.zones.library[c.you].slice(0, 4))).filter((x): x is ObjId => x !== null && s.objects[x]?.zone === 'exile');
        // rulings 3-5: jogadas pagando os custos e no tempo normal; o que sobrar fica exilado
        allowPlay(c.g, c.you, c.source, exiladas, { kind: 'endOfYourNextTurn', player: c.you, afterTurn: s.turn.number });
      }, { text: 'I — Exile as quatro cartas do topo do seu grimório. Até o fim do seu próximo turno, você pode jogar essas cartas.' }),
      chapter([2, 3], function* (c) {
        delayed(c, MARCADOR.id!, { once: false, expiresTurn: c.g.state.turn.number });
      }, { text: 'II, III — Sempre que você conjurar uma mágica neste turno, coloque um marcador +1/+1 na criatura alvo que você controla.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 714.2b — o capítulo dispara quando o total de marcadores passa de menos que N para N ou mais (motor/mecanicas.ts chapter)',
    2: 'teste: I: exila as quatro cartas do topo viradas para cima; dá para jogá-las até o fim do seu próximo turno',
    3: 'regra geral: CR 601.3, 305.1 — a carta exilada é jogada no tempo normal, pagando os custos (motor/priority.ts rule:mayPlay)',
    4: 'regra geral: CR 305.1 — terreno do exílio só com jogada de terreno disponível (motor/priority.ts)',
    5: 'teste: I: exila as quatro cartas do topo viradas para cima; dá para jogá-las até o fim do seu próximo turno',
    6: 'regra geral: CR 714.3a — a Saga entra com um marcador e recebe outro depois da sua etapa de compra (motor/mecanicas.ts sagaEnters, motor/turn.ts)',
    7: 'regra geral: CR 714.2b — cada capítulo é uma habilidade desencadeada (motor/mecanicas.ts chapter)',
    8: 'regra geral: CR 714.2b — o capítulo já atingido não dispara de novo (motor/mecanicas.ts chapter)',
    9: 'regra geral: CR 113.7a — a habilidade na pilha não depende de a Saga continuar no campo',
    10: 'regra geral: CR 603.3b — capítulos que disparam juntos vão para a pilha na ordem que você escolher',
    11: 'teste: II: neste turno, cada mágica que você conjura põe um marcador +1/+1 na criatura alvo',
  },
});
