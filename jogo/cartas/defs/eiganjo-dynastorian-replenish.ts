// Eiganjo Dynastorian // Replenish
// Eiganjo Dynastorian — Vigilance. Whenever you attack with two or more creatures, this creature becomes prepared.
// Replenish (feitiço preparado) — Return all enchantment cards from your graveyard to the battlefield.
import { defineCard, isType, keyword, on, prepare, putOntoBattlefield, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Eiganjo Dynastorian // Replenish',
  faces: [
    {
      abilities: [
        keyword('vigilance'),
        triggered(on.custom((e, c) => e.type === 'attackers' && e.player === c.you && e.attackers.length >= 2), function* (c) { prepare(c.g, c.source); },
          { text: 'Sempre que você ataca com duas ou mais criaturas, esta criatura fica preparada.' }),
      ],
    },
    {
      spell: {
        *effect(c) {
          // todas de uma vez; Auras escolhem o que encantar entre o que já está no campo (rulings 12, 18)
          const ids = c.g.state.zones.graveyard[c.you].filter((id) => isType(c.g, id, 'Enchantment'));
          if (ids.length) yield* putOntoBattlefield(c.g, ids.map((id) => ({ id, controller: c.you })), 'effect');
        },
      },
    },
  ],
  rulings: {
    1: 'regra geral: CR 722.3a — prepare() não age em quem já está preparado',
    2: 'regra geral: CR 722.3c — exceção a 704.5e (motor/sba.ts)',
    3: 'teste: ao ficar preparado, cria a cópia do feitiço no exílio; conjurá-la tira a designação',
    4: 'regra geral: CR 722.3 — a carta é conjurada só pela frente',
    5: 'regra geral: CR 722.3c — só o controlador atual (motor/priority.ts)',
    6: 'regra geral: CR 603.2 — disparou, o que acontece com as atacantes não importa',
    7: 'regra geral: CR 608.2b — não resolve; a designação já saiu ao conjurar (601.2i)',
    8: 'regra geral: CR 722.2b e 722.3a — preparado é designação do objeto, não valor copiável',
    9: 'regra geral: CR 722.3a — prepare() exige feitiço preparado',
    10: 'regra geral: CR 722.3c — a cópia usa só as características do feitiço preparado',
    11: 'regra geral: CR 722.3c — conjura pela permissão, pagando o custo normal',
    12: 'regra geral: CR 303.4f — a Aura só escolhe entre o que já está no campo (putOntoBattlefield)',
    13: 'regra geral: CR 722.3a — a designação continua',
    14: 'regra geral: CR 722.4 — fora do campo, só as características normais',
    15: 'regra geral: CR 722.3a — preparado é designação, não habilidade',
    16: 'não se aplica: nenhuma carta dos decks pede para nomear uma carta',
    17: 'regra geral: CR 722.3b — sem a designação, a cópia no exílio deixa de existir (704.5e)',
    18: 'teste: Aura devolvida escolhe o que encantar sem mirar',
  },
});
