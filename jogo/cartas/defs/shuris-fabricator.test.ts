import { describe, expect, it } from 'vitest';
import { fixture as setup, removeCard } from '../../testes/artefatos.ts';

const N = "Shuri's Fabricator";

describe(N, () => {
  it('entrando, cria dois Vibranium virados', () => {
    const tg = setup({ battlefield: [Array(4).fill('Island'), []], hand: [[N], []] });
    tg.cast(N).resolveAll();
    const fichas = tg.all('Vibranium');
    expect(fichas).toHaveLength(2);
    for (const id of fichas) expect(tg.state.objects[id].tapped).toBe(true);
  });

  it('{6}, {T}: devolve um artefato do cemitério com um marcador de finalidade; se fosse para o cemitério, é exilado', () => {
    const tg = setup({ battlefield: [[N, ...Array(6).fill('Island')], []], graveyard: [['Sol Ring', 'Forest'], []] });
    tg.activate(N).resolveAll();
    const anel = tg.bf('Sol Ring');
    expect(tg.state.objects[anel].counters.finality).toBe(1);
    removeCard(tg, anel);
    expect(tg.find('Sol Ring', 'exile')).not.toBeNull();
    expect(tg.names(0, 'graveyard')).toEqual(['Forest']);
  });
});