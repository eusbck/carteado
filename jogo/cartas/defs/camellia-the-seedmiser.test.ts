import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Camellia, the Seedmiser';

describe(N, () => {
  it('ameaça para ela e para os outros Squirrels seus', () => {
    const tg = setup({ battlefield: [[N, { name: 'Squirrel', token: true }], [{ name: 'Squirrel', token: true }]] });
    const [meu] = tg.all('Squirrel').filter((id) => tg.state.objects[id].controller === 0);
    const [dele] = tg.all('Squirrel').filter((id) => tg.state.objects[id].controller === 1);
    expect(hasKw(tg.g, tg.bf(N), 'menace')).toBe(true);
    expect(hasKw(tg.g, meu, 'menace')).toBe(true);
    expect(hasKw(tg.g, dele, 'menace')).toBe(false);
  });

  it('CR 701.61a: forragear sacrificando uma Food: marcador nos outros Squirrels e um Squirrel novo', () => {
    const tg = setup({ battlefield: [[N, { name: 'Squirrel', token: true }, { name: 'Food', token: true }, 'Swamp', 'Swamp'], []] });
    const esquilo = tg.bf('Squirrel');
    tg.activate(N, 'Forragear').resolveAll();
    expect(tg.find('Food')).toBeNull();
    expect(tg.state.objects[esquilo].counters['+1/+1']).toBe(1);
    expect(tg.all('Squirrel')).toHaveLength(2); // o do gatilho de sacrificar Food (entra depois, sem marcador)
    expect(tg.state.objects[tg.bf(N)].counters['+1/+1'] ?? 0).toBe(0);
  });

  it('forragear exilando três cartas do cemitério, quando escolhe', () => {
    const tg = setup({
      battlefield: [[N, { name: 'Food', token: true }, 'Swamp', 'Swamp'], []],
      graveyard: [['Island', 'Island', 'Island'], []],
    });
    tg.choose('Forragear: como pagar', ['Exilar três cartas do seu cemitério']);
    tg.activate(N, 'Forragear').resolveAll();
    expect(tg.names(0, 'exile')).toEqual(['Island', 'Island', 'Island']);
    expect(tg.bf('Food')).toBeTruthy();
    expect(tg.find('Squirrel')).toBeNull();
  });

  it('sem Food e com menos de três cartas no cemitério, não pode forragear', () => {
    const tg = setup({ battlefield: [[N, 'Swamp', 'Swamp'], []], graveyard: [['Island', 'Island'], []] });
    expect(tg.actionIds().some((a) => a.startsWith('act:'))).toBe(false);
  });
});
