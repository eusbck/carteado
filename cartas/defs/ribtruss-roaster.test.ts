import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { destroy } from '../../motor/api.ts';

describe('Ribtruss Roaster', () => {
  it('devora e cria Pests pelos marcadores; fora do campo, usa os marcadores da última vez', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Forest', 'Forest', 'Forest', 'Elvish Mystic', 'Wall of Omens'], []], hand: [['Ribtruss Roaster'], []], library: [['Island', 'Island'], ['Island']] });
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('Devorar 1') ? { kind: 'select', ids: d.items.map((i) => i.id) } : null));
    tg.cast('Ribtruss Roaster').resolve();
    const r = tg.bf('Ribtruss Roaster');
    expect(tg.state.objects[r].counters['+1/+1']).toBe(2);
    tg.passTo('end');
    tg.run(destroy(tg.g, [r]));
    tg.resolveAll();
    expect(tg.all('Pest').length).toBe(2);
  });
});
