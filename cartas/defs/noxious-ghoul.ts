// Noxious Ghoul
// Whenever this creature or another Zombie enters, all non-Zombie creatures get -1/-1 until end of turn.
import { allCreatures, defineCard, isSubtype, on, triggered, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Noxious Ghoul',
  faces: [{
    abilities: [
      // qualquer Zombie, de qualquer jogador
      triggered(on.enters((c, id) => id === c.source || isSubtype(c.g, id, 'Zombie')), function* (c) {
        // conjunto fixado na resolução (CR 611.2c): quem entra depois ou muda de tipo não muda o efeito
        untilEndOfTurn(c, allCreatures(c.g).filter((id) => !isSubtype(c.g, id, 'Zombie')), [{ k: 'pt', p: -1, t: -1 }]);
      }, { text: 'Sempre que esta criatura ou outro Zombie entra, todas as criaturas não Zombie recebem -1/-1 até o fim do turno.' }),
    ],
  }],
  rulings: {},
});
