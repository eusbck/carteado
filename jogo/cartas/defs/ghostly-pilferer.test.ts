import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Ghostly Pilferer';

describe(N, () => {
  it('dispara na etapa de desvirar e vai para a pilha na manutenção; pagando {2}, compra uma carta', () => {
    const tg = setup({ step: 'end', active: 1, battlefield: [[{ name: N, tapped: true }, 'Sol Ring'], []] });
    tg.yes('Pagar {2}', true);
    tg.passUntil((x) => x.state.turn.active === 0 && x.state.turn.step === 'upkeep');
    expect(tg.state.zones.stack).toHaveLength(1);
    tg.resolve();
    expect(tg.state.zones.hand[0]).toHaveLength(1);
  });

  it('quando um oponente conjura uma mágica de fora da mão, você compra; da mão, não', () => {
    const tg = setup({ active: 1, battlefield: [[N], ['Mountain', 'Mountain', 'Mountain', 'Swamp']], graveyard: [[], ['Faithless Looting']], hand: [[], ['Faithless Looting']] });
    tg.cast('Faithless Looting', 'hand').resolveAll();
    expect(tg.state.zones.hand[0]).toHaveLength(0);
    tg.cast('Faithless Looting', 'flashback').resolveAll();
    expect(tg.state.zones.hand[0]).toHaveLength(1);
  });

  it('descartando uma carta, não pode ser bloqueada neste turno', () => {
    const tg = setup({ step: 'beginCombat', battlefield: [[N], ['Indomitable Ancients']], hand: [['Plains'], []] });
    tg.activate(N).resolve();
    expect(tg.names(0, 'graveyard')).toEqual(['Plains']);
    tg.attack([[N, 1]]).passTo('main2');
    expect(tg.life(1)).toBe(38);
  });
});
