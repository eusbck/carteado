import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { chars } from '../../motor/chars.ts';
import { dealDamage } from '../../motor/api.ts';

const NOME = 'Wight of Precinct Six';

describe(NOME, () => {
  it('+1/+1 por carta de criatura nos cemitérios dos oponentes; o seu cemitério e cartas não criatura não contam', () => {
    const tg = setup({
      players: 3,
      battlefield: [[NOME], [], []],
      graveyard: [['Viscera Seer'], ['Hateful Eidolon', 'Sign in Blood'], ['Blight Pile', 'Wall of Limbs']],
    });
    expect(tg.pt(tg.bf(NOME))).toEqual([4, 4]);
  });

  it('fora do campo é 1/1', () => {
    const tg = setup({ hand: [[NOME], []], graveyard: [[], ['Hateful Eidolon', 'Blight Pile']] });
    const c = chars(tg.g, tg.find(NOME, 'hand')!);
    expect([c.power, c.toughness]).toEqual([1, 1]);
  });

  it('CR 704.3: morre junto com a criatura do oponente, sem crescer a tempo', () => {
    const tg = setup({ battlefield: [[NOME, 'Blight Pile'], ['Viscera Seer']], graveyard: [[], ['Hateful Eidolon']] });
    expect(tg.pt(tg.bf(NOME))).toEqual([2, 2]);
    dealDamage(tg.g, [
      { source: tg.bf('Blight Pile'), target: { kind: 'obj', id: tg.bf(NOME) }, amount: 2, combat: false },
      { source: tg.bf('Blight Pile'), target: { kind: 'obj', id: tg.bf('Viscera Seer') }, amount: 1, combat: false },
    ]);
    tg.refresh(); // ações de estado na próxima prioridade
    expect(tg.find(NOME)).toBeNull();
    expect(tg.find('Viscera Seer')).toBeNull();
    expect(tg.names(0, 'graveyard')).toEqual([NOME]);
  });
});
