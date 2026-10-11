// Nykthos Paragon
// Whenever you gain life, you may put that many +1/+1 counters on each creature you control. Do this only once each turn.
import { addCounters, creaturesOf, defineCard, on, triggered, yesNo } from '../../motor/api.ts';
import { GANHO_DE_VIDA } from '../miku.ts';

const CHAVE = 'nykthos-paragon';

export default defineCard({
  name: 'Nykthos Paragon',
  faces: [{
    abilities: [
      triggered(on.youGainLife(), function* (c) {
        const s = c.g.state;
        const o = s.objects[c.source];
        // ruling 4: com vários gatilhos na pilha, só um deles põe os marcadores
        if (!o || o.zone !== 'battlefield' || o.usedThisTurn[CHAVE] === s.turn.number) return;
        const n = Number(c.event.amount ?? 0);
        if (n <= 0 || !(yield* yesNo(c.g, c.you, `Nykthos Paragon: colocar ${n} marcador(es) +1/+1 em cada criatura que você controla? (só uma vez por turno)`))) return;
        o.usedThisTurn[CHAVE] = s.turn.number;
        c.g.bump();
        for (const id of creaturesOf(c.g, c.you)) addCounters(c.g, { kind: 'obj', id }, '+1/+1', n, c.you);
      }, {
        // rulings 1-3: enquanto você não tiver escolhido pôr os marcadores neste turno, todo ganho de vida dispara;
        // depois, não dispara mais. Cada Nykthos Paragon conta o próprio uso
        condition: (c) => c.g.state.objects[c.source]?.usedThisTurn[CHAVE] !== c.g.state.turn.number,
        text: 'Sempre que você ganha vida, você pode colocar essa quantidade de marcadores +1/+1 em cada criatura que você controla. Faça isso apenas uma vez por turno.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: recusando da primeira vez, o próximo ganho de vida dispara de novo',
    2: 'regra geral: CR 603.2 — "apenas uma vez por turno" vale para cada Nykthos Paragon em separado (objeto.usedThisTurn)',
    3: 'teste: depois de colocar os marcadores, outro ganho de vida no turno não dispara mais',
    4: 'regra geral: CR 603.4 — a condição é conferida de novo na resolução: os outros gatilhos na pilha não fazem nada (cartas/defs/nykthos-paragon.ts)',
    5: GANHO_DE_VIDA.danoLetal,
    6: GANHO_DE_VIDA.vinculo,
  },
});