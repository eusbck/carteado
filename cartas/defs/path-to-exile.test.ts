import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Path to Exile', () => {
  it('exila e o controlador da criatura busca um básico virado', () => {
    const tg = setup({ battlefield: [['Plains'], ['Indomitable Ancients']], hand: [['Path to Exile'], []], library: [[], ['Forest', 'Sol Ring']] });
    tg.yes('Procurar um terreno básico', true).choose('terreno básico', ['Forest']);
    tg.choose('criatura alvo', ['Indomitable Ancients']).cast('Path to Exile').resolve();
    expect(tg.names(1, 'exile')).toEqual(['Indomitable Ancients']);
    expect(tg.state.objects[tg.bf('Forest', 1)].tapped).toBe(true);
  });

  it('o controlador pode não procurar (e então não embaralha)', () => {
    const tg = setup({ battlefield: [['Plains'], ['Indomitable Ancients']], hand: [['Path to Exile'], []], library: [[], ['Sol Ring', 'Forest']] });
    tg.yes('Procurar um terreno básico', false);
    tg.choose('criatura alvo', ['Indomitable Ancients']).cast('Path to Exile').resolve();
    expect(tg.names(1, 'library')).toEqual(['Sol Ring', 'Forest']);
  });
});
