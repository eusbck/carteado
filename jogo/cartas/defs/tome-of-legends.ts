// Tome of Legends
// This artifact enters with a page counter on it.
// Whenever your commander enters or attacks, put a page counter on this artifact.
// {1}, {T}, Remove a page counter from this artifact: Draw a card.
import { activated, addCounters, defineCard, draw, entersWithCounters, on, triggered } from '../../motor/api.ts';
import { ehSeuComandante } from '../vingadores.ts';

export default defineCard({
  name: 'Tome of Legends',
  faces: [{
    abilities: [
      entersWithCounters('page', () => 1),
      // ruling 1: "o seu comandante" é o de que você é dono, mesmo controlado por outro jogador
      triggered(on.custom((e, c) => (e.type === 'zone' && e.to === 'battlefield' && ehSeuComandante(c.g, e.obj, c.you))
        || (e.type === 'attackers' && e.attackers.some((a) => ehSeuComandante(c.g, a.obj, c.you)))), function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, 'page', 1, c.you);
      }, { text: 'Sempre que o seu comandante entra ou ataca, coloque um marcador de página neste artefato.' }),
      activated('{1}, {T}, Remove a page counter from this artifact', function* (c) { yield* draw(c.g, c.you, 1); }, { text: '{1}, {T}, Remova um marcador de página deste artefato: Compre uma carta.' }),
    ],
  }],
  rulings: { 1: 'teste: o seu comandante atacando sob o controle de outro jogador ainda põe o marcador; o comandante de outro que você controla, não' },
});