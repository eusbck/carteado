import { describe, expect, it } from 'vitest';
import { destroy } from '../../motor/api.ts';
import { enterCard, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Skyclave Shade';
const pantanos = (n: number) => Array(n).fill('Swamp');

describe(N, () => {
  it('reforçada, entra com dois marcadores +1/+1', () => {
    const tg = setup({ battlefield: [pantanos(5), []], hand: [[N], []] });
    tg.choose('custo adicional opcional', ['Pagar: kicker {2}{B}']).cast(N).resolveAll();
    const id = tg.bf(N);
    expect(tg.state.objects[id].counters['+1/+1']).toBe(2);
    expect(tg.pt(id)).toEqual([5, 3]);
    expect(tg.all('Swamp').every((s) => tg.state.objects[s].tapped)).toBe(true);
  });

  it('posta no campo sem ser conjurada, entra sem marcadores', () => {
    const tg = setup({ battlefield: [[], []] });
    const id = enterCard(tg, N, 0)!;
    expect(tg.state.objects[id].counters['+1/+1'] ?? 0).toBe(0);
    expect(tg.pt(id)).toEqual([3, 1]);
    const sem = setup({ battlefield: [pantanos(2), []], hand: [[N], []] });
    sem.choose('custo adicional opcional', ['Não pagar']).cast(N).resolveAll();
    expect(sem.pt(sem.bf(N))).toEqual([3, 1]);
  });

  it('no cemitério, um terreno seu entrando no seu turno permite conjurá-la do cemitério neste turno', () => {
    const tg = setup({ battlefield: [pantanos(2), []], hand: [['Swamp'], []], graveyard: [[N], []] });
    expect(tg.canCast(N)).toBe(false);
    tg.play('Swamp').resolveAll();
    expect(tg.canCast(N)).toBe(true);
    tg.choose('custo adicional opcional', ['Não pagar']).cast(N, '*').resolveAll();
    expect(tg.find(N)).not.toBeNull();
  });

  it('do cemitério também pode ser reforçada, pagando os custos', () => {
    const tg = setup({ battlefield: [pantanos(4), []], hand: [['Swamp'], []], graveyard: [[N], []] });
    tg.play('Swamp').resolveAll();
    tg.choose('custo adicional opcional', ['Pagar: kicker {2}{B}']).cast(N, '*').resolveAll();
    expect(tg.state.objects[tg.bf(N)].counters['+1/+1']).toBe(2);
    expect(tg.all('Swamp').filter((s) => tg.state.objects[s].tapped)).toHaveLength(5);
  });

  it('depois de conjurada do cemitério, a permissão não vale para ela de novo', () => {
    const tg = setup({ battlefield: [pantanos(5), []], hand: [['Swamp'], []], graveyard: [[N], []] });
    tg.play('Swamp').resolveAll();
    tg.choose('custo adicional opcional', ['Não pagar']).cast(N, '*').resolveAll();
    tg.run(destroy(tg.g, [tg.bf(N)]));
    expect(tg.find(N, 'graveyard', 0)).not.toBeNull();
    // há mana sobrando, mas a carta que voltou ao cemitério é um objeto novo
    expect(tg.canCast(N)).toBe(false);
  });

  it('no turno do oponente, ou com a carta fora do cemitério, a aterrissagem não dispara', () => {
    const tg = setup({ active: 1, battlefield: [pantanos(2), []], graveyard: [[N], []] });
    enterCard(tg, 'Swamp', 0);
    tg.resolveAll();
    tg.passTo('main1', 0);
    expect(tg.canCast(N)).toBe(false);
    // sem usar, a permissão acaba no fim do turno
    const fim = setup({ battlefield: [pantanos(2), []], hand: [['Swamp'], []], graveyard: [[N], []] });
    fim.play('Swamp').resolveAll();
    fim.passTo('main1', 1);
    fim.passTo('main1', 0);
    expect(fim.canCast(N)).toBe(false);
  });
});
