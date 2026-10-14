import { describe, expect, it } from 'vitest';
import { fixture as setup, removeCard } from '../../testes/artefatos.ts';

const N = 'Angelic Sleuth';

describe(N, () => {
  it('outro permanente seu com marcadores que sai do campo faz você investigar; sem marcadores, não', () => {
    const tg = setup({ battlefield: [[N, { name: 'Segovian Angel', counters: { '+1/+1': 1 } }, 'Slither Blade'], [{ name: 'Baleful Strix', counters: { '+1/+1': 1 } }]] });
    removeCard(tg, tg.bf('Segovian Angel'));
    removeCard(tg, tg.bf('Slither Blade'));
    removeCard(tg, tg.bf('Baleful Strix'));
    tg.resolveAll();
    expect(tg.all('Clue')).toHaveLength(1);
  });
});
