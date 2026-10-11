import { describe, expect, it } from 'vitest';
import { chars, hasKw } from '../../motor/api.ts';
import { enterCard } from '../../testes/artefatos.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Sarkhan, Dragon Ascendant';
const forests = Array(10).fill('Forest');

describe(N, () => {
  it('contemplar aceita um Dragon que você controla ou uma carta de Dragon da mão; contemplando, cria um Treasure', () => {
    const tg = setup({ battlefield: [['Mountain', 'Mountain', 'Goldspan Dragon', 'Elvish Mystic'], []], hand: [[N, 'Rapacious Dragon', "Dragon's Hoard"], []], library: [forests, forests] });
    let opcoes: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.startsWith('Contemplar')) return null;
      opcoes = d.items.map((i) => i.label);
      return { kind: 'select', ids: [d.items.find((i) => i.label.startsWith('Rapacious Dragon'))!.id] };
    });
    tg.cast(N).resolveAll();
    expect(opcoes).toEqual(['Goldspan Dragon (no campo)', 'Rapacious Dragon (revelar da mão)']);
    expect(tg.all('Treasure')).toHaveLength(1);
    // a carta revelada continua na mão
    expect(tg.names(0, 'hand')).toContain('Rapacious Dragon');
  });

  it('é opcional, e sem Dragon para contemplar não cria a ficha', () => {
    const tg = setup({ battlefield: [['Mountain', 'Mountain', 'Goldspan Dragon'], []], hand: [[N], []], library: [forests, forests] });
    tg.script.push((d) => (d.kind === 'select' && d.prompt.startsWith('Contemplar') ? { kind: 'select', ids: [] } : null));
    tg.cast(N).resolveAll();
    expect(tg.all('Treasure')).toHaveLength(0);
    const sem = setup({ battlefield: [['Mountain', 'Mountain'], []], hand: [[N], []], library: [forests, forests] });
    sem.cast(N).resolveAll();
    expect(sem.all('Treasure')).toHaveLength(0);
    expect(sem.find(N)).not.toBeNull();
  });

  it('quando um Dragon que você controla entra: marcador +1/+1 e, até o fim do turno, é também um Dragon com voar', () => {
    const tg = setup({ battlefield: [[N], []], library: [forests, forests] });
    const id = tg.bf(N);
    const antes = tg.pt(id);
    enterCard(tg, 'Goldspan Dragon', 1);
    enterCard(tg, 'Elvish Mystic', 0);
    tg.resolveAll();
    expect(tg.state.objects[id].counters['+1/+1'] ?? 0).toBe(0);
    enterCard(tg, 'Goldspan Dragon', 0);
    tg.resolveAll();
    expect(tg.state.objects[id].counters['+1/+1']).toBe(1);
    expect(tg.pt(id)).toEqual([antes[0] + 1, antes[1] + 1]);
    expect(chars(tg.g, id).subtypes).toEqual(expect.arrayContaining(['Human', 'Druid', 'Dragon']));
    expect(hasKw(tg.g, id, 'flying')).toBe(true);
    tg.passTo('upkeep', 1);
    expect(chars(tg.g, id).subtypes).not.toContain('Dragon');
    expect(hasKw(tg.g, id, 'flying')).toBe(false);
    expect(tg.state.objects[id].counters['+1/+1']).toBe(1);
  });
});
