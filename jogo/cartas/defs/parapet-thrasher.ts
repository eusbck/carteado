// Parapet Thrasher
// Flying
// Whenever one or more Dragons you control deal combat damage to an opponent, choose one that hasn't been chosen this
// turn —
// • Destroy target artifact that opponent controls.
// • This creature deals 4 damage to each other opponent.
// • Exile the top card of your library. You may play it this turn.
import { allowPlay, chars, controllerOf, dealDamage, defineCard, destroy, exile, keyword, modal, on, t, tgt, triggered } from '../../motor/api.ts';
import type { G } from '../../motor/api.ts';
import type { ObjId, PlayerId } from '../../motor/types.ts';

/** os modos já escolhidos neste turno por este Parapet Thrasher */
function escolhidos(g: G, id: ObjId): number[] {
  const d = g.state.objects[id]?.data.thrasher as { turn: number; modos: number[] } | undefined;
  return d && d.turn === g.state.turn.number ? d.modos : [];
}

const ehDragao = (g: G, id: ObjId): boolean => !!(g.state.objects[id] ? chars(g, id) : g.state.lki[id]?.chars)?.subtypes.includes('Dragon');

export default defineCard({
  name: 'Parapet Thrasher',
  faces: [{
    abilities: [
      keyword('flying'),
      // um gatilho por oponente que sofreu dano de combate de um ou mais Dragons seus (CR 603.2c)
      triggered(on.batch((evs, c) => {
        const ops = new Set<PlayerId>();
        for (const e of evs) if (e.type === 'damage' && e.combat && e.amount > 0 && e.target.kind === 'player' && e.controller === c.you && c.g.isOpponent(c.you, e.target.id) && ehDragao(c.g, e.source)) ops.add(e.target.id);
        return ops.size ? [...ops].map((oponente) => ({ oponente })) : false;
      }), function* () { /* modos */ }, {
        modes: modal(1, 1, [
          {
            text: 'Destrua o artefato alvo que esse oponente controla',
            targets: [t.artifact((c, id) => controllerOf(c.g, id) === (c.event?.oponente as PlayerId | undefined), 'artefato alvo que esse oponente controla')],
            *effect(c) { const id = tgt(c); if (id !== null) yield* destroy(c.g, [id]); },
          },
          {
            text: 'Esta criatura causa 4 de dano a cada outro oponente',
            *effect(c) {
              const outros = c.g.opponents(c.you).filter((p) => p !== (c.event.oponente as PlayerId));
              dealDamage(c.g, outros.map((p) => ({ source: c.source, target: { kind: 'player' as const, id: p }, amount: 4, combat: false })));
            },
          },
          {
            text: 'Exile a carta do topo do seu grimório. Você pode jogá-la neste turno',
            *effect(c) {
              const topo = c.g.state.zones.library[c.you][0];
              if (topo === undefined) return;
              const [ex] = yield* exile(c.g, [topo]);
              // ruling 2: joga pagando os custos e no tempo normal da carta
              if (ex !== null && ex !== undefined) allowPlay(c.g, c.you, c.source, [ex], { kind: 'endOfTurn' });
            },
          },
        ], {
          // ruling 1 (CR 700.2, 603.3c): sem modo disponível, o gatilho sai da pilha sem fazer nada
          available: (c, i) => !escolhidos(c.g, c.source).includes(i),
          onChosen: (c, modos) => {
            const o = c.g.state.objects[c.source];
            if (!o) return;
            o.data.thrasher = { turn: c.g.state.turn.number, modos: [...escolhidos(c.g, c.source), ...modos] };
            c.g.bump();
          },
        }),
        text: 'Sempre que um ou mais Dragons que você controla causam dano de combate a um oponente, escolha um que não tenha sido escolhido neste turno — destrua o artefato alvo que esse oponente controla; esta criatura causa 4 de dano a cada outro oponente; ou exile a carta do topo do seu grimório, e você pode jogá-la neste turno.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: cada modo só pode ser escolhido uma vez por turno; sem modo disponível, o gatilho não faz nada',
    2: 'teste: o terceiro modo exila o topo, que pode ser jogado neste turno pagando o custo',
  },
});
