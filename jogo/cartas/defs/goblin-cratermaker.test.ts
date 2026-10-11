import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Goblin Cratermaker';

describe(N, () => {
  it('sacrificado: 2 de dano à criatura alvo', () => {
    const tg = setup({ battlefield: [[N, 'Mountain'], ['Elvish Mystic', 'Sol Ring']] });
    expect(tg.pt(tg.bf(N))).toEqual([2, 2]);
    tg.choose('modo', ['Esta criatura causa 2 de dano à criatura alvo']).choose('criatura alvo', ['Elvish Mystic']);
    tg.activate(N, 'Sacrifique esta criatura').resolveAll();
    expect(tg.find(N)).toBeNull();
    expect(tg.find('Elvish Mystic')).toBeNull();
    expect(tg.find('Sol Ring')).not.toBeNull();
  });

  it('sacrificado: destrói o permanente não terreno incolor alvo; o colorido não é alvo', () => {
    const tg = setup({ battlefield: [[N, 'Mountain'], ['Elvish Mystic', 'Sol Ring']] });
    tg.choose('modo', ['Destrua o permanente não terreno incolor alvo']).choose('permanente não terreno incolor alvo', ['Sol Ring']);
    tg.activate(N, 'Sacrifique esta criatura').resolveAll();
    expect(tg.find('Sol Ring')).toBeNull();
    const outro = setup({ battlefield: [[N, 'Mountain'], ['Elvish Mystic']] });
    outro.choose('modo', ['Destrua o permanente não terreno incolor alvo']).choose('permanente não terreno incolor alvo', ['Elvish Mystic']);
    expect(() => outro.activate(N, 'Sacrifique esta criatura')).toThrow();
  });
});
