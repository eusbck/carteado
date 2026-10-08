import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { hasKw } from '../../motor/chars.ts';
import { moveObjects } from '../../motor/api.ts';

describe('Hardened Academic', () => {
  it('várias cartas ao mesmo tempo disparam uma vez só; descartar dá vínculo com a vida', () => {
    const tg = setup({ battlefield: [['Hardened Academic'], []], hand: [['Plains'], []], graveyard: [['Island', 'Swamp'], []] });
    const gy = [...tg.state.zones.graveyard[0]];
    tg.choose('criatura alvo que você controla', ['Hardened Academic']);
    tg.run(moveObjects(tg.g, gy.map((id) => ({ id, to: 'exile' as const })), 'effect'));
    tg.resolveAll();
    const h = tg.bf('Hardened Academic');
    expect(tg.state.objects[h].counters['+1/+1']).toBe(1);
    tg.choose('escarte', ['Plains']).activate('Hardened Academic').resolve();
    expect(hasKw(tg.g, h, 'lifelink')).toBe(true);
  });
});
