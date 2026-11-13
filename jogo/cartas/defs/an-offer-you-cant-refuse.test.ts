import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = "An Offer You Can't Refuse";

describe(NOME, () => {
  it('anula a mágica que não é de criatura e quem a controla cria dois Tesouros', () => {
    const tg = setup({ battlefield: [['Island'], ['Swamp']], hand: [[NOME], ['Dark Ritual']], active: 1 });
    tg.cast('Dark Ritual');
    tg.pass();
    tg.choose('mágica alvo', ['Dark Ritual']).cast(NOME).resolve();
    expect(tg.names(1, 'graveyard')).toEqual(['Dark Ritual']);
    expect(tg.names(1, 'battlefield').filter((n) => n === 'Treasure')).toHaveLength(2);
    expect(tg.names(0, 'battlefield').filter((n) => n === 'Treasure')).toHaveLength(0);
  });
});
