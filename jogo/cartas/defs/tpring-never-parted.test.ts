import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = "T'Pring, Never Parted";
const terrenos = ['Forest', 'Forest', 'Forest', 'Island', 'Island'];

describe(N, () => {
  it('as escolhidas lutam e, para cada uma que morre neste turno, você compra uma carta', () => {
    const tg = setup({ battlefield: [[...terrenos, 'Elder Gargaroth'], ['Wall of Omens']], hand: [[N], []], library: [['Plains', 'Plains'], []] });
    tg.choose('outra criatura alvo', ['Elder Gargaroth']).choose('criatura alvo que um oponente', ['Wall of Omens']).yes('lutarem', true);
    tg.cast(N).resolveAll();
    expect(tg.find('Wall of Omens', 'graveyard')).not.toBeNull();
    expect(tg.names(0, 'hand')).toEqual(['Plains']);
  });
  it('sem lutar, nada acontece', () => {
    const tg = setup({ battlefield: [[...terrenos, 'Elder Gargaroth'], ['Wall of Omens']], hand: [[N], []], library: [['Plains'], []] });
    tg.yes('lutarem', false);
    tg.cast(N).resolveAll();
    expect(tg.find('Wall of Omens', 'battlefield')).not.toBeNull();
    expect(tg.names(0, 'hand')).toEqual([]);
  });
});
