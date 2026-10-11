import { describe, expect, it } from 'vitest';
import { enterCard, fixture } from '../../testes/artefatos.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Spit Flame';

describe(N, () => {
  it('causa 4 de dano à criatura alvo', () => {
    const tg = setup({ battlefield: [['Mountain', 'Mountain', 'Mountain'], ['Indomitable Ancients']], hand: [[N], []] });
    tg.choose('criatura alvo', ['Indomitable Ancients']).cast(N).resolveAll();
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].damage).toBe(4);
    expect(tg.find(N, 'graveyard', 0)).not.toBeNull();
  });

  it('no cemitério, quando um Dragon que você controla entra, pagando {R} ela volta para a mão', () => {
    const tg = fixture({ battlefield: [['Mountain'], []], graveyard: [[N], []] });
    enterCard(tg, 'Goldspan Dragon', 0);
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toContain(N);
    expect(tg.state.objects[tg.bf('Mountain')].tapped).toBe(true);
  });

  it('sem pagar, fica no cemitério; Dragon de outro jogador e criatura que não é Dragon não disparam', () => {
    const recusa = fixture({ battlefield: [['Mountain'], []], graveyard: [[N], []] });
    recusa.script.push((d) => (d.kind === 'payment' ? { kind: 'payment', cancel: true } : null));
    enterCard(recusa, 'Goldspan Dragon', 0);
    recusa.resolveAll();
    expect(recusa.find(N, 'graveyard', 0)).not.toBeNull();
    expect(recusa.state.objects[recusa.bf('Mountain')].tapped).toBe(false);

    const tg = fixture({ battlefield: [['Mountain'], []], graveyard: [[N], []] });
    enterCard(tg, 'Goldspan Dragon', 1);
    enterCard(tg, 'Elvish Mystic', 0);
    tg.resolveAll();
    expect(tg.find(N, 'graveyard', 0)).not.toBeNull();
    expect(tg.state.objects[tg.bf('Mountain')].tapped).toBe(false);
  });
});
