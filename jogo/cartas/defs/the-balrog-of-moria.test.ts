import { describe, expect, it } from 'vitest';
import { destroy } from '../../motor/api.ts';
import { hasKw } from '../../motor/chars.ts';
import { fixture as artefatos } from '../../testes/artefatos.ts';
import { setup } from '../../testes/harness.ts';

const N = 'The Balrog of Moria';
const lib = Array(10).fill('Mountain');

describe(N, () => {
  it('ao morrer, exilado do cemitério, exila até uma criatura de cada oponente', () => {
    const tg = artefatos({ players: 3, battlefield: [[N], ['Indomitable Ancients', 'Elvish Mystic'], ['Silver Myr']], library: [lib, lib, lib] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([8, 8]);
    expect(hasKw(tg.g, id, 'trample') && hasKw(tg.g, id, 'haste')).toBe(true);
    const [anciao, myr] = [tg.bf('Indomitable Ancients'), tg.bf('Silver Myr')];
    tg.yes('The Balrog of Moria', true).choose('para cada oponente', [anciao, myr]);
    tg.run(destroy(tg.g, [id]));
    tg.resolveAll();
    expect(tg.names(0, 'exile')).toEqual([N]);
    expect(tg.names(1, 'battlefield')).toEqual(['Elvish Mystic']);
    expect(tg.names(2, 'battlefield')).toEqual([]);
  });

  it('é opcional: sem exilar, fica no cemitério e nada mais acontece', () => {
    const tg = artefatos({ battlefield: [[N], ['Elvish Mystic']], library: [lib, lib] });
    tg.yes('The Balrog of Moria', false);
    tg.run(destroy(tg.g, [tg.bf(N)]));
    tg.resolveAll();
    expect(tg.names(0, 'graveyard')).toEqual([N]);
    expect(tg.find('Elvish Mystic')).not.toBeNull();
  });

  it('ciclando, cria dois Treasures antes de você comprar a carta', () => {
    const tg = setup({ battlefield: [[...Array(4).fill('Mountain')], []], hand: [[N], []], library: [lib, lib] });
    tg.activate(N, 'Ciclagem');
    tg.resolve();
    expect(tg.all('Treasure')).toHaveLength(2);
    expect(tg.names(0, 'hand')).toHaveLength(0);
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toHaveLength(1);
  });
});
