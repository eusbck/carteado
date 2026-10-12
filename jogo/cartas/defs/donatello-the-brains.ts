// Donatello, the Brains
// If one or more tokens would be created under your control, those tokens plus a Mutagen token are created instead.
// Partner—Character select
import { defineCard, staticAbility } from '../../motor/api.ts';
import { MUTAGEN, SELECAO } from '../tartarugas.ts';

export default defineCard({
  name: 'Donatello, the Brains',
  faces: [{
    abilities: [
      // CR 614.1a: substituição na criação de fichas. Ruling 2: a Mutagen a mais acompanha o resto do pedido (virada
      // etc.), mas não as habilidades das outras; ruling 5: vale para quem cria as fichas, não para quem controla o efeito
      staticAbility({
        rules: {
          tokenCreation: (c, ev) => (ev.player !== c.you || !ev.tokens.length ? null : {
            label: 'Donatello: mais uma ficha Mutagen',
            *replace(e) { return { ...e, tokens: [...e.tokens, { de: e.tokens[0].de, def: 'Mutagen' }] }; },
          }),
        },
        text: 'Se uma ou mais fichas fossem ser criadas sob o seu controle, em vez disso são criadas essas fichas mais uma ficha Mutagen.',
      }),
    ],
  }],
  rulings: {
    1: SELECAO.comecam,
    2: 'regra geral: CR 111.10 — a Mutagen a mais é a ficha predefinida, sem as habilidades das outras fichas criadas (cartas/defs/donatello-the-brains.ts)',
    3: SELECAO.dois,
    4: SELECAO.controla,
    5: 'teste: cada criação de fichas sob o seu controle cria também uma ficha Mutagen',
    6: MUTAGEN.predefinida,
    7: MUTAGEN.alvos,
    8: SELECAO.identidade,
    9: SELECAO.refere,
    10: SELECAO.perder,
    11: SELECAO.separados,
  },
});