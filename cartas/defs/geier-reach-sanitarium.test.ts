import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { alternativasDeMana } from '../../testes/padroes.ts';
import { isLegendary } from '../../motor/api.ts';

const NOME = 'Geier Reach Sanitarium';

describe(NOME, () => {
  it('CR 605: produz {C}; é lendário', () => {
    expect(alternativasDeMana(NOME)).toEqual(['C']);
    const tg = setup({ battlefield: [[NOME], []] });
    expect(isLegendary(tg.g, tg.bf(NOME))).toBe(true);
  });

  it('cada jogador compra; depois escolhem em ordem APNAP e descartam todos juntos', () => {
    const tg = setup({
      players: 3, active: 1,
      battlefield: [[], [NOME, 'Sol Ring'], []],
      hand: [['Plains'], ['Swamp'], []],
      library: [['Island'], ['Forest'], ['Mountain']],
    });
    const ordem: number[] = [];
    const maos: number[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('escolha uma carta para descartar')) return null;
      ordem.push(d.player);
      // quem já escolheu ainda não descartou: as mãos continuam cheias até todos escolherem
      maos.push(tg.state.zones.hand[0].length + tg.state.zones.hand[1].length);
      return { kind: 'select', ids: [d.items.find((i) => i.label === (d.player === 1 ? 'Swamp' : 'Island'))!.id] };
    });
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('escolha uma carta para descartar')) return null;
      ordem.push(d.player);
      maos.push(tg.state.zones.hand[0].length + tg.state.zones.hand[1].length);
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Island')!.id] };
    });
    tg.activate(NOME, 'Cada jogador').resolve();
    // Bruno (ativo) escolhe antes de Ana (CR 101.4); Carla tem uma carta só e não precisa escolher
    expect(ordem).toEqual([1, 0]);
    expect(maos).toEqual([4, 4]);
    expect(tg.names(1, 'hand')).toEqual(['Forest']);
    expect(tg.names(1, 'graveyard')).toEqual(['Swamp']);
    expect(tg.names(0, 'hand')).toEqual(['Plains']);
    expect(tg.names(0, 'graveyard')).toEqual(['Island']);
    expect(tg.names(2, 'hand')).toEqual([]);
    expect(tg.names(2, 'graveyard')).toEqual(['Mountain']);
  });

  it('com a mão vazia, cada um descarta a carta que acabou de comprar', () => {
    const tg = setup({ battlefield: [[NOME, 'Sol Ring'], []], library: [['Island'], ['Forest']] });
    tg.activate(NOME, 'Cada jogador').resolve();
    expect(tg.names(0, 'graveyard')).toEqual(['Island']);
    expect(tg.names(1, 'graveyard')).toEqual(['Forest']);
    expect(tg.names(0, 'hand')).toEqual([]);
  });
});
