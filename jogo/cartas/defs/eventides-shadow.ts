// Eventide's Shadow
// Remove any number of counters from among permanents on the battlefield. You draw cards and lose life equal to the
// number of counters removed this way.
import { chooseItems, defineCard, draw, loseLife, nameOf, removeCounters } from '../../motor/api.ts';
import type { ChoiceItem } from '../../motor/types.ts';

const NOMES: Record<string, string> = { '+1/+1': '+1/+1', '-1/-1': '−1/−1', loyalty: 'lealdade' };

export default defineCard({
  name: "Eventide's Shadow",
  faces: [{
    spell: {
      *effect(c) {
        const s = c.g.state;
        // cada marcador vira um item; ruling 1: de permanentes de qualquer jogador
        const itens: ChoiceItem[] = [];
        for (const id of s.zones.battlefield) {
          for (const [tipo, n] of Object.entries(s.objects[id].counters)) {
            for (let i = 0; i < n; i++) itens.push({ id: `${id}|${tipo}|${i}`, label: `${nameOf(c.g, id)}: marcador ${NOMES[tipo] ?? tipo} ${i + 1}`, obj: id });
          }
        }
        if (itens.length === 0) return;
        const pick = yield* chooseItems(c.g, c.you, "Eventide's Shadow: escolha os marcadores a remover (compra e perde 1 de vida por marcador)", itens, 0, itens.length);
        const porAlvo = new Map<string, number>();
        for (const p of pick) { const [id, tipo] = p.split('|'); const k = `${id}|${tipo}`; porAlvo.set(k, (porAlvo.get(k) ?? 0) + 1); }
        let total = 0;
        for (const [k, n] of porAlvo) { const [id, tipo] = k.split('|'); total += removeCounters(c.g, { kind: 'obj', id: Number(id) }, tipo, n); }
        if (total === 0) return;
        yield* draw(c.g, c.you, total);
        loseLife(c.g, c.you, total, c.source);
      },
    },
  }],
  rulings: { 1: 'teste: remove de permanentes de qualquer jogador' },
});
