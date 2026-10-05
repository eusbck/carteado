// Kirol, History Buff // Pack a Punch
// Kirol — Whenever one or more cards leave your graveyard, Kirol becomes prepared.
// Pack a Punch (feitiço preparado) — Mill a card. Put two +1/+1 counters on target creature. It gains trample until end of
// turn.
import { addCounters, defineCard, mill, on, prepare, t, tgt, triggered, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Kirol, History Buff // Pack a Punch',
  faces: [
    {
      abilities: [
        triggered(on.batch((evs, c) => evs.some((e) => e.type === 'zone' && e.from === 'graveyard' && e.owner === c.you)), function* (c) { prepare(c.g, c.source); }, {
          text: 'Sempre que uma ou mais cartas saem do seu cemitério, Kirol fica preparado.',
        }),
      ],
    },
    {
      spell: {
        targets: [t.creature()],
        *effect(c) {
          yield* mill(c.g, c.you, 1);
          const id = tgt(c);
          if (id === null || c.g.state.objects[id]?.zone !== 'battlefield') return;
          addCounters(c.g, { kind: 'obj', id }, '+1/+1', 2, c.you);
          untilEndOfTurn(c, [id], [{ k: 'addKeyword', kw: 'trample' }]);
        },
      },
    },
  ],
  rulings: {
    1: "não se aplica: nenhuma carta dos decks pede para nomear uma carta",
    2: "regra geral: CR 722.3a — preparado é designação, não habilidade",
    3: "regra geral: CR 722.3c — conjura pela permissão, pagando o custo normal",
    4: "regra geral: CR 722.3c — só o controlador atual (motor/priority.ts)",
    5: "regra geral: CR 722.2b e 722.3a — preparado é designação do objeto, não valor copiável",
    6: "regra geral: CR 608.2b — não resolve; a designação já saiu ao conjurar (601.2i)",
    7: "regra geral: CR 722.3c — exceção a 704.5e (motor/sba.ts)",
    8: "regra geral: CR 722.3a — prepare() não age em quem já está preparado",
    9: "teste: ao ficar preparado, cria a cópia do feitiço no exílio; conjurá-la tira a designação",
    10: "regra geral: CR 722.4 — fora do campo, só as características normais",
    11: "regra geral: CR 722.3a — a designação continua",
    12: 'teste: várias cartas saindo juntas preparam uma vez',
    13: "regra geral: CR 722.3c — a cópia usa só as características do feitiço preparado",
    14: "regra geral: CR 722.3b — sem a designação, a cópia no exílio deixa de existir (704.5e)",
    15: "regra geral: CR 722.3 — a carta é conjurada só pela frente",
    16: "regra geral: CR 722.3a — prepare() exige feitiço preparado",
  },
});
