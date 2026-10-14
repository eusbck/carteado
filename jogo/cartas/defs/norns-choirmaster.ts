// Norn's Choirmaster
// Flying, first strike
// Whenever a commander you control enters or attacks, proliferate. (Choose any number of permanents and/or players, then
// give each another counter of each kind already there.)
import { controllerOf, defineCard, keywords, on, proliferate, triggered } from '../../motor/api.ts';
import { ehComandante } from '../vingadores.ts';

export default defineCard({
  name: "Norn's Choirmaster",
  faces: [{
    abilities: [
      ...keywords('flying', 'first strike'),
      // "um comandante que você controla": qualquer comandante, seu ou de outro jogador, sob o seu controle
      triggered(on.custom((e, c) => {
        if (e.type === 'zone' && e.to === 'battlefield' && c.g.state.objects[e.obj]) return ehComandante(c.g, e.obj) && controllerOf(c.g, e.obj) === c.you;
        if (e.type === 'attackers') return e.attackers.filter((a) => ehComandante(c.g, a.obj) && controllerOf(c.g, a.obj) === c.you).map((a) => ({ comandante: a.obj }));
        return false;
      }), function* (c) {
        yield* proliferate(c.g, c.you);
      }, { text: 'Sempre que um comandante que você controla entra ou ataca, prolifere.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 701.34a — qualquer permanente ou jogador com marcador pode ser escolhido, inclusive dos oponentes (motor/mecanicas.ts proliferate)',
    2: 'regra geral: CR 701.34a — a escolha pode ser vazia (motor/mecanicas.ts proliferate)',
    3: 'regra geral: CR 701.34a — um marcador de cada tipo que já está lá (motor/mecanicas.ts proliferate)',
    4: 'não se aplica: nenhuma carta dos decks dispara "sempre que você prolifera"',
    5: 'regra geral: CR 608.2 — as escolhas são feitas na resolução',
    6: 'regra geral: CR 704.5q — marcadores +1/+1 e -1/-1 se anulam em pares (motor/sba.ts)',
  },
});
