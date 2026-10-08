// Divergent Transformations
// Undaunted (This spell costs {1} less to cast for each opponent.)
// Exile two target creatures. For each of those creatures, its controller reveals cards from the top of their library
// until they reveal a creature card, puts that card onto the battlefield, then shuffles the rest into their library.
import { controllerOf, defineCard, exactly, exile, isCreature, nameOf, putOntoBattlefield, shuffleLibrary, t, tgtsAll } from '../../motor/api.ts';
import type { G } from '../../motor/game-context.ts';
import type { Gen } from '../../motor/defs.ts';
import type { PlayerId } from '../../motor/types.ts';

/** CR 701.20: revela do topo até uma carta de criatura, põe no campo e embaralha o resto */
function* trocar(g: G, quem: PlayerId): Gen<void> {
  const s = g.state;
  const grimorio = s.zones.library[quem];
  const i = grimorio.findIndex((x) => isCreature(g, x));
  const reveladas = i < 0 ? [...grimorio] : grimorio.slice(0, i + 1);
  g.log(`${s.players[quem].name} revela ${reveladas.map((x) => nameOf(g, x)).join(', ') || 'nada (grimório vazio)'}.`, { rule: '701.20' });
  if (i >= 0) yield* putOntoBattlefield(g, [{ id: grimorio[i], controller: quem }], 'effect');
  // ruling 6: sem carta de criatura, revela o grimório todo e embaralha
  shuffleLibrary(g, quem);
}

export default defineCard({
  name: 'Divergent Transformations',
  faces: [{
    // CR 702.125a-b: {1} a menos por oponente ainda na partida; rulings 7-8: fixado ao calcular o custo total e
    // sem mudar o valor de mana
    selfCost: (c) => ({ reduce: c.g.opponents(c.you).length }),
    spell: {
      // ruling 1: exatamente duas criaturas alvo
      targets: [exactly(2, t.creature(undefined, 'criaturas alvo'))],
      *effect(c) {
        // ruling 1: só as que continuam alvos legais
        const alvos = tgtsAll(c, 0);
        const donos = new Map(alvos.map((id) => [id, controllerOf(c.g, id)] as const));
        yield* exile(c.g, alvos);
        // rulings 2-4: em ordem APNAP, cada controlador repete o processo por criatura, uma de cada vez
        for (const p of c.g.apnap()) for (const id of alvos) if (donos.get(id) === p) yield* trocar(c.g, p);
      },
    },
  }],
  rulings: {
    1: 'teste: se um dos alvos fica ilegal, só o outro é trocado',
    2: 'teste: em ordem APNAP, cada controlador troca a própria criatura',
    3: 'teste: duas criaturas do mesmo jogador: ele repete o processo duas vezes, uma criatura de cada vez',
    4: 'teste: duas criaturas do mesmo jogador: ele repete o processo duas vezes, uma criatura de cada vez',
    5: 'regra geral: CR 603.3b — os gatilhos esperam a mágica terminar de resolver',
    6: 'teste: sem carta de criatura no grimório, revela tudo e embaralha',
    7: 'regra geral: CR 601.2f — o custo é calculado uma vez, ao conjurar',
    8: 'teste: com dois oponentes custa {4}{R}; o valor de mana continua 7',
  },
});
