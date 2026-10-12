import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Director Nick Fury';

describe(N, () => {
  it('as mágicas de Hero custam {1} a menos; atacando, olha quatro cartas, pega um Hero e põe o resto no fundo', () => {
    const tg = setup({ battlefield: [[N, 'Plains'], []], hand: [['Patriot, Shield Wielder', 'Bastion Protector'], []], library: [['Island', 'Patriot, Shield Wielder', 'Island', 'Island', 'Swamp'], ['Island']] });
    expect(tg.canCast('Patriot, Shield Wielder')).toBe(true);
    expect(tg.canCast('Bastion Protector')).toBe(false);
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('Director Nick Fury')) return null;
      expect(d.items).toHaveLength(4);
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Patriot, Shield Wielder')!.id] };
    });
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.names(0, 'hand').filter((n) => n === 'Patriot, Shield Wielder')).toHaveLength(2);
    expect(tg.names(0, 'library')[0]).toBe('Swamp');
    expect(tg.names(0, 'library')).toHaveLength(4);
  });
});