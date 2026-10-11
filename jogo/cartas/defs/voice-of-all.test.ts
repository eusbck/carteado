import { describe, expect, it } from 'vitest';
import { hasKw, kwParams } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Voice of All';

describe(N, () => {
  it('voar; ao entrar, escolhe uma cor e tem proteção contra ela', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains', 'Plains'], ['Swamp', 'Swamp']], hand: [[N], ['Infernal Grasp']] });
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('Voice of All: escolha uma cor') ? { kind: 'select', ids: ['B'] } : null));
    tg.cast(N).resolveAll();
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([2, 2]);
    expect(hasKw(tg.g, id, 'flying')).toBe(true);
    expect(kwParams(tg.g, id, 'protection')).toEqual(['color:B']);
    // a mágica preta do oponente não pode mirá-la
    tg.passTo('main1', 1);
    expect(tg.canCast('Infernal Grasp')).toBe(false);
  });
});