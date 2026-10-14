import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { dealDamage, destroy } from '../../motor/api.ts';
import { chars } from '../../motor/chars.ts';

const NOME = 'Otherworldly Escort';

describe(NOME, () => {
  it('quando morre (não sendo Spirit), volta com quatro marcadores de carga como Spirit Detective; da segunda vez fica no cemitério', () => {
    const tg = setup({ battlefield: [[NOME], []] });
    tg.run(destroy(tg.g, [tg.bf(NOME)]));
    tg.resolveAll();
    const e = tg.bf(NOME);
    expect(tg.state.objects[e].counters.charge).toBe(4);
    expect(chars(tg.g, e).subtypes).toEqual(['Spirit', 'Detective']);
    tg.run(destroy(tg.g, [e]));
    tg.resolveAll();
    expect(tg.find(NOME)).toBeNull();
    expect(tg.names(0, 'graveyard')).toEqual([NOME]);
  });

  it('{1}{W}, {T}, remova um marcador de carga: destrói a criatura que causou dano a você neste turno', () => {
    const tg = setup({ battlefield: [[{ name: NOME, counters: { charge: 2 } }, 'Plains', 'Plains'], ['Indomitable Ancients', 'Wall of Omens']] });
    dealDamage(tg.g, [{ source: tg.bf('Indomitable Ancients'), target: { kind: 'player', id: 0 }, amount: 2, combat: false }]);
    tg.refresh();
    let opcoes: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('causou dano')) return null;
      opcoes = d.items.map((i) => i.label);
      return { kind: 'select', ids: [d.items[0].id] };
    });
    tg.activate(NOME, 'Destrua').resolve();
    expect(opcoes).toEqual(['Indomitable Ancients']);
    expect(tg.names(1, 'graveyard')).toEqual(['Indomitable Ancients']);
    expect(tg.state.objects[tg.bf(NOME)].counters.charge).toBe(1);
  });
});
