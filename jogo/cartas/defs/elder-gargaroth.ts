// Elder Gargaroth
// Reach, vigilance, trample
// Whenever this creature attacks or blocks, choose one —
// • Create a 3/3 green Beast creature token.
// • You gain 3 life.
// • Draw a card.
import { createTokens, defineCard, draw, gainLife, keywords, modal, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Elder Gargaroth',
  faces: [{
    abilities: [
      ...keywords('reach', 'vigilance', 'trample'),
      triggered(on.custom((e, c) => (e.type === 'attackers' && e.attackers.some((a) => a.obj === c.source)) || (e.type === 'blockers' && e.blocks.some(([b]) => b === c.source))), function* () { /* modos */ }, {
        modes: modal(1, 1, [
          { text: 'Crie uma ficha de criatura Beast verde 3/3', *effect(c) { yield* createTokens(c.g, c.you, 'Beast 3/3', 1); } },
          { text: 'Você ganha 3 de vida', *effect(c) { gainLife(c.g, c.you, 3, c.source); } },
          { text: 'Compre uma carta', *effect(c) { yield* draw(c.g, c.you, 1); } },
        ]),
        text: 'Sempre que esta criatura ataca ou bloqueia, escolha um — crie uma ficha de criatura Beast verde 3/3; ou você ganha 3 de vida; ou compre uma carta.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: atacando, cria uma Beast 3/3 que não está atacando',
    2: 'regra geral: CR 509.1, 510.1 — depois de o gatilho resolver, os jogadores recebem prioridade antes dos bloqueios e do dano (motor/turn.ts)',
  },
});
