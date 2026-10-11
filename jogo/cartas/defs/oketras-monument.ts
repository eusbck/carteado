// Oketra's Monument
// White creature spells you cast cost {1} less to cast.
// Whenever you cast a creature spell, create a 1/1 white Warrior creature token with vigilance.
import { createTokens, defineCard, is, on, staticAbility, triggered } from '../../motor/api.ts';

export default defineCard({
  name: "Oketra's Monument",
  faces: [{
    abilities: [
      // rulings 2-3: a mágica multicolorida que é branca também fica mais barata; só o genérico é reduzido (CR 601.2f)
      staticAbility({
        rules: { costModifier: (c, spell) => (spell.controller === c.you && spell.chars.types.includes('Creature') && spell.chars.colors.includes('W') ? { reduce: 1 } : null) },
        text: 'As mágicas de criatura brancas que você conjura custam {1} a menos.',
      }),
      // rulings 1, 4: dispara para qualquer mágica de criatura e resolve antes dela, mesmo que ela seja anulada
      triggered(on.youCast(is.creature), function* (c) { yield* createTokens(c.g, c.you, 'Warrior vigilância', 1); }, {
        text: 'Sempre que você conjura uma mágica de criatura, crie uma ficha de criatura Warrior 1/1 branca com vigilância.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: qualquer mágica de criatura cria o Warrior; só as brancas custam {1} a menos',
    2: 'regra geral: CR 105.2 — a mágica multicolorida é de cada uma das cores dela (cartas/defs/oketras-monument.ts)',
    3: 'regra geral: CR 601.2f — reduz só o genérico do custo total; o valor de mana não muda (motor/stack.ts totalSpellCost)',
    4: 'regra geral: CR 603.3 — o gatilho resolve antes da mágica de criatura, mesmo que ela seja anulada',
  },
});
