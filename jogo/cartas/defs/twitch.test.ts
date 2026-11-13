import { describe, expect, it } from 'vitest';
import { destroy } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Twitch';
const ilhas = ['Island', 'Island', 'Island'];

describe(N, () => {
  it('desvira o terreno alvo e compra uma carta', () => {
    const tg = setup({ battlefield: [ilhas, [{ name: 'Forest', tapped: true }]], hand: [[N], []], library: [['Opt'], []] });
    tg.choose('artefato, criatura ou terreno alvo', ['Forest']).yes('Twitch: desvirar', true).cast(N).resolve();
    expect(tg.state.objects[tg.bf('Forest')].tapped).toBe(false);
    expect(tg.names(0, 'hand')).toEqual(['Opt']);
  });
  it('vira a criatura alvo, ou pode não fazer nada e só comprar', () => {
    const tg = setup({ battlefield: [ilhas, ['Elvish Mystic']], hand: [[N], []], library: [['Opt'], []] });
    tg.choose('artefato, criatura ou terreno alvo', ['Elvish Mystic']).yes('Twitch: virar', false).cast(N).resolve();
    expect(tg.state.objects[tg.bf('Elvish Mystic')].tapped).toBe(false);
    expect(tg.names(0, 'hand')).toEqual(['Opt']);
  });
  it('não mira encantamento', () => {
    const tg = setup({ battlefield: [ilhas, ['Rhystic Study', 'Forest']], hand: [[N], []] });
    let alvos: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('artefato, criatura ou terreno alvo')) return null;
      alvos = d.items.map((i) => i.label);
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Forest')!.id] };
    });
    tg.cast(N);
    expect(alvos).not.toContain('Rhystic Study');
    expect(alvos).toContain('Forest');
  });
  it('com o alvo ilegal na resolução, a mágica não resolve e você não compra', () => {
    const tg = setup({ battlefield: [ilhas, ['Elvish Mystic']], hand: [[N], []], library: [['Opt'], []] });
    tg.choose('artefato, criatura ou terreno alvo', ['Elvish Mystic']).cast(N);
    tg.run(destroy(tg.g, [tg.bf('Elvish Mystic')]));
    tg.resolve();
    expect(tg.names(0, 'hand')).toEqual([]);
  });
});
