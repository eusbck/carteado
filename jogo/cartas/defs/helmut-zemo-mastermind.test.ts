import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Helmut Zemo, Mastermind';
const lib = Array(10).fill('Island');

describe(N, () => {
  it('ao atacar, conjura do cemitério uma instantânea ou feitiço de valor de mana até a força dele, pagando o custo; ela é exilada e ele ganha um marcador', () => {
    // Preordain ({U}, valor 1) cabe na força 2; Hex (valor 6) não é alvo
    const tg = setup({ battlefield: [[N, 'Island'], []], graveyard: [['Preordain', 'Hex'], []], library: [lib, lib] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([2, 2]);
    tg.choose('carta instantânea ou de feitiço alvo', ['Preordain']).yes('Helmut Zemo', true);
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.state.objects[id].counters['+1/+1']).toBe(1);
    expect(tg.names(0, 'exile')).toEqual(['Preordain']);
    expect(tg.names(0, 'graveyard')).toEqual(['Hex']);
    expect(tg.state.objects[tg.bf('Island')].tapped).toBe(true);
    // Preordain resolveu: comprou uma carta
    expect(tg.names(0, 'hand')).toHaveLength(1);
    expect(tg.life(1)).toBe(37);
  });

  it('é opcional: recusando, a carta fica no cemitério e ele não ganha marcador', () => {
    const tg = setup({ battlefield: [[N, 'Island'], []], graveyard: [['Preordain'], []], library: [lib, lib] });
    tg.choose('carta instantânea ou de feitiço alvo', ['Preordain']).yes('Helmut Zemo', false);
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.state.objects[tg.bf(N)].counters['+1/+1'] ?? 0).toBe(0);
    expect(tg.names(0, 'graveyard')).toEqual(['Preordain']);
  });
});
