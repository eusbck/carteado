import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Wakanda Forever!';

describe(N, () => {
  it('das seis do topo: uma permanente para o campo com marcador de indestrutível, uma para a mão e o resto para o cemitério', () => {
    const tg = setup({ battlefield: [Array(6).fill('Forest'), []], hand: [[N], []], library: [['Serra Angel', 'Sol Ring', 'Diabolic Tutor', 'Island', 'Silver Myr', 'Swamp', 'Mountain'], []] });
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('no campo com um marcador')) return null;
      // feitiço não é carta de permanente
      expect(d.items.find((i) => i.label === 'Diabolic Tutor')?.disabled).toBe(true);
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Serra Angel')!.id] };
    });
    tg.choose('na sua mão', ['Sol Ring']);
    tg.cast(N).resolveAll();
    const anjo = tg.bf('Serra Angel');
    expect(tg.state.objects[anjo].counters.indestructible).toBe(1);
    expect(hasKw(tg.g, anjo, 'indestructible')).toBe(true);
    expect(tg.names(0, 'hand')).toEqual(['Sol Ring']);
    expect(tg.names(0, 'graveyard').sort()).toEqual(['Diabolic Tutor', 'Island', 'Silver Myr', 'Swamp', N].sort());
    expect(tg.names(0, 'library')).toEqual(['Mountain']);
  });
});