// Mana-Charged Dragon
// Flying, trample
// Join forces — Whenever this creature attacks or blocks, each player starting with you may pay any amount of mana. This
// creature gets +X/+0 until end of turn, where X is the total amount of mana paid this way.
import { chooseNumber, defineCard, keywords, on, payMana, triggered } from '../../motor/api.ts';
import { canAfford } from '../../motor/costs.ts';
import type { ManaSymbol } from '../../motor/types.ts';
import { bombeia } from '../inferno.ts';

const generico = (n: number): ManaSymbol[] => [{ k: 'generic', n }];

export default defineCard({
  name: 'Mana-Charged Dragon',
  faces: [{
    abilities: [
      ...keywords('flying', 'trample'),
      triggered(on.custom((e, c) => (e.type === 'attackers' && e.attackers.some((a) => a.obj === c.source)) || (e.type === 'blockers' && e.blocks.some(([b]) => b === c.source))), function* (c) {
        const s = c.g.state;
        // "começando por você": ordem de turno a partir de quem controla o Dragon
        const ordem = c.g.order().filter((p) => !s.players[p].left);
        const i = Math.max(0, ordem.indexOf(c.you));
        let total = 0;
        for (const p of [...ordem.slice(i), ...ordem.slice(0, i)]) {
          let max = 0;
          while (max < 40 && canAfford(c.g, p, generico(max + 1), { purpose: { kind: 'effect' } })) max++;
          if (max === 0) continue;
          const n = yield* chooseNumber(c.g, p, `Unir forças (Mana-Charged Dragon): quanta mana você paga? Ele recebe +1/+0 por mana (já pagaram ${total})`, 0, max);
          if (n <= 0) continue;
          const pago = yield* payMana(c.g, p, generico(n), { purpose: { kind: 'effect' }, canCancel: true, label: 'unir forças' });
          if (pago !== null) total += n;
        }
        if (total > 0) bombeia(c, total, 0);
      }, { text: 'Unir forças — Sempre que esta criatura ataca ou bloqueia, cada jogador, começando por você, pode pagar qualquer quantidade de mana. Esta criatura recebe +X/+0 até o fim do turno, onde X é o total de mana paga assim.' }),
    ],
  }],
  rulings: {},
});