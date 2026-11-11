import { describe, expect, it } from 'vitest';
import { addCounters, attach } from '../../motor/api.ts';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';
import type { TestGame } from '../../testes/harness.ts';

const N = 'Red XIII, Proud Warrior';

function vigiaEAtropela(tg: TestGame, id: number): boolean {
  return hasKw(tg.g, id, 'vigilance') && hasKw(tg.g, id, 'trample');
}

describe(N, () => {
  it('vigilância e atropelar; ao entrar, devolve uma carta de Aura ou de Equipamento do seu cemitério para a mão', () => {
    const tg = setup({ battlefield: [['Mountain', 'Forest', 'Forest'], []], hand: [[N], []], graveyard: [['Swiftfoot Boots', 'Sol Ring', 'Elvish Mystic'], ['Angelic Gift']] });
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('Aura ou de Equipamento')) return null;
      const ativos = d.items.filter((i) => !(i as { disabled?: boolean }).disabled);
      // só cartas de Aura ou Equipamento do seu cemitério
      expect(ativos.map((i) => i.label)).toEqual(['Swiftfoot Boots']);
      return { kind: 'select', ids: [ativos[0].id] };
    });
    tg.cast(N).resolveAll();
    const red = tg.bf(N);
    expect(tg.pt(red)).toEqual([3, 3]);
    expect(vigiaEAtropela(tg, red)).toBe(true);
    expect(tg.names(0, 'hand')).toEqual(['Swiftfoot Boots']);
  });

  it('CR 700.9: qualquer marcador, de quem for, modifica a criatura', () => {
    const tg = setup({ battlefield: [[N, 'Elvish Mystic', 'Wall of Omens'], []] });
    expect(vigiaEAtropela(tg, tg.bf('Elvish Mystic'))).toBe(false);
    // marcador de atordoamento posto pelo oponente
    addCounters(tg.g, { kind: 'obj', id: tg.bf('Wall of Omens') }, 'stun', 1, 1);
    tg.refresh();
    expect(vigiaEAtropela(tg, tg.bf('Wall of Omens'))).toBe(true);
    expect(vigiaEAtropela(tg, tg.bf('Elvish Mystic'))).toBe(false);
  });

  it('CR 700.9: a criatura equipada é modificada, seja quem for o controlador do Equipamento', () => {
    const tg = setup({ battlefield: [[N, 'Elvish Mystic'], ['Swiftfoot Boots', 'Wall of Omens']] });
    attach(tg.g, tg.bf('Swiftfoot Boots'), tg.bf('Elvish Mystic'));
    tg.refresh();
    expect(vigiaEAtropela(tg, tg.bf('Elvish Mystic'))).toBe(true);
    // as criaturas modificadas dos oponentes não ganham nada
    tg.g.state.objects[tg.bf('Wall of Omens')].counters['+1/+1'] = 1;
    tg.g.bump();
    tg.refresh();
    expect(vigiaEAtropela(tg, tg.bf('Wall of Omens'))).toBe(false);
  });

  it('CR 700.9: a Aura de outro jogador não modifica a sua criatura', () => {
    const tg = setup({ battlefield: [[N, 'Elvish Mystic', 'Wall of Omens', { name: 'Angelic Gift', attachTo: 'Wall of Omens' }], [{ name: 'Angelic Gift', attachTo: 'Indomitable Ancients' }, 'Indomitable Ancients']] });
    expect(attach(tg.g, tg.bf('Angelic Gift', 1), tg.bf('Elvish Mystic'))).toBe(true);
    tg.refresh();
    expect(vigiaEAtropela(tg, tg.bf('Elvish Mystic'))).toBe(false);
    expect(vigiaEAtropela(tg, tg.bf('Wall of Omens'))).toBe(true);
  });
});
