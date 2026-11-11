import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const C = 'Gilgamesh, Master-at-Arms';

describe(C, () => {
  it('ao entrar: põe Equipamentos do topo no campo, o resto vai para o fundo, e pode anexar a um Samurai', () => {
    const tg = setup({ battlefield: [[...Array(6).fill('Mountain')], []], hand: [[C], []], library: [['Opt', 'Basilisk Collar', 'Elvish Mystic', 'Darksteel Plate', 'Opt', 'Opt', 'Wall of Omens'], []] });
    tg.choose('Coloque no campo', ['Basilisk Collar', 'Darksteel Plate']).choose('Anexe um dos Equipamentos', ['Basilisk Collar']).choose('Samurai', [C]);
    tg.cast(C).resolveAll();
    expect(tg.find('Basilisk Collar')).not.toBeNull();
    expect(tg.find('Darksteel Plate')).not.toBeNull();
    expect(tg.state.objects[tg.bf('Basilisk Collar')].attachedTo).toBe(tg.bf(C));
    const lib = tg.state.zones.library[0].map((id) => tg.state.objects[id].def);
    expect(lib[0]).toBe('Wall of Omens');
    expect(lib.length).toBe(5);
  });
});
