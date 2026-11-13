import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Nahiri, Forged in Fury';

describe(N, () => {
  it('afinidade com Equipamentos: custa {1} a menos para cada Equipamento que você controla', () => {
    const tg = setup({ battlefield: [['Mountain', 'Plains', 'Lightning Greaves', 'Swiftfoot Boots', 'Shadowspear', 'Loxodon Warhammer'], []], hand: [[N], []] });
    expect(tg.canCast(N)).toBe(true);
    const caro = setup({ battlefield: [['Mountain', 'Plains', 'Lightning Greaves'], []], hand: [[N], []] });
    expect(caro.canCast(N)).toBe(false);
  });

  it('um gatilho por criatura equipada que ataca', () => {
    const tg = setup({
      battlefield: [[N, 'Silver Myr', 'Llanowar Elves', 'Jumbo Cactuar', { name: 'Lightning Greaves', attachTo: 'Silver Myr' }, { name: 'Loxodon Warhammer', attachTo: 'Silver Myr' }, { name: 'Swiftfoot Boots', attachTo: 'Llanowar Elves' }], []],
      library: [['Island', 'Swamp', 'Forest'], []], step: 'beginCombat',
    });
    tg.attack([['Silver Myr', 1], ['Llanowar Elves', 1], ['Jumbo Cactuar', 1]]).passTo('declareBlockers');
    expect(tg.names(0, 'exile').sort()).toEqual(['Island', 'Swamp']);
  });

  it('o Equipamento exilado pode ser conjurado de graça ou pagando o custo', () => {
    const tg = setup({
      battlefield: [[N, 'Silver Myr', { name: 'Lightning Greaves', attachTo: 'Silver Myr' }], []],
      library: [['Loxodon Warhammer', 'Island'], []], step: 'beginCombat',
    });
    tg.attack([['Silver Myr', 1]]).passTo('main2', 0);
    const martelo = tg.find('Loxodon Warhammer', 'exile')!;
    const opcoes = tg.pending?.kind === 'priority' ? tg.pending.actions.filter((a) => a.obj === martelo).map((a) => a.label) : [];
    expect(opcoes.some((l) => l.includes('sem pagar'))).toBe(true);
    const acao = tg.pending?.kind === 'priority' ? tg.pending.actions.find((a) => a.obj === martelo && a.label.includes('sem pagar'))! : null;
    tg.answer({ kind: 'priority', action: acao!.id });
    tg.resolveAll();
    expect(tg.find('Loxodon Warhammer', 'battlefield', 0)).not.toBeNull();
  });

  it('a carta que não é Equipamento segue as regras normais e paga o custo', () => {
    const tg = setup({
      battlefield: [[N, 'Silver Myr', { name: 'Lightning Greaves', attachTo: 'Silver Myr' }], []],
      library: [['Wall of Omens', 'Island'], []], step: 'beginCombat',
    });
    tg.attack([['Silver Myr', 1]]).passTo('main2', 0);
    // sem mana, a muralha exilada não pode ser conjurada
    expect(tg.canCast('Wall of Omens')).toBe(false);
  });
});
