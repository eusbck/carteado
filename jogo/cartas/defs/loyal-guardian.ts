// Loyal Guardian
// Trample
// Lieutenant — At the beginning of combat on your turn, if you control your commander, put a +1/+1 counter on each
// creature you control.
import { addCounters, creaturesOf, defineCard, keyword, on, triggered } from '../../motor/api.ts';
import { controlaComandante } from '../wakanda.ts';

export default defineCard({
  name: 'Loyal Guardian',
  faces: [{
    abilities: [
      keyword('trample'),
      triggered(on.beginCombat('you'), function* (c) {
        for (const id of creaturesOf(c.g, c.you)) addCounters(c.g, { kind: 'obj', id }, '+1/+1', 1, c.you);
      }, {
        // rulings 1-3 (CR 603.4): cláusula "se" interveniente, vista ao disparar e ao resolver; basta um comandante
        condition: (c) => controlaComandante(c.g, c.you),
        text: 'Tenente — No início do combate no seu turno, se você controla o seu comandante, coloque um marcador +1/+1 em cada criatura que você controla.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: sem o seu comandante no campo, nada acontece',
    2: 'regra geral: CR 603.2 — um gatilho por início de combate, com um ou mais comandantes (cartas/wakanda.ts controlaComandante)',
    3: 'teste: controlando o seu comandante, cada criatura sua ganha um marcador +1/+1 no início do combate',
  },
});