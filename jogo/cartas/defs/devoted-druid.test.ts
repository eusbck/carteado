import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Devoted Druid', () => {
  it('o marcador é custo; com resistência 0 morre antes de desvirar', () => {
    const tg = setup({ battlefield: [[{ name: 'Devoted Druid', tapped: true }], []] });
    tg.activate('Devoted Druid', 'Desvire').resolve();
    expect(tg.state.objects[tg.bf('Devoted Druid')].tapped).toBe(false);
    tg.state.objects[tg.bf('Devoted Druid')].tapped = true;
    tg.refresh();
    tg.activate('Devoted Druid', 'Desvire');
    // 0/0 com dois marcadores: morre pelas ações de estado antes de a habilidade resolver
    expect(tg.find('Devoted Druid')).toBeNull();
  });
});
