import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { chars, hasKw } from '../../motor/chars.ts';

describe('Lingering Souls', () => {
  it('cria duas fichas de criatura Spirit 1/1 brancas com voar', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains'], []], hand: [['Lingering Souls'], []] });
    tg.cast('Lingering Souls').resolve();
    const fichas = tg.all('Spirit');
    expect(fichas.length).toBe(2);
    for (const id of fichas) {
      expect(tg.pt(id)).toEqual([1, 1]);
      expect(chars(tg.g, id).colors).toEqual(['W']);
      expect(hasKw(tg.g, id, 'flying')).toBe(true);
    }
    expect(tg.names(0, 'graveyard')).toEqual(['Lingering Souls']);
  });

  it('por retrospectiva, do cemitério sem ter sido conjurada antes: cria as fichas e vai para o exílio', () => {
    // a carta começa no cemitério sem ter sido conjurada
    const tg = setup({ battlefield: [['Swamp', 'Plains'], []], graveyard: [['Lingering Souls'], []] });
    tg.cast('Lingering Souls', 'flashback').resolve();
    expect(tg.all('Spirit').length).toBe(2);
    expect(tg.names(0, 'graveyard')).toEqual([]);
    expect(tg.names(0, 'exile')).toEqual(['Lingering Souls']);
    // pagou {1}{B}: os dois terrenos viraram
    expect(tg.state.zones.battlefield.filter((id) => tg.state.objects[id].tapped).length).toBe(2);
  });

  it('CR 702.34a, 307.1: por retrospectiva, só no tempo de feitiço', () => {
    const tg = setup({ active: 1, battlefield: [['Swamp', 'Plains'], []], graveyard: [['Lingering Souls'], []] });
    tg.pass(); // Bruno passa; Ana recebe prioridade no turno de Bruno
    expect(tg.pending?.player).toBe(0);
    expect(tg.canCast('Lingering Souls')).toBe(false);
    const meu = setup({ battlefield: [['Swamp', 'Plains'], []], graveyard: [['Lingering Souls'], []] });
    expect(meu.canCast('Lingering Souls')).toBe(true);
  });

  it('CR 702.34a: anulada depois de conjurada por retrospectiva, vai para o exílio', () => {
    const tg = setup({ battlefield: [['Swamp', 'Plains'], ['Island', 'Island']], graveyard: [['Lingering Souls'], []], hand: [[], ['Counterspell']] });
    tg.cast('Lingering Souls', 'flashback').pass();
    tg.choose('mágica alvo', ['Lingering Souls']).cast('Counterspell').resolve();
    expect(tg.state.zones.stack.length).toBe(0);
    expect(tg.all('Spirit').length).toBe(0);
    expect(tg.names(0, 'exile')).toEqual(['Lingering Souls']);
    expect(tg.names(0, 'graveyard')).toEqual([]);
  });
});
