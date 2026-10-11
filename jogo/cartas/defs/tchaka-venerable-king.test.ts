import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = "T'Chaka, Venerable King";

describe(N, () => {
  it('entrando, mói três cartas e você pode pôr na mão um artefato ou terreno entre elas', () => {
    const tg = setup({ battlefield: [['Forest', 'Plains'], []], hand: [[N], []], library: [['Silver Myr', 'Serra Angel', 'Island', 'Forest'], []] });
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes("T'Chaka")) return null;
      // Serra Angel não é artefato nem terreno
      expect(d.items.map((i) => i.label).sort()).toEqual(['Island', 'Silver Myr']);
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Silver Myr')!.id] };
    });
    tg.cast(N).resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([2, 2]);
    expect(tg.names(0, 'hand')).toEqual(['Silver Myr']);
    expect(tg.names(0, 'graveyard').sort()).toEqual(['Island', 'Serra Angel']);
  });

  it('do cemitério, {3} e exile: você vira o monarca, só controlando o seu comandante', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island', { name: 'Silver Myr', commander: true }], []], graveyard: [[N], []] });
    tg.activate(N).resolveAll();
    expect(tg.state.monarch).toBe(0);
    expect(tg.find(N, 'exile')).not.toBeNull();
    const sem = setup({ battlefield: [['Island', 'Island', 'Island', 'Silver Myr'], []], graveyard: [[N], []] });
    expect(sem.actionIds().some((a) => a.startsWith('act:'))).toBe(false);
  });
});