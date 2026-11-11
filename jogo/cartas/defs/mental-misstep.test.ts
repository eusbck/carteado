import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Mental Misstep';

describe(NOME, () => {
  it('paga {U/P} com 2 de vida e anula a mágica de valor 1', () => {
    const tg = setup({ battlefield: [[], ['Swamp']], hand: [[NOME], ['Dark Ritual']], active: 1 });
    tg.cast('Dark Ritual');
    tg.pass();
    let vida = false;
    tg.script.push((d) => (d.kind === 'payment' && !vida ? ((vida = true), { kind: 'payment', life: 1 }) : null));
    tg.choose('mágica alvo', ['Dark Ritual']).cast(NOME).resolve();
    expect(tg.names(1, 'graveyard')).toEqual(['Dark Ritual']);
    expect(tg.life(0)).toBe(38);
  });

  it('só mira mágicas com valor de mana 1; X conta pelo valor escolhido na pilha', () => {
    const tg = setup({ battlefield: [['Island'], ['Swamp', 'Swamp']], hand: [[NOME], ['Cabal Ritual']], active: 1 });
    tg.cast('Cabal Ritual');
    tg.pass();
    expect(tg.canCast(NOME)).toBe(false);
  });
});
