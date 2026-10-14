import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { destroy } from '../../motor/api.ts';
import { hasKw } from '../../motor/chars.ts';

const NOME = 'Ancient Stone Idol';

describe(NOME, () => {
  it('custa {1} a menos para cada criatura atacante, inclusive as do oponente', () => {
    const terrenos = Array(8).fill('Plains');
    const tg = setup({ active: 1, battlefield: [terrenos, ['Indomitable Ancients', 'Zetalpa, Primal Dawn']], hand: [[NOME], []] });
    tg.attack([['Indomitable Ancients', 0], ['Zetalpa, Primal Dawn', 0]]);
    tg.passUntil((x) => x.pending?.player === 0 && x.state.turn.step === 'declareAttackers');
    // 10 - 2 atacantes = 8: os oito terrenos de Ana pagam
    tg.cast(NOME);
    expect(tg.state.zones.battlefield.filter((id) => tg.state.objects[id].def === 'Plains' && tg.state.objects[id].tapped).length).toBe(8);
    tg.resolve();
    expect(hasKw(tg.g, tg.bf(NOME), 'trample')).toBe(true);
  });

  it('sem atacantes, custa {10}', () => {
    const tg = setup({ battlefield: [Array(9).fill('Plains'), []], hand: [[NOME], []] });
    expect(tg.canCast(NOME)).toBe(false);
  });

  it('quando morre, cria um Construct 6/12 com atropelar', () => {
    const tg = setup({ battlefield: [[NOME], []] });
    tg.run(destroy(tg.g, [tg.bf(NOME)]));
    tg.resolveAll();
    const k = tg.bf('Construct');
    expect(tg.pt(k)).toEqual([6, 12]);
    expect(hasKw(tg.g, k, 'trample')).toBe(true);
  });
});
