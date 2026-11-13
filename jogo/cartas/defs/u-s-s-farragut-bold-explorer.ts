// U.S.S. Farragut, Bold Explorer
// Landfall — Whenever a land you control enters, you may put a creature card from your hand onto the battlefield. That
// creature gains haste. At the beginning of the next end step, put it on the bottom of your library. When you do,
// draw a card.
// Station (Tap another creature you control: Put charge counters equal to its power on this Spacecraft. Station only as
// a sorcery. It's an artifact creature at 7+.)
// 7+ | Flying
// 4/4 (no quadro da faixa 7+)
import { addEffect, chooseItems, defineAbility, defineCard, delayed, draw, isCreature, moveObjects, nameOf, nextEndStepTrigger, objItem, on, putOntoBattlefield, station, stationLevel, triggered } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

const VAI_PARA_O_FUNDO = defineAbility('U.S.S. Farragut, Bold Explorer:fundo', nextEndStepTrigger(function* (c) {
  const id = c.data.criatura as ObjId;
  // CR 400.7: se a criatura saiu do campo, é outro objeto e fica onde está; sem pôr no fundo, não compra
  if (c.g.state.objects[id]?.zone !== 'battlefield') return;
  const dono = c.g.state.objects[id].owner;
  const [novo] = yield* moveObjects(c.g, [{ id, to: 'library' }], 'effect');
  if (novo === null || novo === undefined || c.g.state.objects[novo]?.zone !== 'library') return;
  const lib = c.g.state.zones.library[dono];
  c.g.state.zones.library[dono] = [...lib.filter((x) => x !== novo), novo];
  c.g.bump();
  // "Quando fizer isso, compre uma carta" (CR 603.12): resolvido aqui mesmo, sem escolhas no meio
  yield* draw(c.g, c.you, 1);
}, 'No início da próxima etapa final, coloque essa criatura no fundo do seu grimório. Quando fizer isso, compre uma carta.'));

export default defineCard({
  name: 'U.S.S. Farragut, Bold Explorer',
  faces: [{
    abilities: [
      triggered(on.landfall(), function* (c) {
        const cands = c.g.state.zones.hand[c.you].filter((id) => isCreature(c.g, id));
        if (!cands.length) return;
        const esc = yield* chooseItems(c.g, c.you, 'U.S.S. Farragut: você pode pôr uma carta de criatura da sua mão no campo', cands.map((id) => objItem(c.g, id, nameOf(c.g, id))), 0, 1);
        if (!esc.length) return;
        const [id] = yield* putOntoBattlefield(c.g, [{ id: Number(esc[0]), controller: c.you }], 'effect');
        if (id === undefined || c.g.state.objects[id]?.zone !== 'battlefield') return;
        addEffect(c.g, { source: c.source, sourceDef: '', controller: c.you, duration: { kind: 'whileOnBattlefield', obj: id }, affected: [id], mods: [{ k: 'addKeyword', kw: 'haste' }] });
        delayed(c, VAI_PARA_O_FUNDO.id!, { data: { criatura: id } });
      }, { text: 'Aterragem — Sempre que um terreno que você controla entra, você pode pôr uma carta de criatura da sua mão no campo. Essa criatura ganha ímpeto. No início da próxima etapa final, coloque-a no fundo do seu grimório. Quando fizer isso, compre uma carta.' }),
      station(),
      ...stationLevel(7, { creature: true, keywords: ['flying'], text: 'Voar. É uma criatura artefato 4/4.' }),
    ],
  }],
  rulings: {},
});
