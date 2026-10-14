// Moonstone Eulogist
// Flying
// Whenever a creature an opponent controls dies, you create a Blood token. (It's an artifact with "{1}, {T}, Discard a
// card, Sacrifice this token: Draw a card.")
// Whenever you sacrifice an artifact, put a +1/+1 counter on this creature and you gain 1 life.
import { addCounters, createTokens, defineCard, gainLife, keywords, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Moonstone Eulogist',
  faces: [{
    abilities: [
      ...keywords('flying'),
      // ruling 4: morrendo junto com criaturas dos oponentes, dispara por cada uma (CR 603.10a)
      triggered(on.dies((c, l) => c.g.isOpponent(c.you, l.controller)), function* (c) {
        yield* createTokens(c.g, c.you, 'Blood', 1);
      }, { text: 'Sempre que uma criatura que um oponente controla morre, você cria uma ficha Blood.' }),
      triggered(on.custom((e, c) => e.type === 'sacrifice' && e.player === c.you && !!c.g.state.lki[e.old]?.chars.types.includes('Artifact')), function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 1, c.you);
        gainLife(c.g, c.you, 1, c.source);
      }, { text: 'Sempre que você sacrifica um artefato, coloque um marcador +1/+1 nesta criatura e você ganha 1 de vida.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: "ficha Blood" é qualquer ficha de artefato Blood (motor/criaturas.ts bloodTokens)',
    2: 'regra geral: CR 601.2h — uma permanente sacrificada paga um custo só',
    3: 'regra geral: o gatilho de sacrifício vale por qualquer motivo do sacrifício',
    4: 'teste: uma criatura do oponente morre: você cria uma Blood; sacrificando um artefato, marcador e 1 de vida',
  },
});
