import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Mightform Harmonizer';
const dobra = (tg: ReturnType<typeof setup>) =>
  tg.actionIds().find((a) => a.startsWith('cast:') && a.includes(':perm:warp') && a.split(':').includes(String(tg.find(N, 'hand'))));

describe(N, () => {
  it('dobra a força da criatura alvo até o fim do turno', () => {
    const tg = setup({ battlefield: [[N, 'Tunneling Geopede'], []], hand: [['Forest'], []] });
    tg.choose('criatura alvo que você controla', ['Tunneling Geopede']).play('Forest');
    tg.resolveAll();
    expect(tg.pt(tg.bf('Tunneling Geopede'))).toEqual([6, 2]);
  });
  it('dobra {2}{G}: conjurada da mão pelo custo de dobra e exilada na etapa final', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Forest'], []], hand: [[N], []], library: [Array(3).fill('Island'), Array(3).fill('Island')] });
    const acao = dobra(tg);
    expect(acao).toBeDefined();
    tg.answer({ kind: 'priority', action: acao! });
    tg.resolve();
    expect(tg.find(N)).not.toBeNull();
    tg.passTo('end', 0);
    expect(tg.find(N, 'exile', 0)).not.toBeNull();
  });
});
