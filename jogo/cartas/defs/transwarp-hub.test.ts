import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Transwarp Hub';

describe(N, () => {
  it('ao entrar, moa cinco e pegue até duas cartas de artefato dentre elas', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island'], []], hand: [[N], []], library: [['Sol Ring', 'Island', 'Steel Overseer', 'Darksteel Plate', 'Wall of Omens', 'Forest'], []] });
    tg.choose('até duas cartas de artefato', ['Sol Ring', 'Darksteel Plate']).cast(N).resolveAll();
    expect(tg.names(0, 'hand').sort()).toEqual(['Darksteel Plate', 'Sol Ring']);
    expect(tg.names(0, 'graveyard').sort()).toEqual(['Island', 'Steel Overseer', 'Wall of Omens']);
  });

  it('com 3 marcadores, {T}: a criatura alvo não pode ser bloqueada; não vira criatura', () => {
    const tg = setup({ battlefield: [[{ name: N, counters: { charge: 3 } }, 'Steel Overseer'], ['Wall of Omens']] });
    tg.choose('criatura alvo', ['Steel Overseer']).activate(N, 'não pode ser bloqueada').resolveAll();
    tg.attack([['Steel Overseer', 1]]).passTo('declareBlockers');
    tg.passTo('main2');
    expect(tg.life(1)).toBe(39);
  });

  it('com menos de 3 marcadores, a habilidade não existe', () => {
    const tg = setup({ battlefield: [[{ name: N, counters: { charge: 2 } }, 'Steel Overseer'], []] });
    expect(tg.actionIds().filter((a) => a.startsWith('act:') && a.split(':').includes(String(tg.bf(N))))).toHaveLength(1); // só a estação
  });
});
