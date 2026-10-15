import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Eris, Roar of the Storm';

describe(N, () => {
  it('custa {2} a menos por valor de mana diferente entre as instantâneas e feitiços do cemitério', () => {
    // Opt (1), Think Twice (2), Lock and Load (3), Opt repetida não conta de novo, terreno não conta: {8}{U}{R} - 6
    const tg = setup({ battlefield: [['Island', 'Mountain', 'Island', 'Island'], []], hand: [[N], []], graveyard: [['Opt', 'Opt', 'Think Twice', 'Lock and Load', 'Forest'], []] });
    tg.cast(N).resolveAll();
    expect(tg.find(N)).not.toBeNull();
  });

  it('sem o desconto suficiente, não dá para conjurar', () => {
    const tg = setup({ battlefield: [['Island', 'Mountain', 'Island', 'Island'], []], hand: [[N], []], graveyard: [['Opt', 'Think Twice'], []] });
    expect(tg.canCast(N)).toBe(false);
  });

  it('conjurada como segunda mágica do turno, a próxima é a terceira e não dispara; antes disso, a segunda dispara', () => {
    const tg = setup({ battlefield: [['Island', 'Mountain', 'Island', 'Island', 'Island', 'Island'], []], hand: [['Opt', N, 'Opt'], []], graveyard: [['Opt', 'Think Twice', 'Lock and Load'], []], library: [Array(5).fill('Plains'), []] });
    tg.cast('Opt').resolveAll();
    tg.cast(N).resolveAll();
    tg.cast('Opt');
    // só a Opt na pilha (a bravura de Eris dispara, o gatilho de segunda mágica não)
    expect(tg.state.zones.stack.filter((id) => tg.state.objects[id].stack?.kind === 'triggered')).toHaveLength(1);
    tg.resolveAll();
    expect(tg.find('Dragon Elemental')).toBeNull();

    const outra = setup({ battlefield: [[N, 'Island', 'Island'], []], hand: [['Opt', 'Opt'], []], library: [Array(5).fill('Plains'), []] });
    outra.cast('Opt').resolveAll();
    outra.cast('Opt').resolveAll();
    expect(outra.all('Dragon Elemental')).toHaveLength(1);
    // e Eris ganhou +1/+1 duas vezes pela bravura
    expect(outra.pt(outra.bf(N))).toEqual([6, 6]);
  });
});
