import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Yennett, Cryptic Sovereign';
const ilhas = Array(6).fill('Island');

describe(N, () => {
  it('com valor de mana ímpar, você conjura a carta revelada de graça durante a resolução e não compra', () => {
    const tg = setup({ battlefield: [[N], []], library: [['Sol Ring', ...ilhas], ilhas] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([3, 5]);
    for (const kw of ['flying', 'vigilance', 'menace']) expect(hasKw(tg.g, id, kw)).toBe(true);
    tg.yes('Yennett', true);
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.find('Sol Ring', 'battlefield')).not.toBeNull();
    expect(tg.names(0, 'hand')).toEqual([]);
    expect(tg.names(0, 'library')).toHaveLength(6);
  });

  it('com valor de mana par, ou recusando, você compra a carta revelada', () => {
    // Silver Myr tem valor de mana 2: não há pergunta
    const par = setup({ battlefield: [[N], []], library: [['Silver Myr', ...ilhas], ilhas] });
    par.script.push((d) => { if (JSON.stringify(d).includes('Yennett: conjurar')) throw new Error('não devia perguntar'); return null; });
    par.attack([[N, 1]]).passTo('main2', 0);
    expect(par.names(0, 'hand')).toEqual(['Silver Myr']);
    // terreno tem valor de mana 0
    const terreno = setup({ battlefield: [[N], []], library: [ilhas, ilhas] });
    terreno.attack([[N, 1]]).passTo('main2', 0);
    expect(terreno.names(0, 'hand')).toEqual(['Island']);
    // ímpar, mas recusando
    const recusa = setup({ battlefield: [[N], []], library: [['Sol Ring', ...ilhas], ilhas] });
    recusa.yes('Yennett', false);
    recusa.attack([[N, 1]]).passTo('main2', 0);
    expect(recusa.names(0, 'hand')).toEqual(['Sol Ring']);
    expect(recusa.find('Sol Ring', 'battlefield')).toBeNull();
  });
});
