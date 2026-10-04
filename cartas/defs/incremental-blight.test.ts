import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Incremental Blight', () => {
  it('põe 1, 2 e 3 marcadores -1/-1 em três criaturas diferentes', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp', 'Swamp'], ['Indomitable Ancients', 'Wall of Omens', 'Zetalpa, Primal Dawn']], hand: [['Incremental Blight'], []] });
    tg.choose('(1 marcador)', ['Indomitable Ancients']).choose('(2 marcadores)', ['Wall of Omens']).choose('(3 marcadores)', ['Zetalpa, Primal Dawn']);
    tg.cast('Incremental Blight').resolve();
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].counters['-1/-1']).toBe(1);
    expect(tg.state.objects[tg.bf('Wall of Omens')].counters['-1/-1']).toBe(2);
    expect(tg.state.objects[tg.bf('Zetalpa, Primal Dawn')].counters['-1/-1']).toBe(3);
  });
  it('CR 115.3: precisa de três criaturas diferentes para ser conjurada', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp', 'Swamp'], ['Indomitable Ancients', 'Wall of Omens']], hand: [['Incremental Blight'], []] });
    expect(tg.canCast('Incremental Blight')).toBe(false);
  });
});
