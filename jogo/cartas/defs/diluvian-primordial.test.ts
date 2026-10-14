import { describe, expect, it } from 'vitest';
import { enterCard, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Diluvian Primordial';

describe(N, () => {
  it('no máximo uma carta alvo por oponente', () => {
    const tg = setup({ players: 3, battlefield: [[], [], []], graveyard: [['Kodama\'s Reach'], ['Rampant Growth', 'Stolen Goods'], ['Baleful Strix']] });
    let opcoes: string[] = [];
    let max = 0;
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('instantânea ou feitiço alvo')) return null;
      opcoes = d.items.map((i) => i.label).sort();
      max = d.max;
      return { kind: 'select', ids: [] };
    });
    enterCard(tg, N, 0);
    tg.resolveAll();
    // só as de oponentes; a criatura de Carla não serve
    expect(opcoes).toEqual(['Rampant Growth', 'Stolen Goods']);
    expect(max).toBe(2);
  });

  it('conjura uma de cada vez; a mágica conjurada assim é exilada depois de resolver', () => {
    const tg = setup({ battlefield: [[], []], graveyard: [[], ['Rampant Growth']], library: [['Forest', 'Island'], []] });
    tg.choose('instantânea ou feitiço alvo', ['Rampant Growth']).choose('escolha uma mágica para conjurar', ['Rampant Growth']).choose('Procure uma carta de terreno básico', ['Forest']);
    enterCard(tg, N, 0);
    tg.resolveAll();
    expect(tg.find('Forest')).not.toBeNull();
    expect(tg.find('Rampant Growth', 'exile')).not.toBeNull();
    expect(tg.names(1, 'graveyard')).toEqual([]);
  });

  it('a carta que você não conjura fica no cemitério do dono', () => {
    const tg = setup({ battlefield: [[], []], graveyard: [[], ['Rampant Growth']] });
    tg.choose('instantânea ou feitiço alvo', ['Rampant Growth']).choose('escolha uma mágica para conjurar', ['Não conjurar']);
    enterCard(tg, N, 0);
    tg.resolveAll();
    expect(tg.names(1, 'graveyard')).toEqual(['Rampant Growth']);
  });
});
