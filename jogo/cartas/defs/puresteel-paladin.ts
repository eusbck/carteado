// Puresteel Paladin
// Whenever an Equipment you control enters, you may draw a card.
// Metalcraft — Equipment you control have equip {0} as long as you control three or more artifacts.
import { and, anthem, defineAbility, defineCard, draw, equip, is, on, triggered, yesNo } from '../../motor/api.ts';
import { artefatosDe } from '../wakanda.ts';

const EQUIPAR_0 = defineAbility('Puresteel Paladin:equipar', equip('{0}'));

export default defineCard({
  name: 'Puresteel Paladin',
  faces: [{
    abilities: [
      triggered(on.enters(and(is.yours, is.subtype('Equipment'))), function* (c) {
        if (yield* yesNo(c.g, c.you, 'Puresteel Paladin: comprar uma carta?')) yield* draw(c.g, c.you, 1);
      }, { text: 'Sempre que um Equipamento que você controla entra, você pode comprar uma carta.' }),
      // ruling 1: os outros equipar continuam; ruling 2: depois de ativado, o equipar {0} resolve mesmo sem o Paladin
      anthem((c, id) => and(is.yours, is.subtype('Equipment'))(c, id) && artefatosDe(c.g, c.you).length >= 3, () => [{ k: 'addAbility', id: EQUIPAR_0.id! }],
        'Metalcraft — Os Equipamentos que você controla têm equipar {0} enquanto você controlar três ou mais artefatos.'),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 702.6d — o Equipamento com mais de um equipar pode usar qualquer um deles (motor/dsl.ts equip)',
    2: 'regra geral: CR 113.7a — a habilidade na pilha não depende mais da fonte: o equipar {0} resolve mesmo sem o Paladin (motor/stack.ts)',
  },
});