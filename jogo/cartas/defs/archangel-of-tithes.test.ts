import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Archangel of Tithes';

describe(N, () => {
  it('desvirada: atacar você custa {1} por criatura', () => {
    const tg = setup({ active: 1, battlefield: [[N], ['Slither Blade', 'Triton Shorestalker', 'Island']] });
    let custos: number[][] = [];
    tg.script.push((d) => {
      if (d.kind !== 'attackers') return null;
      custos = d.candidates.map((c) => c.costs ?? []);
      return { kind: 'attackers', attacks: [[tg.bf('Slither Blade'), { kind: 'player', id: 0 }]] };
    });
    tg.passTo('main2', 1);
    expect(custos).toEqual([[1], [1]]);
    expect(tg.state.objects[tg.bf('Island')].tapped).toBe(true);
    expect(tg.life(0)).toBe(39);
  });

  it('atacando: bloquear custa {1} por criatura; sem mana, não dá para bloquear', () => {
    const tg = setup({ battlefield: [[N], ['Indomitable Ancients', 'Baleful Strix', 'Island']] });
    tg.attack([[N, 1]]);
    // Bruno tenta bloquear com Strix (voar) pagando {1}
    tg.block([['Baleful Strix', N]]);
    tg.passTo('declareBlockers');
    expect(tg.state.combat!.attackers.find((a) => a.id === tg.bf(N))!.blocked).toBe(true);
    expect(tg.state.objects[tg.bf('Island')].tapped).toBe(true);
  });

  it('sem mana para pagar, o bloqueio é recusado', () => {
    const tg = setup({ battlefield: [[N], ['Baleful Strix']] });
    let erro: string | null = null;
    tg.script.push((d) => {
      if (d.kind !== 'blockers') return null;
      const live = d as typeof d & { validate?: (a: unknown) => string | null };
      erro = live.validate?.({ kind: 'blockers', blocks: [[tg.bf('Baleful Strix'), tg.bf(N)]] }) ?? null;
      return { kind: 'blockers', blocks: [] };
    });
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(erro).toMatch(/bloquear/);
    expect(tg.life(1)).toBe(37);
  });

  it('CR 509.1d: a decisão de bloqueio já mostra o custo de cada bloqueio, antes de confirmar', () => {
    const tg = setup({ battlefield: [[N, 'Segovian Angel'], ['Baleful Strix', 'Island']] });
    let custos: Record<string, number[]> = {};
    tg.script.push((d) => {
      if (d.kind !== 'blockers') return null;
      custos = Object.fromEntries(d.candidates.map((c) => [tg.state.objects[c.obj].def, c.costs ?? []]));
      return { kind: 'blockers', blocks: [] };
    });
    tg.attack([[N, 1], ['Segovian Angel', 1]]).passTo('main2', 0);
    // bloquear qualquer atacante custa {1} enquanto Archangel of Tithes ataca
    expect(custos['Baleful Strix']).toEqual([1, 1]);
  });

  it('sem estar atacando, bloquear não custa nada', () => {
    const tg = setup({ battlefield: [[N, 'Segovian Angel'], ['Baleful Strix']] });
    let custos: number[] | undefined = [9];
    tg.script.push((d) => {
      if (d.kind !== 'blockers') return null;
      custos = d.candidates[0].costs;
      return { kind: 'blockers', blocks: [] };
    });
    tg.attack([['Segovian Angel', 1]]).passTo('main2', 0);
    expect(custos).toBeUndefined();
  });
});
