import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { destroy } from '../../motor/api.ts';

describe('Skirsdag High Priest', () => {
  it('só depois que uma criatura morreu; as outras duas podem ter acabado de entrar', () => {
    const tg = setup({
      battlefield: [[{ name: 'Skirsdag High Priest', ready: true }, { name: 'Wall of Omens', ready: false }, { name: 'Elvish Mystic', ready: false }], ['Gau, Feral Youth']],
      library: [['Island'], ['Island']],
    });
    const acao = () => tg.actionIds().some((a) => a.startsWith(`act:${tg.bf('Skirsdag High Priest')}:`));
    expect(acao()).toBe(false);
    tg.run(destroy(tg.g, [tg.bf('Gau, Feral Youth')]));
    tg.refresh();
    expect(acao()).toBe(true);
    tg.activate('Skirsdag High Priest').resolve();
    expect(tg.all('Demon').length).toBe(1);
    expect(tg.state.objects[tg.bf('Wall of Omens')].tapped).toBe(true);
  });
});
