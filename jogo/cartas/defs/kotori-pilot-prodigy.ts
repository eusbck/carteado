// Kotori, Pilot Prodigy
// Vehicles you control have crew 2.
// At the beginning of combat on your turn, target artifact creature you control gains lifelink and vigilance until end of
// turn.
import { and, anthem, crew, defineAbility, defineCard, is, on, t, tgt, triggered, untilEndOfTurn } from '../../motor/api.ts';
import { ehVeiculo } from '../veiculos.ts';

// CR 702.122a: os Veículos ganham mais uma habilidade de tripular (a impressa continua)
const TRIPULAR_2 = defineAbility('Kotori, Pilot Prodigy:tripular2', crew(2));

export default defineCard({
  name: 'Kotori, Pilot Prodigy',
  faces: [{
    abilities: [
      anthem(and(is.yours, (c, id) => ehVeiculo(c.g, id)), () => [{ k: 'addAbility', id: TRIPULAR_2.id! }], 'Os Veículos que você controla têm tripular 2.'),
      triggered(on.beginCombat('you'), function* (c) {
        const id = tgt(c);
        if (id !== null) untilEndOfTurn(c, [id], [{ k: 'addKeyword', kw: 'lifelink' }, { k: 'addKeyword', kw: 'vigilance' }]);
      }, {
        targets: [t.creature(and(is.yours, is.artifact), 'criatura artefato alvo que você controla')],
        text: 'No início do combate no seu turno, a criatura artefato alvo que você controla ganha vínculo com a vida e vigilância até o fim do turno.',
      }),
    ],
  }],
  rulings: {},
});
