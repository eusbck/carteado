import { describe, expect, it } from 'vitest';
import { putOntoBattlefield } from '../../motor/api.ts';
import { chars, nameOf } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = "Agadeem's Awakening // Agadeem, the Undercrypt";
const pantanos = (n: number) => Array(n).fill('Swamp');
// valores de mana: Elvish Mystic 1, Silver Myr 2, Wall of Omens 2, Indomitable Ancients 4
const cemiterio = ['Elvish Mystic', 'Silver Myr', 'Wall of Omens', 'Indomitable Ancients'];

describe(N, () => {
  it('com X = 3 volta uma criatura de cada valor de mana, nunca duas do mesmo', () => {
    const tg = setup({ battlefield: [pantanos(6), []], hand: [[N], []], graveyard: [cemiterio, []] });
    let oferecidas: string[] = [];
    tg.number('valor de X', 3);
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('valor de mana diferente')) return null;
      oferecidas = d.items.filter((i) => !i.disabled).map((i) => i.label);
      return { kind: 'select', ids: ['Elvish Mystic', 'Silver Myr'].map((n) => d.items.find((i) => i.label === n)!.id) };
    });
    tg.cast(N, 'hand').resolveAll();
    // a de valor 4 não cabe em X = 3
    expect(oferecidas.sort()).toEqual(['Elvish Mystic', 'Silver Myr', 'Wall of Omens']);
    expect(tg.names(0, 'battlefield').filter((n) => n !== 'Swamp').sort()).toEqual(['Elvish Mystic', 'Silver Myr']);
    expect(tg.names(0, 'graveyard').sort()).toEqual(["Agadeem's Awakening", 'Indomitable Ancients', 'Wall of Omens']);
  });

  it('duas cartas com o mesmo valor de mana não podem ser escolhidas juntas', () => {
    const tg = setup({ battlefield: [pantanos(6), []], hand: [[N], []], graveyard: [cemiterio, []] });
    tg.number('valor de X', 3).choose('valor de mana diferente', ['Silver Myr', 'Wall of Omens']);
    expect(() => tg.cast(N, 'hand')).toThrow();
  });

  it('com X = 0 só cabe carta de criatura de valor de mana 0', () => {
    const tg = setup({ battlefield: [pantanos(3), []], hand: [[N], []], graveyard: [cemiterio, []] });
    let oferecidas = -1;
    tg.number('valor de X', 0);
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('valor de mana diferente')) return null;
      oferecidas = d.items.filter((i) => !i.disabled).length;
      return { kind: 'select', ids: [] };
    });
    tg.cast(N, 'hand').resolveAll();
    // nenhuma das cartas do cemitério tem valor de mana 0
    expect(oferecidas <= 0).toBe(true);
    expect(tg.names(0, 'battlefield').filter((n) => n !== 'Swamp')).toEqual([]);
  });

  it('CR 712.11c — conjurar ou jogar olha só a face escolhida', () => {
    const tg = setup({ battlefield: [[], []], hand: [[N], []] });
    expect(tg.actionIds().some((a) => a.startsWith('cast:'))).toBe(false);
    tg.yes('3 de vida', true).play(N);
    const id = tg.bf(N);
    expect(nameOf(tg.g, id)).toBe('Agadeem, the Undercrypt');
    expect(chars(tg.g, id).types).toEqual(['Land']);
    expect(tg.life(0)).toBe(37);
    expect(tg.state.objects[id].tapped).toBe(false);
  });

  it('CR 712.8a — fora da pilha e do campo vale o valor de mana da frente', () => {
    const tg = setup({ battlefield: [[], []], hand: [[N], []] });
    const id = tg.find(N, 'hand', 0)!;
    // {X}{B}{B}{B} com X = 0 fora da pilha
    expect(chars(tg.g, id).manaValue).toBe(3);
    expect(chars(tg.g, id).types).toEqual(['Sorcery']);
  });

  it('CR 712.14 — posta no campo por efeito, só a frente; a frente sendo feitiço, fica onde está', () => {
    const tg = setup({ battlefield: [[], []], graveyard: [[N], []] });
    tg.run(putOntoBattlefield(tg.g, [{ id: tg.find(N, 'graveyard', 0)!, controller: 0 }], 'effect'));
    expect(tg.find(N)).toBeNull();
    expect(tg.find(N, 'graveyard', 0)).not.toBeNull();
  });
});
