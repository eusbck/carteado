import { describe, expect, it } from 'vitest';
import { chars, controllerOf } from '../../motor/chars.ts';
import { fixture as setup, removeCard } from '../../testes/artefatos.ts';

const N = 'Assimilate the Wounded';

describe(N, () => {
  it('assimila a carta de criatura que foi do campo para o cemitério do oponente neste turno; a que já estava lá não serve', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp'], ['Wall of Omens']], graveyard: [[], ['Indomitable Ancients']], hand: [[N], []] });
    removeCard(tg, tg.bf('Wall of Omens'));
    tg.resolveAll();
    let ofertas: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('carta de criatura alvo')) return null;
      ofertas = d.items.filter((i) => !i.disabled).map((i) => i.label);
      const i = d.items.find((x) => x.label.includes('Wall of Omens'));
      return i ? { kind: 'select', ids: [i.id] } : null;
    });
    tg.cast(N).resolveAll();
    expect(ofertas.some((l) => l.includes('Indomitable Ancients'))).toBe(false);
    const muro = tg.bf('Wall of Omens');
    expect(controllerOf(tg.g, muro)).toBe(0);
    expect(chars(tg.g, muro).subtypes).toEqual(['Borg']);
    expect(tg.state.objects[muro].counters['+1/+1']).toBe(1);
  });
});
