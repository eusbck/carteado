import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Academy Ruins', () => {
  it('põe um artefato do cemitério no topo do grimório', () => {
    const tg = setup({ battlefield: [['Academy Ruins', 'Island', 'Island'], []], graveyard: [['Sol Ring'], []], library: [['Opt'], []] });
    tg.choose('carta de artefato', ['Sol Ring']).activate('Academy Ruins', '{1}{U}').resolve();
    const lib = tg.state.zones.library[0];
    expect(tg.state.objects[lib[lib.length - 1]].def === 'Sol Ring' || tg.state.objects[lib[0]].def === 'Sol Ring').toBe(true);
  });
});
