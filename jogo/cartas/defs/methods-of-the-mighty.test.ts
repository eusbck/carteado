import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Methods of the Mighty';

describe(N, () => {
  it('um ou mais modos: destrói um artefato, destrói uma criatura virada e põe um marcador +1/+1 em cada criatura sua', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains', 'Plains', 'Wall of Omens'], ['Sol Ring', { name: 'Serra Angel', tapped: true }, 'Elvish Mystic']], hand: [[N], []] });
    tg.choose('artefato alvo', ['Sol Ring']);
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('criatura virada alvo')) return null;
      expect(d.items.map((i) => i.label)).toEqual(['Serra Angel']);
      return { kind: 'select', ids: [d.items[0].id] };
    });
    tg.choose('escolha', ['Destrua o artefato alvo', 'Destrua a criatura virada alvo', 'Coloque um marcador +1/+1 em cada criatura que você controla']).cast(N).resolveAll();
    expect(tg.find('Sol Ring')).toBeNull();
    expect(tg.find('Serra Angel')).toBeNull();
    expect(tg.pt(tg.bf('Wall of Omens'))).toEqual([1, 5]);
    expect(tg.pt(tg.bf('Elvish Mystic'))).toEqual([1, 1]);
  });
});