import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Mirrorpool";

describe(C, () => {
  it('cria uma ficha cópia de uma criatura sua', () => {
    const tg = setup({ battlefield: [[C, 'Sol Ring', 'Forest', 'Forest', 'Forest', 'Memnite'], []] });
    tg.choose('criatura alvo', ['Memnite']).activate(C, 'Crie').resolve();
    expect(tg.all('Memnite').length).toBe(2);
  });
});
