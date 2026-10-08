import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Wall of Reverence', () => {
  it('força modificada até o fim do turno ainda vale na etapa final', () => {
    const tg = setup({ battlefield: [['Wall of Reverence', 'Dina, Soul Steeper', 'Indomitable Ancients', 'Plains'], []] });
    tg.choose('Sacrifique', ['Indomitable Ancients']).activate('Dina, Soul Steeper').resolve(); // +2/+0
    tg.choose('criatura alvo que você controla', ['Dina, Soul Steeper']).yes('Wall of Reverence', true);
    tg.passTo('end').resolve();
    expect(tg.life(0)).toBe(43);
  });
});
