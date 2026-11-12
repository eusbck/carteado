import { describe, expect, it } from 'vitest';
import { blockCandidates } from '../../motor/combat.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Higure, the Still Wind';

describe(N, () => {
  it('com dano de combate, procura uma carta Ninja e a põe na mão', () => {
    const tg = setup({ battlefield: [[N], []], library: [['Forest', 'Ninja of the Deep Hours', 'Island'], []] });
    let servem: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('Higure: procure')) return null;
      servem = d.items.filter((i) => !i.disabled).map((i) => i.label);
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Ninja of the Deep Hours')!.id] };
    });
    tg.yes('Higure: procurar', true);
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(servem).toEqual(['Ninja of the Deep Hours']);
    expect(tg.names(0, 'hand')).toEqual(['Ninja of the Deep Hours']);
  });
  it('{2}: a criatura Ninja alvo não pode ser bloqueada neste turno', () => {
    const tg = setup({ battlefield: [[N, 'Island', 'Island'], ['Indomitable Ancients']] });
    const id = tg.bf(N);
    tg.choose('Ninja alvo', [N]).activate(N, 'não pode ser bloqueada').resolve();
    tg.attack([[N, 1]]).passTo('declareBlockers');
    expect(blockCandidates(tg.g, 1).some((b) => b.canBlock.includes(id))).toBe(false);
  });
});
