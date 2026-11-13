// Transwarp Hub
// When this Spacecraft enters, mill five cards. You may put up to two artifact cards from among them into your hand.
// Station (Tap another creature you control: Put charge counters equal to its power on this Spacecraft. Station only as
// a sorcery.)
// 3+ | {T}: Target creature can't be blocked this turn.
import { activated, chooseItems, defineAbility, defineCard, etb, isType, mill, moveObjects, nameOf, objItem, station, stationLevel, t, tgt, untilEndOfTurn } from '../../motor/api.ts';

// sem quadro de força e resistência (CR 721.2a): a faixa 3+ só dá a habilidade ativada
const IMBLOQUEAVEL = 'Transwarp Hub:imbloqueavel';
defineAbility(IMBLOQUEAVEL, activated('{T}', function* (c) {
  const id = tgt(c);
  if (id !== null) untilEndOfTurn(c, [id], [{ k: 'rule', id: 'rule:cantBeBlocked' }]);
}, { targets: [t.creature()], text: '{T}: A criatura alvo não pode ser bloqueada neste turno.' }));

export default defineCard({
  name: 'Transwarp Hub',
  faces: [{
    abilities: [
      etb(function* (c) {
        const moidas = yield* mill(c.g, c.you, 5);
        const artefatos = moidas.filter((id) => c.g.state.objects[id]?.zone === 'graveyard' && isType(c.g, id, 'Artifact'));
        if (!artefatos.length) return;
        const esc = yield* chooseItems(c.g, c.you, 'Transwarp Hub: ponha até duas cartas de artefato moídas na sua mão', artefatos.map((id) => objItem(c.g, id, nameOf(c.g, id))), 0, 2);
        if (esc.length) yield* moveObjects(c.g, esc.map((id) => ({ id: Number(id), to: 'hand' as const })), 'effect');
      }, { text: 'Quando esta Espaçonave entra, moa cinco cartas. Você pode colocar até duas cartas de artefato dentre elas na sua mão.' }),
      station(),
      ...stationLevel(3, { abilities: [IMBLOQUEAVEL], text: '{T}: A criatura alvo não pode ser bloqueada neste turno.' }),
    ],
  }],
  rulings: {},
});
