import { describe, expect, it } from 'vitest';
import { alternativasDeMana, setup } from '../../testes/padroes.ts';
import { chars } from '../../motor/chars.ts';

const NOME = "Minamo, School at Water's Edge";

describe(NOME, () => {
  it('CR 605: mana que produz; é um terreno lendário', () => {
    expect(alternativasDeMana(NOME)).toEqual(['U']);
    const tg = setup({ battlefield: [[NOME], []] });
    expect(chars(tg.g, tg.bf(NOME)).supertypes).toEqual(['Legendary']);
  });
  it('{U}, {T}: desvira a permanente lendária alvo (de qualquer jogador)', () => {
    const tg = setup({ battlefield: [[NOME, 'Island', { name: 'Wall of Omens', tapped: true }], [{ name: 'Gau, Feral Youth', tapped: true }]] });
    let alvos: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('permanente lendária alvo')) return null;
      alvos = d.items.filter((i) => !i.disabled).map((i) => i.label).sort();
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Gau, Feral Youth')!.id] };
    });
    tg.activate(NOME, 'Desvire').resolve();
    // Minamo é lendária: pode ser alvo de si mesma; Wall of Omens não é lendária
    expect(alvos).toEqual(['Gau, Feral Youth', NOME]);
    expect(tg.state.objects[tg.bf('Gau, Feral Youth')].tapped).toBe(false);
    expect(tg.state.objects[tg.bf('Wall of Omens')].tapped).toBe(true);
  });
});
