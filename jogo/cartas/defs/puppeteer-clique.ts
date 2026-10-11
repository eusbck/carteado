// Puppeteer Clique
// Flying
// When this creature enters, put target creature card from an opponent's graveyard onto the battlefield under your
// control. It gains haste. At the beginning of your next end step, exile it.
// Persist (When this creature dies, if it had no -1/-1 counters on it, return it to the battlefield under its owner's
// control with a -1/-1 counter on it.)
import { defineAbility, defineCard, delayed, etb, exile, is, keyword, on, persist, putOntoBattlefield, t, tgt, triggered, withDuration } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

// "No início da sua próxima etapa final, exile-a"
const EXILA = defineAbility('Puppeteer Clique:exila', triggered(on.custom((e, c) => {
  if (e.type !== 'step' || e.step !== 'end' || e.active !== c.you) return false;
  // CR 513.2: criado durante a sua etapa final, espera a do seu próximo turno
  const d = (c as unknown as { delayed?: { createdTurn: number; createdStep: string } }).delayed;
  return !d || c.g.state.turn.number > d.createdTurn || d.createdStep !== 'end';
}), function* (c) {
  const id = c.data.criatura as ObjId;
  if (c.g.state.objects[id]?.zone === 'battlefield') yield* exile(c.g, [id]);
}, { text: 'No início da sua próxima etapa final, exile a criatura trazida por Puppeteer Clique.' }));

export default defineCard({
  name: 'Puppeteer Clique',
  faces: [{
    abilities: [
      keyword('flying'),
      etb(function* (c) {
        const carta = tgt(c);
        if (carta === null) return;
        const [nova] = yield* putOntoBattlefield(c.g, [{ id: carta, controller: c.you }], 'effect');
        if (nova === undefined) return;
        // "ela ganha ímpeto": sem prazo, vale enquanto esse permanente estiver no campo
        withDuration(c, [nova], [{ k: 'addKeyword', kw: 'haste' }], { kind: 'whileOnBattlefield', obj: nova });
        delayed(c, EXILA.id!, { data: { criatura: nova } });
      }, {
        targets: [t.card('graveyard', is.creature, 'carta de criatura alvo no cemitério de um oponente', 'opponent')],
        text: 'Quando esta criatura entra, coloque a carta de criatura alvo do cemitério de um oponente no campo de batalha sob o seu controle. Ela ganha ímpeto. No início da sua próxima etapa final, exile-a.',
      }),
      // CR 702.79a
      persist(),
    ],
  }],
  rulings: {
    1: 'teste: persistir — volta com um marcador -1/-1 e a habilidade de entrar dispara de novo; com o marcador, não volta',
    2: 'regra geral: CR 603.3b — gatilhos simultâneos vão para a pilha em ordem APNAP (motor/triggers.ts)',
    3: 'regra geral: CR 702.79a — persistir olha a criatura como existia no campo (testes/regras-criaturas.test.ts)',
    4: 'regra geral: CR 702.79a — persistir funciona mesmo se deixou de ser criatura (motor/criaturas.ts)',
    5: 'regra geral: CR 702.79a, 603.10a — usa a última informação conhecida (testes/regras-criaturas.test.ts)',
    6: 'regra geral: CR 702.79b — instâncias repetidas são redundantes (motor/criaturas.ts)',
    7: 'regra geral: CR 111.8 — a ficha que morre deixa de existir e não volta (motor/actions.ts moveObjects)',
  },
});
