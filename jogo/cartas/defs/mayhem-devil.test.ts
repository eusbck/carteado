import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Mayhem Devil';

describe(N, () => {
  it('dispara quando um oponente sacrifica, e você escolhe o alvo', () => {
    const tg = setup({ battlefield: [[N], [{ name: 'Treasure', token: true }]] });
    tg.pass();
    const d = tg.pending!;
    if (d.kind !== 'priority' || d.player !== 1) throw new Error('sem prioridade do oponente');
    const acao = d.actions.find((a) => a.label.startsWith('Treasure'))!;
    tg.choose('qualquer alvo', ['Bruno']);
    tg.answer({ kind: 'priority', action: acao.id });
    tg.settle();
    expect(tg.state.zones.stack.length).toBe(1);
    tg.resolve();
    expect(tg.life(1)).toBe(39);
  });
  it('sacrificado para pagar um custo, o gatilho resolve antes da habilidade', () => {
    const tg = setup({ battlefield: [[N, 'Elvish Reclaimer', 'Forest', 'Forest', 'Swamp'], []], library: [['Island'], []] });
    tg.choose('qualquer alvo', ['Bruno']).choose('Sacrifique', ['Swamp']).choose('Procure uma carta de terreno', ['Island']).activate('Elvish Reclaimer');
    expect(tg.state.zones.stack.length).toBe(2);
    tg.resolve();
    expect(tg.life(1)).toBe(39);
    expect(tg.find('Island')).toBeNull();
    tg.resolve();
    expect(tg.find('Island')).not.toBeNull();
  });
  it('sacrificado ele mesmo, ainda dispara', () => {
    const tg = setup({ battlefield: [[N, 'Mountain', 'Mountain'], []], hand: [['Fling'], []] });
    tg.choose('Sacrifique', [N]).choose('qualquer alvo', ['Bruno']).choose('qualquer alvo', ['Bruno']).cast('Fling');
    tg.resolveAll();
    expect(tg.life(1)).toBe(36);
  });
});
