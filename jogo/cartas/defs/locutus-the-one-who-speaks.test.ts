import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Locutus, the One Who Speaks';

describe(N, () => {
  it('as criaturas artefato que você controla recebem +1/+1', () => {
    const tg = setup({ battlefield: [[N, { name: 'Borg', token: true }], []] });
    expect(tg.pt(tg.bf('Borg'))).toEqual([2, 2]);
  });

  it('da mão, {W}{B} e descartá-la: 2 de dano à criatura alvo e você ganha 2 de vida', () => {
    const tg = setup({ battlefield: [['Plains', 'Swamp'], ['Wall of Omens']], hand: [[N], []] });
    tg.choose('criatura alvo', ['Wall of Omens']).activate(N, 'Descarte').resolveAll();
    expect(tg.state.objects[tg.bf('Wall of Omens')].damage).toBe(2);
    expect(tg.life(0)).toBe(42);
    expect(tg.names(0, 'graveyard')).toEqual([N]);
  });
});
