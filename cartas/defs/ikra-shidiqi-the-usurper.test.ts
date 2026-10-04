import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Ikra Shidiqi, the Usurper', () => {
  it('a vida ganha é a resistência na resolução', () => {
    const tg = setup({ battlefield: [['Ikra Shidiqi, the Usurper', 'Indomitable Ancients', 'Swamp', 'Swamp', 'Swamp'], []], hand: [['Toxic Deluge'], []] });
    tg.attack([['Indomitable Ancients', 1]]).passTo('combatDamage');
    // o gatilho já resolveu: 2/10 → ganhou 10
    expect(tg.life(0)).toBe(50);
    expect(tg.life(1)).toBe(38);
  });
  it('se a criatura saiu do campo, usa a resistência que ela tinha', () => {
    const tg = setup({ battlefield: [['Ikra Shidiqi, the Usurper', 'Indomitable Ancients', 'Swamp', 'Swamp'], []], hand: [['Infernal Grasp'], []] });
    tg.attack([['Indomitable Ancients', 1]]);
    tg.passUntil((x) => x.state.zones.stack.length === 1);
    tg.choose('criatura alvo', ['Indomitable Ancients']).cast('Infernal Grasp').resolve();
    tg.resolve();
    expect(tg.find('Indomitable Ancients')).toBeNull();
    expect(tg.life(0)).toBe(40 - 2 + 10);
  });
});
