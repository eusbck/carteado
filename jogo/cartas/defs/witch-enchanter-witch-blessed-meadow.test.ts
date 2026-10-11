import { describe, expect, it } from 'vitest';
import { addEffect, defineAbility } from '../../motor/api.ts';
import { chars, nameOf } from '../../motor/chars.ts';
import type { StaticDef } from '../../motor/defs.ts';
import { activateMana, fixture as setup, removeCard } from '../../testes/artefatos.ts';

const N = 'Witch Enchanter // Witch-Blessed Meadow';

// "você não pode conjurar mágicas": efeito de regra só para o teste
const SEM_MAGICAS = defineAbility<StaticDef>('teste:witch-enchanter:sem-magicas', { kind: 'static', rules: { cantCastSpells: (_c, p) => p === 0 } });

describe(N, () => {
  it('frente: criatura 2/2 que, ao entrar, destrói o artefato ou encantamento alvo de um oponente', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains', 'Plains', 'Sol Ring'], ['Sol Ring', 'Indomitable Ancients']], hand: [[N], []] });
    let alvos: number[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('artefato ou encantamento alvo')) return null;
      alvos = d.items.filter((i) => !i.disabled).map((i) => i.obj!);
      return { kind: 'select', ids: [d.items.find((i) => !i.disabled)!.id] };
    });
    tg.cast(N, 'hand').resolveAll();
    const id = tg.bf(N);
    expect(nameOf(tg.g, id)).toBe('Witch Enchanter');
    expect(tg.pt(id)).toEqual([2, 2]);
    // só o artefato do oponente pode ser alvo
    expect(alvos).toHaveLength(1);
    expect(tg.find('Sol Ring', 'battlefield', 1)).toBeNull();
    expect(tg.find('Sol Ring', 'battlefield', 0)).not.toBeNull();
  });

  it('verso: terreno que gera {W}; pagando 3 de vida entra desvirado', () => {
    const tg = setup({ battlefield: [[], []], hand: [[N], []] });
    tg.yes('3 de vida', true).play(N);
    const id = tg.bf(N);
    expect(nameOf(tg.g, id)).toBe('Witch-Blessed Meadow');
    expect(tg.life(0)).toBe(37);
    activateMana(tg, 'Witch-Blessed Meadow', 'W');
    expect(tg.state.players[0].manaPool.map((u) => u.type)).toEqual(['W']);
  });

  it('CR 712.11c — impedido de conjurar criaturas, ainda joga o terreno', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains', 'Plains'], []], hand: [[N], []] });
    addEffect(tg.g, { source: tg.bf('Plains'), sourceDef: '', controller: 1, duration: { kind: 'endOfTurn' }, affected: null, mods: [{ k: 'rule', id: SEM_MAGICAS.id! }] });
    tg.refresh();
    expect(tg.actionIds().some((a) => a.startsWith('cast:'))).toBe(false);
    tg.yes('3 de vida', false).play(N);
    expect(nameOf(tg.g, tg.bf(N))).toBe('Witch-Blessed Meadow');
  });

  it('CR 712.8a — no cemitério é só uma carta de criatura, não de terreno', () => {
    const tg = setup({ battlefield: [[], []], hand: [[N], []] });
    tg.yes('3 de vida', false).play(N);
    removeCard(tg, tg.bf(N));
    const id = tg.find(N, 'graveyard', 0)!;
    expect(chars(tg.g, id).types).toEqual(['Creature']);
    expect(nameOf(tg.g, id)).toBe('Witch Enchanter');
  });
});
