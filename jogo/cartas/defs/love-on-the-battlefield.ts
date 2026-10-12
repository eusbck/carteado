// Love on the Battlefield
// Whenever you attack with exactly two creatures, those creatures gain first strike until end of turn, then draw a card.
// Whenever either of those creatures deals combat damage to a player this combat, put a +1/+1 counter on it.
import { addCounters, defineAbility, defineCard, delayed, draw, on, triggered, untilEndOfTurn } from '../../motor/api.ts';

type Dados = { criaturas?: number[]; combate?: number };

// gatilho atrasado: vale só para aquele combate (compara a contagem de combates do turno)
const DANO = defineAbility('Love on the Battlefield:dano', triggered(on.custom((e, c) => {
  const d = ((c as unknown as { delayed?: { data: Dados } }).delayed?.data ?? {}) as Dados;
  if (e.type !== 'damage' || !e.combat || e.target.kind !== 'player' || !(d.criaturas ?? []).includes(e.source)) return false;
  return c.g.state.turn.combatCount === d.combate ? { criatura: e.source } : false;
}), function* (c) {
  const id = c.event.criatura as number;
  if (c.g.state.objects[id]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id }, '+1/+1', 1, c.you);
}, { text: 'Sempre que uma dessas criaturas causa dano de combate a um jogador neste combate, coloque um marcador +1/+1 nela.' }));

export default defineCard({
  name: 'Love on the Battlefield',
  faces: [{
    abilities: [
      triggered(on.custom((e, c) => (e.type === 'attackers' && e.player === c.you && e.attackers.length === 2 ? { criaturas: e.attackers.map((a) => a.obj) } : false)), function* (c) {
        const criaturas = (c.event.criaturas as number[]).filter((id) => c.g.state.objects[id]?.zone === 'battlefield');
        if (criaturas.length) untilEndOfTurn(c, criaturas, [{ k: 'addKeyword', kw: 'first strike' }]);
        yield* draw(c.g, c.you, 1);
        delayed(c, DANO.id!, { once: false, expiresTurn: c.g.state.turn.number, data: { criaturas: c.event.criaturas, combate: c.g.state.turn.combatCount } });
      }, { text: 'Sempre que você ataca com exatamente duas criaturas, essas criaturas ganham iniciativa até o fim do turno e depois você compra uma carta. Sempre que uma dessas criaturas causa dano de combate a um jogador neste combate, coloque um marcador +1/+1 nela.' }),
    ],
  }],
  rulings: {},
});