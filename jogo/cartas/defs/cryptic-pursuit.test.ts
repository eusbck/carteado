import { describe, expect, it } from 'vitest';
import { destroy } from '../../motor/api.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Cryptic Pursuit';
const ilhas = (n: number) => Array(n).fill('Island');
const viradas = (tg: ReturnType<typeof setup>) => tg.state.zones.battlefield.filter((id) => tg.state.objects[id].faceDown);

describe(N, () => {
  it('conjurando uma instantânea ou feitiço da mão, manifesta o topo do grimório como uma criatura 2/2 virada para baixo', () => {
    const tg = setup({ battlefield: [[N, ...ilhas(2)], []], hand: [['Preordain', 'Elvish Mystic'], []], library: [['Maestros Charm', ...Array(10).fill('Forest')], Array(10).fill('Forest')] });
    tg.cast('Preordain');
    tg.resolve();
    // o gatilho resolveu antes da mágica: a carta do topo está no campo virada para baixo
    const [id] = viradas(tg);
    expect(id).toBeDefined();
    expect(tg.state.objects[id].def).toBe('Maestros Charm');
    expect(tg.pt(id)).toEqual([2, 2]);
    expect(tg.state.objects[id].controller).toBe(0);
    tg.resolveAll();
  });

  it('mágica de criatura, mágica conjurada de outra zona e mágica do oponente não manifestam', () => {
    const tg = setup({ battlefield: [[N, 'Forest', ...ilhas(2)], []], hand: [['Elvish Mystic'], []], graveyard: [['Sever the Bloodline'], []] });
    tg.cast('Elvish Mystic').resolveAll();
    expect(viradas(tg)).toHaveLength(0);
    const dele = setup({ active: 1, battlefield: [[N], ilhas(1)], hand: [[], ['Preordain']] });
    dele.cast('Preordain').resolveAll();
    expect(viradas(dele)).toHaveLength(0);
  });

  it('a criatura virada para baixo que morre é exilada se for instantânea ou feitiço, e pode ser conjurada até o fim do seu próximo turno', () => {
    const tg = setup({ battlefield: [[N, ...ilhas(5)], []], hand: [['Preordain'], []], library: [['Frantic Search', ...Array(10).fill('Forest')], Array(10).fill('Forest')] });
    tg.cast('Preordain').resolveAll();
    const [id] = viradas(tg);
    tg.run(destroy(tg.g, [id]));
    tg.resolveAll();
    expect(tg.find('Frantic Search', 'exile')).not.toBeNull();
    // ainda neste turno, ou no seu próximo, pagando o custo
    tg.passTo('main1', 1);
    tg.passTo('main1', 0);
    expect(tg.canCast('Frantic Search')).toBe(true);
    tg.passTo('main1', 1);
    tg.passTo('main1', 0);
    expect(tg.canCast('Frantic Search')).toBe(false);
  });

  it('se a carta virada para baixo que morre não é instantânea nem feitiço, fica no cemitério', () => {
    const tg = setup({ battlefield: [[N, ...ilhas(2)], []], hand: [['Preordain'], []], library: [['Sol Ring', ...Array(10).fill('Forest')], Array(10).fill('Forest')] });
    tg.cast('Preordain');
    tg.resolve();
    const [id] = viradas(tg);
    tg.run(destroy(tg.g, [id]));
    tg.resolveAll();
    expect(tg.find('Sol Ring', 'graveyard', 0)).not.toBeNull();
    expect(tg.find('Sol Ring', 'exile')).toBeNull();
  });
});
