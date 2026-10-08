// Nissa, Leyline Tamer
// Deathtouch, vigilance
// Landfall — Whenever a land you control enters, draw a card. Then if this is the first time this ability has resolved
// this turn, reveal cards from the top of your library until you reveal a creature card. Put that card onto the
// battlefield and the rest on the bottom of your library in a random order.
import { defineCard, draw, isCreature, keywords, nameOf, on, putOntoBattlefield, triggered } from '../../motor/api.ts';
import { shuffle } from '../../motor/rng.ts';

export default defineCard({
  name: 'Nissa, Leyline Tamer',
  faces: [{
    abilities: [
      ...keywords('deathtouch', 'vigilance'),
      triggered(on.landfall(), function* (c) {
        const s = c.g.state;
        // contagem de resoluções desta habilidade neste turno: fica no objeto de Nissa (um objeto novo tem uma
        // habilidade nova, CR 400.7); se ela já saiu do campo, segue na última informação conhecida
        const dados = (s.objects[c.source] ?? s.lki[c.source]?.obj)?.data;
        const vez = dados && dados.landfallTurno === s.turn.number ? (dados.landfallVezes as number) + 1 : 1;
        if (dados) { dados.landfallTurno = s.turn.number; dados.landfallVezes = vez; }
        yield* draw(c.g, c.you, 1);
        if (vez !== 1) return;
        const lib = s.zones.library[c.you];
        const i = lib.findIndex((id) => isCreature(c.g, id));
        const reveladas = i < 0 ? [...lib] : lib.slice(0, i + 1);
        c.g.log(`${s.players[c.you].name} revela ${reveladas.map((id) => nameOf(c.g, id)).join(', ') || 'nada'}.`, { rule: '701.20' });
        if (i >= 0) yield* putOntoBattlefield(c.g, [{ id: lib[i], controller: c.you }], 'effect');
        const resto = shuffle(s.rng, reveladas.filter((id) => s.objects[id]?.zone === 'library'));
        s.zones.library[c.you] = [...s.zones.library[c.you].filter((id) => !resto.includes(id)), ...resto];
        c.g.bump();
      }, { text: 'Queda de terreno — Sempre que um terreno que você controla entra, compre uma carta. Depois, se esta for a primeira vez que esta habilidade resolve neste turno, revele cartas do topo do seu grimório até revelar uma carta de criatura. Ponha essa carta no campo e o resto no fundo do seu grimório em ordem aleatória.' }),
    ],
  }],
  rulings: {},
});
