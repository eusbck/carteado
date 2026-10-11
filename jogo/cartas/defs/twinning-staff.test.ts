import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Twinning Staff';
const ilhas = (n: number) => Array(n).fill('Island');

describe(N, () => {
  it('copiando uma mágica, você a copia mais uma vez', () => {
    // Double Vision copia o primeiro Preordain; com o Twinning Staff são duas cópias: três compras no total
    const tg = setup({ battlefield: [[N, 'Double Vision', ...ilhas(1)], []], hand: [['Preordain'], []] });
    tg.cast('Preordain');
    tg.resolve();
    // a original e as duas cópias na pilha
    expect(tg.state.zones.stack).toHaveLength(3);
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toHaveLength(3);
  });

  it('com dois Twinning Staff, duas cópias adicionais', () => {
    const tg = setup({ battlefield: [[N, N, 'Double Vision', ...ilhas(1)], []], hand: [['Preordain'], []] });
    tg.cast('Preordain').resolveAll();
    expect(tg.names(0, 'hand')).toHaveLength(4);
  });

  it('{7}, {T}: copia uma mágica sua na pilha, com ou sem alvos, e a cópia resolve antes', () => {
    const tg = setup({ battlefield: [[N, ...ilhas(8)], []], hand: [['Preordain'], []] });
    tg.cast('Preordain');
    tg.choose('que você controla', ['Preordain']).activate(N);
    tg.resolve();
    // a habilidade copiou uma vez e o próprio Twinning Staff acrescentou outra
    expect(tg.state.zones.stack).toHaveLength(3);
    tg.resolve();
    expect(tg.names(0, 'hand')).toHaveLength(1);
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toHaveLength(3);
    expect(tg.state.objects[tg.bf(N)].tapped).toBe(true);
  });

  it('não vale para as cópias do oponente, e ele não pode ter as mágicas dele copiadas pela sua habilidade', () => {
    const tg = setup({ active: 1, battlefield: [[N, ...ilhas(7)], ['Double Vision', 'Island']], hand: [[], ['Preordain']] });
    tg.cast('Preordain');
    tg.resolve();
    // só a cópia do Double Vision dele
    expect(tg.state.zones.stack).toHaveLength(2);
    tg.pass();
    expect(tg.pending?.player).toBe(0);
    expect(tg.actionIds().some((a) => a.startsWith('act:'))).toBe(false);
  });
});
