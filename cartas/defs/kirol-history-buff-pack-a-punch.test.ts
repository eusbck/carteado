import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { hasKw } from '../../motor/chars.ts';
import { exile } from '../../motor/api.ts';

describe('Kirol, History Buff // Pack a Punch', () => {
  it('várias cartas saindo juntas preparam uma vez; Pack a Punch dá dois marcadores e atropelar', () => {
    const tg = setup({ battlefield: [['Kirol, History Buff // Pack a Punch', 'Mountain', 'Mountain', 'Plains'], []], graveyard: [['Island', 'Island'], []], library: [['Plains'], ['Island']] });
    tg.run(exile(tg.g, [...tg.state.zones.graveyard[0]]));
    tg.resolveAll();
    const k = tg.bf('Kirol, History Buff');
    expect(tg.state.objects[k].prepared).toBe(true);
    expect(tg.state.zones.exile.filter((id) => tg.state.objects[id].isCopy).length).toBe(1);
    tg.choose('criatura alvo', ['Kirol, History Buff']);
    tg.cast('Pack a Punch', 'prepared').resolve();
    expect(tg.pt(k)).toEqual([4, 5]);
    expect(hasKw(tg.g, k, 'trample')).toBe(true);
    expect(tg.names(0, 'graveyard')).toEqual(['Plains']);
  });
});
