import { describe, expect, it } from 'vitest';
import { chars } from '../../motor/api.ts';
import { fixture } from '../../testes/artefatos.ts';

const N = 'Peacewalker Colossus';

describe(N, () => {
  it('{1}{W}: outro Veículo seu vira criatura artefato até o fim do turno, com a força e a resistência impressas', () => {
    const tg = fixture({ battlefield: [[N, "Cultivator's Caravan", 'Plains', 'Plains'], []] });
    let alvos: string[] = [];
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('outro Veículo alvo') ? (alvos = d.items.filter((i) => !i.disabled).map((i) => i.label), { kind: 'select', ids: [d.items.find((i) => i.label === "Cultivator's Caravan")!.id] }) : null));
    tg.activate(N, '{1}{W}').resolve();
    expect(alvos).toEqual(["Cultivator's Caravan"]);
    const v = tg.bf("Cultivator's Caravan");
    expect(chars(tg.g, v).types).toEqual(['Artifact', 'Creature']);
    expect(tg.pt(v)).toEqual([5, 5]);
    tg.passTo('upkeep', 1);
    expect(chars(tg.g, v).types).toEqual(['Artifact']);
  });
});
