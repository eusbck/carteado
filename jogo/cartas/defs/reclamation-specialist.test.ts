import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Reclamation Specialist';

describe(N, () => {
  it('{1}, sacrificar uma criatura artefato: compre uma carta', () => {
    const tg = setup({ battlefield: [[N, 'Plains', { name: 'Borg', token: true }, 'Wall of Omens'], []] });
    const mao = tg.state.zones.hand[0].length;
    tg.choose('Sacrifique', ['Borg']).activate(N, 'Compre').resolveAll();
    expect(tg.find('Borg')).toBeNull();
    expect(tg.find('Wall of Omens')).not.toBeNull();
    expect(tg.state.zones.hand[0].length).toBe(mao + 1);
  });
});
