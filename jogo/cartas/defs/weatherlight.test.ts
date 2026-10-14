import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Weatherlight';

describe(N, () => {
  it('ao causar dano de combate, pega uma carta histórica entre as cinco do topo', () => {
    const tg = setup({
      battlefield: [[N, 'Ripjaw Raptor'], []],
      library: [['Forest', 'Rishkar, Peema Renegade', 'Sol Ring', 'Ripjaw Raptor', 'Island', 'Plains', 'Swamp'], Array(10).fill('Forest')],
    });
    tg.choose('Tripular:', ['Ripjaw Raptor']).choose('Tripular:', ['done']).activate(N, 'Tripular').resolveAll();
    let oferecidas: string[] = [];
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('Weatherlight:') ? (oferecidas = d.items.filter((i) => !i.disabled).map((i) => i.label), { kind: 'select', ids: [d.items.find((i) => i.label === 'Rishkar, Peema Renegade')!.id] }) : null));
    tg.attack([[N, 1]]).passTo('main2');
    expect(tg.life(1)).toBe(36);
    expect(oferecidas.sort()).toEqual(['Rishkar, Peema Renegade', 'Sol Ring']);
    expect(tg.names(0, 'hand')).toEqual(['Rishkar, Peema Renegade']);
    const lib = tg.names(0, 'library');
    expect(lib.slice(0, 2)).toEqual(['Plains', 'Swamp']);
  });
});
