import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { hasKw } from '../../motor/chars.ts';

describe('Carrion Feeder', () => {
  it('CR 509.1b: não pode bloquear', () => {
    const tg = setup({ active: 1, battlefield: [['Carrion Feeder'], ['Hateful Eidolon']] });
    const feeder = tg.bf('Carrion Feeder');
    expect(hasKw(tg.g, feeder, 'cantBlock')).toBe(true);
    let candidatos: number[] = [];
    tg.script.push((d) => (d.kind === 'blockers' ? (candidatos = d.candidates.map((x) => x.obj), { kind: 'blockers', blocks: [] }) : null));
    tg.attack([['Hateful Eidolon', 0]]).passTo('main2', 1);
    expect(candidatos).not.toContain(feeder);
    expect(tg.life(0)).toBe(39);
  });

  it('sacrifica uma criatura (mesmo com enjoo de invocação) e ganha um marcador +1/+1', () => {
    const tg = setup({ battlefield: [[{ name: 'Carrion Feeder', ready: false }, 'Viscera Seer'], []] });
    tg.choose('Sacrifique', ['Viscera Seer']).activate('Carrion Feeder').resolve();
    expect(tg.state.objects[tg.bf('Carrion Feeder')].counters['+1/+1']).toBe(1);
    expect(tg.pt(tg.bf('Carrion Feeder'))).toEqual([2, 2]);
    expect(tg.names(0, 'graveyard')).toEqual(['Viscera Seer']);
  });

  it('pode sacrificar a si mesma; aí não há onde pôr o marcador', () => {
    const tg = setup({ battlefield: [['Carrion Feeder'], []] });
    tg.choose('Sacrifique', ['Carrion Feeder']).activate('Carrion Feeder').resolve();
    expect(tg.find('Carrion Feeder')).toBeNull();
    expect(tg.names(0, 'graveyard')).toEqual(['Carrion Feeder']);
  });
});
