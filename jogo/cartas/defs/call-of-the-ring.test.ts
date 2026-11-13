import { describe, expect, it } from 'vitest';
import { ringTemptations, ringTempts } from '../../motor/api.ts';
import { fixture as setup, runEffect } from '../../testes/artefatos.ts';

const N = 'Call of the Ring';

describe(N, () => {
  it('na sua manutenção o Anel tenta você; ao escolher o Portador, pode pagar 2 de vida para comprar', () => {
    const tg = setup({ active: 1, battlefield: [[N, 'Elvish Mystic'], []] });
    tg.yes('Call of the Ring: pagar 2 de vida', true);
    tg.passTo('main1', 0);
    expect(ringTemptations(tg.g, 0)).toBe(1);
    expect(tg.life(0)).toBe(38);
    expect(tg.names(0, 'hand')).toHaveLength(2); // a compra do Call e a da etapa de compra
  });

  it('escolher de novo o mesmo Portador do Anel dispara de novo', () => {
    const tg = setup({ battlefield: [[N, 'Elvish Mystic'], []] });
    tg.yes('Call of the Ring: pagar 2 de vida', true).yes('Call of the Ring: pagar 2 de vida', true);
    runEffect(tg, ringTempts(tg.g, 0));
    tg.resolveAll();
    runEffect(tg, ringTempts(tg.g, 0));
    tg.resolveAll();
    expect(tg.life(0)).toBe(36);
    expect(tg.names(0, 'hand')).toHaveLength(2);
  });

  it('sem criatura para escolher, o Anel tenta mas a segunda habilidade não dispara', () => {
    const tg = setup({ battlefield: [[N], []] });
    runEffect(tg, ringTempts(tg.g, 0));
    tg.resolveAll();
    expect(ringTemptations(tg.g, 0)).toBe(1);
    expect(tg.state.zones.stack).toHaveLength(0);
    expect(tg.life(0)).toBe(40);
  });
});
