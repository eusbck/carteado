import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const C = 'Bruenor Battlehammer';

describe(C, () => {
  it('+2/+0 para cada Equipamento anexado', () => {
    const tg = setup({ battlefield: [[C, { name: 'Basilisk Collar', attachTo: 'Elvish Mystic' }, { name: 'Darksteel Plate', attachTo: 'Elvish Mystic' }, 'Elvish Mystic'], []] });
    expect(tg.pt(tg.bf('Elvish Mystic'))).toEqual([5, 1]);
  });
  it('só a primeira habilidade de equipar do turno sai por {0}', () => {
    const tg = setup({ battlefield: [[C, 'Basilisk Collar', 'Darksteel Plate', 'Elvish Mystic'], []] });
    tg.choose('criatura alvo', ['Elvish Mystic']).activate('Basilisk Collar', 'Equipar').resolve();
    expect(tg.state.objects[tg.bf('Basilisk Collar')].attachedTo).toBe(tg.bf('Elvish Mystic'));
    // sem terrenos: o segundo equipar já não sai de graça
    expect(tg.actionIds().some((a) => a.startsWith('activate') && a.includes(String(tg.bf('Darksteel Plate'))))).toBe(false);
  });
});
