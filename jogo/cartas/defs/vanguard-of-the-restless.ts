// Vanguard of the Restless
// Flying
// Spirits you control get +1/+1 for each time you've cast your commander from the command zone this game.
// Whenever a Spirit you control enters, you may pay {2}{W}. If you do, return this card from your graveyard to the
// battlefield.
import { defineCard, isCreature, isSubtype, keyword, mayPay, on, putOntoBattlefield, staticAbility, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Vanguard of the Restless',
  faces: [{
    abilities: [
      keyword('flying'),
      // rulings 1-2: soma as conjurações de todos os seus comandantes, mesmo anuladas ou ainda na pilha
      staticAbility({
        affects: (c, o) => o.zone === 'battlefield' && o.controller === c.you && isCreature(c.g, o.id) && isSubtype(c.g, o.id, 'Spirit'),
        mods: (c) => {
          const n = Object.values(c.g.state.players[c.you].commanderCasts).reduce((a, b) => a + b, 0);
          return n > 0 ? [{ k: 'pt', p: n, t: n }] : [];
        },
        text: 'Os Spirits que você controla recebem +1/+1 para cada vez que você conjurou seu comandante da zona de comando nesta partida.',
      }),
      triggered(on.custom((e, c) => e.type === 'zone' && e.to === 'battlefield' && e.controller === c.you && !!c.g.state.objects[e.obj] && isSubtype(c.g, e.obj, 'Spirit') && isCreature(c.g, e.obj)), function* (c) {
        if (c.g.state.objects[c.source]?.zone !== 'graveyard') return;
        if (yield* mayPay(c, c.you, '{2}{W}', 'devolver Vanguard of the Restless ao campo')) {
          if (c.g.state.objects[c.source]?.zone === 'graveyard') yield* putOntoBattlefield(c.g, [{ id: c.source, controller: c.you }], 'effect');
        }
      }, { zones: ['graveyard'], text: 'Sempre que um Spirit que você controla entra, você pode pagar {2}{W}. Se fizer isso, devolva esta carta do seu cemitério ao campo.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: soma as conjurações de todos os comandantes (cada deck tem um só)',
    2: 'teste: conta as conjurações registradas da zona de comando',
  },
});
