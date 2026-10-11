import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Spellbinding Soprano';
const montanhas = (n: number) => Array(n).fill('Mountain');

describe(N, () => {
  it('depois de atacar, as suas instantâneas e feitiços custam {1} a menos até o fim do turno', () => {
    // Spit Flame custa {2}{R}: com duas Mountains só dá com o desconto
    const tg = setup({ battlefield: [[N, ...montanhas(2)], ['Indomitable Ancients']], hand: [['Spit Flame', 'Sol Ring'], []] });
    expect(tg.pt(tg.bf(N))).toEqual([2, 2]);
    expect(tg.canCast('Spit Flame')).toBe(false);
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.canCast('Spit Flame')).toBe(true);
    tg.choose('criatura alvo', ['Indomitable Ancients']).cast('Spit Flame').resolveAll();
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].damage).toBe(4);
    // no turno seguinte o desconto acabou
    const fim = setup({ battlefield: [[N, ...montanhas(2)], []], hand: [['Spit Flame'], []] });
    fim.attack([[N, 1]]).passTo('main2', 0);
    fim.passTo('main1', 1);
    fim.passTo('main1', 0);
    expect(fim.canCast('Spit Flame')).toBe(false);
  });

  it('o desconto não vale para artefatos nem criaturas', () => {
    // Rapacious Dragon custa {4}{R}: com quatro Mountains continua sem dar
    const tg = setup({ battlefield: [[N, ...montanhas(4)], []], hand: [['Rapacious Dragon'], []] });
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.canCast('Rapacious Dragon')).toBe(false);
  });

  it('CR 702.141a: bis — do cemitério, cria uma cópia para cada oponente, que o ataca neste turno, com ímpeto, e é sacrificada na etapa final', () => {
    const tg = setup({ players: 3, battlefield: [montanhas(4), [], []], graveyard: [[N], [], []] });
    tg.activate(N, 'Bis').resolveAll();
    expect(tg.find(N, 'exile')).not.toBeNull();
    const fichas = tg.all(N);
    expect(fichas).toHaveLength(2);
    expect(fichas.every((id) => tg.state.objects[id].isToken && hasKw(tg.g, id, 'haste'))).toBe(true);
    // cada ficha é obrigada a atacar o oponente dela
    let exigidas = 0;
    let alvos: number[][] = [];
    tg.script.push((d) => {
      if (d.kind !== 'attackers') return null;
      const cands = d.candidates.filter((x) => fichas.includes(x.obj));
      exigidas = cands.filter((x) => x.required?.length).length;
      alvos = cands.map((x) => x.targets.filter((t) => t.kind === 'player').map((t) => t.id));
      return { kind: 'attackers', attacks: cands.map((x) => [x.obj, x.targets[0]]) };
    });
    tg.passTo('main2', 0);
    expect(exigidas).toBe(2);
    expect(alvos.map((a) => a.join()).sort()).toEqual(['1', '2']);
    expect([tg.life(1), tg.life(2)]).toEqual([38, 38]);
    tg.passTo('upkeep', 1);
    expect(tg.all(N)).toHaveLength(0);
  });

  it('o bis só pode ser ativado como feitiço', () => {
    const tg = setup({ active: 1, battlefield: [montanhas(4), []], graveyard: [[N], []] });
    tg.pass();
    expect(tg.pending?.player).toBe(0);
    expect(tg.actionIds().some((a) => a.startsWith('act:'))).toBe(false);
  });
});
