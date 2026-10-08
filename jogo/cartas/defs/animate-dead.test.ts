import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { controllerOf, destroy } from '../../motor/api.ts';

describe('Animate Dead', () => {
  it('a Aura mira a carta no cemitério e volta presa à criatura; ao sair, a criatura é sacrificada', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], []], hand: [['Animate Dead'], []], graveyard: [[], ['Glissa Sunslayer']] });
    tg.choose('carta de criatura num cemitério', ['Glissa Sunslayer']);
    tg.cast('Animate Dead').resolve().resolveAll();
    const g = tg.bf('Glissa Sunslayer');
    expect(controllerOf(tg.g, g)).toBe(0);
    expect(tg.state.objects[tg.bf('Animate Dead')].attachedTo).toBe(g);
    expect(tg.pt(g)).toEqual([2, 3]);
    tg.run(destroy(tg.g, [tg.bf('Animate Dead')]));
    tg.resolveAll();
    expect(tg.find('Glissa Sunslayer')).toBeNull();
    expect(tg.names(1, 'graveyard')).toEqual(['Glissa Sunslayer']);
  });
});
