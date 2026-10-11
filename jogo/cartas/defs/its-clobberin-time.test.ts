import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = "It's Clobberin' Time!";
const DANO = 'A criatura alvo que você controla causa dano igual à força dela à criatura alvo que um oponente controla';
const DESTRUIR = 'Destrua o artefato ou encantamento alvo';
const forests = Array(10).fill('Forest');

describe(N, () => {
  it('primeiro modo: a sua criatura causa dano igual à força dela à criatura do oponente, sem levar dano de volta', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Forest', 'Zetalpa, Primal Dawn'], ['Indomitable Ancients']], hand: [[N], []], library: [forests, forests] });
    tg.choose('modo', [DANO]).choose('que você controla', ['Zetalpa, Primal Dawn']).choose('que um oponente controla', ['Indomitable Ancients']);
    tg.cast(N).resolveAll();
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].damage).toBe(4);
    expect(tg.state.objects[tg.bf('Zetalpa, Primal Dawn')].damage).toBe(0);
  });

  it('segundo modo: destrói o artefato ou encantamento alvo', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Forest'], ['Sol Ring', 'Indomitable Ancients']], hand: [[N], []], library: [forests, forests] });
    let alvos: string[] = [];
    tg.choose('modo', [DESTRUIR]);
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('artefato ou encantamento alvo')) return null;
      alvos = d.items.filter((i) => !i.disabled).map((i) => i.label);
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Sol Ring')!.id] };
    });
    tg.cast(N).resolveAll();
    expect(alvos).toEqual(['Sol Ring']);
    expect(tg.find('Sol Ring')).toBeNull();
  });

  it('CR 702.88a: ricochete — na sua próxima manutenção pode escolher outro modo, sem pagar', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Forest', 'Zetalpa, Primal Dawn'], ['Indomitable Ancients', 'Sol Ring']], hand: [[N], []], library: [forests, forests] });
    tg.choose('modo', [DESTRUIR]).choose('artefato ou encantamento alvo', ['Sol Ring']).cast(N).resolveAll();
    expect(tg.find(N, 'exile')).not.toBeNull();
    tg.yes('Ricochete', true).choose('modo', [DANO]).choose('que você controla', ['Zetalpa, Primal Dawn']).choose('que um oponente controla', ['Indomitable Ancients']);
    tg.passTo('upkeep', 0);
    tg.resolveAll();
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].damage).toBe(4);
    expect(tg.find(N, 'graveyard', 0)).not.toBeNull();
  });
});
