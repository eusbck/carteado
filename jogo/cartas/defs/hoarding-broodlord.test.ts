import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Hoarding Broodlord';

describe(NOME, () => {
  it('busca e exila virada para baixo; você joga a carta e as mágicas do exílio têm convocar', () => {
    const tg = setup({
      battlefield: [[...Array(8).fill('Swamp'), 'Wall of Omens', 'Wall of Omens'], []],
      hand: [[NOME], []], library: [['Island', 'Island', 'Wall of Omens'], []],
    });
    tg.choose('Convocar', []).choose('Procure', ['Wall of Omens']).cast(NOME).resolveAll();
    const ex = tg.find('Wall of Omens', 'exile')!;
    expect(tg.state.objects[ex].faceDown).toBe(true);
    // sem terrenos desvirados, a Wall of Omens exilada ({1}{W}) só se paga convocando as duas Walls brancas
    const acao = tg.actionIds().find((a) => a.startsWith('cast:') && a.split(':').includes(String(ex)));
    expect(acao).toBeDefined();
    tg.choose('Convocar', ['Wall of Omens', 'Wall of Omens']);
    tg.answer({ kind: 'priority', action: acao! });
    tg.resolveAll();
    expect(tg.all('Wall of Omens')).toHaveLength(3);
  });
});
