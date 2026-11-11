import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = "Swordsman's Steel";

describe(N, () => {
  it('ao entrar, compra uma carta para cada Equipamento que você controla (contando ele)', () => {
    const tg = setup({ battlefield: [['Sol Ring', 'Sol Ring', 'Lightning Greaves'], []], hand: [[N], []] });
    tg.cast(N).resolveAll();
    expect(tg.names(0, 'hand').length).toBe(2);
  });

  it('a equipada recebe +2/+2 para cada Equipamento que você controla', () => {
    const tg = setup({ battlefield: [[N, 'Lightning Greaves', 'Swiftfoot Boots', { name: 'Wall of Omens' }], []] });
    tg.choose('criatura alvo', ['Wall of Omens']);
    tg.state.objects[tg.bf(N)].attachedTo = tg.bf('Wall of Omens');
    tg.refresh();
    expect(tg.pt(tg.bf('Wall of Omens'))).toEqual([6, 10]);
  });
});
