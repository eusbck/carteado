import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = "N'Yami-Class Mother Ship";
const mesa = (topo: string) => setup({ battlefield: [[N, 'Serra Angel'], []], library: [[topo, 'Island', 'Island'], ['Forest']] });
function ataca(tg: ReturnType<typeof setup>): void {
  tg.choose('Tripular:', ['Serra Angel']).choose('Tripular:', ['done']).activate(N, 'Tripular').resolveAll();
  tg.attack([[N, 1]]).passTo('main2', 0);
}

describe(N, () => {
  it('causando dano de combate, põe no campo a permanente do topo do grimório, se você quiser', () => {
    const tg = mesa('Sol Ring');
    tg.yes("N'Yami-Class Mother Ship", true);
    ataca(tg);
    expect(tg.life(1)).toBe(35);
    expect(tg.find('Sol Ring')).not.toBeNull();
    expect(tg.names(0, 'hand')).toEqual([]);
  });

  it('recusando, ou não sendo carta de permanente, a carta vai para a mão', () => {
    const recusa = mesa('Sol Ring');
    recusa.yes("N'Yami-Class Mother Ship", false);
    ataca(recusa);
    expect(recusa.names(0, 'hand')).toEqual(['Sol Ring']);
    const feitico = mesa('Diabolic Tutor');
    ataca(feitico);
    expect(feitico.names(0, 'hand')).toEqual(['Diabolic Tutor']);
  });
});