import { describe, expect, it } from 'vitest';
import { enterCard, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Inferno Titan';
const lib = Array(8).fill('Mountain');

describe(N, () => {
  it('3 de dano em um alvo; 2 e 1 em dois; 1 em cada um de três', () => {
    const um = setup({ battlefield: [[], ['Indomitable Ancients']], library: [lib, lib] });
    um.choose('um, dois ou três alvos', ['Indomitable Ancients']);
    const id = enterCard(um, N, 0)!;
    um.resolveAll();
    expect(um.pt(id)).toEqual([6, 6]);
    expect(um.state.objects[um.bf('Indomitable Ancients')].damage).toBe(3);

    const dois = setup({ battlefield: [[], ['Indomitable Ancients', 'Elvish Mystic']], library: [lib, lib] });
    const anciao = dois.bf('Indomitable Ancients');
    dois.choose('um, dois ou três alvos', [anciao, dois.bf('Elvish Mystic')]).choose('qual alvo recebe 2', ['0']);
    enterCard(dois, N, 0);
    dois.resolveAll();
    expect(dois.state.objects[anciao].damage).toBe(2);
    expect(dois.find('Elvish Mystic')).toBeNull();

    const tres = setup({ battlefield: [[], ['Indomitable Ancients', 'Elvish Mystic', 'Silver Myr']], library: [lib, lib] });
    tres.choose('um, dois ou três alvos', ['Indomitable Ancients', 'Elvish Mystic', 'Silver Myr']);
    enterCard(tres, N, 0);
    tres.resolveAll();
    expect(tres.names(1, 'battlefield')).toEqual(['Indomitable Ancients']);
    expect(tres.state.objects[tres.bf('Indomitable Ancients')].damage).toBe(1);
  });

  it('{R}: +1/+0; ao atacar, causa o dano de novo', () => {
    const tg = setup({ battlefield: [[N, 'Mountain'], []], library: [lib, lib] });
    tg.activate(N, '{R}').resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([7, 6]);
    tg.choose('um, dois ou três alvos', ['Bruno']);
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.life(1)).toBe(40 - 3 - 7);
  });
});
