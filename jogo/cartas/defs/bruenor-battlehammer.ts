// Bruenor Battlehammer
// Each creature you control gets +2/+0 for each Equipment attached to it.
// You may pay {0} rather than pay the equip cost of the first equip ability you activate each turn.
import { anthem, chars, controllerOf, defineCard, isCreature, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Bruenor Battlehammer',
  faces: [{
    abilities: [
      anthem((c, id) => controllerOf(c.g, id) === c.you && isCreature(c.g, id), (c, o) => {
        const s = c.g.state;
        const n = s.zones.battlefield.filter((x) => s.objects[x].attachedTo === o.id && chars(c.g, x).subtypes.includes('Equipment')).length;
        // sempre devolve a modificação (com 0): o motor sonda a camada chamando mods com a própria fonte
        return [{ k: 'pt', p: 2 * n, t: 0 }];
      }, 'Cada criatura que você controla recebe +2/+0 para cada Equipamento anexado a ela.'),
      // CR 118.9: custo alternativo da ativação; o motor só oferece na primeira ativação de equipar do turno
      staticAbility({
        rules: { equipForZero: (c, jogador) => jogador === c.you },
        text: 'Você pode pagar {0} em vez do custo de equipar da primeira habilidade de equipar que você ativar em cada turno.',
      }),
    ],
  }],
  rulings: {},
});
