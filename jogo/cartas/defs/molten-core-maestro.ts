// Molten-Core Maestro
// Menace
// Opus — Whenever you cast an instant or sorcery spell, put a +1/+1 counter on this creature. If five or more mana was
// spent to cast that spell, add an amount of {R} equal to this creature's power.
import { addCounters, addMana, defineCard, is, keyword, lkiChars, on, triggered } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Molten-Core Maestro',
  faces: [{
    abilities: [
      keyword('menace'),
      // rulings 1-2: resolve antes da mágica; usa a pilha (não é habilidade de mana)
      triggered(on.youCast(is.instantOrSorcery), function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 1, c.you);
        const spell = c.event.spell as ObjId;
        const o = c.g.state.objects[spell] ?? c.g.state.lki[spell]?.obj;
        if ((o?.stack?.manaSpent?.total ?? 0) >= 5) {
          const p = Math.max(0, lkiChars(c.g, c.source)?.power ?? 0);
          if (p > 0) addMana(c.g, c.you, Array(p).fill('R'), { source: c.source });
        }
      }, { text: 'Opus — Sempre que você conjura uma mágica instantânea ou de feitiço, coloque um marcador +1/+1 nesta criatura. Se cinco ou mais manas foram gastas para conjurá-la, adicione {R} igual à força desta criatura.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 603.3 — o gatilho resolve antes da mágica',
    2: 'teste: a mana vem quando o gatilho resolve (usa a pilha)',
  },
});
