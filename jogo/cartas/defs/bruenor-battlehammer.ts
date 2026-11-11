// Bruenor Battlehammer
// Each creature you control gets +2/+0 for each Equipment attached to it.
// You may pay {0} rather than pay the equip cost of the first equip ability you activate each turn.
import { and, anthem, defineCard, is, staticAbility } from '../../motor/api.ts';
import { ehEquipar, equipamentosAnexados, equiparesAtivadosNoTurno } from '../equipar.ts';

export default defineCard({
  name: 'Bruenor Battlehammer',
  faces: [{
    abilities: [
      anthem(and(is.creature, is.yours), (c, o) => {
        // sempre devolve a modificação (mesmo +0/+0): o motor sonda a camada pela própria fonte (motor/chars.ts)
        return [{ k: 'pt', p: 2 * equipamentosAnexados(c.g, o.id).length, t: 0 }];
      }, 'Cada criatura que você controla recebe +2/+0 para cada Equipamento anexado a ela.'),
      // CR 118.9: custo alternativo; vale em qualquer turno, inclusive o de um oponente
      staticAbility({
        rules: { abilityCostModifier: (c, jogador, _fonte, def) => (jogador === c.you && ehEquipar(def) && equiparesAtivadosNoTurno(c.g, c.you) === 0 ? { reduce: 0, free: true } : null) },
        text: 'Você pode pagar {0} em vez do custo de equipar da primeira habilidade de equipar que você ativa a cada turno.',
      }),
    ],
  }],
  rulings: {},
});
