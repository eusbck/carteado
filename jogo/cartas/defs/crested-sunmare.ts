// Crested Sunmare
// Other Horses you control have indestructible.
// At the beginning of each end step, if you gained life this turn, create a 5/5 white Horse creature token.
import { controllerOf, createTokens, defineCard, isSubtype, on, staticAbility, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Crested Sunmare',
  faces: [{
    abilities: [
      staticAbility({
        affects: (c, o) => o.id !== c.source && o.zone === 'battlefield' && controllerOf(c.g, o.id) === c.you && isSubtype(c.g, o.id, 'Horse'),
        mods: () => [{ k: 'addKeyword', kw: 'indestructible' }],
        text: 'Os outros Horses que você controla têm indestrutível.',
      }),
      triggered(on.endStep('each'), function* (c) { yield* createTokens(c.g, c.you, 'Horse', 1); }, {
        // rulings 2-3 (CR 603.4): só se você já ganhou vida no turno quando a etapa final começa, tenha Crested Sunmare
        // estado no campo ou não
        condition: (c) => c.g.state.turnStats[c.you].lifeGained > 0,
        text: 'No início de cada etapa final, se você ganhou vida neste turno, crie uma ficha de criatura Horse 5/5 branca.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 704.5g — o dano marcado fica até a limpeza; sem a indestrutibilidade, o Horse com dano letal é destruído (motor/sba.ts)',
    2: 'teste: sem ganhar vida no turno, a habilidade não dispara',
    3: 'teste: na etapa final de qualquer jogador, se você ganhou vida no turno, cria um Horse 5/5 indestrutível',
  },
});