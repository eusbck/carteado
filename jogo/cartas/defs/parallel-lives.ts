// Parallel Lives
// If an effect would create one or more tokens under your control, it creates twice that many of those tokens instead.
import { defineCard, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Parallel Lives',
  faces: [{
    abilities: [
      // CR 614.1a, 616.1f: substituição na criação de fichas; cada Parallel Lives se aplica uma vez (ruling 1)
      staticAbility({
        rules: {
          tokenCreation: (c, ev) => (ev.player !== c.you ? null : {
            label: 'Parallel Lives: o dobro das fichas',
            // ruling 2: o resto do pedido (virada, atacando) acompanha as fichas novas
            *replace(e) { return { ...e, tokens: [...e.tokens, ...e.tokens.map((t) => ({ ...t }))] }; },
          }),
        },
        text: 'Se um efeito fosse criar uma ou mais fichas sob o seu controle, ele cria o dobro dessas fichas em vez disso.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: com duas Parallel Lives, quatro vezes as fichas',
    2: 'teste: as fichas a mais entram como as originais (viradas)',
  },
});
