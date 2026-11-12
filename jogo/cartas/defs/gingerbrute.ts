// Gingerbrute
// Haste (This creature can attack and {T} as soon as it comes under your control.)
// {1}: This creature can't be blocked this turn except by creatures with haste.
// {2}, {T}, Sacrifice this creature: You gain 3 life.
import { activated, defineCard, gainLife, keyword, untilEndOfTurn } from '../../motor/api.ts';
import { COMIDA } from '../tartarugas.ts';

export default defineCard({
  name: 'Gingerbrute',
  faces: [{
    abilities: [
      keyword('haste'),
      activated('{1}', function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') untilEndOfTurn(c, [c.source], [{ k: 'rule', id: 'rule:blockedOnlyByKeyword', params: { kw: 'haste' } }]);
      }, { text: '{1}: Esta criatura não pode ser bloqueada neste turno, exceto por criaturas com ímpeto.' }),
      activated('{2}, {T}, Sacrifice this creature', function* (c) { gainLife(c.g, c.you, 3, c.source); }, { text: '{2}, {T}, Sacrifique esta criatura: Você ganha 3 de vida.' }),
    ],
  }],
  rulings: {
    1: COMIDA.qualquer,
    2: COMIDA.tipo,
    3: COMIDA.qualquer,
    4: COMIDA.naoComa,
    5: 'regra geral: CR 509.1 — a restrição vale só ao declarar bloqueadores; depois do bloqueio, continua bloqueada (motor/combat.ts)',
  },
});
