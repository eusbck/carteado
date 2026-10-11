// Bloodline Pretender
// Changeling (This card is every creature type.)
// As this creature enters, choose a creature type.
// Whenever another creature you control of the chosen type enters, put a +1/+1 counter on this creature.
import { addCounters, and, asEnters, changeling, chars, chooseCreatureType, defineCard, is, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Bloodline Pretender',
  faces: [{
    abilities: [
      changeling(),
      asEnters(function* (c, ev) {
        ev.choices.creatureType = yield* chooseCreatureType(c.g, c.you, 'Bloodline Pretender: escolha um tipo de criatura');
      }, 'Ao entrar, escolha um tipo de criatura.'),
      // ruling 2: sem tipo escolhido, nunca dispara; ruling 1: vale para a criatura que entra junto com ele
      triggered(on.enters(and(is.creature, is.yours, is.other, (c, id) => {
        const tipo = c.g.state.objects[c.source]?.choices.creatureType as string | undefined;
        return !!tipo && chars(c.g, id).subtypes.includes(tipo);
      })), function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 1, c.you);
      }, { text: 'Sempre que outra criatura que você controla do tipo escolhido entra, coloque um marcador +1/+1 nesta criatura.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 603.6a — a criatura que entra junto com ele também dispara o gatilho (o tipo já foi escolhido ao entrar)',
    2: 'teste: sem tipo escolhido, não dispara',
    3: 'regra geral: CR 702.73a — polimorfo vale em todas as zonas (motor/criaturas.ts changeling)',
    4: 'regra geral: CR 702.73a — a carta com polimorfo é de todos os tipos de criatura (motor/criaturas.ts changeling)',
    5: 'regra geral: CR 613.1d — um efeito que troca o tipo de criatura passa por cima do polimorfo, que vem antes na camada 4',
    6: 'regra geral: CR 613.1d — perder as habilidades (camada 6) não desfaz os tipos dados na camada 4',
    7: 'regra geral: CR 205.3m — só tipos de criatura existentes são oferecidos (motor/efeitos.ts chooseCreatureType)',
  },
});
