import { describe, expect, it } from 'vitest';
import { chars, hasKw } from '../../motor/api.ts';
import { fixture } from '../../testes/artefatos.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Katsumasa, the Animator';

describe(N, () => {
  it('{2}{U}: o artefato vira criatura 1/1 voadora; o Veículo fica com a força impressa', () => {
    const tg = setup({ battlefield: [[N, 'Sol Ring', "Cultivator's Caravan", ...Array(6).fill('Island')], []] });
    tg.choose('artefato alvo que não é criatura', ['Sol Ring']).activate(N, '{2}{U}').resolve();
    const anel = tg.bf('Sol Ring');
    expect(chars(tg.g, anel).types).toEqual(['Artifact', 'Creature']);
    expect(tg.pt(anel)).toEqual([1, 1]);
    expect(hasKw(tg.g, anel, 'flying')).toBe(true);
    tg.choose('artefato alvo que não é criatura', ["Cultivator's Caravan"]).activate(N, '{2}{U}').resolve();
    expect(tg.pt(tg.bf("Cultivator's Caravan"))).toEqual([5, 5]);
  });

  it('na sua manutenção, um marcador +1/+1 em até três artefatos que não são criaturas', () => {
    const tg = fixture({ battlefield: [[N, 'Sol Ring', 'Gold Myr'], ['Sol Ring']] });
    let alvos: string[] = [];
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('até três artefatos alvo') ? (alvos = d.items.filter((i) => !i.disabled).map((i) => `${i.label}`), { kind: 'select', ids: d.items.filter((i) => !i.disabled).map((i) => i.id) }) : null));
    tg.passTo('upkeep', 0);
    expect(alvos).toEqual(['Sol Ring', 'Sol Ring']);
    expect(tg.state.objects[tg.bf('Sol Ring', 0)].counters['+1/+1']).toBe(1);
    expect(tg.state.objects[tg.bf('Sol Ring', 1)].counters['+1/+1']).toBe(1);
    expect(tg.state.objects[tg.bf('Gold Myr')].counters['+1/+1'] ?? 0).toBe(0);
  });
});
