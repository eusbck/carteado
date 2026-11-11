// Wayward Swordtooth
// Ascend
// You may play an additional land on each of your turns.
// This creature can't attack or block unless you have the city's blessing.
import { defineCard, keyword, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Wayward Swordtooth',
  faces: [{
    abilities: [
      { ...keyword('ascend'), text: 'Ascensão (se você controlar dez ou mais permanentes, você recebe a bênção da cidade pelo resto do jogo).' },
      staticAbility({ rules: { extraLandPlays: (c, p) => (p === c.you ? 1 : 0) }, text: 'Você pode jogar um terreno adicional em cada um dos seus turnos.' }),
      staticAbility({
        rules: {
          canAttack: (c, a) => a !== c.source || c.g.state.players[c.you].citysBlessing,
          canBlock: (c, b) => b !== c.source || c.g.state.players[c.you].citysBlessing,
        },
        text: 'Esta criatura não pode atacar nem bloquear a menos que você tenha a bênção da cidade.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 702.131c — a bênção fica pelo resto do jogo (motor/sba.ts)',
    2: 'regra geral: CR 702.131b — não usa a pilha',
  },
});
