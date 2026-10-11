// Sinister Concierge
// When this creature dies, you may exile it and put three time counters on it. If you do, exile up to one target
// creature and put three time counters on it. Each card exiled this way that doesn't have suspend gains suspend. (For
// each card with suspend, its owner removes a time counter from it at the beginning of their upkeep. When the last is
// removed, they may cast it without paying its mana cost. Those creature spells have haste.)
import { addCounters, defineCard, exile, grantSuspend, on, t, tgt, triggered, upTo, yesNo } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Sinister Concierge',
  faces: [{
    abilities: [
      triggered(on.custom((e, c) => (e.type === 'zone' && e.from === 'battlefield' && e.to === 'graveyard' && e.old === c.source ? { carta: e.obj } : false)), function* (c) {
        const g = c.g;
        const eu = c.event.carta as ObjId;
        // "se fizer isso": só exila o alvo se o próprio Concierge foi exilado do cemitério
        if (g.state.objects[eu]?.zone !== 'graveyard') return;
        if (!(yield* yesNo(g, c.you, 'Sinister Concierge: exilá-lo com três marcadores de tempo? (se fizer isso, a criatura alvo também é exilada assim)'))) return;
        const [meu] = yield* exile(g, [eu]);
        if (meu === null || meu === undefined) return;
        const exiladas: ObjId[] = [meu];
        const alvo = tgt(c);
        if (alvo !== null) {
          // uma ficha exilada deixa de existir (CR 111.8): não recebe marcadores nem suspender
          const [dela] = yield* exile(g, [alvo]);
          if (dela !== null && dela !== undefined && g.state.objects[dela]?.zone === 'exile') exiladas.push(dela);
        }
        for (const id of exiladas) addCounters(g, { kind: 'obj', id }, 'time', 3, c.you);
        // CR 702.62: quem remove os marcadores e conjura é o dono de cada carta
        grantSuspend(g, c.source, c.you, exiladas);
      }, {
        targets: [upTo(1, t.creature())],
        text: 'Quando esta criatura morre, você pode exilá-la e colocar três marcadores de tempo nela. Se fizer isso, exile até uma criatura alvo e coloque três marcadores de tempo nela. Cada carta exilada assim que não tem suspender ganha suspender.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: os dois são exilados com três marcadores de tempo; o dono de cada carta remove um por manutenção e a conjura de graça, com ímpeto',
    2: 'não se aplica: as cartas não são suspensas da mão',
    3: 'regra geral: CR 702.62 — as cartas suspensas ficam exiladas com a face para cima (motor/actions.ts exile)',
    4: 'não se aplica: as cartas não são suspensas da mão',
    5: 'regra geral: CR 702.62a — os alvos são escolhidos quando a mágica é conjurada (motor/mecanicas.ts conjurarSuspensa)',
    6: 'regra geral: CR 702.62b — suspensa é a carta com suspender, exilada e com marcador de tempo (motor/mecanicas.ts)',
    7: 'regra geral: CR 702.62a — se o gatilho de manutenção não resolver, nenhum marcador sai (motor/mecanicas.ts)',
    8: 'regra geral: CR 702.62a — não importa por que o último marcador saiu (motor/mecanicas.ts)',
    9: 'regra geral: CR 702.62a — sem o segundo gatilho, a carta fica exilada sem marcadores (motor/mecanicas.ts)',
    10: 'teste: conjurar ao sair o último marcador é opcional; recusando, a carta fica exilada',
    11: 'regra geral: CR 118.9 — sem pagar o custo de mana não dá para usar outro custo alternativo (motor/mecanicas.ts mayCastFree)',
    12: 'regra geral: CR 107.3b — X vale 0 ao conjurar sem pagar o custo de mana (motor/stack.ts)',
    13: 'regra geral: CR 202.3 — o valor de mana vem do custo de mana, mesmo sem pagar (motor/chars.ts)',
  },
});
