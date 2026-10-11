import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Conduit of Worlds';

describe(N, () => {
  it('você joga um terreno do seu cemitério, como a jogada de terreno do turno', () => {
    const tg = setup({ battlefield: [[N], []], hand: [['Island'], []], graveyard: [['Forest'], ['Swamp']] });
    const floresta = tg.find('Forest', 'graveyard')!;
    const acao = tg.actionIds().find((a) => a.startsWith('play:') && a.split(':').includes(String(floresta)))!;
    expect(acao).toBeDefined();
    tg.answer({ kind: 'priority', action: acao });
    tg.settle();
    expect(tg.find('Forest')).not.toBeNull();
    // foi a jogada de terreno do turno
    expect(tg.actionIds().some((a) => a.startsWith('play:'))).toBe(false);
  });

  it('sem ter conjurado mágica no turno, você conjura a carta do cemitério e não conjura mais nada no turno', () => {
    const tg = setup({ battlefield: [[N, 'Island', 'Island', 'Island'], []], hand: [['Sol Ring'], []], graveyard: [['Silver Myr', 'Forest'], []] });
    tg.yes('Conduit of Worlds', true);
    tg.activate(N).resolveAll();
    expect(tg.find('Silver Myr')).not.toBeNull();
    expect(tg.canCast('Sol Ring')).toBe(false);
    tg.passTo('upkeep', 1).passTo('main1', 0);
    expect(tg.canCast('Sol Ring')).toBe(true);
  });

  it('tendo conjurado uma mágica no turno, a habilidade não deixa conjurar a carta', () => {
    const tg = setup({ battlefield: [[N, 'Island', 'Island', 'Island'], []], hand: [['Sol Ring'], []], graveyard: [['Silver Myr'], []] });
    tg.cast('Sol Ring').resolveAll();
    tg.script.push((d) => { if (d.kind === 'select' && d.prompt.includes('Conduit of Worlds: conjurar')) throw new Error('não devia oferecer'); return null; });
    tg.activate(N).resolveAll();
    expect(tg.find('Silver Myr')).toBeNull();
  });
});