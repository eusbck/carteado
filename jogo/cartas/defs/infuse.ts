// Infuse
// Untap target artifact, creature, or land.
// Draw a card at the beginning of the next turn's upkeep.
import { defineCard, delayed, tgt, untap } from '../../motor/api.ts';
import { alvoArtefatoCriaturaOuTerreno, compraNaProximaManutencao } from '../twitch.ts';

const COMPRA = compraNaProximaManutencao('Infuse');

export default defineCard({
  name: 'Infuse',
  faces: [{
    spell: {
      targets: [alvoArtefatoCriaturaOuTerreno()],
      *effect(c) {
        const id = tgt(c);
        if (id !== null) untap(c.g, id);
        // ruling 1: com o alvo já desvirado, a compra atrasada acontece do mesmo jeito
        delayed(c, COMPRA.id!);
      },
    },
  }],
  rulings: { 1: 'teste: o alvo já desvirado não muda, e a compra da próxima manutenção acontece' },
});
