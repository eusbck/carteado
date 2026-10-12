import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Destroy Evil';

describe(N, () => {
  it('destrói uma criatura com resistência 4 ou mais', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains'], ['Serra Angel', 'Silver Myr']], hand: [[N], []] });
    tg.choose('escolha', ['Destrua a criatura alvo com resistência 4 ou mais']);
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('resistência 4 ou mais')) return null;
      expect(d.items.map((i) => i.label)).toEqual(['Serra Angel']);
      return { kind: 'select', ids: [d.items[0].id] };
    });
    tg.cast(N).resolveAll();
    expect(tg.find('Serra Angel')).toBeNull();
  });

  it('ou destrói um encantamento', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains'], ['High Score']], hand: [[N], []] });
    tg.choose('escolha', ['Destrua o encantamento alvo']).choose('encantamento alvo', ['High Score']).cast(N).resolveAll();
    expect(tg.find('High Score')).toBeNull();
  });
});