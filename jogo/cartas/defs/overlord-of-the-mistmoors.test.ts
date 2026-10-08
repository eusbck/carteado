import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { attackCandidates } from '../../motor/combat.ts';
import { chars, isCreature } from '../../motor/chars.ts';
import { copiableValues, createTokens } from '../../motor/api.ts';

const OVERLORD = 'Overlord of the Mistmoors';
const PLAINS = (n: number) => Array(n).fill('Plains');
const insetos = (tg: ReturnType<typeof setup>, p = 0) => tg.names(p, 'battlefield').filter((n) => n === 'Insect').length;

describe('Overlord of the Mistmoors', () => {
  it('iminente 4 — entra com quatro marcadores de tempo, não é criatura enquanto tiver um, e perde um no início da sua etapa final', () => {
    const tg = setup({ battlefield: [PLAINS(4), []], hand: [[OVERLORD], []], library: [PLAINS(5), PLAINS(5)] });
    tg.cast(OVERLORD, 'impending');
    // ruling 1: na pilha continua sendo mágica de criatura
    expect(chars(tg.g, tg.find(OVERLORD, 'stack')!).types).toContain('Creature');
    tg.resolve();
    tg.resolveAll();
    const id = tg.bf(OVERLORD);
    expect(tg.state.objects[id].counters.time).toBe(4);
    expect(isCreature(tg.g, id)).toBe(false);
    expect(chars(tg.g, id).types).toEqual(['Enchantment']);
    // entrar dispara mesmo sem ser criatura
    expect(insetos(tg)).toBe(2);
    tg.passTo('end');
    expect(tg.state.objects[id].counters.time).toBe(3);
    // só na etapa final do controlador
    tg.passTo('end', 1);
    expect(tg.state.objects[id].counters.time).toBe(3);
    // ao sair o último marcador, vira criatura 6/6
    tg.state.objects[id].counters.time = 1;
    tg.g.bump();
    tg.passTo('end', 0);
    expect(tg.state.objects[id].counters.time ?? 0).toBe(0);
    expect(isCreature(tg.g, id)).toBe(true);
    expect(tg.pt(id)).toEqual([6, 6]);
    expect(tg.state.gameOver).toBeNull();
  });

  it('enquanto tem marcador de tempo não pode atacar; conjurado pelo custo normal é criatura 6/6 sem marcadores', () => {
    const tg = setup({ battlefield: [[{ name: OVERLORD, counters: { time: 2 } }, ...PLAINS(7)], []], hand: [[OVERLORD], []] });
    const velho = tg.bf(OVERLORD);
    tg.state.objects[velho].data.spell = { method: 'impending' };
    tg.g.bump();
    expect(attackCandidates(tg.g, 0).some((c) => c.obj === velho)).toBe(false);
    tg.cast(OVERLORD).resolve();
    tg.resolveAll();
    const novo = tg.all(OVERLORD).find((x) => x !== velho)!;
    expect(tg.state.objects[novo].counters.time ?? 0).toBe(0);
    expect(isCreature(tg.g, novo)).toBe(true);
    expect(tg.pt(novo)).toEqual([6, 6]);
  });

  it('sempre que ataca, cria duas fichas Inseto 2/1 brancas com voar', () => {
    const tg = setup({ battlefield: [[OVERLORD], []] });
    tg.attack([[OVERLORD, 1]]).passTo('declareBlockers');
    expect(insetos(tg)).toBe(2);
    const ins = tg.bf('Insect');
    const c = chars(tg.g, ins);
    expect([c.power, c.toughness, c.colors]).toEqual([2, 1, ['W']]);
    expect(c.abilities.some((a) => a.kw === 'flying')).toBe(true);
  });

  it('pelo custo iminente continua sendo mágica de criatura e só se conjura quando se poderia conjurar a criatura', () => {
    const tg = setup({ battlefield: [PLAINS(4), []], hand: [[OVERLORD], []], step: 'beginCombat' });
    expect(tg.actionIds().some((a) => a.endsWith(':impending'))).toBe(false);
    tg.passTo('main2');
    expect(tg.actionIds().some((a) => a.endsWith(':impending'))).toBe(true);
  });

  it('conjurada pelo custo iminente, pode ser anulada', () => {
    const tg = setup({ battlefield: [PLAINS(4), ['Island', 'Island']], hand: [[OVERLORD], ['Counterspell']] });
    tg.cast(OVERLORD, 'impending').pass();
    tg.choose('mágica alvo', [OVERLORD]).cast('Counterspell').resolve();
    tg.resolveAll();
    expect(tg.find(OVERLORD)).toBeNull();
    expect(tg.names(0, 'graveyard')).toEqual([OVERLORD]);
    expect(insetos(tg)).toBe(0);
  });

  it('uma cópia do permanente entra sem marcadores de tempo e é criatura', () => {
    const tg = setup({ battlefield: [PLAINS(4), []], hand: [[OVERLORD], []] });
    tg.cast(OVERLORD, 'impending').resolve();
    tg.resolveAll();
    const id = tg.bf(OVERLORD);
    const [copia] = tg.run(createTokens(tg.g, 0, { copyOf: copiableValues(tg.g, id) }, 1));
    expect(tg.state.objects[copia].counters.time ?? 0).toBe(0);
    expect(isCreature(tg.g, copia)).toBe(true);
    // o original continua sem ser criatura
    expect(isCreature(tg.g, id)).toBe(false);
  });
});
