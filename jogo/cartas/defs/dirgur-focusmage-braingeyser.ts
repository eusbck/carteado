// Dirgur Focusmage // Braingeyser
// Dirgur Focusmage — Instant and sorcery spells you cast cost {1} less to cast.
// Whenever you cast an instant or sorcery spell with mana value 5 or greater from your hand, this creature becomes
// prepared.
// Braingeyser (feitiço preparado) — Target player draws X cards.
import { chars, defineCard, draw, isInstantOrSorcery, on, prepare, staticAbility, t, tgtPlayer, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Dirgur Focusmage // Braingeyser',
  faces: [
    {
      abilities: [
        staticAbility({
          rules: { costModifier: (c, spell) => (spell.controller === c.you && (spell.chars.types.includes('Instant') || spell.chars.types.includes('Sorcery')) ? { reduce: 1 } : null) },
          text: 'As mágicas instantâneas e feitiços que você conjura custam {1} a menos.',
        }),
        triggered(on.custom((e, c) => e.type === 'cast' && e.player === c.you && e.from === 'hand' && isInstantOrSorcery(c.g, e.obj) && chars(c.g, e.obj).manaValue >= 5), function* (c) {
          prepare(c.g, c.source);
        }, { text: 'Sempre que você conjura da mão uma mágica instantânea ou feitiço com valor de mana 5 ou mais, esta criatura fica preparada.' }),
      ],
    },
    {
      spell: {
        targets: [t.player()],
        *effect(c) { const p = tgtPlayer(c); if (p !== null && c.x > 0) yield* draw(c.g, p, c.x); },
      },
    },
  ],
  rulings: {
    1: 'teste: ao ficar preparado, cria a cópia do feitiço no exílio; conjurá-la tira a designação',
    2: 'regra geral: CR 722.3b — sem a designação, a cópia no exílio deixa de existir (704.5e)',
    3: 'regra geral: CR 722.3 — a carta é conjurada só pela frente',
    4: 'regra geral: CR 722.2b e 722.3a — preparado é designação do objeto, não valor copiável',
    5: 'regra geral: CR 722.3c — exceção a 704.5e (motor/sba.ts)',
    6: 'regra geral: CR 722.3a — preparado é designação, não habilidade',
    7: 'regra geral: CR 202.3 — valor de mana só pelo custo de mana',
    8: 'regra geral: CR 722.3a — prepare() exige feitiço preparado',
    9: 'regra geral: CR 603.3 — o gatilho resolve antes da mágica',
    10: 'regra geral: CR 722.3a — prepare() não age em quem já está preparado',
    11: 'regra geral: CR 608.2b — não resolve; a designação já saiu ao conjurar (601.2i)',
    12: 'não se aplica: nenhuma carta dos decks pede para nomear uma carta',
    13: 'regra geral: CR 722.3c — a cópia usa só as características do feitiço preparado',
    14: 'regra geral: CR 722.4 — fora do campo, só as características normais',
    15: 'regra geral: CR 722.3c — conjura pela permissão, pagando o custo normal',
    16: 'regra geral: CR 722.3a — a designação continua',
    17: 'regra geral: CR 722.3c — só o controlador atual (motor/priority.ts)',
    18: 'teste: a redução vale para o feitiço preparado',
  },
});
