import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Axebane Guardian', () => {
  it('X conta as criaturas com defensor; as cores são escolhidas ao ativar', () => {
    const tg = setup({ battlefield: [['Axebane Guardian', 'Wall of Omens', 'Indomitable Ancients'], []] });
    const act = tg.actionIds().find((a) => a.startsWith('mana:'))!;
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('cor da mana') ? { kind: 'select', ids: ['R'] } : null));
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('cor da mana') ? { kind: 'select', ids: ['G'] } : null));
    tg.answer({ kind: 'priority', action: act });
    tg.settle();
    expect(tg.state.players[0].manaPool.map((u) => u.type).sort()).toEqual(['G', 'R']);
  });

  it('paga um custo com as cores que faltam (pagamento automático)', () => {
    const tg = setup({ battlefield: [['Axebane Guardian', 'Wall of Omens'], ['Indomitable Ancients']], hand: [['Swords to Plowshares'], []] });
    tg.choose('criatura alvo', ['Indomitable Ancients']).cast('Swords to Plowshares');
    expect(tg.state.zones.stack.length).toBe(1);
  });
});
