import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Royal Warden';

describe(N, () => {
  it('ao entrar cria dois Necron Warriors 2/2 virados; desenterrada, cria de novo', () => {
    const tg = setup({ battlefield: [Array(9).fill('Swamp'), []], hand: [[N], []], graveyard: [[N], []] });
    tg.cast(N).resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([3, 2]);
    expect(tg.all('Necron Warrior')).toHaveLength(2);
    for (const id of tg.all('Necron Warrior')) expect(tg.state.objects[id].tapped).toBe(true);
    tg.activate(N, 'Desenterrar').resolveAll();
    expect(tg.all('Necron Warrior')).toHaveLength(4);
  });
});