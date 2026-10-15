import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const MK = 'The Master of Keys';
const mana = ['Plains', 'Island', 'Swamp', 'Swamp', 'Swamp'];

describe(MK, () => {
  it('entra com X marcadores e moe duas vezes X; com ela fora do campo, ainda moe', () => {
    const tg = setup({ battlefield: [mana, []], hand: [[MK], []], library: [['Island', 'Forest', 'Swamp', 'Plains', 'Island'], []] });
    tg.number('valor de X', 2).cast(MK).resolve();
    const id = tg.bf(MK);
    expect(tg.state.zones.stack).toHaveLength(1);
    tg.resolve();
    expect(tg.state.objects[id].counters['+1/+1']).toBe(2);
    expect(tg.names(0, 'graveyard')).toEqual(['Island', 'Forest', 'Swamp', 'Plains']);
    expect(tg.pt(id)).toEqual([5, 5]);
  });

  it('conjura o encantamento do cemitério pagando o custo de mana e exilando outras três; sem três outras, não', () => {
    const tg = setup({ battlefield: [[MK, 'Plains', 'Plains', 'Plains'], []], graveyard: [['Ghostly Prison', 'Island', 'Forest', 'Swamp'], []] });
    const fuga = () => tg.actionIds().find((a) => a.includes('master-of-keys') && a.split(':')[1] === String(tg.find('Ghostly Prison', 'graveyard', 0)));
    expect(fuga()).toBeDefined();
    tg.answer({ kind: 'priority', action: fuga()! });
    tg.settle();
    expect(tg.names(0, 'exile').sort()).toEqual(['Forest', 'Island', 'Swamp']);
    expect(tg.all('Plains').every((x) => tg.state.objects[x].tapped)).toBe(true);
    tg.resolve();
    expect(tg.find('Ghostly Prison')).not.toBeNull();

    const tg2 = setup({ battlefield: [[MK, 'Plains', 'Plains', 'Plains'], []], graveyard: [['Ghostly Prison', 'Island', 'Forest'], []] });
    expect(tg2.actionIds().some((a) => a.includes('master-of-keys'))).toBe(false);
  });
});
