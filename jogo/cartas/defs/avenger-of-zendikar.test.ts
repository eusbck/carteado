import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Avenger of Zendikar';
const plantas = (tg: ReturnType<typeof setup>) => tg.state.zones.battlefield.filter((id) => tg.state.objects[id].def === 'Plant 0/1');

describe(N, () => {
  it('ao entrar, cria uma Plant 0/1 para cada terreno que você controla', () => {
    const tg = setup({ battlefield: [Array<string>(7).fill('Forest'), ['Forest']], hand: [[N], []] });
    tg.cast(N).resolveAll();
    expect(plantas(tg).length).toBe(7);
    expect(tg.pt(plantas(tg)[0])).toEqual([0, 1]);
  });
  it('com um terreno entrando, cada Planta sua ganha um marcador +1/+1', () => {
    const tg = setup({ battlefield: [[N, { name: 'Plant 0/1', token: true }, { name: 'Plant 0/1', token: true }, 'Wall of Omens'], [{ name: 'Plant 0/1', token: true }]], hand: [['Forest'], []] });
    tg.yes('Avenger', true).play('Forest').resolveAll();
    const minhas = plantas(tg).filter((id) => tg.state.objects[id].controller === 0);
    expect(minhas.map((id) => tg.pt(id))).toEqual([[1, 2], [1, 2]]);
    const deBruno = plantas(tg).find((id) => tg.state.objects[id].controller === 1)!;
    expect(tg.pt(deBruno)).toEqual([0, 1]);
    expect(tg.pt(tg.bf('Wall of Omens'))).toEqual([0, 4]);
  });
});
