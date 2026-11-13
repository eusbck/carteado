import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Reassembling Skeleton', () => {
  it('{1}{B}: volta do cemitério para o campo virada', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], []], graveyard: [['Reassembling Skeleton'], []] });
    tg.activate('Reassembling Skeleton').resolve();
    const id = tg.bf('Reassembling Skeleton');
    expect(tg.state.objects[id].tapped).toBe(true);
  });
});
