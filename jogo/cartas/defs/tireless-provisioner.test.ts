import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Tireless Provisioner';

describe(NOME, () => {
  it('um terreno seu entra: você escolhe Food ou Treasure', () => {
    const tg = setup({ battlefield: [[NOME], []], hand: [['Forest'], []] });
    tg.choose('Tireless Provisioner', ['Treasure']);
    tg.play('Forest').resolveAll();
    expect(tg.all('Treasure').length).toBe(1);
    expect(tg.all('Food').length).toBe(0);
  });
});
