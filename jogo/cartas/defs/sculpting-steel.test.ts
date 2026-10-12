import { describe, expect, it } from 'vitest';
import { nameOf } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Sculpting Steel';

describe(N, () => {
  it('pode entrar como cópia de qualquer artefato no campo, ou sem copiar nada', () => {
    const tg = setup({ battlefield: [Array(6).fill('Forest'), ['Silver Myr', 'Elvish Mystic']], hand: [[N, N], []] });
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('Sculpting Steel')) return null;
      expect(d.items.map((i) => i.label)).not.toContain('Elvish Mystic');
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Silver Myr')!.id] };
    });
    tg.cast(N).resolveAll();
    const copia = tg.all('Silver Myr').find((id) => tg.state.objects[id].controller === 0)!;
    expect(tg.pt(copia)).toEqual([1, 1]);
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('Sculpting Steel') ? { kind: 'select', ids: [d.items.find((i) => i.label === 'Não copiar')!.id] } : null));
    tg.cast(N).resolveAll();
    const meus = tg.state.zones.battlefield.filter((id) => tg.state.objects[id].def === N);
    expect(meus.map((id) => nameOf(tg.g, id)).sort()).toEqual([N, 'Silver Myr']);
  });
});