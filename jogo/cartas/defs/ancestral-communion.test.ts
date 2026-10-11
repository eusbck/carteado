import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Ancestral Communion';

describe(N, () => {
  it('devolve a carta de permanente alvo do seu cemitério para a mão', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest'], []], hand: [[N], []], graveyard: [['Sol Ring', 'Diabolic Tutor'], []] });
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('carta de permanente alvo')) return null;
      expect(d.items.map((i) => i.label)).toEqual(['Sol Ring']);
      return { kind: 'select', ids: [d.items[0].id] };
    });
    tg.cast(N).resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Sol Ring']);
  });

  it('controlando o seu comandante, a mágica é copiada e a cópia pode ter outro alvo', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', { name: 'Elvish Mystic', commander: true }], []], hand: [[N], []], graveyard: [['Sol Ring', 'Silver Myr'], []] });
    tg.choose('carta de permanente alvo', ['Sol Ring']);
    tg.yes('novos alvos', true).choose('carta de permanente alvo', ['Silver Myr']);
    tg.cast(N).resolveAll();
    expect(tg.names(0, 'hand').sort()).toEqual(['Silver Myr', 'Sol Ring']);
  });
});