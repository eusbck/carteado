// Tendershoot Dryad
// Ascend (If you control ten or more permanents, you get the city's blessing for the rest of the game.)
// At the beginning of each upkeep, create a 1/1 green Saproling creature token.
// Saprolings you control get +2/+2 as long as you have the city's blessing.
import { createTokens, defineCard, isCreature, isSubtype, keyword, on, staticAbility, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Tendershoot Dryad',
  faces: [{
    abilities: [
      // rulings 1-2, 4-5, 8: ascensão (CR 702.131) — verificada com as ações de estado (motor/sba.ts)
      keyword('ascend'),
      triggered(on.upkeep('each'), function* (c) { yield* createTokens(c.g, c.you, 'Saproling', 1); }, { text: 'No início de cada manutenção, crie uma ficha de criatura Saproling verde 1/1.' }),
      staticAbility({
        affects: (c, o) => c.g.state.players[c.you].citysBlessing && o.zone === 'battlefield' && o.controller === c.you && isCreature(c.g, o.id) && isSubtype(c.g, o.id, 'Saproling'),
        mods: () => [{ k: 'pt', p: 2, t: 2 }],
        text: 'Os Saprolings que você controla recebem +2/+2 enquanto você tiver a bênção da cidade.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 702.131b — precisa de um permanente com ascensão',
    2: 'teste: a bênção chega sem usar a pilha',
    3: 'regra geral: CR 702.131 — características com a bênção valem ao entrar',
    4: 'regra geral: CR 110.1 — fichas e terrenos contam como permanentes',
    5: 'regra geral: CR 702.131c — a bênção chega antes das outras ações de estado (motor/sba.ts)',
    6: 'regra geral: CR 704.5g — dano marcado pode virar letal sem o bônus',
    7: 'não se aplica: nenhuma mágica com ascensão nos decks',
    8: 'teste: a bênção fica mesmo com menos de dez permanentes',
  },
});
