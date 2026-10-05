// Mazirek, Kraul Death Priest
// Flying
// Whenever a player sacrifices another permanent, put a +1/+1 counter on each creature you control.
import { addCounters, creaturesOf, defineCard, keyword, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Mazirek, Kraul Death Priest',
  faces: [{
    abilities: [
      keyword('flying'),
      // ruling 1: sacrificado junto, ainda vê os outros (olha para trás, CR 603.10a); ruling 4: regra da lenda não é sacrifício
      triggered(on.custom((e, c) => e.type === 'sacrifice' && e.old !== c.source), function* (c) {
        for (const id of creaturesOf(c.g, c.you)) addCounters(c.g, { kind: 'obj', id }, '+1/+1', 1, c.you);
      }, { text: 'Sempre que um jogador sacrifica outro permanente, coloque um marcador +1/+1 em cada criatura que você controla.' }),
    ],
  }],
  rulings: {
    1: 'teste: sacrificado junto com outro, ainda dispara pelo outro',
    2: 'regra geral: CR 603.3 — o gatilho resolve antes da mágica ou habilidade',
    3: 'regra geral: é habilidade disparada, não ativada',
    4: 'regra geral: CR 704.5j — a regra da lenda não sacrifica',
  },
});
