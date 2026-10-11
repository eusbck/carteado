// Lady Loki, Agent of Chaos
// Whenever you cast your first instant, sorcery, or Villain spell each turn, exile it, then exile cards from the top of
// your library until you exile a nonland card. Lady Loki deals damage to each opponent equal to the difference between
// that spell's mana value and that nonland card's mana value. You may cast that card without paying its mana cost.
import { dealDamage, defineCard, exile, isLand, manaValue, mayCastFree, nameOf, on, triggered } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

const conta = (x: { types: string[]; subtypes: string[] }): boolean => x.types.includes('Instant') || x.types.includes('Sorcery') || x.subtypes.includes('Villain');

export default defineCard({
  name: 'Lady Loki, Agent of Chaos',
  faces: [{
    abilities: [
      // "a sua primeira … em cada turno": o registro do turno já inclui a mágica que acabou de ser conjurada
      triggered(on.custom((e, c) => {
        if (e.type !== 'cast' || e.copy || e.player !== c.you || !c.g.state.objects[e.obj]) return false;
        const log = c.g.state.turnStats[c.you]?.castLog ?? [];
        const ultima = log.at(-1);
        if (!ultima || !conta(ultima) || log.filter(conta).length !== 1) return false;
        return { spell: e.obj, valor: manaValue(c.g, e.obj) };
      }), function* (c) {
        const s = c.g.state;
        const magica = c.event.spell as ObjId;
        // exila a mágica, se ela ainda está na pilha
        if (s.objects[magica]?.zone === 'stack') yield* exile(c.g, [magica]);
        let carta: ObjId | null = null;
        while (s.zones.library[c.you].length) {
          const [ex] = yield* exile(c.g, [s.zones.library[c.you][0]]);
          if (ex === null || ex === undefined || s.objects[ex]?.zone !== 'exile') break;
          if (!isLand(c.g, ex)) { carta = ex; break; }
        }
        if (carta === null) return;
        const dano = Math.abs((c.event.valor as number) - manaValue(c.g, carta));
        if (dano > 0) dealDamage(c.g, c.g.opponents(c.you).map((p) => ({ source: c.source, target: { kind: 'player' as const, id: p }, amount: dano, combat: false })));
        yield* mayCastFree(c.g, c.you, carta, `Lady Loki: conjurar ${nameOf(c.g, carta)} sem pagar o custo de mana?`);
      }, { text: 'Sempre que você conjura a sua primeira mágica instantânea, de feitiço ou de Villain em cada turno, exile-a e depois exile cartas do topo do seu grimório até exilar uma carta que não é terreno. Lady Loki causa a cada oponente dano igual à diferença entre o valor de mana dessa mágica e o dessa carta. Você pode conjurar essa carta sem pagar o custo de mana.' }),
    ],
  }],
  rulings: {},
});
