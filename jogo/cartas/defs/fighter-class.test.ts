import { describe, expect, it } from 'vitest';
import { validateBlocks } from '../../motor/combat.ts';
import { setup } from '../../testes/harness.ts';

const C = 'Fighter Class';

describe(C, () => {
  it('ao entrar, busca um Equipamento', () => {
    const tg = setup({ battlefield: [['Mountain', 'Plains'], []], hand: [[C], []], library: [['Basilisk Collar', 'Opt'], []] });
    tg.choose('Equipamento', ['Basilisk Collar']);
    tg.cast(C).resolveAll();
    expect(tg.names(0, 'hand')).toContain('Basilisk Collar');
  });
  it('nível 2: equipar custa {2} a menos', () => {
    const tg = setup({ battlefield: [[C, 'Basilisk Collar', 'Elvish Mystic'], []] });
    tg.state.objects[tg.bf(C)].classLevel = 2;
    tg.refresh();
    tg.activate('Basilisk Collar', 'Equipar').resolve();
    expect(tg.state.objects[tg.bf('Basilisk Collar')].attachedTo).toBe(tg.bf('Elvish Mystic'));
  });
  it('nível 3: a criatura alvo precisa bloquear a atacante', () => {
    const tg = setup({ battlefield: [[C, { name: 'Elvish Mystic', ready: true }], ['Wall of Omens']], step: 'main1' });
    tg.state.objects[tg.bf(C)].classLevel = 3;
    tg.refresh();
    tg.choose('até uma criatura alvo', ['Wall of Omens']);
    tg.attack([['Elvish Mystic', 1]]).passTo('declareAttackers');
    tg.resolveAll();
    expect(validateBlocks(tg.g, 1, [])).not.toBeNull();
    expect(validateBlocks(tg.g, 1, [[tg.bf('Wall of Omens'), tg.bf('Elvish Mystic')]])).toBeNull();
  });
});
