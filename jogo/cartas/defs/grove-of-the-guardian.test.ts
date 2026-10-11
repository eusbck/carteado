import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { alternativasDeMana } from '../../testes/padroes.ts';
import { hasKw } from '../../motor/chars.ts';

const NOME = 'Grove of the Guardian';

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(['C']));
  it('pode virar criaturas que acabaram de entrar', () => {
    const tg = setup({ battlefield: [[NOME, 'Forest', 'Plains', 'Sol Ring', 'Plains', { name: 'Elvish Mystic', ready: false }, { name: 'Wall of Omens', ready: false }], []] });
    tg.activate(NOME, 'Elemental').resolve();
    expect(tg.find(NOME)).toBeNull();
    expect(tg.state.objects[tg.bf('Elvish Mystic')].tapped).toBe(true);
    expect(tg.state.objects[tg.bf('Wall of Omens')].tapped).toBe(true);
    const el = tg.bf('Elemental');
    expect(tg.pt(el)).toEqual([8, 8]);
    expect(hasKw(tg.g, el, 'vigilance')).toBe(true);
    expect(tg.state.objects[el].controller).toBe(0);
  });
  it('sem duas criaturas desviradas, não pode ativar', () => {
    const tg = setup({ battlefield: [[NOME, 'Forest', 'Plains', 'Sol Ring', 'Plains', 'Elvish Mystic', { name: 'Wall of Omens', tapped: true }], []] });
    expect(tg.actionIds().some((a) => a.startsWith(`act:${tg.bf(NOME)}:`))).toBe(false);
  });
});
