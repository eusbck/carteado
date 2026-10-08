import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { untap } from '../../motor/api.ts';

describe('Hall of Oracles', () => {
  it('marcador só depois de conjurar instantânea ou feitiço neste turno', () => {
    const tg = setup({ battlefield: [['Hall of Oracles', 'Swamp', 'Swamp', 'Swamp', 'Wall of Omens'], []], hand: [["Night's Whisper"], []], library: [['Island', 'Island'], []] });
    const acoes = () => { tg.settle(); const d = tg.pending; return d?.kind === 'priority' ? d.actions.map((a) => a.label).filter((l) => l.includes('marcador +1/+1')) : []; };
    expect(acoes()).toEqual([]);
    tg.cast("Night's Whisper").resolve();
    untap(tg.g, tg.bf('Hall of Oracles')); // o pagamento automático pode ter usado o Hall
    tg.refresh();
    expect(acoes().length).toBe(1);
    tg.choose('criatura alvo', ['Wall of Omens']).activate('Hall of Oracles', 'marcador').resolve();
    expect(tg.pt(tg.bf('Wall of Omens'))).toEqual([1, 5]);
  });
});
