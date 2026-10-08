// Thunderclap Drake
// Flying
// Instant and sorcery spells you cast cost {1} less to cast.
// {2}{U}, Sacrifice this creature: When you next cast an instant or sorcery spell this turn, copy it for each time you've
// cast your commander from the command zone this game. You may choose new targets for the copies.
import { activated, copySpell, defineAbility, defineCard, delayed, is, keyword, staticAbility, triggered } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

const COPIA = defineAbility('Thunderclap Drake:copia', triggered({
  kind: 'event',
  match: (e, c) => (e.type === 'cast' && e.player === c.you && !!c.g.state.objects[e.obj] && is.instantOrSorcery(c, e.obj) ? { spell: e.obj } : false),
}, function* (c) {
  const spell = c.event.spell as ObjId;
  // ruling 5: soma as conjurações de todos os seus comandantes
  const n = Object.values(c.g.state.players[c.you].commanderCasts).reduce((a, b) => a + b, 0);
  // rulings 1-4, 8: cópias na pilha (não conjuradas), mesmo X, modos, divisão e custos adicionais
  for (let i = 0; i < n; i++) yield* copySpell(c.g, spell, c.you, { newTargets: true });
}, { text: 'Quando você conjurar a próxima mágica instantânea ou de feitiço neste turno, copie-a uma vez para cada vez que você conjurou seu comandante da zona de comando. Você pode escolher novos alvos para as cópias.' }));

export default defineCard({
  name: 'Thunderclap Drake',
  faces: [{
    abilities: [
      keyword('flying'),
      // rulings 6-7: reduz só o genérico; o valor de mana não muda
      staticAbility({
        rules: { costModifier: (c, spell) => (spell.controller === c.you && (spell.chars.types.includes('Instant') || spell.chars.types.includes('Sorcery')) ? { reduce: 1 } : null) },
        text: 'As mágicas instantâneas e de feitiço que você conjura custam {1} a menos.',
      }),
      activated('{2}{U}, Sacrifice this creature', function* (c) {
        delayed(c, COPIA.id!, { once: true, expiresTurn: c.g.state.turn.number });
      }, { text: '{2}{U}, Sacrifique esta criatura: Quando você conjurar a próxima mágica instantânea ou de feitiço neste turno, copie-a para cada vez que você conjurou seu comandante da zona de comando nesta partida.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 707.10 — as cópias não são conjuradas',
    2: 'regra geral: CR 707.10 — mesmo X',
    3: 'regra geral: CR 707.10 — divisão e número de alvos não mudam',
    4: 'regra geral: CR 707.10 — custos adicionais pagos são copiados',
    5: 'regra geral: soma das conjurações de todos os comandantes (cada deck tem um só)',
    6: 'teste: a redução não paga mana colorida',
    7: 'regra geral: CR 202.3 — valor de mana não muda',
    8: 'regra geral: CR 707.10 — mesmos modos',
    9: 'regra geral: o texto Oracle atualizado é o que o motor segue',
  },
});
