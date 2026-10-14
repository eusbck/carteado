// Oran-Rief, the Vastwood
// This land enters tapped.
// {T}: Add {G}.
// {T}: Put a +1/+1 counter on each green creature that entered this turn.
import { activated, addCounters, chars, defineCard, isCreature, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Oran-Rief, the Vastwood',
  faces: [{
    abilities: [
      land.tapped(),
      mana('G'),
      activated('{T}', function* (c) {
        // rulings 1-2: todas as criaturas verdes (de qualquer jogador) que entraram neste turno, com as cores de agora
        const e = c.g.state.enteredThisTurn;
        if (!e || e.turn !== c.g.state.turn.number) return;
        for (const id of e.objs) {
          if (c.g.state.objects[id]?.zone !== 'battlefield' || !isCreature(c.g, id) || !chars(c.g, id).colors.includes('G')) continue;
          addCounters(c.g, { kind: 'obj', id }, '+1/+1', 1, c.you);
        }
      }, { text: '{T}: Coloque um marcador +1/+1 em cada criatura verde que entrou neste turno.' }),
    ],
  }],
  rulings: {
    1: 'teste: um marcador em cada criatura verde que entrou neste turno, de qualquer jogador; as que já estavam ficam sem',
    2: 'regra geral: as cores são as da criatura na resolução (chars na hora)',
  },
});
