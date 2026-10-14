// Chatterfang, Squirrel General
// Forestwalk (This creature can't be blocked as long as defending player controls a Forest.)
// If one or more tokens would be created under your control, those tokens plus that many 1/1 green Squirrel creature
// tokens are created instead.
// {B}, Sacrifice X Squirrels: Target creature gets +X/-X until end of turn.
import { activated, and, controlledBy, defineCard, is, staticAbility, t, tgt, untilEndOfTurn } from '../../motor/api.ts';
import { ehEsquilo, forestwalk } from '../esquilos.ts';

export default defineCard({
  name: 'Chatterfang, Squirrel General',
  faces: [{
    abilities: [
      forestwalk(),
      // CR 614.1a: substituição na criação de fichas sob o seu controle (ruling 1: de qualquer efeito); os Squirrels a
      // mais acompanham o resto do pedido, virados ou atacando (ruling 3) e não têm as habilidades das outras
      staticAbility({
        rules: {
          tokenCreation: (c, ev) => (ev.player !== c.you ? null : {
            label: 'Chatterfang: mais um Squirrel para cada ficha',
            *replace(e) { return { ...e, tokens: [...e.tokens, ...e.tokens.map((x) => ({ de: x.de, def: 'Squirrel' }))] }; },
          }),
        },
        text: 'Se uma ou mais fichas fossem ser criadas sob o seu controle, em vez disso são criadas essas fichas mais essa quantidade de fichas de criatura Squirrel verdes 1/1.',
      }),
      activated('{B}, Sacrifice X Squirrels', function* (c) {
        const id = tgt(c);
        if (id !== null && c.x > 0) untilEndOfTurn(c, [id], [{ k: 'pt', p: c.x, t: -c.x }]);
      }, {
        targets: [t.creature()],
        xMax: (c) => controlledBy(c.g, c.you, (id) => ehEsquilo(c.g, id) && and(is.creature)(c, id)).length,
        text: '{B}, Sacrifique X Squirrels: A criatura alvo recebe +X/-X até o fim do turno.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: qualquer efeito que crie fichas sob o seu controle cria também a mesma quantidade de Squirrels',
    2: 'teste: vale para Food, Clue e Treasure também',
    3: 'regra geral: o Squirrel a mais herda o resto do pedido (TokenCreation.de: virada, atacando…)',
    4: 'regra geral: CR 616.1 — quem cria as fichas escolhe a ordem das substituições (motor/actions.ts createTokens)',
    5: 'teste: passo da floresta: não pode ser bloqueado se o defensor controla uma Forest',
  },
});
