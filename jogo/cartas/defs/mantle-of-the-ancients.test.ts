import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Mantle of the Ancients';

describe(N, () => {
  it('devolve Auras e Equipamentos do cemitério anexados à criatura encantada, que recebe +1/+1 por cada um', () => {
    const tg = setup({ battlefield: [[...Array(5).fill('Plains'), 'Wall of Omens'], []], hand: [[N], []], graveyard: [['Shadowspear', "Hero's Blade", 'Sol Ring'], []] });
    tg.choose('criatura que você controla', ['Wall of Omens']);
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('Aura e/ou de Equipamento')) return null;
      expect(d.items.map((i) => i.label).sort()).toEqual(["Hero's Blade", 'Shadowspear']);
      return { kind: 'select', ids: d.items.map((i) => i.id) };
    });
    tg.cast(N).resolveAll();
    const muro = tg.bf('Wall of Omens');
    expect(tg.state.objects[tg.bf('Shadowspear')].attachedTo).toBe(muro);
    expect(tg.state.objects[tg.bf("Hero's Blade")].attachedTo).toBe(muro);
    // 0/4, +1/+1 da lança, +3/+2 da lâmina, +3/+3 pelos três anexos
    expect(tg.pt(muro)).toEqual([7, 10]);
  });
});