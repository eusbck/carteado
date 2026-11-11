import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Cabal Ritual';

describe(NOME, () => {
  it('adiciona {B}{B}{B} sem limiar', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], []], hand: [[NOME], []], graveyard: [Array(6).fill('Island'), []] });
    tg.cast(NOME).resolve();
    expect(tg.state.players[0].manaPool.map((m) => m.type)).toEqual(['B', 'B', 'B']);
  });

  it('limiar: com sete ou mais cartas no cemitério adiciona {B}{B}{B}{B}{B}', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], []], hand: [[NOME], []], graveyard: [Array(7).fill('Island'), []] });
    tg.cast(NOME).resolve();
    expect(tg.state.players[0].manaPool.map((m) => m.type)).toEqual(['B', 'B', 'B', 'B', 'B']);
  });
});
