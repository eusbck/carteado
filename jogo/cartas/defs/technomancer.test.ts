import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Technomancer';

describe(N, () => {
  it('tritura três e devolve criaturas artefato do cemitério com valor de mana total até 6, inclusive as que já estavam lá', () => {
    const tg = setup({ battlefield: [Array(7).fill('Swamp'), []], hand: [[N], []], graveyard: [['Cryptothrall', 'Serra Angel'], []], library: [['Silver Myr', 'Canoptek Spyder', 'Island', 'Island'], ['Island']] });
    const vistos: string[][] = [];
    for (const nome of ['Cryptothrall', 'Silver Myr']) tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('Technomancer')) return null;
      vistos.push(d.items.map((i) => i.label.replace(/ \(\d+\)$/, '')).sort());
      const i = d.items.find((x) => x.label.startsWith(nome));
      return i ? { kind: 'select', ids: [i.id] } : null;
    });
    tg.cast(N).resolveAll();
    // primeiro cabem os três artefatos; depois do Cryptothrall (4) restam 2, e só o Silver Myr cabe
    expect(vistos).toEqual([['Canoptek Spyder', 'Cryptothrall', 'Silver Myr'], ['Silver Myr']]);
    expect(tg.find('Cryptothrall')).not.toBeNull();
    expect(tg.find('Silver Myr')).not.toBeNull();
    expect(tg.find('Canoptek Spyder')).toBeNull();
  });
});