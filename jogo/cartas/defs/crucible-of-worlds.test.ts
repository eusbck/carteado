import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Crucible of Worlds';

describe(N, () => {
  it('o terreno do cemitério usa a jogada de terreno do turno', () => {
    const tg = setup({ battlefield: [[N], []], hand: [['Island'], []], graveyard: [['Forest'], ['Swamp']] });
    const floresta = tg.find('Forest', 'graveyard')!;
    const pantano = tg.find('Swamp', 'graveyard', 1)!;
    expect(tg.actionIds().some((a) => a.startsWith('play:') && a.split(':').includes(String(pantano)))).toBe(false);
    const acao = tg.actionIds().find((a) => a.startsWith('play:') && a.split(':').includes(String(floresta)))!;
    expect(acao).toBeDefined();
    tg.answer({ kind: 'priority', action: acao });
    tg.settle();
    expect(tg.find('Forest')).not.toBeNull();
    expect(tg.actionIds().some((a) => a.startsWith('play:'))).toBe(false);
  });
});
