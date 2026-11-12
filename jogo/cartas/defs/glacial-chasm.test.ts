import { describe, expect, it } from 'vitest';
import { dealDamage } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Glacial Chasm';

describe(N, () => {
  it('ao entrar, sacrifica um terreno; previne o dano a você; suas criaturas não atacam', () => {
    const tg = setup({ battlefield: [['Swamp', 'Indomitable Ancients'], ['Tunneling Geopede']], hand: [[N], []] });
    tg.choose('Sacrifique', ['Swamp']).play(N).resolve();
    expect(tg.find('Swamp')).toBeNull();
    expect(tg.find(N)).not.toBeNull();
    dealDamage(tg.g, [{ source: tg.bf('Tunneling Geopede'), target: { kind: 'player', id: 0 }, amount: 3, combat: false }]);
    expect(tg.life(0)).toBe(40);
    tg.passTo('declareAttackers');
    expect(tg.state.combat?.attackers.length ?? 0).toBe(0);
  });
  it('sem outro terreno, sacrifica a si mesmo', () => {
    const tg = setup({ hand: [[N], []] });
    tg.play(N).resolve();
    expect(tg.find(N)).toBeNull();
  });
  it('CR 702.24a: manutenção cumulativa pagando 2 de vida por marcador de idade', () => {
    const tg = setup({ battlefield: [[{ name: N, counters: { age: 1 } }], []], step: 'untap', life: 40 });
    tg.yes('Pagar 4 de vida', true).passTo('upkeep');
    tg.resolve();
    expect(tg.life(0)).toBe(36);
    expect(tg.state.objects[tg.bf(N)].counters.age).toBe(2);
  });
  it('sem pagar, é sacrificado', () => {
    const tg = setup({ battlefield: [[N], []], step: 'untap' });
    tg.yes('Pagar 2 de vida', false).passTo('upkeep');
    tg.resolve();
    expect(tg.find(N)).toBeNull();
  });
});
