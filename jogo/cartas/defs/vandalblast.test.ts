import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Vandalblast';
const montanhas = (n: number) => Array(n).fill('Mountain');

describe(N, () => {
  it('destrói o artefato alvo que você não controla', () => {
    const tg = setup({ battlefield: [[...montanhas(1), 'Sol Ring'], ['Sol Ring', 'Silver Myr', 'Elvish Mystic']], hand: [[N], []] });
    let alvos: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('que você não controla')) return null;
      alvos = d.items.filter((i) => !i.disabled).map((i) => i.label);
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Silver Myr')!.id] };
    });
    tg.cast(N).resolveAll();
    expect(alvos.sort()).toEqual(['Silver Myr', 'Sol Ring']);
    expect(tg.find('Silver Myr')).toBeNull();
    expect(tg.find('Sol Ring', 'battlefield', 1)).not.toBeNull();
    expect(tg.find('Sol Ring', 'battlefield', 0)).not.toBeNull();
  });

  it('CR 702.96b: com a sobrecarga, destrói cada artefato que você não controla, sem alvos', () => {
    const tg = setup({ players: 3, battlefield: [[...montanhas(5), 'Sol Ring'], ['Sol Ring', 'Silver Myr', 'Elvish Mystic'], ['Sol Ring']], hand: [[N], [], []] });
    let pediuAlvo = false;
    tg.script.push((d) => { if (d.kind === 'select' && d.prompt.includes('alvo')) pediuAlvo = true; return null; });
    tg.cast(N, 'overload').resolveAll();
    expect(pediuAlvo).toBe(false);
    expect(tg.find('Sol Ring', 'battlefield', 1)).toBeNull();
    expect(tg.find('Silver Myr')).toBeNull();
    expect(tg.find('Sol Ring', 'battlefield', 2)).toBeNull();
    // o seu artefato e o que não é artefato ficam
    expect(tg.find('Sol Ring', 'battlefield', 0)).not.toBeNull();
    expect(tg.find('Elvish Mystic')).not.toBeNull();
  });
});
