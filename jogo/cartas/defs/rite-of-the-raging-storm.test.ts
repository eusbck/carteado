import { describe, expect, it } from 'vitest';
import { chars, hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Rite of the Raging Storm';
const R = 'Lightning Rager';

describe(N, () => {
  it('cada jogador cria na própria manutenção um Lightning Rager 5/1, sacrificado no início da etapa final', () => {
    const tg = setup({ active: 1, battlefield: [[N], []] });
    tg.passTo('main1', 0);
    const meu = tg.bf(R);
    expect(tg.state.objects[meu].controller).toBe(0);
    expect(tg.pt(meu)).toEqual([5, 1]);
    expect(chars(tg.g, meu).name).toBe(R);
    expect(chars(tg.g, meu).subtypes).toEqual(['Elemental']);
    expect(hasKw(tg.g, meu, 'trample') && hasKw(tg.g, meu, 'haste')).toBe(true);
    // sacrificado no início da etapa final
    tg.passTo('upkeep', 1);
    tg.resolveAll();
    expect(tg.all(R).filter((id) => tg.state.objects[id].controller === 0)).toHaveLength(0);
    // o oponente cria o dele na manutenção dele
    tg.passTo('main1', 1);
    expect(tg.all(R).filter((id) => tg.state.objects[id].controller === 1)).toHaveLength(1);
  });

  it('Lightning Rager não pode atacar quem controla o Rite, mas pode atacar os outros', () => {
    const tg = setup({ players: 3, active: 0, battlefield: [[N], [], []] });
    tg.passTo('main1', 1);
    const dele = tg.all(R).find((id) => tg.state.objects[id].controller === 1)!;
    let alvos: number[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'attackers') return null;
      const cand = d.candidates.find((x) => x.obj === dele);
      alvos = (cand?.targets ?? []).filter((t) => t.kind === 'player').map((t) => t.id);
      return { kind: 'attackers', attacks: [[dele, { kind: 'player', id: 2 }]] };
    });
    tg.passTo('main2', 1);
    // só Carla pode ser atacada; você, que controla o Rite, não
    expect(alvos).toEqual([2]);
    expect([tg.life(0), tg.life(2)]).toEqual([40, 35]);
  });
});
