import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const acao = (tg: ReturnType<typeof setup>) => tg.actionIds().some((a) => a.startsWith(`act:${tg.bf('Ghoulcaller Gisa')}:`));

describe('Ghoulcaller Gisa', () => {
  it('sacrifica outra criatura e cria fichas Zombie 2/2 pretas iguais à força dela', () => {
    const tg = setup({ battlefield: [['Ghoulcaller Gisa', 'Swamp', 'Blight Pile'], []] });
    tg.choose('Sacrifique', ['Blight Pile']).activate('Ghoulcaller Gisa').resolve();
    const zumbis = tg.all('Zombie');
    expect(zumbis.length).toBe(3);
    expect(zumbis.every((id) => tg.state.objects[id].def === 'Zombie 2/2' && tg.pt(id)[0] === 2 && tg.pt(id)[1] === 2)).toBe(true);
    expect(tg.names(0, 'graveyard')).toEqual(['Blight Pile']);
    expect(tg.state.objects[tg.bf('Ghoulcaller Gisa')].tapped).toBe(true);
  });

  it('CR 608.2h: usa a força da criatura como estava no campo (com marcadores)', () => {
    const tg = setup({ battlefield: [['Ghoulcaller Gisa', 'Swamp', { name: 'Viscera Seer', counters: { '+1/+1': 3 } }], []] });
    tg.choose('Sacrifique', ['Viscera Seer']).activate('Ghoulcaller Gisa').resolve();
    expect(tg.all('Zombie').length).toBe(4);
  });

  it('criatura de força 0 não cria fichas; "outra": sem outra criatura não pode ativar', () => {
    const tg = setup({ battlefield: [['Ghoulcaller Gisa', 'Swamp'], []] });
    expect(acao(tg)).toBe(false);
    const tg2 = setup({ battlefield: [['Ghoulcaller Gisa', 'Swamp', 'Tree of Perdition'], []] });
    tg2.choose('Sacrifique', ['Tree of Perdition']).activate('Ghoulcaller Gisa').resolve();
    expect(tg2.all('Zombie').length).toBe(0);
    expect(tg2.names(0, 'graveyard')).toEqual(['Tree of Perdition']);
  });

  it('CR 302.6: como comandante, conjurada da zona de comando só ativa a partir do turno seguinte', () => {
    const tg = setup({
      battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp', 'Swamp', 'Swamp', 'Blight Pile'], []],
      command: [['Ghoulcaller Gisa'], []],
      library: [['Island', 'Island'], ['Island', 'Island']],
    });
    tg.cast('Ghoulcaller Gisa', 'command').resolve();
    expect(tg.find('Ghoulcaller Gisa')).not.toBeNull();
    expect(acao(tg)).toBe(false); // enjoo de invocação: o custo tem {T}
    tg.passTo('main1', 1).passTo('main1', 0);
    expect(acao(tg)).toBe(true);
    tg.choose('Sacrifique', ['Blight Pile']).activate('Ghoulcaller Gisa').resolve();
    expect(tg.all('Zombie').length).toBe(3);
  });
});
