import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { alternativasDeMana } from '../../testes/padroes.ts';
import { registry } from '../../motor/defs.ts';
import type { G } from '../../motor/api.ts';

const NOME = 'Avengers Tower';
const HEROI = 'Patriot, Shield Wielder'; // Legendary Creature — Human Hero, {1}{W}

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(['B', 'C', 'G', 'R', 'U', 'W']));
  it('CR 106.6: a mana colorida só paga mágica Hero ou habilidade de fonte Hero', () => {
    expect(setup({ battlefield: [[NOME], []], hand: [['Brainstorm'], []] }).canCast('Brainstorm')).toBe(false);
    const tg = setup({ battlefield: [[NOME, 'Sol Ring', 'Wall of Omens'], []], hand: [[HEROI], []] });
    tg.cast(HEROI).resolve();
    const heroi = tg.bf(HEROI);
    const pode = registry.fns.get('Avengers Tower:hero') as (g: G, p: { kind: string; obj?: number }) => boolean;
    expect(pode(tg.g, { kind: 'ability', obj: heroi })).toBe(true);
    expect(pode(tg.g, { kind: 'ability', obj: tg.bf('Wall of Omens') })).toBe(false);
    expect(pode(tg.g, { kind: 'effect' })).toBe(false);
  });
  it('{4}, {T}: olha as três do topo, pode pôr uma carta Hero na mão; o resto vai para o fundo na ordem escolhida', () => {
    const tg = setup({ battlefield: [[NOME, 'Sol Ring', 'Sol Ring'], []], library: [['Island', HEROI, 'Forest', 'Swamp'], []] });
    let habilitadas: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('revelar uma carta Hero')) return null;
      habilitadas = d.items.filter((i) => !i.disabled).map((i) => i.label);
      return { kind: 'select', ids: [d.items.find((i) => i.label === HEROI)!.id] };
    });
    tg.choose('Ordem das cartas', ['Forest', 'Island']);
    tg.activate(NOME, 'Olhe').resolve();
    expect(habilitadas).toEqual([HEROI]);
    expect(tg.names(0, 'hand')).toEqual([HEROI]);
    expect(tg.names(0, 'library')).toEqual(['Swamp', 'Forest', 'Island']);
  });
  it('pode não pegar nada: as três vão para o fundo', () => {
    const tg = setup({ battlefield: [[NOME, 'Sol Ring', 'Sol Ring'], []], library: [['Island', 'Forest', 'Plains', 'Swamp'], []] });
    tg.choose('revelar uma carta Hero', []).choose('Ordem das cartas', ['Plains', 'Forest', 'Island']);
    tg.activate(NOME, 'Olhe').resolve();
    expect(tg.names(0, 'hand')).toEqual([]);
    expect(tg.names(0, 'library')).toEqual(['Swamp', 'Plains', 'Forest', 'Island']);
  });
});
