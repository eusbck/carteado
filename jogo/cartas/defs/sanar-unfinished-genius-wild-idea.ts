// Sanar, Unfinished Genius // Wild Idea
// Sanar — Sanar enters prepared. {T}: Create a Treasure token. Activate only if you've cast an instant or sorcery spell
// this turn.
// Wild Idea (feitiço preparado) — Search your library for an instant or sorcery card, reveal it, put it into your hand,
// then shuffle.
import { activated, asEnters, createTokens, defineCard, is, searchTo } from '../../motor/api.ts';

export default defineCard({
  name: 'Sanar, Unfinished Genius // Wild Idea',
  faces: [
    {
      abilities: [
        // CR 722.3a: "entra preparado"
        asEnters((_c, ev) => { ev.choices.prepared = true; }, 'Sanar entra preparado.'),
        activated('{T}', function* (c) { yield* createTokens(c.g, c.you, 'Treasure', 1); }, {
          condition: (c) => c.g.state.turnStats[c.you].instantSorceryCast > 0,
          text: '{T}: Crie uma ficha de Tesouro. Ative só se você conjurou uma mágica instantânea ou de feitiço neste turno.',
        }),
      ],
    },
    {
      spell: {
        *effect(c) {
          yield* searchTo(c, c.you, (id) => is.instantOrSorcery(c, id), 1, 'hand', { reveal: true, prompt: 'Procure uma carta de instantânea ou feitiço' });
        },
      },
    },
  ],
  rulings: {
    1: "não se aplica: nenhuma carta dos decks pede para nomear uma carta",
    2: "regra geral: CR 722.3c — conjura pela permissão, pagando o custo normal",
    3: "regra geral: CR 722.3c — exceção a 704.5e (motor/sba.ts)",
    4: "regra geral: CR 722.3a — prepare() não age em quem já está preparado",
    5: "teste: ao ficar preparado, cria a cópia do feitiço no exílio; conjurá-la tira a designação",
    6: "regra geral: CR 722.3a — prepare() exige feitiço preparado",
    7: "regra geral: CR 722.3c — a cópia usa só as características do feitiço preparado",
    8: "regra geral: CR 722.3a — preparado é designação, não habilidade",
    9: "regra geral: CR 722.2b e 722.3a — preparado é designação do objeto, não valor copiável",
    10: "regra geral: CR 608.2b — não resolve; a designação já saiu ao conjurar (601.2i)",
    11: "regra geral: CR 722.3a — a designação continua",
    12: "regra geral: CR 722.4 — fora do campo, só as características normais",
    13: "regra geral: CR 722.3c — só o controlador atual (motor/priority.ts)",
    14: "regra geral: CR 722.3 — a carta é conjurada só pela frente",
    15: "regra geral: CR 722.3b — sem a designação, a cópia no exílio deixa de existir (704.5e)",
  },
});
