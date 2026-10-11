import { describe, expect, it } from 'vitest';
import { enterCard, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Dread Cacodemon';

describe(N, () => {
  it('conjurada da mão, destrói as criaturas dos oponentes e vira as outras criaturas que você controla', () => {
    const tg = setup({ battlefield: [[...Array(10).fill('Swamp'), 'Serra Angel'], ['Indomitable Ancients', 'Silver Myr']], hand: [[N], []] });
    tg.cast(N).resolveAll();
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([8, 8]);
    expect(tg.find('Indomitable Ancients')).toBeNull();
    expect(tg.find('Silver Myr')).toBeNull();
    expect(tg.state.objects[tg.bf('Serra Angel')].tapped).toBe(true);
    expect(tg.state.objects[id].tapped).toBe(false);
  });

  it('posta no campo sem ser conjurada, a habilidade não dispara', () => {
    const tg = setup({ battlefield: [['Serra Angel'], ['Indomitable Ancients']] });
    enterCard(tg, N, 0);
    tg.resolveAll();
    expect(tg.find('Indomitable Ancients')).not.toBeNull();
    expect(tg.state.objects[tg.bf('Serra Angel')].tapped).toBe(false);
  });
});