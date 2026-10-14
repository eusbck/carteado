// Otherworldly Escort
// Flash
// When this creature dies, if it's not a Spirit, return it to the battlefield under its owner's control with four
// charge counters on it. It's a Spirit Detective. (It's no longer a Human.)
// {1}{W}, {T}, Remove a charge counter from this creature: Destroy target creature that dealt damage to you this turn.
import { activated, addEffect, defineCard, destroy, keywords, lkiChars, on, putOntoBattlefield, t, tgt, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Otherworldly Escort',
  faces: [{
    abilities: [
      ...keywords('flash'),
      triggered(on.custom((e, c) => (e.type === 'zone' && e.from === 'battlefield' && e.to === 'graveyard' && e.old === c.source ? { carta: e.obj } : false)), function* (c) {
        const carta = c.event.carta as number;
        if (c.g.state.objects[carta]?.zone !== 'graveyard') return;
        const [nova] = yield* putOntoBattlefield(c.g, [{ id: carta, controller: c.g.state.objects[carta].owner, counters: { charge: 4 } }], 'effect');
        if (nova === undefined || c.g.state.objects[nova]?.zone !== 'battlefield') return;
        // "é um Spirit Detective": troca os tipos de criatura (camada 4), enquanto estiver no campo
        addEffect(c.g, { source: nova, sourceDef: '', controller: c.you, duration: { kind: 'whileOnBattlefield', obj: nova }, affected: [nova], mods: [{ k: 'setTypes', types: ['Creature'], subtypes: ['Spirit', 'Detective'], keepSupertypes: true }] });
      }, {
        // cláusula "se" interveniente (CR 603.4): pela última informação, ela não era um Spirit
        condition: (c) => !lkiChars(c.g, c.source)?.subtypes.includes('Spirit'),
        text: 'Quando esta criatura morre, se ela não for um Spirit, devolva-a ao campo sob o controle do dono com quatro marcadores de carga. Ela é um Spirit Detective (não é mais Human).',
      }),
      activated('{1}{W}, {T}, Remove a charge counter from this creature', function* (c) {
        const id = tgt(c);
        if (id !== null) yield* destroy(c.g, [id]);
      }, {
        targets: [t.creature((c, id) => {
          const d = c.g.state.damagedPlayersBy;
          return !!d && d.turn === c.g.state.turn.number && !!d.pairs[String(id)]?.includes(c.you);
        }, 'criatura alvo que causou dano a você neste turno')],
        text: '{1}{W}, {T}, Remova um marcador de carga desta criatura: Destrua a criatura alvo que causou dano a você neste turno.',
      }),
    ],
  }],
  rulings: {},
});
