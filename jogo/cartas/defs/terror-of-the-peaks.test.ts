import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { putOntoBattlefield } from '../../motor/api.ts';

const T = 'Terror of the Peaks';

describe(T, () => {
  it('o dano é a força da criatura que entrou', () => {
    const tg = setup({ battlefield: [[T], []], hand: [['Zetalpa, Primal Dawn'], []] });
    tg.choose('qualquer alvo', ['Bruno']);
    tg.run(putOntoBattlefield(tg.g, [{ id: tg.find('Zetalpa, Primal Dawn', 'hand', 0)!, controller: 0 }], 'effect'));
    tg.resolve();
    expect(tg.life(1)).toBe(36);
  });

  it('mágica de oponente com ela como alvo custa 3 de vida a mais', () => {
    // Bruno, no turno dele, conjura Avatar's Wrath escolhendo Terror of the Peaks como alvo: paga 3 de vida
    const tg = setup({ battlefield: [[T], ['Plains', 'Plains', 'Plains', 'Plains']], hand: [[], ["Avatar's Wrath"]], active: 1 });
    tg.choose('até uma criatura alvo', [T]).cast("Avatar's Wrath");
    expect(tg.life(1)).toBe(37);
    expect(tg.state.zones.stack.length).toBe(1);
  });

  it('a sua própria mágica não paga vida', () => {
    const tg = setup({ battlefield: [[T, 'Plains', 'Plains', 'Plains', 'Plains'], []], hand: [["Avatar's Wrath"], []] });
    tg.choose('até uma criatura alvo', [T]).cast("Avatar's Wrath");
    expect(tg.life(0)).toBe(40);
  });
});
