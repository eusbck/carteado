// Mondrak, Glory Dominus
// If one or more tokens would be created under your control, twice that many of those tokens are created instead.
// {1}{W/P}{W/P}, Sacrifice two other artifacts and/or creatures: Put an indestructible counter on Mondrak. ({W/P} can be
// paid with either {W} or 2 life.)
import { activated, addCounters, cost, defineCard, is, or, staticAbility } from '../../motor/api.ts';
import type { CostPart } from '../../motor/defs.ts';

const CUSTO: CostPart[] = [
  ...cost('{1}{W/P}{W/P}'),
  { k: 'sacrifice', n: 2, label: 'outros artefatos e/ou criaturas', filter: (c, id) => id !== c.source && or(is.artifact, is.creature)(c, id) },
];

export default defineCard({
  name: 'Mondrak, Glory Dominus',
  faces: [{
    abilities: [
      // CR 614.1a, 616.1f: substituição na criação de fichas (como Anointed Procession)
      staticAbility({
        rules: {
          tokenCreation: (c, ev) => (ev.player !== c.you ? null : {
            label: 'Mondrak, Glory Dominus: o dobro das fichas',
            // ruling 1: o resto do pedido (virada, atacando, marcadores) acompanha as fichas novas
            *replace(e) { return { ...e, tokens: [...e.tokens, ...e.tokens.map((t) => ({ ...t }))] }; },
          }),
        },
        text: 'Se uma ou mais fichas fossem ser criadas sob o seu controle, o dobro dessas fichas é criado em vez disso.',
      }),
      // CR 107.4f: {W/P} pode ser pago com {W} ou 2 de vida
      activated(CUSTO, function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, 'indestructible', 1, c.you);
      }, { text: '{1}{W/P}{W/P}, Sacrifique dois outros artefatos e/ou criaturas: Coloque um marcador de indestrutível em Mondrak.' }),
    ],
  }],
  rulings: { 1: 'teste: o dobro das fichas; as fichas a mais entram viradas e atacando como as originais' },
});
