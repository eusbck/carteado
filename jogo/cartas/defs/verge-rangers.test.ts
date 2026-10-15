import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const jogarDoTopo = (tg: ReturnType<typeof setup>) => tg.actionIds().find((a) => a.startsWith('play:') && a.includes('perm:verge-rangers'));

describe('Verge Rangers', () => {
  it('com um oponente com mais terrenos, joga o terreno do topo; isso usa a jogada de terreno do turno', () => {
    const tg = setup({ battlefield: [['Verge Rangers'], ['Forest', 'Forest']], hand: [['Plains'], []], library: [['Island', 'Swamp'], []] });
    const acao = jogarDoTopo(tg);
    expect(acao).toBeDefined();
    tg.answer({ kind: 'priority', action: acao! });
    tg.settle();
    expect(tg.find('Island')).not.toBeNull();
    expect(tg.names(0, 'library')).toEqual(['Swamp']);
    // a jogada de terreno já foi: nem o da mão nem o do topo
    expect(tg.actionIds().some((a) => a.startsWith('play:'))).toBe(false);
  });

  it('sem oponente com mais terrenos, ou com uma mágica no topo, não há a opção', () => {
    const tg = setup({ battlefield: [['Verge Rangers', 'Plains'], ['Forest']], library: [['Island'], []] });
    expect(jogarDoTopo(tg)).toBeUndefined();
    const tg2 = setup({ battlefield: [['Verge Rangers'], ['Forest']], library: [['Wall of Omens'], []] });
    expect(tg2.actionIds().some((a) => a.includes('perm:verge-rangers'))).toBe(false);
  });
});
