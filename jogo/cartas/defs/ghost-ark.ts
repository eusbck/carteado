// Ghost Ark
// Flying
// Repair Barge — Whenever this Vehicle becomes crewed, each artifact creature card in your graveyard gains unearth {3}
// until end of turn.
// Crew 2 (Tap any number of creatures you control with total power 2 or more: This Vehicle becomes an artifact creature
// until end of turn.)
import { crew, defineAbility, defineCard, keyword, on, triggered, unearth, untilEndOfTurn } from '../../motor/api.ts';
import { DESENTERRAR, ehCriaturaArtefato } from '../necrons.ts';

const DESENTERRAR_3 = defineAbility('Ghost Ark:desenterrar', unearth('{3}'));

export default defineCard({
  name: 'Ghost Ark',
  faces: [{
    abilities: [
      keyword('flying'),
      // ruling 1: vale para as cartas que estão no cemitério quando a habilidade resolve; as que chegarem depois, não
      triggered(on.custom((e, c) => e.type === 'crewed' && e.obj === c.source), function* (c) {
        const cartas = c.g.state.zones.graveyard[c.you].filter((id) => ehCriaturaArtefato(c.g, id));
        if (cartas.length) untilEndOfTurn(c, cartas, [{ k: 'addAbility', id: DESENTERRAR_3.id! }]);
      }, { text: 'Repair Barge — Sempre que este Veículo fica tripulado, cada carta de criatura artefato no seu cemitério ganha desenterrar {3} até o fim do turno.' }),
      crew(2),
    ],
  }],
  rulings: {
    1: 'teste: tripulado, as cartas de criatura artefato do seu cemitério ganham desenterrar {3} até o fim do turno',
    2: 'não se aplica: só remete às notas gerais da coleção sobre desenterrar',
    3: DESENTERRAR.sumiu,
    4: DESENTERRAR.naoMagica,
    5: DESENTERRAR.sairia,
    6: DESENTERRAR.etapaFinal,
    7: DESENTERRAR.impeto,
  },
});