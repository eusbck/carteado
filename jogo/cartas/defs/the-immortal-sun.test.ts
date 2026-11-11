import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'The Immortal Sun';

describe(N, () => {
  it('as suas mágicas custam {1} a menos e as do oponente não', () => {
    const tg = setup({ battlefield: [[N, 'Plains'], ['Plains']], hand: [['Wall of Omens'], ['Wall of Omens']] });
    expect(tg.canCast('Wall of Omens')).toBe(true);
    tg.cast('Wall of Omens').resolveAll();
    expect(tg.find('Wall of Omens', 'battlefield', 0)).not.toBeNull();
    // suas criaturas recebem +1/+1
    expect(tg.pt(tg.bf('Wall of Omens', 0))).toEqual([1, 5]);
  });

  it('compra uma carta a mais na sua etapa de compra', () => {
    const tg = setup({ battlefield: [[N], []], step: 'upkeep' });
    const mao = tg.state.zones.hand[0].length;
    tg.passTo('main1');
    expect(tg.state.zones.hand[0].length).toBe(mao + 2);
  });

  it('ninguém pode ativar habilidades de lealdade', () => {
    const J = 'Jace, Architect of Thought';
    const acoesDoJace = (tg: ReturnType<typeof setup>) => tg.actionIds().filter((a) => a.startsWith('act:') && a.split(':').includes(String(tg.bf(J))));
    const sem = setup({ battlefield: [[], [J]], active: 1 });
    expect(acoesDoJace(sem).length).toBeGreaterThan(0);
    const com = setup({ battlefield: [[N], [J]], active: 1 });
    expect(acoesDoJace(com)).toEqual([]);
  });
});
