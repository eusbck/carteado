import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Dread Tiller', () => {
  it('ao entrar, -1/-1; criatura com -1/-1 morre: terreno da mão ou do cemitério no campo virado', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Forest'], ['Elvish Mystic']], hand: [['Dread Tiller'], []], graveyard: [['Plains'], []] });
    tg.choose('criatura alvo', ['Elvish Mystic']).choose('terreno da mão ou do cemitério', ['Plains (cemitério)']);
    tg.cast('Dread Tiller').resolve().resolveAll();
    expect(tg.find('Elvish Mystic')).toBeNull();
    expect(tg.state.objects[tg.bf('Plains')].tapped).toBe(true);
  });
});
