// T'Challa, the Black Panther
// Whenever T'Challa enters or attacks, create a tapped Vibranium token. (It's an artifact with indestructible and "{T}:
// Add {C}. This mana can't be spent to cast a nonartifact spell.")
// Whenever you cast an artifact spell with mana value 4 or greater, put two +1/+1 counters on T'Challa.
import { addCounters, defineCard, on, triggered } from '../../motor/api.ts';
import { artefatoDeValor4, criaVibraniumVirado } from '../wakanda.ts';

export default defineCard({
  name: "T'Challa, the Black Panther",
  faces: [{
    abilities: [
      triggered(on.custom((e, c) => (e.type === 'zone' && e.to === 'battlefield' && e.obj === c.source) || (e.type === 'attackers' && e.attackers.some((a) => a.obj === c.source))), function* (c) {
        yield* criaVibraniumVirado(c);
      }, { text: "Sempre que T'Challa entra ou ataca, crie uma ficha de Vibranium virada." }),
      triggered(on.youCast(artefatoDeValor4), function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 2, c.you);
      }, { text: "Sempre que você conjura uma mágica de artefato com valor de mana 4 ou maior, coloque dois marcadores +1/+1 em T'Challa." }),
    ],
  }],
  rulings: {},
});