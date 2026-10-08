import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Abrade', () => {
  it('modo 1: 3 de dano à criatura alvo', () => {
    const tg = setup({ battlefield: [['Mountain', 'Mountain'], ['Wall of Omens']], hand: [['Abrade'], []] });
    tg.choose('modo', ['Causa 3 de dano à criatura alvo']).choose('criatura alvo', ['Wall of Omens']).cast('Abrade').resolve();
    expect(tg.state.objects[tg.bf('Wall of Omens')].damage).toBe(3);
  });
  it('modo 2: destrói o artefato alvo', () => {
    const tg = setup({ battlefield: [['Mountain', 'Mountain'], ['Sol Ring']], hand: [['Abrade'], []] });
    tg.choose('modo', ['Destrua o artefato alvo']).choose('artefato alvo', ['Sol Ring']).cast('Abrade').resolve();
    expect(tg.find('Sol Ring')).toBeNull();
  });
  it('CR 700.2a: modo sem alvo possível não pode ser escolhido', () => {
    const tg = setup({ battlefield: [['Mountain', 'Mountain'], ['Wall of Omens']], hand: [['Abrade'], []] });
    let disabled: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('modo')) return null;
      disabled = d.items.filter((i) => i.disabled).map((i) => i.label);
      return { kind: 'select', ids: ['0'] };
    });
    tg.cast('Abrade');
    expect(disabled).toEqual(['Destrua o artefato alvo']);
  });
});
