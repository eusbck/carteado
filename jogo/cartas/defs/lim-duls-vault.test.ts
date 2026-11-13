import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = "Lim-Dûl's Vault";
const LIB = ['Island', 'Forest', 'Plains', 'Swamp', 'Mountain', 'Wall of Omens', 'Sol Ring', 'Zetalpa, Primal Dawn', 'Indomitable Ancients', 'Dark Ritual', 'Gamble'];

describe(NOME, () => {
  it('sem pagar vida, as cinco do topo ficam no topo na ordem escolhida', () => {
    const tg = setup({ battlefield: [['Island', 'Swamp'], []], hand: [[NOME], []], library: [LIB, []] });
    tg.yes('Pagar 1 de vida', false);
    tg.script.push((d) => (d.kind === 'arrange' ? { kind: 'arrange', placement: Object.fromEntries(d.items.map((i) => [i.id, 'top'])), order: [...d.items].reverse().map((i) => i.id) } : null));
    tg.cast(NOME).resolve();
    expect(tg.names(0, 'library').slice(0, 5)).toEqual(['Mountain', 'Swamp', 'Plains', 'Forest', 'Island']);
    expect(tg.life(0)).toBe(40);
  });

  it('pagando 1 de vida, as cinco vão para o fundo e você olha as cinco seguintes', () => {
    const tg = setup({ battlefield: [['Island', 'Swamp'], []], hand: [[NOME], []], library: [LIB, []] });
    tg.yes('Pagar 1 de vida', true);
    tg.yes('Pagar 1 de vida', false);
    tg.cast(NOME).resolve();
    const lib = tg.names(0, 'library');
    expect(lib.slice(0, 5).sort()).toEqual(['Dark Ritual', 'Indomitable Ancients', 'Sol Ring', 'Wall of Omens', 'Zetalpa, Primal Dawn'].sort());
    // as cinco primeiras foram para o fundo e depois entraram no embaralhamento do resto
    expect(lib).toHaveLength(11);
    expect(tg.life(0)).toBe(39);
  });
});
