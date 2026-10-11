// Virtue of Persistence // Locthwain Scorn (aventureiro, CR 715)
// Virtue of Persistence {5}{B}{B} — Enchantment
// At the beginning of your upkeep, put target creature card from a graveyard onto the battlefield under your control.
// Locthwain Scorn {1}{B} — Sorcery — Adventure
// Target creature gets -3/-3 until end of turn. You gain 2 life.
import { defineCard, gainLife, is, on, putOntoBattlefield, t, tgt, triggered, untilEndOfTurn } from '../../motor/api.ts';

// Conjurar como aventura, ir para o exílio ao resolver e conjurar a carta de lá ficam no motor (motor/stack.ts,
// priority.ts, CR 715.3d).
export default defineCard({
  name: 'Virtue of Persistence // Locthwain Scorn',
  faces: [
    {
      abilities: [
        triggered(on.upkeep('you'), function* (c) {
          const id = tgt(c);
          if (id !== null) yield* putOntoBattlefield(c.g, [{ id, controller: c.you }], 'effect');
        }, {
          targets: [t.card('graveyard', is.creature, 'carta de criatura alvo de um cemitério', 'any')],
          text: 'No início da sua manutenção, coloque a carta de criatura alvo de um cemitério no campo sob o seu controle.',
        }),
      ],
    },
    {
      spell: {
        targets: [t.creature()],
        *effect(c) {
          const id = tgt(c);
          if (id !== null) untilEndOfTurn(c, [id], [{ k: 'pt', p: -3, t: -3 }]);
          gainLife(c.g, c.you, 2, c.source);
        },
      },
    },
  ],
  rulings: {
    1: 'teste: CR 715.4 — no cemitério é só uma carta de encantamento de valor de mana 7',
    2: 'teste: CR 715.3b — conjurada como aventura, só as características da aventura',
    3: 'regra geral: CR 715.3a — só as características da aventura contam para conjurá-la (testes/regras-formatos.test.ts)',
    4: 'teste: CR 715.3d — anulada, vai para o cemitério e não dá para conjurar a carta depois',
    5: 'teste: exilada de outro jeito, não dá permissão de conjurar',
    6: 'teste: do exílio, só no tempo de um feitiço',
    7: 'regra geral: CR 707.10, 715.3c — a cópia da aventura deixa de existir ao resolver (motor/stack.ts)',
    8: 'não se aplica: nenhuma carta dos decks fala de carta "que tem uma Aventura"',
    9: 'não se aplica: nenhuma carta dos decks fala de carta "que tem uma Aventura"',
    10: 'não se aplica: nenhuma carta dos decks fala de carta "que tem uma Aventura"',
    11: 'não se aplica: nenhuma carta dos decks manda escolher um nome',
    12: 'regra geral: CR 715.3 — conjurar como aventura não é custo alternativo: permissões e "sem pagar" valem para ela (testes/regras-formatos.test.ts)',
  },
});
