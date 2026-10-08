// Grave Researcher // Reanimate
// Grave Researcher — At the beginning of your upkeep, surveil 1. Then if there are three or more creature cards in your
// graveyard, this creature becomes prepared.
// Reanimate (feitiço preparado) — Put target creature card from a graveyard onto the battlefield under your control. You
// lose life equal to that card's mana value.
import { defineCard, is, lookAndArrange, loseLife, manaValue, on, prepare, putOntoBattlefield, t, tgt, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Grave Researcher // Reanimate',
  faces: [
    {
      abilities: [
        triggered(on.upkeep('you'), function* (c) {
          yield* lookAndArrange(c.g, c.you, 1, 'surveil');
          const n = c.g.state.zones.graveyard[c.you].filter((id) => is.creature(c, id)).length;
          if (n >= 3) prepare(c.g, c.source);
        }, { text: 'No início da sua manutenção, vigie 1. Depois, se houver três ou mais cards de criatura no seu cemitério, esta criatura fica preparada.' }),
      ],
    },
    {
      spell: {
        targets: [t.card('graveyard', is.creature, 'carta de criatura alvo em um cemitério', 'any')],
        *effect(c) {
          const id = tgt(c);
          if (id === null) return;
          // ruling 9: valor de mana da carta no cemitério (X = 0)
          const vm = manaValue(c.g, id);
          yield* putOntoBattlefield(c.g, [{ id, controller: c.you }], 'effect');
          // rulings 1, 13: perde vida depois que a criatura já está no campo
          if (vm > 0) loseLife(c.g, c.you, vm, c.source);
        },
      },
    },
  ],
  rulings: {
    1: 'regra geral: CR 603.3 — gatilhos de entrada vão para a pilha depois que Reanimate termina de resolver',
    2: 'regra geral: CR 800.4a — quem sai do jogo leva suas cartas; o que controlava é exilado',
    3: 'regra geral: CR 722.3a — a designação continua sem habilidades',
    4: 'regra geral: CR 722.4 — fora do campo, só as características normais',
    5: 'teste: ao ficar preparado, cria a cópia de Reanimate no exílio',
    6: 'regra geral: CR 722.3a — preparado é designação do objeto',
    7: 'regra geral: CR 722.3a — prepare() não age em quem já está preparado',
    8: 'regra geral: CR 722.3 — a carta é conjurada só pela frente',
    9: 'teste: perde vida igual ao valor de mana da carta',
    10: 'regra geral: CR 722.3a — prepare() exige feitiço preparado',
    11: 'regra geral: CR 722.3c — só o controlador atual (motor/priority.ts)',
    12: 'regra geral: CR 722.2b — preparado não é valor copiável',
    13: 'regra geral: CR 608.2c — a perda de vida vem depois, na ordem do texto',
    14: 'regra geral: CR 722.3c — conjurar a cópia não é custo alternativo',
    15: 'regra geral: CR 722.3c — exceção a 704.5e (motor/sba.ts)',
    16: 'não se aplica: nenhuma carta dos decks pede para nomear uma carta',
    17: 'regra geral: CR 722.3b — sem a designação, a cópia no exílio deixa de existir',
    18: 'regra geral: CR 722.3a — a cópia vem do feitiço da carta, sem exceções de cópia',
    19: 'regra geral: CR 202.3e — X vale 0 fora da pilha',
    20: 'regra geral: CR 608.2b — sem alvo legal, não resolve; a designação já saiu ao conjurar',
  },
});
