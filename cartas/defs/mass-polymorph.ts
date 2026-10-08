// Mass Polymorph
// Exile all creatures you control, then reveal cards from the top of your library until you reveal that many creature
// cards. Put all creature cards revealed this way onto the battlefield, then shuffle the rest of the revealed cards into
// your library.
import { creaturesOf, defineCard, exile, isCreature, nameOf, putOntoBattlefield, shuffleLibrary } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Mass Polymorph',
  faces: [{
    spell: {
      *effect(c) {
        // ruling 4: as exiladas ficam no exílio; fichas exiladas também contam
        const exiladas = (yield* exile(c.g, creaturesOf(c.g, c.you))).filter((x): x is ObjId => x !== null && c.g.state.objects[x]?.zone === 'exile');
        const s = c.g.state;
        const n = exiladas.length;
        // CR 701.20: revela do topo até revelar n cartas de criatura (ruling 1: ou o grimório todo)
        const grimorio = s.zones.library[c.you];
        const criaturas: ObjId[] = [];
        let i = 0;
        for (; i < grimorio.length && criaturas.length < n; i++) if (isCreature(c.g, grimorio[i])) criaturas.push(grimorio[i]);
        const reveladas = grimorio.slice(0, i);
        if (n > 0) c.g.log(`${s.players[c.you].name} revela ${reveladas.map((x) => nameOf(c.g, x)).join(', ') || 'nada (grimório vazio)'}.`, { rule: '701.20' });
        // ruling 3: todas entram ao mesmo tempo; ruling 2: os gatilhos esperam o fim da resolução
        if (criaturas.length) yield* putOntoBattlefield(c.g, criaturas.map((id) => ({ id, controller: c.you })), 'effect');
        shuffleLibrary(c.g, c.you);
      },
    },
  }],
  rulings: {
    1: 'teste: com menos cartas de criatura no grimório do que criaturas exiladas, revela o grimório todo',
    2: 'teste: as criaturas entram juntas e os gatilhos de entrar vão para a pilha depois da resolução',
    3: 'teste: as criaturas entram juntas e os gatilhos de entrar vão para a pilha depois da resolução',
    4: 'teste: exila as suas criaturas (fichas também contam) e revela até achar o mesmo número de cartas de criatura',
  },
});
