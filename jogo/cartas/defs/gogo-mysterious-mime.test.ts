import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { chars } from '../../motor/chars.ts';

describe('Gogo, Mysterious Mime', () => {
  it('copiando uma lendária, a regra da lenda não pega; as duas recebem +2/+0, ímpeto e atacam se puderem', () => {
    const tg = setup({ battlefield: [['Gogo, Mysterious Mime', 'Glissa Sunslayer'], []], library: [['Island'], ['Island']] });
    tg.choose('outra criatura alvo', ['Glissa Sunslayer']).yes('Gogo: virar');
    const erros: (string | null)[] = [];
    tg.script.push((d, x) => {
      if (d.kind !== 'attackers') return null;
      erros.push(x.game.check(0, { kind: 'attackers', attacks: [] }));
      return { kind: 'attackers', attacks: d.candidates.map((cd) => [cd.obj, { kind: 'player', id: 1 }] as [number, { kind: 'player'; id: number }]) };
    });
    tg.passTo('beginCombat').resolve();
    const gogo = tg.state.zones.battlefield.find((id) => tg.state.objects[id].def === 'Gogo, Mysterious Mime')!;
    const c = chars(tg.g, gogo);
    expect(c.name).toBe('Gogo, Mysterious Mime');
    expect(c.supertypes).toContain('Legendary');
    expect(tg.pt(gogo)).toEqual([5, 3]);
    expect(tg.find('Glissa Sunslayer')).not.toBeNull();
    tg.passTo('main2');
    expect(erros[0]).not.toBeNull();
  });
});
