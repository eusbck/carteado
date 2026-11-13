import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Bruenor Battlehammer';

describe(N, () => {
  it('cada criatura sua recebe +2/+0 para cada Equipamento anexado a ela', () => {
    const tg = setup({ battlefield: [[N, 'Silver Myr', { name: 'Lightning Greaves', attachTo: 'Silver Myr' }, { name: 'Swiftfoot Boots', attachTo: 'Silver Myr' }], ['Wall of Omens']] });
    expect(tg.pt(tg.bf('Silver Myr'))).toEqual([5, 1]);
    expect(tg.pt(tg.bf(N))).toEqual([5, 3]);
  });

  it('CR 118.9 — a primeira habilidade de equipar do turno pode custar {0}; a segunda paga o custo', () => {
    const tg = setup({ battlefield: [[N, 'Silver Myr', 'Loxodon Warhammer', 'Blackblade Reforged'], []] });
    tg.yes('pagar {0}', true).choose('criatura alvo', ['Silver Myr']).activate('Loxodon Warhammer', 'Equipar').resolveAll();
    expect(tg.state.objects[tg.bf('Loxodon Warhammer')].attachedTo).toBe(tg.bf('Silver Myr'));
    // sem terrenos, a segunda (equipar {7}) não pode ser ativada
    expect(tg.pending?.kind === 'priority' && tg.pending.actions.some((a) => a.label.includes('Blackblade Reforged: Equipar'))).toBe(false);
  });
});
