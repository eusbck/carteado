import { describe, expect, it } from 'vitest';
import { draw, hasKw } from '../../motor/api.ts';
import { runEffect } from '../../testes/artefatos.ts';
import { setup } from '../../testes/harness.ts';

const AMINATOU = 'Aminatou, Veil Piercer';

describe(AMINATOU, () => {
  it('no começo da sua manutenção, vigia 2', () => {
    const tg = setup({ step: 'untap', battlefield: [[AMINATOU], []], library: [['Island', 'Forest', 'Swamp'], ['Forest']] });
    tg.script.push((d) => (d.kind === 'arrange' && d.prompt.includes('Vigiar 2')
      ? { kind: 'arrange', order: d.items.map((i) => i.id), placement: Object.fromEntries(d.items.map((i, k) => [i.id, k === 0 ? 'graveyard' : 'top'])) }
      : null));
    tg.passTo('upkeep');
    tg.resolve();
    expect(tg.names(0, 'graveyard')).toEqual(['Island']);
    expect(tg.names(0, 'library')).toEqual(['Forest', 'Swamp']);
  });

  it('a carta de encantamento comprada na etapa de compra é conjurada pelo custo de mana menos {4}', () => {
    // Ghostly Prison custa {2}{W}: o milagre custa {W}
    const tg = setup({ step: 'upkeep', battlefield: [[AMINATOU, 'Plains', 'Plains'], []], library: [['Ghostly Prison', 'Island'], ['Forest']] });
    tg.yes('Milagre: revelar', true).yes('Milagre: conjurar', true);
    tg.passUntil((t) => t.find('Ghostly Prison', 'stack') !== null);
    expect(tg.state.turn.step).toBe('draw');
    expect(tg.all('Plains').filter((x) => tg.state.objects[x].tapped)).toHaveLength(1);
    tg.resolve();
    expect(tg.find('Ghostly Prison')).not.toBeNull();
  });

  it('só as cartas de encantamento na sua mão têm milagre, e só com Aminatou no campo', () => {
    const tg = setup({ battlefield: [[AMINATOU], []], hand: [['Ghostly Prison', 'Wall of Omens'], ['Ghostly Prison']] });
    expect(hasKw(tg.g, tg.find('Ghostly Prison', 'hand', 0)!, 'miracle')).toBe(true);
    expect(hasKw(tg.g, tg.find('Wall of Omens', 'hand', 0)!, 'miracle')).toBe(false);
    expect(hasKw(tg.g, tg.find('Ghostly Prison', 'hand', 1)!, 'miracle')).toBe(false);
    const sem = setup({ hand: [['Ghostly Prison'], []] });
    expect(hasKw(sem.g, sem.find('Ghostly Prison', 'hand', 0)!, 'miracle')).toBe(false);
  });

  it('carta que não é encantamento não pergunta nada ao ser comprada', () => {
    const tg = setup({ active: 1, battlefield: [[AMINATOU], []], library: [['Wall of Omens'], ['Forest']] });
    const vistas: string[] = [];
    tg.script.push((d) => { if (d.prompt.includes('Milagre')) vistas.push(d.prompt); return null; });
    runEffect(tg, draw(tg.g, 0, 1));
    expect(vistas).toEqual([]);
    expect(tg.state.zones.stack).toHaveLength(0);
  });
});
