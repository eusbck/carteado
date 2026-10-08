import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { chars, hasKw } from '../../motor/chars.ts';

const HIVE = "Skrelv's Hive";
const mite = (extra: Record<string, unknown> = {}) => ({ name: 'Phyrexian Mite', token: true, ...extra });

describe(HIVE, () => {
  it('na sua manutenção, você perde 1 de vida e cria um Phyrexian Mite', () => {
    const tg = setup({ step: 'end', active: 1, battlefield: [[HIVE], []], library: [['Plains'], ['Island']] });
    tg.passUntil((x) => x.state.turn.active === 0 && x.state.turn.step === 'upkeep').resolve();
    expect(tg.life(0)).toBe(39);
    const [m] = tg.all('Phyrexian Mite');
    const c = chars(tg.g, m);
    expect([c.types, c.subtypes, c.colors]).toEqual([['Artifact', 'Creature'], ['Phyrexian', 'Mite'], []]);
    expect(tg.pt(m)).toEqual([1, 1]);
    expect(hasKw(tg.g, m, 'toxic')).toBe(true);
    expect(hasKw(tg.g, m, 'cantBlock')).toBe(true);
    expect(tg.state.objects[m].controller).toBe(0);
  });

  it('a criatura com tóxico causa o dano normal e o jogador também recebe veneno', () => {
    const tg = setup({ battlefield: [[HIVE, mite()], []] });
    tg.attack([['Phyrexian Mite', 1]]).passTo('main2');
    expect(tg.life(1)).toBe(39);
    expect(tg.state.players[1].counters.poison).toBe(1);
  });

  it('o marcador de veneno não depende de quanto dano foi causado', () => {
    const tg = setup({ battlefield: [[HIVE, mite({ counters: { '+1/+1': 2 } })], []] });
    tg.attack([['Phyrexian Mite', 1]]).passTo('main2');
    expect(tg.life(1)).toBe(37);
    expect(tg.state.players[1].counters.poison).toBe(1);
  });

  it('dano de combate a criatura não dá veneno', () => {
    const tg = setup({ battlefield: [[HIVE, mite()], ['Wall of Omens']] });
    tg.attack([['Phyrexian Mite', 1]]).block([['Wall of Omens', 'Phyrexian Mite']]).passTo('main2');
    expect(tg.state.players[1].counters.poison ?? 0).toBe(0);
    expect(tg.state.objects[tg.bf('Wall of Omens')].damage).toBe(1);
  });

  it('com corrompido, o vínculo com a vida acontece junto com o veneno', () => {
    const tg = setup({ battlefield: [[HIVE, mite(), 'Indomitable Ancients'], []] });
    // sem um oponente com três marcadores de veneno, nada de vínculo com a vida
    expect(hasKw(tg.g, tg.bf('Phyrexian Mite'), 'lifelink')).toBe(false);
    tg.state.players[1].counters.poison = 3;
    tg.g.bump();
    tg.refresh();
    expect(hasKw(tg.g, tg.bf('Phyrexian Mite'), 'lifelink')).toBe(true);
    // só as criaturas com tóxico
    expect(hasKw(tg.g, tg.bf('Indomitable Ancients'), 'lifelink')).toBe(false);
    tg.attack([['Phyrexian Mite', 1]]).passTo('main2');
    expect(tg.life(0)).toBe(41);
    expect(tg.life(1)).toBe(39);
    expect(tg.state.players[1].counters.poison).toBe(4);
  });
});
