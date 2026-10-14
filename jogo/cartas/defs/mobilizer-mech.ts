// Mobilizer Mech
// Flying
// Whenever this Vehicle becomes crewed, up to one other target Vehicle you control becomes an artifact creature until end
// of turn.
// Crew 3 (Tap any number of creatures you control with total power 3 or more: This Vehicle becomes an artifact creature
// until end of turn.)
import { and, crew, defineCard, is, keyword, on, t, tgt, triggered, upTo } from '../../motor/api.ts';
import { ehVeiculo, viramCriaturasArtefato } from '../veiculos.ts';

export default defineCard({
  name: 'Mobilizer Mech',
  faces: [{
    abilities: [
      keyword('flying'),
      // CR 702.122e: "fica tripulado" = a habilidade de tripular resolveu, mesmo já sendo criatura (ruling 1); o outro
      // Veículo não conta como tripulado (ruling 2) e fica com a força e a resistência impressas (ruling 3)
      triggered(on.custom((e, c) => e.type === 'crewed' && e.obj === c.source), function* (c) {
        const id = tgt(c);
        if (id !== null) viramCriaturasArtefato(c, [id]);
      }, {
        targets: [upTo(1, t.permanent(and(is.yours, is.other, (c, id) => ehVeiculo(c.g, id)), 'até um outro Veículo alvo que você controla'))],
        text: 'Sempre que este Veículo fica tripulado, até um outro Veículo alvo que você controla se torna uma criatura artefato até o fim do turno.',
      }),
      crew(3),
    ],
  }],
  rulings: {
    1: 'teste: tripulado, o outro Veículo alvo vira criatura sem disparar o "fica tripulado" dele',
    2: 'teste: tripulado, o outro Veículo alvo vira criatura sem disparar o "fica tripulado" dele',
    3: 'teste: tripulado, o outro Veículo alvo vira criatura sem disparar o "fica tripulado" dele',
  },
});
