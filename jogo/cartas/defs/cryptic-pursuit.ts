// Cryptic Pursuit
// Whenever you cast an instant or sorcery spell from your hand, manifest the top card of your library. (Put that card
// onto the battlefield face down as a 2/2 creature. Turn it face up any time for its mana cost if it's a creature card.)
// Whenever a face-down creature you control dies, exile it if it's an instant or sorcery card. You may cast that card
// until the end of your next turn.
import { allowPlay, defineCard, exile, is, manifest, on, triggered } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Cryptic Pursuit',
  faces: [{
    abilities: [
      // CR 701.40: manifestar o topo do grimório; só mágicas conjuradas da mão (não as cópias)
      triggered(on.custom((e, c) => e.type === 'cast' && !e.copy && e.player === c.you && e.from === 'hand' && !!c.g.state.objects[e.obj] && is.instantOrSorcery(c, e.obj)), function* (c) {
        yield* manifest(c.g, c.you);
      }, { text: 'Sempre que você conjura uma mágica instantânea ou feitiço da sua mão, manifeste a carta do topo do seu grimório.' }),
      // olha para trás (CR 603.10a): a criatura estava virada para baixo e era sua quando morreu
      triggered(on.custom((e, c) => {
        if (e.type !== 'zone' || e.from !== 'battlefield' || e.to !== 'graveyard' || e.controller !== c.you) return false;
        const l = c.g.state.lki[e.old];
        return !!l && l.obj.faceDown && l.chars.types.includes('Creature') ? { carta: e.obj } : false;
      }), function* (c) {
        const carta = c.event.carta as ObjId;
        if (c.g.state.objects[carta]?.zone !== 'graveyard' || !is.instantOrSorcery(c, carta)) return;
        const [ex] = yield* exile(c.g, [carta]);
        // só conjurar (não é "jogar"), pagando os custos, até o fim do seu próximo turno
        if (ex !== null && ex !== undefined) allowPlay(c.g, c.you, c.source, [ex], { kind: 'endOfYourNextTurn', player: c.you, afterTurn: c.g.state.turn.number }, { spellsOnly: true });
      }, { text: 'Sempre que uma criatura virada para baixo que você controla morre, exile-a se ela for uma carta de instantânea ou feitiço. Você pode conjurar essa carta até o fim do seu próximo turno.' }),
    ],
  }],
  rulings: {
    1: 'teste: conjurando uma instantânea ou feitiço da mão, manifesta o topo do grimório como uma criatura 2/2 virada para baixo',
    2: 'regra geral: CR 701.40b — virar a manifestada para cima pagando o custo de mana é ação especial (motor/mecanicas.ts turnFaceUp)',
    3: 'regra geral: CR 701.40c — com metamorfose, também vira pelo custo de metamorfose (motor/conjurar-alternativo.ts)',
    4: 'regra geral: CR 701.40b — a manifestada vira mesmo sem habilidades, se for carta de criatura (motor/mecanicas.ts)',
    5: 'regra geral: CR 708.8 — virar para cima não é entrar no campo (motor/mecanicas.ts turnFaceUp)',
    6: 'regra geral: CR 708.2 — a criatura virada para baixo não tem nome (motor/chars.ts)',
    7: 'regra geral: CR 708.8 — virar não muda o permanente (motor/mecanicas.ts)',
    8: 'regra geral: CR 708.8 — virar não muda virado ou desvirado (motor/mecanicas.ts)',
    9: 'regra geral: CR 708.5 — só quem controla vê a face (motor/view.ts)',
    10: 'regra geral: CR 708.9 — ao sair do campo, a carta é revelada (motor/state.ts moveRaw)',
    11: 'não se aplica: a mesa mostra cada permanente virado para baixo separado',
    12: 'regra geral: CR 701.40g — instantânea ou feitiço manifestado não vira para cima (motor/mecanicas.ts manifestFaceUpCost)',
    13: 'regra geral: CR 701.40a, 701.40b — a carta de duas faces manifestada fica virada para baixo e vira com a frente, se a frente for criatura (motor/mecanicas.ts)',
  },
});
