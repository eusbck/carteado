// Rhonas's Monument
// Green creature spells you cast cost {1} less to cast.
// Whenever you cast a creature spell, target creature you control gets +2/+2 and gains trample until end of turn.
import { defineCard, is, on, staticAbility, t, tgt, triggered, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: "Rhonas's Monument",
  faces: [{
    abilities: [
      // CR 601.2f: a redução só tira mana genérica (ruling 4)
      staticAbility({
        rules: { costModifier: (c, spell) => (spell.controller === c.you && spell.chars.types.includes('Creature') && spell.chars.colors.includes('G') ? { reduce: 1 } : null) },
        text: 'Mágicas de criatura verdes que você conjura custam {1} a menos.',
      }),
      // ruling 2: dispara com qualquer mágica de criatura, verde ou não; ruling 5: resolve antes da mágica
      triggered(on.youCast(is.creature), function* (c) {
        const id = tgt(c);
        if (id !== null) untilEndOfTurn(c, [id], [{ k: 'pt', p: 2, t: 2 }, { k: 'addKeyword', kw: 'trample' }]);
      }, { targets: [t.creature(is.yours, 'criatura alvo que você controla')], text: 'Sempre que você conjura uma mágica de criatura, a criatura alvo que você controla recebe +2/+2 e ganha atropelar até o fim do turno.' }),
    ],
  }],
  rulings: {
    1: 'teste: a mágica de criatura ainda está na pilha e não pode ser o alvo',
    2: 'teste: mágica de criatura que não é verde dispara, mas não fica mais barata',
    3: 'regra geral: CR 105.2 — a mágica multicolorida que inclui verde é verde (motor/chars.ts)',
    4: 'teste: a mágica de criatura verde custa {1} a menos e a criatura alvo recebe +2/+2 e atropelar',
    5: 'teste: a mágica de criatura verde custa {1} a menos e a criatura alvo recebe +2/+2 e atropelar',
  },
});
