import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Braids, Arisen Nightmare';

describe(N, () => {
  it('com uma criatura artefato sacrificada, um oponente sacrifica um artefato e o outro recusa', () => {
    const tg = setup({ players: 3, battlefield: [[N, { name: 'Servo', token: true }], ['Sol Ring', 'Forest'], ['Elvish Mystic']] });
    tg.script.push((d) => (d.kind === 'select' && d.player === 0 && /Braids: você pode/.test(d.prompt) ? { kind: 'select', ids: d.items.filter((i) => i.label === 'Servo').map((i) => i.id) } : null));
    tg.script.push((d) => (d.kind === 'select' && d.player === 1 && /Braids: sacrificar/.test(d.prompt) ? { kind: 'select', ids: d.items.filter((i) => i.label === 'Sol Ring').map((i) => i.id) } : null));
    tg.script.push((d) => (d.kind === 'select' && d.player === 2 && /Braids: sacrificar/.test(d.prompt) ? { kind: 'select', ids: [] } : null));
    const mao = tg.names(0, 'hand').length;
    tg.passTo('cleanup');
    expect(tg.find('Servo')).toBeNull();
    expect(tg.find('Sol Ring')).toBeNull();
    expect(tg.bf('Forest')).toBeTruthy(); // terreno não tem tipo em comum
    expect(tg.bf('Elvish Mystic')).toBeTruthy();
    expect([tg.life(1), tg.life(2)]).toEqual([40, 38]);
    expect(tg.names(0, 'hand').length).toBe(mao + 1);
  });

  it('pode não sacrificar nada', () => {
    const tg = setup({ battlefield: [[N], ['Elvish Mystic']] });
    tg.script.push((d) => (d.kind === 'select' && /Braids: você pode/.test(d.prompt) ? { kind: 'select', ids: [] } : null));
    tg.passTo('cleanup');
    expect(tg.bf(N)).toBeTruthy();
    expect(tg.life(1)).toBe(40);
  });
});
