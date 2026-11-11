import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const C = 'Firion, Wild Rose Warrior';

describe(C, () => {
  it('cria a cópia, com o equipar mais barato, e ela é sacrificada na próxima manutenção', () => {
    const tg = setup({ battlefield: [[C, 'Plains', 'Plains', 'Elvish Mystic'], []], hand: [['Basilisk Collar'], []], library: [['Opt', 'Opt'], ['Opt', 'Opt']] });
    tg.cast('Basilisk Collar').resolveAll();
    expect(tg.all('Basilisk Collar').length).toBe(2);
    const ficha = tg.all('Basilisk Collar').find((id) => tg.state.objects[id].isToken)!;
    // equipar {2} da ficha sai por {0}: sem mana, ainda dá
    tg.choose('criatura alvo', ['Elvish Mystic']);
    const acao = tg.actionIds().find((a) => a.split(':').includes(String(ficha)) && !a.startsWith('mana'));
    expect(acao, tg.actionIds().join(' | ')).toBeDefined();
    tg.answer({ kind: 'priority', action: acao! });
    tg.settle();
    tg.resolveAll();
    expect(tg.state.objects[ficha].attachedTo).toBe(tg.bf('Elvish Mystic'));
    expect(hasKw(tg.g, tg.bf('Elvish Mystic'), 'haste')).toBe(true);
    tg.passTo('upkeep', 1);
    tg.resolveAll();
    expect(tg.all('Basilisk Collar').length).toBe(1);
  });
});
