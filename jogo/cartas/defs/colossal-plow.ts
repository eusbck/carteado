// Colossal Plow
// Whenever this Vehicle attacks, add {W}{W}{W} and you gain 3 life. Until end of turn, you don't lose this mana as steps
// and phases end.
// Crew 6 (Tap any number of creatures you control with total power 6 or more: This Vehicle becomes an artifact creature
// until end of turn.)
import { addMana, crew, defineCard, gainLife, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Colossal Plow',
  faces: [{
    abilities: [
      // CR 106.4, 500.5: a mana fica até o fim do turno
      triggered(on.selfAttacks(), function* (c) {
        addMana(c.g, c.you, ['W', 'W', 'W'], { source: c.source, untilEndOfTurn: true });
        gainLife(c.g, c.you, 3, c.source);
      }, { text: 'Sempre que este Veículo ataca, adicione {W}{W}{W} e você ganha 3 de vida. Até o fim do turno, você não perde essa mana quando as etapas e fases terminam.' }),
      crew(6),
    ],
  }],
  rulings: {},
});
