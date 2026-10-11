import { describe, expect, it } from 'vitest';
import { createTokens } from '../../motor/api.ts';
import { hasKw } from '../../motor/chars.ts';
import { enterCard, fixture as setup, runEffect } from '../../testes/artefatos.ts';

const N = 'Qasali Slingers';

describe(N, () => {
  it('dispara ao entrar e de novo quando outro Cat seu entra', () => {
    const tg = setup({ battlefield: [[], ['Sol Ring', 'Impact Tremors', 'Silver Myr']] });
    tg.choose('artefato ou encantamento alvo', ['Sol Ring']);
    const id = enterCard(tg, N, 0)!;
    tg.resolveAll();
    expect(tg.pt(id)).toEqual([3, 5]);
    expect(hasKw(tg.g, id, 'reach')).toBe(true);
    expect(tg.names(1, 'battlefield')).toEqual(['Impact Tremors', 'Silver Myr']);
    tg.script.length = 0;
    tg.choose('artefato ou encantamento alvo', ['Impact Tremors']);
    runEffect(tg, createTokens(tg.g, 0, 'Cat', 1));
    tg.resolveAll();
    expect(tg.names(1, 'battlefield')).toEqual(['Silver Myr']);
  });

  it('é opcional; Cat do oponente não dispara', () => {
    const tg = setup({ battlefield: [[N], ['Sol Ring']] });
    runEffect(tg, createTokens(tg.g, 1, 'Cat', 1));
    expect(tg.state.zones.stack).toHaveLength(0);
    tg.choose('artefato ou encantamento alvo', []);
    runEffect(tg, createTokens(tg.g, 0, 'Cat', 1));
    tg.resolveAll();
    expect(tg.find('Sol Ring')).not.toBeNull();
  });
});
