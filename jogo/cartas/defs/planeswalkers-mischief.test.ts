import { describe, expect, it } from 'vitest';
import { fixture as setup, removeCard } from '../../testes/artefatos.ts';

const N = "Planeswalker's Mischief";
const ilhas = ['Island', 'Island', 'Island', 'Island'];

describe(N, () => {
  it('conjurada de graça, a carta resolve e vai para o cemitério do dono', () => {
    // Night's Whisper: você compra duas cartas e perde 2 de vida
    const tg = setup({ battlefield: [[N, ...ilhas], []], hand: [[], ["Night's Whisper"]] });
    tg.activate(N).resolveAll();
    const carta = tg.state.zones.exile[0];
    expect(tg.state.objects[carta].def).toBe("Night's Whisper");
    const acao = tg.actionIds().find((a) => a.startsWith('cast:') && a.split(':').includes(String(carta)))!;
    expect(acao).toBeDefined();
    tg.answer({ kind: 'priority', action: acao });
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toHaveLength(2);
    expect(tg.life(0)).toBe(38);
    expect(tg.names(1, 'graveyard')).toEqual(["Night's Whisper"]);
    tg.passTo('upkeep', 1);
    expect(tg.names(1, 'hand')).toEqual([]);
  });

  it("sem conjurar, a carta volta para a mão do dono na próxima etapa final, mesmo sem Planeswalker's Mischief no campo", () => {
    const tg = setup({ battlefield: [[N, ...ilhas], []], hand: [[], ["Night's Whisper"]] });
    tg.activate(N).resolveAll();
    expect(tg.names(1, 'hand')).toEqual([]);
    removeCard(tg, tg.bf(N));
    tg.passTo('upkeep', 1);
    expect(tg.names(1, 'hand')).toEqual(["Night's Whisper"]);
    expect(tg.state.zones.exile).toHaveLength(0);
  });

  it('carta que não é instantânea nem feitiço só é revelada', () => {
    const tg = setup({ battlefield: [[N, ...ilhas], []], hand: [[], ['Sol Ring']] });
    tg.activate(N).resolveAll();
    expect(tg.names(1, 'hand')).toEqual(['Sol Ring']);
    expect(tg.state.zones.exile).toHaveLength(0);
  });

  it('com o oponente sem cartas na mão, nada acontece', () => {
    const tg = setup({ battlefield: [[N, ...ilhas], []] });
    tg.activate(N).resolveAll();
    expect(tg.state.zones.exile).toHaveLength(0);
    expect(tg.state.delayedTriggers).toHaveLength(0);
  });

  it('só pode ser ativada como feitiço', () => {
    const tg = setup({ active: 1, battlefield: [[N, ...ilhas], []], hand: [[], ['Sol Ring']] });
    tg.pass();
    expect(tg.pending?.player).toBe(0);
    expect(tg.actionIds().some((a) => a.startsWith('act:'))).toBe(false);
  });
});
