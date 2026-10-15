// Ancient Cellarspawn
// Each spell you cast that's a Demon, Horror, or Nightmare costs {1} less to cast.
// Whenever you cast a spell, if the amount of mana spent to cast it was less than its mana value, target opponent loses
// life equal to the difference.
import { defineCard, lkiChars, loseLife, lkiObj, on, staticAbility, t, tgtPlayer, triggered } from '../../motor/api.ts';
import type { SCtx } from '../../motor/defs.ts';
import type { ObjId } from '../../motor/types.ts';

const TIPOS = ['Demon', 'Horror', 'Nightmare'];

/** quanto faltou de mana para o valor de mana da mágica (como ela existiu por último na pilha: ruling 4) */
function diferenca(c: SCtx, magica: ObjId): number {
  const o = c.g.state.objects[magica]?.zone === 'stack' ? c.g.state.objects[magica] : lkiObj(c.g, magica);
  const ch = lkiChars(c.g, magica);
  if (!o?.stack || !ch) return 0;
  // ruling 3: o valor de mana na pilha já inclui o X escolhido
  return Math.max(0, ch.manaValue - (o.stack.manaSpent?.total ?? 0));
}

export default defineCard({
  name: 'Ancient Cellarspawn',
  faces: [{
    abilities: [
      staticAbility({
        rules: { costModifier: (c, sp) => (sp.controller === c.you && sp.chars.subtypes.some((s) => TIPOS.includes(s)) ? { reduce: 1 } : null) },
        text: 'Cada mágica que você conjura que é um Demon, Horror ou Nightmare custa {1} a menos para ser conjurada.',
      }),
      // CR 603.4: a condição é conferida ao disparar e de novo na resolução
      triggered(on.youCast(), function* (c) {
        const p = tgtPlayer(c);
        const n = diferenca(c, (c.event as { spell: ObjId }).spell);
        if (p !== null && n > 0) loseLife(c.g, p, n, c.source);
      }, {
        condition: (c) => diferenca(c, (c.event as { spell: ObjId }).spell) > 0,
        targets: [t.opponent()],
        text: 'Sempre que você conjura uma mágica, se a quantidade de mana gasta para conjurá-la foi menor que o valor de mana dela, o oponente alvo perde vida igual à diferença.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 601.2f — o custo total parte do custo de mana ou alternativo; o valor de mana não muda (motor/stack.ts)',
    2: 'regra geral: CR 603.2 — o gatilho resolve antes da mágica, mesmo com ela anulada',
    3: 'regra geral: CR 202.3e — na pilha, o valor de mana inclui o X escolhido (motor/chars.ts)',
    4: 'teste: com a mágica já fora da pilha, usa a última informação dela',
  },
});
