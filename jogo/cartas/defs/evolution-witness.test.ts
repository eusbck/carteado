import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Evolution Witness';

describe(N, () => {
  it('adaptar põe dois marcadores e devolve uma carta de permanente; com marcador, adaptar não põe nada', () => {
    const tg = setup({ battlefield: [[N, 'Forest', 'Forest', 'Forest', 'Forest'], []], graveyard: [['Sol Ring', 'Damning Verdict'], []] });
    let opcoes: string[] = [];
    tg.script.push((d) => {
      if (d.kind === 'select' && d.prompt.includes('carta de permanente alvo')) {
        opcoes = d.items.filter((i) => !i.disabled).map((i) => i.label);
        return { kind: 'select', ids: [d.items.find((i) => i.label.includes('Sol Ring'))!.id] };
      }
      return null;
    });
    tg.activate(N).resolve();
    tg.resolveAll();
    expect(tg.state.objects[tg.bf(N)].counters['+1/+1']).toBe(2);
    expect(tg.names(0, 'hand')).toEqual(['Sol Ring']);
    expect(opcoes.some((l) => l.includes('Damning Verdict'))).toBe(false);
    tg.activate(N).resolve();
    tg.resolveAll();
    expect(tg.state.objects[tg.bf(N)].counters['+1/+1']).toBe(2);
  });
});
