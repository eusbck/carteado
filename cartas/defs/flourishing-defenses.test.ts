import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { addCounters, createTokens } from '../../motor/api.ts';

describe('Flourishing Defenses', () => {
  it('dispara uma vez para cada marcador', () => {
    const tg = setup({ battlefield: [['Flourishing Defenses'], ['Indomitable Ancients']] });
    tg.yes('Elf Warrior', true);
    addCounters(tg.g, { kind: 'obj', id: tg.bf('Indomitable Ancients') }, '-1/-1', 2, 1);
    tg.refresh();
    expect(tg.state.zones.stack.length).toBe(2);
    tg.resolveAll();
    expect(tg.all('Elf Warrior').length).toBe(2);
  });
  it('CR 122.6: entrar com marcadores -1/-1 também conta', () => {
    const tg = setup({ battlefield: [['Flourishing Defenses'], []] });
    tg.yes('Elf Warrior', true);
    tg.run(createTokens(tg.g, 1, 'Treefolk', 1, { counters: { '-1/-1': 1 } }));
    tg.resolveAll();
    expect(tg.all('Elf Warrior').length).toBe(1);
  });
  it('marcadores +1/+1 não contam', () => {
    const tg = setup({ battlefield: [['Flourishing Defenses'], ['Indomitable Ancients']] });
    addCounters(tg.g, { kind: 'obj', id: tg.bf('Indomitable Ancients') }, '+1/+1', 2, 1);
    tg.refresh();
    expect(tg.state.zones.stack.length).toBe(0);
  });
});
