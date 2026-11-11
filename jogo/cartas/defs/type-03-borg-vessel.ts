// Type-03 Borg Vessel
// Artifact spells you cast cost {1} less to cast.
// Station (It's an artifact creature at 7+.)
// 7+ | Flying
// Whenever you cast a spell, create a 1/1 colorless Borg artifact creature token.
import { createTokens, defineCard, on, staticAbility, triggered } from '../../motor/api.ts';
import { comCargas, estacao, nivelDeEstacao } from '../estacao.ts';

export default defineCard({
  name: 'Type-03 Borg Vessel',
  faces: [{
    abilities: [
      staticAbility({
        rules: { costModifier: (c, spell) => (spell.controller === c.you && spell.chars.types.includes('Artifact') ? { reduce: 1 } : null) },
        text: 'As mágicas de artefato que você conjura custam {1} a menos para conjurar.',
      }),
      estacao(),
      nivelDeEstacao(7, { criatura: true, mods: [{ k: 'addKeyword', kw: 'flying' }] }, '7+ | Voar. É uma criatura-artefato.'),
      // a linha fica na mesma caixa de 7+ da carta impressa
      triggered(on.youCast(), function* (c) { yield* createTokens(c.g, c.you, 'Borg', 1); }, {
        condition: comCargas(7),
        text: '7+ | Sempre que você conjura uma mágica, crie uma ficha de criatura-artefato Borg 1/1 incolor.',
      }),
    ],
  }],
  rulings: {},
});
