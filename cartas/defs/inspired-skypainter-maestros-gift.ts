// Inspired Skypainter // Maestro's Gift
// Inspired Skypainter — Flying. When this creature enters and whenever one or more creature tokens you control deal combat
// damage to a player, this creature becomes prepared.
// Maestro's Gift (feitiço preparado) — Create a token that's a copy of target creature you control. That token gains haste
// until end of turn.
import { and, copiableValues, createTokens, defineCard, etb, is, isCreature, keyword, on, prepare, t, tgt, triggered, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: "Inspired Skypainter // Maestro's Gift",
  faces: [
    {
      abilities: [
        keyword('flying'),
        etb(function* (c) { prepare(c.g, c.source); }, { text: 'Quando esta criatura entra, ela fica preparada.' }),
        triggered(on.batch((evs, c) => evs.some((e) => e.type === 'damage' && e.combat && e.target.kind === 'player' && !!c.g.state.objects[e.source]?.isToken
          && c.g.state.objects[e.source].controller === c.you && isCreature(c.g, e.source))), function* (c) { prepare(c.g, c.source); }, {
          text: 'Sempre que uma ou mais fichas de criatura que você controla causam dano de combate a um jogador, esta criatura fica preparada.',
        }),
      ],
    },
    {
      spell: {
        targets: [t.creature(and(is.yours), 'criatura alvo que você controla')],
        *effect(c) {
          const id = tgt(c);
          if (id === null) return;
          const fichas = yield* createTokens(c.g, c.you, { copyOf: copiableValues(c.g, id) }, 1);
          if (fichas.length) untilEndOfTurn(c, fichas, [{ k: 'addKeyword', kw: 'haste' }]);
        },
      },
    },
  ],
  rulings: {
    1: "regra geral: CR 722.3a — prepare() exige feitiço preparado",
    2: "regra geral: CR 722.3 — a carta é conjurada só pela frente",
    3: "regra geral: CR 608.2b — não resolve; a designação já saiu ao conjurar (601.2i)",
    4: "regra geral: CR 722.2b e 722.3a — preparado é designação do objeto, não valor copiável",
    5: 'regra geral: CR 707.2 — ficha copia os valores originais da ficha',
    6: "regra geral: CR 722.3b — sem a designação, a cópia no exílio deixa de existir (704.5e)",
    7: 'regra geral: CR 707.2 — sem marcadores nem efeitos',
    8: "regra geral: CR 722.4 — fora do campo, só as características normais",
    9: "regra geral: CR 722.3c — conjura pela permissão, pagando o custo normal",
    10: "regra geral: CR 722.3a — prepare() não age em quem já está preparado",
    11: 'regra geral: CR 707.3 — copia o que a criatura estiver copiando',
    12: "regra geral: CR 722.3a — preparado é designação, não habilidade",
    13: "regra geral: CR 722.3a — a designação continua",
    14: "regra geral: CR 722.3c — exceção a 704.5e (motor/sba.ts)",
    15: "não se aplica: nenhuma carta dos decks pede para nomear uma carta",
    16: "regra geral: CR 722.3c — a cópia usa só as características do feitiço preparado",
    17: 'regra geral: CR 707.5 — habilidades de entrar da cópia funcionam',
    18: "teste: ao ficar preparado, cria a cópia do feitiço no exílio; conjurá-la tira a designação",
    19: "regra geral: CR 722.3c — só o controlador atual (motor/priority.ts)",
  },
});
