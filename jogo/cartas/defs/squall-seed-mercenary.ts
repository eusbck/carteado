// Squall, SeeD Mercenary
// Rough Divide — Whenever a creature you control attacks alone, it gains double strike until end of turn.
// Whenever Squall deals combat damage to a player, return target permanent card with mana value 3 or less from your
// graveyard to the battlefield.
import { and, defineCard, is, on, putOntoBattlefield, t, tgt, triggered, untilEndOfTurn } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Squall, SeeD Mercenary',
  faces: [{
    abilities: [
      // ruling 3: "ataca sozinha" = a única criatura declarada como atacante
      triggered(on.custom((e, c) => (e.type === 'attackers' && e.player === c.you && e.attackers.length === 1 ? { criatura: e.attackers[0].obj } : false)), function* (c) {
        const id = c.event.criatura as ObjId;
        if (c.g.state.objects[id]?.zone === 'battlefield') untilEndOfTurn(c, [id], [{ k: 'addKeyword', kw: 'double strike' }]);
      }, { text: 'Divisão Bruta — Sempre que uma criatura que você controla ataca sozinha, ela ganha golpe duplo até o fim do turno.' }),
      triggered(on.selfDealsCombatDamageToPlayer(), function* (c) {
        const id = tgt(c);
        if (id !== null) yield* putOntoBattlefield(c.g, [{ id, controller: c.you }], 'effect');
      }, {
        // ruling 5: X vale 0 no cemitério
        targets: [t.card('graveyard', and(is.permanentCard, is.mvAtMost(3)), 'carta de permanente alvo com valor de mana 3 ou menos no seu cemitério')],
        text: 'Sempre que Squall causa dano de combate a um jogador, devolva a carta de permanente alvo com valor de mana 3 ou menos do seu cemitério ao campo.',
      }),
    ],
  }],
  rulings: {
    1: 'não se aplica: ruling de Starting Town, outra carta (erro nos dados de rulings)',
    2: 'não se aplica: ruling de Starting Town, outra carta (erro nos dados de rulings)',
    3: 'teste: atacando com duas, nenhuma ganha golpe duplo',
    4: 'não se aplica: ruling de Starting Town, outra carta (erro nos dados de rulings)',
    5: 'regra geral: CR 202.3e — X vale 0 no cemitério',
  },
});
