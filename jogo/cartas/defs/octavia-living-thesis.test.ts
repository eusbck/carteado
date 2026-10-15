import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Octavia, Living Thesis';
const magicas = (n: number) => Array(n).fill('Opt');

describe(N, () => {
  it('com oito instantâneas e feitiços no cemitério, custa só {U}{U}', () => {
    const tg = setup({ battlefield: [['Island', 'Island'], []], hand: [[N], []], graveyard: [magicas(8), []] });
    tg.cast(N).resolveAll();
    expect(tg.find(N)).not.toBeNull();
  });

  it('com sete, não dá para conjurar com duas Ilhas', () => {
    const tg = setup({ battlefield: [['Island', 'Island'], []], hand: [[N], []], graveyard: [magicas(7), []] });
    expect(tg.canCast(N)).toBe(false);
  });

  it('magecraft: a criatura alvo tem força e resistência base 8/8 até o fim do turno, com os marcadores por cima', () => {
    const tg = setup({ battlefield: [[N, 'Island', { name: 'Wall of Omens', counters: { '+1/+1': 1 } }], []], hand: [['Opt'], []], library: [['Plains', 'Swamp'], []] });
    tg.choose('criatura alvo', ['Wall of Omens']).cast('Opt').resolveAll();
    expect(tg.pt(tg.bf('Wall of Omens'))).toEqual([9, 9]);
    tg.passTo('cleanup');
    expect(tg.pt(tg.bf('Wall of Omens'))).toEqual([1, 5]);
  });

  it('copiar uma instantânea também dispara', () => {
    const tg = setup({ battlefield: [[N, 'Twinning Staff', ...Array(8).fill('Island')], []], hand: [['Opt'], []], library: [['Plains', 'Swamp', 'Forest'], []] });
    tg.cast('Opt');
    tg.resolve();
    tg.choose('que você controla', ['Opt']).activate('Twinning Staff');
    tg.resolve();
    // a habilidade do Staff criou duas cópias (uma dela e a adicional do próprio Staff): dois gatilhos de magecraft
    const octavia = tg.bf(N);
    const gatilhos = tg.state.zones.stack.filter((id) => tg.state.objects[id].stack?.kind === 'triggered' && tg.state.objects[id].stack?.source === octavia);
    expect(gatilhos).toHaveLength(2);
  });

  it('resguardo {8}', () => {
    const tg = setup({ active: 1, battlefield: [[N], ['Swamp', 'Swamp']], hand: [[], ['Infernal Grasp']] });
    tg.yes('Pagar {8}', false).choose('criatura alvo', [N]).cast('Infernal Grasp').resolveAll();
    expect(tg.find(N)).not.toBeNull();
  });
});
