// Aminatou, Veil Piercer
// At the beginning of your upkeep, surveil 2. (Look at the top two cards of your library, then put any number of them
// into your graveyard and the rest on top of your library in any order.)
// Each enchantment card in your hand has miracle. Its miracle cost is equal to its mana cost reduced by {4}. (You may
// cast a card for its miracle cost when you draw it if it's the first card you drew this turn.)
import { defineCard, lookAndArrange, milagreReduzido, on, printedChars, staticAbility, triggered } from '../../motor/api.ts';
import { MILAGRE } from '../milagres.ts';

export default defineCard({
  name: 'Aminatou, Veil Piercer',
  faces: [{
    abilities: [
      triggered(on.upkeep('you'), function* (c) {
        yield* lookAndArrange(c.g, c.you, 2, 'surveil');
      }, { text: 'No começo da sua manutenção, vigie 2.' }),
      // a palavra-chave milagre vale na mão (motor/milagre.ts); o custo é o custo de mana da porta ou face que vai ser
      // conjurada, reduzido em {4} só no genérico (CR 601.2f)
      staticAbility({
        offField: true,
        affects: (c, o) => o.zone === 'hand' && o.owner === c.you && printedChars(o.def, 0, o.owner).types.includes('Enchantment'),
        mods: () => [milagreReduzido(4)],
        text: 'Cada carta de encantamento na sua mão tem milagre. O custo de milagre dela é igual ao custo de mana dela reduzido em {4}.',
      }),
    ],
  }],
  rulings: {
    1: MILAGRE.revelarAntes,
    2: MILAGRE.qualquerTurno,
    3: MILAGRE.primeiraDaSequencia,
    4: MILAGRE.semComprar,
    5: MILAGRE.naoPrecisaRevelar,
    6: MILAGRE.soNaResolucao,
    7: 'teste: a carta de encantamento comprada na etapa de compra é conjurada pelo custo de mana menos {4}',
    8: MILAGRE.custoAlternativo,
    9: MILAGRE.custoTotal,
    10: MILAGRE.saiuDaMao,
    11: MILAGRE.continuaComprada,
  },
});
