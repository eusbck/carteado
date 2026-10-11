import { describe, expect, it } from 'vitest';
import { counter } from '../../motor/api.ts';
import { enterCard, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Double Vision';
const ilhas = (n: number) => Array(n).fill('Island');

describe(N, () => {
  it('copia a primeira instantânea ou feitiço do turno, com ou sem alvos; a cópia resolve antes', () => {
    const tg = setup({ battlefield: [[N, ...ilhas(2)], []], hand: [['Preordain', 'Preordain'], []] });
    tg.cast('Preordain');
    expect(tg.state.zones.stack).toHaveLength(2);
    tg.resolve();
    // gatilho resolvido: a cópia está acima da original
    expect(tg.state.zones.stack).toHaveLength(2);
    tg.resolve();
    expect(tg.names(0, 'hand')).toEqual(['Preordain', 'Forest']);
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Preordain', 'Forest', 'Forest']);
  });

  it('a segunda instantânea ou feitiço do turno não é copiada, nem a primeira se já tinha sido conjurada antes de ela entrar', () => {
    const tg = setup({ battlefield: [[N, ...ilhas(2)], []], hand: [['Preordain', 'Preordain'], []] });
    tg.cast('Preordain').resolveAll();
    tg.cast('Preordain');
    expect(tg.state.zones.stack).toHaveLength(1);
    tg.resolveAll();
    // 2 da primeira (com a cópia) + 1 da segunda
    expect(tg.names(0, 'hand')).toHaveLength(3);

    const depois = setup({ battlefield: [ilhas(2), []], hand: [['Preordain', 'Preordain'], []] });
    depois.cast('Preordain').resolveAll();
    enterCard(depois, N, 0);
    depois.cast('Preordain');
    expect(depois.state.zones.stack).toHaveLength(1);
  });

  it('a cópia é criada mesmo que a mágica original seja anulada', () => {
    const tg = setup({ battlefield: [[N, ...ilhas(1)], []], hand: [['Preordain'], []] });
    tg.cast('Preordain');
    const original = tg.state.zones.stack[0];
    tg.run(counter(tg.g, original));
    tg.resolveAll();
    expect(tg.find('Preordain', 'graveyard', 0)).not.toBeNull();
    // só a cópia comprou
    expect(tg.names(0, 'hand')).toEqual(['Forest']);
  });

  it('mágica de criatura e mágica do oponente não são copiadas', () => {
    const tg = setup({ battlefield: [[N, 'Forest'], []], hand: [['Elvish Mystic'], []] });
    tg.cast('Elvish Mystic');
    expect(tg.state.zones.stack).toHaveLength(1);
    const dele = setup({ active: 1, battlefield: [[N], ilhas(1)], hand: [[], ['Preordain']] });
    dele.cast('Preordain');
    expect(dele.state.zones.stack).toHaveLength(1);
  });
});
