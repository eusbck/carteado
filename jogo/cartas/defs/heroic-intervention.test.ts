import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { enterCard, fixture as setup } from '../../testes/artefatos.ts';

const NOME = 'Heroic Intervention';

describe(NOME, () => {
  it('as suas permanentes ganham resistência a magia e indestrutível até o fim do turno; as dos oponentes não', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Indomitable Ancients', 'Sol Ring'], ['Wall of Omens']], hand: [[NOME], []] });
    tg.cast(NOME).resolve();
    for (const n of ['Indomitable Ancients', 'Sol Ring', 'Forest']) {
      expect(hasKw(tg.g, tg.bf(n), 'hexproof')).toBe(true);
      expect(hasKw(tg.g, tg.bf(n), 'indestructible')).toBe(true);
    }
    expect(hasKw(tg.g, tg.bf('Wall of Omens'), 'indestructible')).toBe(false);
    tg.passTo('upkeep', 1);
    expect(hasKw(tg.g, tg.bf('Indomitable Ancients'), 'indestructible')).toBe(false);
  });

  it('CR 611.2c — a permanente que entra depois da resolução não ganha nada', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest'], []], hand: [[NOME], []] });
    tg.cast(NOME).resolve();
    const id = enterCard(tg, 'Wall of Omens', 0)!;
    expect(hasKw(tg.g, id, 'indestructible')).toBe(false);
  });
});
