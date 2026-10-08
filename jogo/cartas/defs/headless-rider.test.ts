import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { destroy } from '../../motor/api.ts';

describe('Headless Rider', () => {
  it('quando ela morre, cria um Zombie 2/2', () => {
    const tg = setup({ battlefield: [['Headless Rider'], []] });
    tg.run(destroy(tg.g, [tg.bf('Headless Rider')]));
    tg.resolveAll();
    expect(tg.all('Zombie 2/2').length).toBe(1);
  });
  it('outro Zombie não ficha seu morre: cria; ficha Zombie, não Zombie e Zombie de oponente não', () => {
    const tg = setup({
      battlefield: [['Headless Rider', 'Midnight Reaper', { name: 'Zombie 2/2', token: true }, 'Wall of Omens'], ["Stitcher's Supplier"]],
      library: [['Island', 'Plains', 'Forest'], ['Island', 'Island', 'Island']],
    });
    tg.run(destroy(tg.g, [tg.bf('Midnight Reaper'), tg.bf('Zombie 2/2'), tg.bf('Wall of Omens'), tg.bf("Stitcher's Supplier")]));
    tg.resolveAll();
    const minhas = tg.state.zones.battlefield.filter((id) => tg.state.objects[id].def === 'Zombie 2/2' && tg.state.objects[id].controller === 0);
    expect(minhas.length).toBe(1);
    expect(tg.all('Zombie 2/2').length).toBe(1);
  });
  it('CR 603.10a: morrendo junto com outro Zombie não ficha, dispara pelos dois', () => {
    const tg = setup({ battlefield: [['Headless Rider', 'Undead Augur'], []], library: [['Island', 'Plains', 'Forest'], []] });
    tg.run(destroy(tg.g, [tg.bf('Headless Rider'), tg.bf('Undead Augur')]));
    tg.resolveAll();
    expect(tg.all('Zombie 2/2').length).toBe(2);
  });
});
