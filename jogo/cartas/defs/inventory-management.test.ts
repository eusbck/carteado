import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Inventory Management';

describe(N, () => {
  it('CR 702.61a — com ela na pilha, ninguém conjura mágicas nem ativa habilidades que não são de mana; habilidades de mana continuam', () => {
    const tg = setup({ battlefield: [['Mountain', 'Plains', 'Silver Myr', 'Loxodon Warhammer'], ['Mountain', 'Plains', 'Plains', 'Llanowar Elves']], hand: [[N], ['Lightning Bolt']] });
    tg.cast(N);
    tg.pass();
    // Bruno tem prioridade com a mágica na pilha
    expect(tg.pending?.player).toBe(1);
    const acoes = tg.pending?.kind === 'priority' ? tg.pending.actions : [];
    expect(acoes.some((a) => a.kind === 'cast')).toBe(false);
    expect(acoes.some((a) => a.kind === 'activate')).toBe(false);
    expect(acoes.some((a) => a.kind === 'mana')).toBe(true);
  });

  it('depois que ela resolve, os jogadores voltam a poder conjurar e ativar', () => {
    const tg = setup({ battlefield: [['Mountain', 'Plains', 'Mountain', 'Silver Myr'], []], hand: [[N, 'Lightning Bolt'], []] });
    tg.cast(N);
    expect(tg.canCast('Lightning Bolt')).toBe(false);
    tg.resolve();
    expect(tg.canCast('Lightning Bolt')).toBe(true);
  });

  it('cada Aura e Equipamento seu pode ir para uma criatura sua; a Aura só para onde pode encantar', () => {
    const tg = setup({
      battlefield: [['Mountain', 'Plains', 'Silver Myr', 'Llanowar Elves', { name: 'Loxodon Warhammer', attachTo: 'Silver Myr' }, 'Lightning Greaves',
        { name: 'Ethereal Armor', attachTo: 'Silver Myr' }], ['Wall of Omens']],
      hand: [[N], []],
    });
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('anexar Loxodon Warhammer') ? { kind: 'select', ids: [d.items.find((i) => i.label === 'Llanowar Elves')!.id] } : null));
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('anexar Lightning Greaves') ? { kind: 'select', ids: [d.items.find((i) => i.label === 'Silver Myr')!.id] } : null));
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('anexar Ethereal Armor') ? { kind: 'select', ids: [] } : null));
    tg.cast(N).resolveAll();
    expect(tg.state.objects[tg.bf('Loxodon Warhammer')].attachedTo).toBe(tg.bf('Llanowar Elves'));
    expect(tg.state.objects[tg.bf('Lightning Greaves')].attachedTo).toBe(tg.bf('Silver Myr'));
    expect(tg.state.objects[tg.bf('Ethereal Armor')].attachedTo).toBe(tg.bf('Silver Myr'));
  });
});
