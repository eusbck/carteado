import { describe, expect, it } from 'vitest';
import { destroy } from '../../motor/api.ts';
import { enterCard, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Hostage Taker';
const lib = Array(10).fill('Island');

describe(N, () => {
  it('exila outra criatura ou artefato até sair do campo; saindo, a carta volta para o dono', () => {
    const tg = setup({ battlefield: [[], ['Indomitable Ancients']], library: [lib, lib] });
    tg.choose('outra criatura ou artefato alvo', ['Indomitable Ancients']);
    const id = enterCard(tg, N, 0)!;
    tg.resolveAll();
    expect(tg.pt(id)).toEqual([2, 3]);
    expect(tg.names(1, 'exile')).toEqual(['Indomitable Ancients']);
    tg.run(destroy(tg.g, [id]));
    tg.resolveAll();
    expect(tg.names(1, 'battlefield')).toEqual(['Indomitable Ancients']);
  });

  it('você conjura a carta exilada com mana de qualquer tipo e fica com ela mesmo que Hostage Taker saia', () => {
    // Elvish Mystic custa {G}: paga com uma Island
    const tg = setup({ battlefield: [['Island'], ['Elvish Mystic']], library: [lib, lib] });
    tg.choose('outra criatura ou artefato alvo', ['Elvish Mystic']);
    const id = enterCard(tg, N, 0)!;
    tg.resolveAll();
    tg.cast('Elvish Mystic', '*').resolveAll();
    const elfo = tg.bf('Elvish Mystic');
    expect(tg.state.objects[elfo].controller).toBe(0);
    tg.run(destroy(tg.g, [id]));
    tg.resolveAll();
    expect(tg.state.objects[elfo].controller).toBe(0);
  });
});
