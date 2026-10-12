import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Canoptek Tomb Sentinel';

describe(N, () => {
  it('vigilância; desenterrada, entra vinda do cemitério e exila até uma permanente que não é terreno', () => {
    const tg = setup({ battlefield: [Array(7).fill('Swamp'), ['Serra Angel']], graveyard: [[N], []] });
    tg.script.push((d) => { const i = d.kind === 'select' ? d.items.find((x) => x.label === 'Serra Angel') : undefined; return i ? { kind: 'select', ids: [i.id] } : null; });
    tg.activate(N, 'Desenterrar').resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([4, 3]);
    expect(hasKw(tg.g, tg.bf(N), 'vigilance')).toBe(true);
    expect(tg.names(1, 'exile')).toEqual(['Serra Angel']);
  });

  it('conjurada da mão, não dispara', () => {
    const tg = setup({ battlefield: [Array(4).fill('Swamp'), ['Serra Angel']], hand: [[N], []] });
    tg.cast(N).resolveAll();
    expect(tg.find('Serra Angel')).not.toBeNull();
  });
});