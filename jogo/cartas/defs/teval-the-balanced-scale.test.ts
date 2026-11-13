import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Teval, the Balanced Scale';
const zumbis = (tg: ReturnType<typeof setup>) => tg.state.zones.battlefield.filter((id) => tg.state.objects[id].def === 'Zombie Druid');

describe(N, () => {
  it('no ataque, mói três e devolve um terreno virado; a saída do cemitério cria um Zombie Druid', () => {
    const tg = setup({ battlefield: [[N], []], library: [['Forest', 'Hex', 'Island', 'Plains'], []] });
    tg.choose('Teval: devolver', ['Island']).attack([[N, 1]]).passTo('declareBlockers');
    tg.resolveAll();
    expect(tg.state.objects[tg.bf('Island')].tapped).toBe(true);
    expect(tg.names(0, 'graveyard').sort()).toEqual(['Forest', 'Hex']);
    expect(zumbis(tg).length).toBe(1);
    expect(tg.pt(zumbis(tg)[0])).toEqual([2, 2]);
  });
  it('várias cartas saindo juntas criam um Zombie Druid só', () => {
    const tg = setup({ battlefield: [[N, 'Forest', 'Forest'], []], hand: [['Life from the Loam'], []], graveyard: [['Island', 'Swamp', 'Plains'], []] });
    tg.choose('até três cartas de terreno', ['Island', 'Swamp', 'Plains']).cast('Life from the Loam').resolveAll();
    expect(zumbis(tg).length).toBe(1);
  });
  it('cartas do cemitério do oponente não disparam', () => {
    const tg = setup({ battlefield: [[N, 'Forest', 'Forest'], []], hand: [['Life from the Loam'], []], graveyard: [[], ['Island']] });
    tg.cast('Life from the Loam').resolveAll();
    expect(zumbis(tg).length).toBe(0);
  });
});
