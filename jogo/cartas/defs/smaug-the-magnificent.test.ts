import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { createTokens } from '../../motor/api.ts';

const S = 'Smaug the Magnificent';

describe(S, () => {
  it('no início da sua manutenção, cria um Tesouro', () => {
    const tg = setup({ battlefield: [[S], []], library: [['Island', 'Island'], ['Island', 'Island']], active: 1 });
    tg.passUntil((x) => x.state.turn.active === 0 && x.state.turn.step === 'upkeep' && x.state.zones.stack.length > 0);
    tg.resolve();
    expect(tg.names(0, 'battlefield').filter((x) => x === 'Treasure').length).toBe(1);
  });
  it('atacando, causa dano igual ao número de Tesouros que você controla a qualquer alvo', () => {
    const tg = setup({ battlefield: [[S], ['Indomitable Ancients']], library: [['Island'], ['Island']] });
    tg.run(createTokens(tg.g, 0, 'Treasure', 3));
    tg.choose('qualquer alvo', ['Indomitable Ancients']);
    tg.attack([[S, 1]]).passUntil((x) => x.state.turn.step === 'declareAttackers' && x.state.zones.stack.length > 0);
    tg.resolve();
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].damage).toBe(3);
  });
});
