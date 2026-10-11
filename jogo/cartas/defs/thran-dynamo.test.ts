import { describe, expect, it } from 'vitest';
import { activateMana, fixture as setup } from '../../testes/artefatos.ts';

describe('Thran Dynamo', () => {
  it('{T}: adiciona {C}{C}{C}', () => {
    const tg = setup({ battlefield: [['Thran Dynamo'], []] });
    activateMana(tg, 'Thran Dynamo', 'C');
    expect(tg.state.players[0].manaPool.map((u) => u.type)).toEqual(['C', 'C', 'C']);
  });
});