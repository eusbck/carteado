// S.S. Botany Bay
// {T}: Each opponent exiles a card from their graveyard. You may exile a card from your graveyard.
// Station
// 8+ | Flying
// Whenever S.S. Botany Bay deals combat damage to a player, return each creature card you own exiled with it to the
// battlefield.
// 3/5 (no quadro da faixa 8+)
import { activated, chooseItems, defineAbility, defineCard, exile, isCreature, linkedExiled, nameOf, objItem, on, putOntoBattlefield, station, stationLevel, triggered } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

const CHAVE = 'botany-bay';

// CR 721.2: a linha depois de "8+ | Voar" está na mesma faixa
const DANO = defineAbility('S.S. Botany Bay:dano', triggered(on.selfDealsCombatDamageToPlayer(), function* (c) {
  const cartas = linkedExiled(c.g, c.source, CHAVE).filter((id: ObjId) => c.g.state.objects[id].owner === c.you && isCreature(c.g, id));
  if (cartas.length) yield* putOntoBattlefield(c.g, cartas.map((id) => ({ id, controller: c.you })), 'effect');
}, { text: 'Sempre que S.S. Botany Bay causa dano de combate a um jogador, devolva ao campo cada carta de criatura de que você é dono exilada com ela.' }));

export default defineCard({
  name: 'S.S. Botany Bay',
  faces: [{
    abilities: [
      activated('{T}', function* (c) {
        const s = c.g.state;
        // CR 101.4: as escolhas em ordem APNAP; cada um exila ao escolher (as cartas ficam ligadas a esta Spacecraft)
        for (const p of c.g.apnap()) {
          const cem = s.zones.graveyard[p];
          if (!cem.length) continue;
          const opcional = p === c.you;
          if (!opcional && !c.g.isOpponent(c.you, p)) continue;
          const esc = yield* chooseItems(c.g, p, opcional ? 'S.S. Botany Bay: você pode exilar uma carta do seu cemitério' : 'S.S. Botany Bay: exile uma carta do seu cemitério', cem.map((id) => objItem(c.g, id, nameOf(c.g, id))), opcional ? 0 : 1, 1);
          if (esc.length) yield* exile(c.g, [Number(esc[0])], { linkTo: { obj: c.source, key: CHAVE } });
        }
      }, { text: '{T}: Cada oponente exila uma carta do próprio cemitério. Você pode exilar uma carta do seu cemitério.' }),
      station(),
      // CR 721.2b: com 8 ou mais marcadores, criatura artefato 3/5 com voar e o gatilho de dano (mesma faixa)
      ...stationLevel(8, { creature: true, keywords: ['flying'], abilities: [DANO.id!], text: 'Voar. Sempre que S.S. Botany Bay causa dano de combate a um jogador, devolva ao campo cada carta de criatura de que você é dono exilada com ela. É uma criatura artefato 3/5.' }),
    ],
  }],
  rulings: {},
});
