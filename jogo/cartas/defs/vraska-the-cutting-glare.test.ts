import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Vraska, the Cutting Glare";

describe(C, () => {
  it('com seis terrenos destrói um permanente do oponente, que cria Treasure', () => {
    const tg = setup({ battlefield: [[...Array(4).fill('Swamp'), 'Forest', 'Forest'], ['Sol Ring']], hand: [[C], []] });
    tg.choose('permanente alvo', ['Sol Ring']).cast(C).resolve().resolveAll();
    expect(tg.find('Sol Ring')).toBeNull();
    expect(tg.all('Treasure').length).toBe(1);
  });
});
