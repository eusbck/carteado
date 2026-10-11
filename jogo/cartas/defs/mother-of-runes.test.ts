import { describe, expect, it } from 'vitest';
import { kwParams } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Mother of Runes';

describe(N, () => {
  it('{T}: a criatura alvo que você controla ganha proteção contra a cor escolhida até o fim do turno', () => {
    const tg = setup({ battlefield: [[N, 'Indomitable Ancients'], ['Silver Myr', 'Swamp', 'Swamp']], hand: [[], ['Infernal Grasp']] });
    expect(tg.pt(tg.bf(N))).toEqual([1, 1]);
    const a = tg.bf('Indomitable Ancients');
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('criatura alvo que você controla')) return null;
      expect(d.items.map((i) => i.label)).not.toContain('Silver Myr');
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Indomitable Ancients')!.id] };
    });
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('proteção contra qual cor') ? { kind: 'select', ids: ['B'] } : null));
    tg.activate(N).resolveAll();
    expect(kwParams(tg.g, a, 'protection')).toEqual(['color:B']);
    expect(tg.state.objects[tg.bf(N)].tapped).toBe(true);
    tg.passTo('upkeep', 1);
    expect(kwParams(tg.g, a, 'protection')).toEqual([]);
  });
});