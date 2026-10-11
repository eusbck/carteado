// Puppet Master, String Puller
// Whenever you attack, goad target creature an opponent controls. It can't block this turn. (Until your next turn, that
// creature attacks each combat if able and attacks a player other than you if able.)
// Whenever one or more goaded creatures deal combat damage to one of your opponents, create a Treasure token.
import { controllerOf, createTokens, defineCard, goad, hooks, on, t, tgt, triggered, untilEndOfTurn } from '../../motor/api.ts';
import type { G } from '../../motor/game-context.ts';
import type { ObjId } from '../../motor/types.ts';

/** goadada por qualquer jogador (designação ou efeito estático) */
function goadada(g: G, id: ObjId): boolean {
  const o = g.state.objects[id] ?? g.state.lki[id]?.obj;
  if (!o) return false;
  return o.goadedBy.length > 0 || hooks(g, 'goads').some((h) => h.fn(h.ctx, id));
}

export default defineCard({
  name: 'Puppet Master, String Puller',
  faces: [{
    abilities: [
      triggered(on.youAttack(), function* (c) {
        const id = tgt(c);
        if (id === null) return;
        goad(c.g, id, c.you);
        untilEndOfTurn(c, [id], [{ k: 'rule', id: 'rule:cantBlock' }]);
      }, {
        targets: [t.creature((c, id) => c.g.isOpponent(c.you, controllerOf(c.g, id)), 'criatura alvo que um oponente controla')],
        text: 'Sempre que você ataca, goade a criatura alvo que um oponente controla. Ela não pode bloquear neste turno.',
      }),
      // um gatilho por oponente que tomou dano de combate de criaturas goadadas no mesmo lote
      triggered(on.batch((evs, c) => {
        const ops = new Set<number>();
        for (const e of evs) if (e.type === 'damage' && e.combat && e.target.kind === 'player' && c.g.isOpponent(c.you, e.target.id) && goadada(c.g, e.source)) ops.add(e.target.id);
        return [...ops].map((jogador) => ({ jogador }));
      }), function* (c) { yield* createTokens(c.g, c.you, 'Treasure', 1); }, {
        text: 'Sempre que uma ou mais criaturas goadadas causam dano de combate a um dos seus oponentes, crie uma ficha de Treasure.',
      }),
    ],
  }],
  rulings: {},
});
