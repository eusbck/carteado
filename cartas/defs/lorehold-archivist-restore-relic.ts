// Lorehold Archivist // Restore Relic
// Lorehold Archivist — First strike. At the beginning of your upkeep, if there are three or more artifact and/or creature
// cards in your graveyard, this creature becomes prepared.
// Restore Relic (feitiço preparado) — Exile target artifact or creature card from your graveyard. Create a token that's a
// copy of it.
import { createTokens, defineCard, exile, is, isCreature, isType, keyword, on, or, prepare, t, tgt, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Lorehold Archivist // Restore Relic',
  faces: [
    {
      abilities: [
        keyword('first strike'),
        triggered(on.upkeep('you'), function* (c) { prepare(c.g, c.source); }, {
          condition: (c) => c.g.state.zones.graveyard[c.you].filter((id) => isCreature(c.g, id) || isType(c.g, id, 'Artifact')).length >= 3,
          text: 'No início da sua manutenção, se houver três ou mais cartas de artefato e/ou criatura no seu cemitério, esta criatura fica preparada.',
        }),
      ],
    },
    {
      spell: {
        targets: [t.card('graveyard', or(is.artifact, is.creature), 'carta de artefato ou criatura alvo no seu cemitério')],
        *effect(c) {
          const id = tgt(c);
          if (id === null) return;
          const def = c.g.state.objects[id].def;
          yield* exile(c.g, [id]);
          yield* createTokens(c.g, c.you, { copyOf: { def, face: 0 } }, 1);
        },
      },
    },
  ],
  rulings: {
    1: "não se aplica: nenhuma carta dos decks pede para nomear uma carta",
    2: "regra geral: CR 722.3a — preparado é designação, não habilidade",
    3: "regra geral: CR 722.2b e 722.3a — preparado é designação do objeto, não valor copiável",
    4: "regra geral: CR 722.3c — a cópia usa só as características do feitiço preparado",
    5: "regra geral: CR 722.3c — exceção a 704.5e (motor/sba.ts)",
    6: "teste: ao ficar preparado, cria a cópia do feitiço no exílio; conjurá-la tira a designação",
    7: "regra geral: CR 722.3b — sem a designação, a cópia no exílio deixa de existir (704.5e)",
    8: "regra geral: CR 722.3c — conjura pela permissão, pagando o custo normal",
    9: 'teste: sem três cartas de artefato e/ou criatura, não dispara',
    10: "regra geral: CR 608.2b — não resolve; a designação já saiu ao conjurar (601.2i)",
    11: 'regra geral: CR 707.2 — copia a carta impressa',
    12: "regra geral: CR 722.3a — prepare() não age em quem já está preparado",
    13: "regra geral: CR 722.4 — fora do campo, só as características normais",
    14: 'regra geral: CR 707.5 — habilidades de entrar da cópia funcionam',
    15: 'regra geral: CR 707.9 — X vale 0',
    16: "regra geral: CR 722.3a — prepare() exige feitiço preparado",
    17: "regra geral: CR 722.3c — só o controlador atual (motor/priority.ts)",
    18: "regra geral: CR 722.3 — a carta é conjurada só pela frente",
    19: "regra geral: CR 722.3a — a designação continua",
  },
});
