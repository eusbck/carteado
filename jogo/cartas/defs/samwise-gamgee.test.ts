import { describe, expect, it } from 'vitest';
import { createTokens } from '../../motor/api.ts';
import { fixture as setup, runEffect } from '../../testes/artefatos.ts';

const N = 'Samwise Gamgee';

describe(N, () => {
  it('outra criatura sua que não é ficha entrando cria uma Food; ficha de criatura não', () => {
    const tg = setup({ battlefield: [[N, 'Forest'], []], hand: [['Elvish Mystic'], []] });
    tg.cast('Elvish Mystic').resolveAll();
    expect(tg.all('Food')).toHaveLength(1);
    runEffect(tg, createTokens(tg.g, 0, 'Soldier', 1));
    tg.resolveAll();
    expect(tg.all('Food')).toHaveLength(1);
  });

  it('sacrifique três Foods: devolve a carta histórica alvo do seu cemitério para a mão', () => {
    const food = { name: 'Food', token: true };
    const tg = setup({ battlefield: [[N, food, food, food], []], graveyard: [['Elvish Mystic', 'Sol Ring'], []] });
    tg.choose('carta histórica', ['Sol Ring']).activate(N).resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Sol Ring']);
    expect(tg.all('Food')).toHaveLength(0);
  });
});
