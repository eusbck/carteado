import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { activateMana } from '../../testes/artefatos.ts';
import { entraVirado } from '../../testes/padroes.ts';
import { hasKw } from '../../motor/api.ts';

const AG = 'Arena of Glory';

describe(AG, () => {
  it('entra virado sem uma Mountain; desvirado com uma', () => {
    expect(entraVirado(AG)).toBe(true);
    expect(entraVirado(AG, ['Mountain'])).toBe(false);
  });

  it('a mana pode ser gasta em qualquer coisa; numa mágica de criatura, ela ganha ímpeto', () => {
    const tg = setup({ battlefield: [[AG, 'Mountain', 'Mountain', 'Mountain'], []], hand: [['Dragon Whelp'], []] });
    activateMana(tg, 'Mountain', 'R');
    activateMana(tg, AG, 'R}{R');
    expect(tg.state.players[0].manaPool.map((u) => u.type)).toEqual(['R', 'R']);
    // exaurido: não desvira na próxima etapa de desvirar
    expect(tg.state.objects[tg.bf(AG)].data.skipNextUntap).toBe(true);
    tg.cast('Dragon Whelp').resolve();
    expect(hasKw(tg.g, tg.bf('Dragon Whelp'), 'haste')).toBe(true);
  });

  it('exaurido, não desvira na sua próxima etapa de desvirar', () => {
    const tg = setup({ battlefield: [[AG, 'Mountain'], []], library: [['Island', 'Island'], ['Island', 'Island']] });
    activateMana(tg, 'Mountain', 'R');
    activateMana(tg, AG, 'R}{R');
    tg.passTo('main1', 1).passTo('main1', 0);
    expect(tg.state.objects[tg.bf(AG)].tapped).toBe(true);
    expect(tg.state.objects[tg.bf('Mountain')].tapped).toBe(false);
  });
});
