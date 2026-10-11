import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Wrecking Ball';
const terrenos = ['Swamp', 'Swamp', 'Mountain', 'Mountain'];

describe(N, () => {
  it('destrói a criatura ou o terreno alvo; artefato não é alvo', () => {
    const tg = setup({ battlefield: [terrenos, ['Indomitable Ancients', 'Island', 'Sol Ring']], hand: [[N, N], []] });
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('criatura ou terreno alvo')) return null;
      expect(d.items.map((i) => i.label)).not.toContain('Sol Ring');
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Island')!.id] };
    });
    tg.cast(N).resolveAll();
    expect(tg.find('Island', 'battlefield', 1)).toBeNull();
    const criatura = setup({ battlefield: [terrenos, ['Indomitable Ancients']], hand: [[N], []] });
    criatura.choose('criatura ou terreno alvo', ['Indomitable Ancients']).cast(N).resolveAll();
    expect(criatura.find('Indomitable Ancients')).toBeNull();
  });
});