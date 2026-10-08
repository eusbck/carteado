// Polymorph
// Destroy target creature. It can't be regenerated. Its controller reveals cards from the top of their library until
// they reveal a creature card. The player puts that card onto the battlefield, then shuffles all other cards revealed
// this way into their library.
// (Nenhuma carta dos decks regenera; "não pode ser regenerada" não muda o resultado.)
import { controllerOf, defineCard, destroy, isCreature, nameOf, putOntoBattlefield, shuffleLibrary, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Polymorph',
  faces: [{
    spell: {
      targets: [t.creature()],
      *effect(c) {
        // ruling 2: alvo ilegal, a mágica não resolve (CR 608.2b)
        const id = tgt(c);
        if (id === null) return;
        const quem = controllerOf(c.g, id);
        // ruling 1: indestrutível continua alvo legal; não é destruída, mas o resto acontece
        yield* destroy(c.g, [id]);
        // CR 701.20: revela do topo até uma carta de criatura (ruling 4: qualquer carta com o tipo criatura)
        const s = c.g.state;
        const grimorio = s.zones.library[quem];
        const i = grimorio.findIndex((x) => isCreature(c.g, x));
        const reveladas = i < 0 ? [...grimorio] : grimorio.slice(0, i + 1);
        c.g.log(`${s.players[quem].name} revela ${reveladas.map((x) => nameOf(c.g, x)).join(', ') || 'nada (grimório vazio)'}.`, { rule: '701.20' });
        if (i >= 0) yield* putOntoBattlefield(c.g, [{ id: grimorio[i], controller: quem }], 'effect');
        // rulings 3, 5: sem criatura, revela o grimório todo; embaralha de qualquer jeito
        shuffleLibrary(c.g, quem);
      },
    },
  }],
  rulings: {
    1: 'teste: criatura indestrutível não é destruída, mas o controlador revela e põe uma criatura no campo',
    2: 'teste: CR 608.2b: com o alvo ilegal, nada acontece',
    3: 'teste: sem carta de criatura no grimório, revela tudo e embaralha; o alvo continua destruído',
    4: 'teste: carta de artefato e criatura é carta de criatura',
    5: 'teste: sem carta de criatura no grimório, revela tudo e embaralha; o alvo continua destruído',
  },
});
