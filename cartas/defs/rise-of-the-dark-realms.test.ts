import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { controllerOf } from '../../motor/api.ts';

describe('Rise of the Dark Realms', () => {
  it('todas as criaturas de todos os cemitérios vêm para você', () => {
    const tg = setup({ battlefield: [[...Array(9).fill('Swamp')], []], hand: [['Rise of the Dark Realms'], []], graveyard: [['Elvish Mystic', 'Island'], ['Glissa Sunslayer']] });
    tg.cast('Rise of the Dark Realms').resolve();
    expect(controllerOf(tg.g, tg.bf('Elvish Mystic'))).toBe(0);
    expect(controllerOf(tg.g, tg.bf('Glissa Sunslayer'))).toBe(0);
    expect(tg.names(0, 'graveyard').sort()).toEqual(['Island', 'Rise of the Dark Realms']);
  });
});
