import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Hour of Reckoning';

describe(N, () => {
  it('destrói todas as criaturas que não são fichas', () => {
    const tg = setup({ battlefield: [[...Array(7).fill('Plains'), 'Silver Myr', { name: 'Horse', token: true }], ['Indomitable Ancients', { name: 'Pegasus 1/1', token: true }]], hand: [[N], []] });
    tg.cast(N).resolveAll();
    expect(tg.find('Silver Myr')).toBeNull();
    expect(tg.find('Indomitable Ancients')).toBeNull();
    expect(tg.find('Horse')).not.toBeNull();
    expect(tg.find('Pegasus')).not.toBeNull();
  });

  it('convocar: as suas criaturas ajudam a pagar', () => {
    // quatro Plains e três criaturas brancas pagam {4}{W}{W}{W}
    const tg = setup({ battlefield: [[...Array(4).fill('Plains'), { name: 'Pegasus 1/1', token: true }, { name: 'Pegasus 1/1', token: true }, { name: 'Horse', token: true }], ['Indomitable Ancients']], hand: [[N], []] });
    expect(tg.canCast(N)).toBe(true);
    const sem = setup({ battlefield: [Array(4).fill('Plains'), ['Indomitable Ancients']], hand: [[N], []] });
    expect(sem.canCast(N)).toBe(false);
  });
});