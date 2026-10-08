import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Cultivate', () => {
  it('um terreno básico vai para o campo virado e o outro para a mão', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Forest'], []], hand: [['Cultivate'], []], library: [['Plains', 'Wall of Omens', 'Island'], []] });
    tg.choose('Procure até duas', ['Plains', 'Island']).choose('vai para o campo', ['Island']).cast('Cultivate').resolve();
    expect(tg.state.objects[tg.bf('Island')].tapped).toBe(true);
    expect(tg.names(0, 'hand')).toEqual(['Plains']);
  });
  it('com uma só carta encontrada, ela vai para o campo virada', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Forest'], []], hand: [['Cultivate'], []], library: [['Plains', 'Wall of Omens'], []] });
    tg.choose('Procure até duas', ['Plains']).cast('Cultivate').resolve();
    expect(tg.state.objects[tg.bf('Plains')].tapped).toBe(true);
    expect(tg.names(0, 'hand')).toEqual([]);
  });
});
