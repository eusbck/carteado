// Wayward Swordtooth
// Ascend (If you control ten or more permanents, you get the city's blessing for the rest of the game.)
// You may play an additional land on each of your turns.
// This creature can't attack or block unless you have the city's blessing.
import { defineCard, keyword, staticAbility } from '../../motor/api.ts';
import { terrenoAdicional } from '../terras.ts';

export default defineCard({
  name: 'Wayward Swordtooth',
  faces: [{
    abilities: [
      // CR 702.131: a bênção da cidade vem pelas ações baseadas em estado (motor/sba.ts)
      keyword('ascend'),
      terrenoAdicional(),
      staticAbility({
        rules: {
          canAttack: (c, atacante) => atacante !== c.source || c.g.state.players[c.you].citysBlessing === true,
          canBlock: (c, bloqueador) => bloqueador !== c.source || c.g.state.players[c.you].citysBlessing === true,
        },
        text: 'Esta criatura não pode atacar nem bloquear a menos que você tenha a bênção da cidade.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: soma com Exploration: três terrenos no turno',
    2: 'regra geral: CR 702.131c — a bênção da cidade é para o resto da partida (motor/sba.ts)',
    3: 'regra geral: CR 702.131 — conta qualquer permanente (fichas e terrenos também)',
    4: 'não se aplica: nenhuma mágica com ascender nos decks desta frente',
    5: 'regra geral: CR 702.131b — só com um permanente com ascender (motor/sba.ts)',
    6: 'regra geral: CR 702.131b — conferido nas ações baseadas em estado, antes de outras saírem',
    7: 'teste: com dez permanentes, ganha a bênção e pode atacar',
  },
});
