import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Age of Ultron';
const lib = Array(10).fill('Island');

describe(N, () => {
  it('os três capítulos: destrói uma criatura não artefato de cada oponente, cria os Robots e os fortalece', () => {
    const tg = setup({
      players: 3, battlefield: [[...Array(5).fill('Swamp'), 'Silver Myr'], ['Indomitable Ancients', 'Silver Myr'], ['Elvish Mystic']],
      hand: [[N], [], []], library: [lib, lib, lib],
    });
    const anciao = tg.bf('Indomitable Ancients');
    const elfo = tg.bf('Elvish Mystic');
    tg.choose('para cada oponente', [anciao, elfo]);
    tg.cast(N).resolveAll();
    expect(tg.names(1, 'battlefield')).toEqual(['Silver Myr']);
    expect(tg.names(2, 'battlefield')).toEqual([]);
    // capítulo II no seu próximo turno
    tg.passTo('main1', 1);
    tg.passTo('main1', 2);
    tg.passTo('main1', 0);
    tg.resolveAll();
    expect(tg.all('Robot Villain')).toHaveLength(2);
    // capítulo III no turno seguinte: Myr e os dois Robots ganham toque mortífero e um marcador; a Saga é sacrificada
    tg.passTo('main1', 1);
    tg.passTo('main1', 2);
    tg.passTo('main1', 0);
    tg.resolveAll();
    const myr = tg.bf('Silver Myr', 0);
    expect(tg.pt(myr)).toEqual([2, 2]);
    expect(hasKw(tg.g, myr, 'deathtouch')).toBe(true);
    for (const r of tg.all('Robot Villain')) expect(tg.pt(r)).toEqual([3, 3]);
    expect(tg.names(0, 'graveyard')).toEqual([N]);
  });

  it('criatura artefato do oponente não é alvo do capítulo I', () => {
    const tg = setup({ battlefield: [[...Array(5).fill('Swamp')], ['Silver Myr']], hand: [[N], []], library: [lib, lib] });
    tg.cast(N).resolveAll();
    expect(tg.names(1, 'battlefield')).toEqual(['Silver Myr']);
  });
});
