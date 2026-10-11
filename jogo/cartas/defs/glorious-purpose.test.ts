import { describe, expect, it } from 'vitest';
import { connive } from '../../motor/api.ts';
import { fixture as setup, runEffect } from '../../testes/artefatos.ts';

const N = 'Glorious Purpose';

describe(N, () => {
  it('quando uma criatura sua trama, ela ganha um marcador +1/+1 e o encantamento ganha um marcador de plano', () => {
    const lib = Array(8).fill('Swamp');
    const tg = setup({ battlefield: [[N, 'Elvish Mystic'], []], library: [lib, lib] });
    const elfo = tg.bf('Elvish Mystic');
    runEffect(tg, connive(tg.g, elfo));
    tg.resolveAll();
    expect(tg.state.objects[elfo].counters['+1/+1']).toBe(1);
    expect(tg.state.objects[tg.bf(N)].counters.plan).toBe(1);
  });

  it('no sexto marcador de plano, é sacrificado: exila quatro cartas, conjura as que quiser de graça e o resto vai para a mão', () => {
    const tg = setup({ battlefield: [[N, 'Elvish Mystic'], []], library: [['Swamp', 'Sol Ring', 'Indomitable Ancients', 'Silver Myr', 'Island', 'Island', 'Island'], Array(4).fill('Island')] });
    tg.state.objects[tg.bf(N)].counters.plan = 5;
    const elfo = tg.bf('Elvish Mystic');
    // a trama compra a Swamp e a descarta; as quatro seguintes são exiladas
    tg.choose('Descarte', ['Swamp']);
    tg.choose('Glorious Purpose', ['Indomitable Ancients']).yes('Conjurar Indomitable Ancients', true);
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('Glorious Purpose') ? { kind: 'select', ids: [''] } : null));
    runEffect(tg, connive(tg.g, elfo));
    tg.resolveAll();
    expect(tg.find(N)).toBeNull();
    expect(tg.find('Indomitable Ancients')).not.toBeNull();
    expect(tg.names(0, 'hand').sort()).toEqual(['Island', 'Silver Myr', 'Sol Ring']);
    expect(tg.names(0, 'exile')).toEqual([]);
  });
});
