import { describe, expect, it } from 'vitest';
import { enterCard, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Jaques Wagner e Rui Costa, Dupla da Bahia';

describe(N, () => {
  it('ao entrar, busca uma Aura e um encantamento que não é Aura', () => {
    const tg = setup({ battlefield: [[], []], library: [['Island', 'Vow of Duty', 'Island', 'Ghostly Prison', 'Sol Ring', 'Island'], Array(6).fill('Island')] });
    tg.choose('Procure uma carta de Aura', ['Vow of Duty']);
    tg.choose('Procure uma carta de encantamento', ['Ghostly Prison']);
    enterCard(tg, N, 0);
    tg.resolveAll();
    expect(tg.names(0, 'hand').sort()).toEqual(['Ghostly Prison', 'Vow of Duty']);
    expect(tg.names(0, 'library')).toHaveLength(4);
  });
});
