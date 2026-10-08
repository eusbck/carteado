import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { counter, manaValue } from '../../motor/api.ts';

const NOME = 'Army of the Damned';
const terrenos = (n: number) => Array(n).fill('Swamp');

describe(NOME, () => {
  it('cria treze fichas Zombie 2/2 pretas viradas', () => {
    const tg = setup({ battlefield: [terrenos(8), []], hand: [[NOME], []] });
    tg.cast(NOME).resolve();
    const z = tg.all('Zombie');
    expect(z.length).toBe(13);
    expect(z.every((id) => tg.state.objects[id].tapped && tg.state.objects[id].def === 'Zombie 2/2' && tg.state.objects[id].controller === 0)).toBe(true);
    expect(tg.names(0, 'graveyard')).toEqual([NOME]);
  });

  it('por retrospectiva, paga o custo dela e vai para o exílio', () => {
    const tg = setup({ battlefield: [terrenos(10), []], graveyard: [[NOME], []] });
    expect(manaValue(tg.g, tg.find(NOME, 'graveyard')!)).toBe(8);
    tg.cast(NOME, 'flashback');
    expect(tg.state.zones.battlefield.filter((id) => tg.state.objects[id].def === 'Swamp' && tg.state.objects[id].tapped).length).toBe(10);
    tg.resolve();
    expect(tg.all('Zombie').length).toBe(13);
    expect(tg.names(0, 'exile')).toEqual([NOME]);
    expect(tg.names(0, 'graveyard')).toEqual([]);
  });

  it('por retrospectiva, só no tempo de feitiço; com 9 terrenos não dá para pagar', () => {
    const turnoDoOponente = setup({ active: 1, battlefield: [terrenos(10), []], graveyard: [[NOME], []] });
    turnoDoOponente.pass();
    expect(turnoDoOponente.canCast(NOME)).toBe(false);
    const pouco = setup({ battlefield: [terrenos(9), []], graveyard: [[NOME], []] });
    expect(pouco.canCast(NOME)).toBe(false);
  });

  it('por retrospectiva, anulada também vai para o exílio', () => {
    const tg = setup({ battlefield: [terrenos(10), []], graveyard: [[NOME], []] });
    tg.cast(NOME, 'flashback');
    const magica = tg.state.zones.stack[tg.state.zones.stack.length - 1];
    tg.run(counter(tg.g, magica));
    expect(tg.names(0, 'exile')).toEqual([NOME]);
    expect(tg.all('Zombie').length).toBe(0);
  });
});
