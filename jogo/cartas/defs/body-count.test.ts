import { describe, expect, it } from 'vitest';
import { destroy, gainLife, loseLife } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Body Count';
const forests = Array(10).fill('Forest');

describe(N, () => {
  it('compra uma carta para cada criatura que morreu sob o seu controle neste turno', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Elvish Mystic', 'Silver Myr'], ['Wall of Omens']], hand: [[N], []], library: [forests, forests] });
    tg.run(destroy(tg.g, [tg.bf('Elvish Mystic'), tg.bf('Silver Myr'), tg.bf('Wall of Omens')]));
    tg.cast(N).resolveAll();
    // duas criaturas suas morreram; a do oponente não conta
    expect(tg.names(0, 'hand')).toHaveLength(2);
  });

  it('sem criatura sua morta no turno, não compra', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp'], []], hand: [[N], []], library: [forests, forests] });
    tg.cast(N).resolveAll();
    expect(tg.names(0, 'hand')).toEqual([]);
  });

  it('CR 702.137a: com um oponente tendo perdido vida neste turno, pode ser conjurada por {B}', () => {
    const tg = setup({ players: 3, battlefield: [['Swamp'], [], []], hand: [[N], [], []], library: [forests, forests, forests] });
    // só com um Swamp o custo normal {2}{B} não é pagável
    expect(tg.canCast(N)).toBe(false);
    loseLife(tg.g, 2, 1, null);
    tg.refresh();
    expect(tg.canCast(N)).toBe(true);
    tg.cast(N, 'spectacle').resolveAll();
    expect(tg.find(N, 'graveyard', 0)).not.toBeNull();
    expect(tg.state.objects[tg.bf('Swamp')].tapped).toBe(true);
  });

  it('vale ter perdido vida no turno, mesmo que o oponente ganhe vida depois', () => {
    const tg = setup({ battlefield: [['Swamp'], []], hand: [[N], []], library: [forests, forests] });
    loseLife(tg.g, 1, 1, null);
    gainLife(tg.g, 1, 5, null);
    tg.refresh();
    expect(tg.canCast(N)).toBe(true);
    // você ter perdido vida não habilita o espetáculo
    const eu = setup({ battlefield: [['Swamp'], []], hand: [[N], []], library: [forests, forests] });
    loseLife(eu.g, 0, 1, null);
    eu.refresh();
    expect(eu.canCast(N)).toBe(false);
  });
});
