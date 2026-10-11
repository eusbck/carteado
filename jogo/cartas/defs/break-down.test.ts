import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Break Down';

describe(N, () => {
  it('destrói o artefato ou encantamento alvo e cria uma ficha Junk', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Forest'], ['Sol Ring']], hand: [[N], []] });
    tg.choose('artefato ou encantamento alvo', ['Sol Ring']).cast(N).resolveAll();
    expect(tg.find('Sol Ring')).toBeNull();
    expect(tg.find('Junk')).not.toBeNull();
  });

  it('a ficha Junk exila o topo do grimório e deixa jogar essa carta neste turno, pagando os custos', () => {
    const tg = setup({ battlefield: [[{ name: 'Junk', token: true }], []], library: [['Island', 'Forest'], []] });
    tg.activate('Junk').resolveAll();
    expect(tg.find('Junk')).toBeNull();
    const carta = tg.find('Island', 'exile')!;
    expect(carta).not.toBeNull();
    const jogar = tg.actionIds().find((a) => a.startsWith('play:') && a.split(':').includes(String(carta)))!;
    expect(jogar).toBeDefined();
    tg.answer({ kind: 'priority', action: jogar });
    tg.settle();
    expect(tg.find('Island')).not.toBeNull();
  });
});