import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Chatterstorm';

describe(NOME, () => {
  it('depois de duas mágicas no turno (uma de cada jogador), cria três Squirrels; as cópias não contam para a próxima tempestade', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Forest', 'Forest', 'Mountain'], ['Mountain']], hand: [[NOME, NOME, 'Lightning Bolt'], ['Lightning Bolt']], library: [['Island'], ['Island']] });
    // 1ª mágica: Ana
    tg.choose('qualquer alvo', ['Bruno']).cast('Lightning Bolt');
    // 2ª mágica: Bruno, em resposta
    tg.pass();
    tg.choose('qualquer alvo', ['Ana']).cast('Lightning Bolt');
    tg.resolveAll();
    tg.cast(NOME).resolveAll();
    expect(tg.all('Squirrel').length).toBe(3);
    // 4ª mágica conjurada: três cópias
    tg.cast(NOME).resolveAll();
    expect(tg.all('Squirrel').length).toBe(7);
  });
});
