import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { destroy } from '../../motor/api.ts';
import { attackCandidates } from '../../motor/combat.ts';

const NOME = 'Orzhov Advokist';
const lib = Array(5).fill('Island');

describe(NOME, () => {
  it('na sua manutenção, Bruno aceita: a criatura dele recebe dois marcadores e ele não pode atacar você até o seu próximo turno', () => {
    const tg = setup({ players: 3, step: 'untap', battlefield: [[NOME], ['Indomitable Ancients'], []], library: [lib, lib, lib] });
    tg.choose('Orzhov Advokist', ['Não colocar marcadores']);
    tg.choose('Orzhov Advokist', ['Indomitable Ancients']);
    tg.passTo('main1', 0);
    const anc = tg.bf('Indomitable Ancients');
    expect(tg.state.objects[anc].counters['+1/+1']).toBe(2);
    expect(tg.state.objects[tg.bf(NOME)].counters['+1/+1'] ?? 0).toBe(0);
    // no turno de Bruno, ele só pode atacar Carla
    let alvos: number[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'attackers' || d.player !== 1) return null;
      alvos = d.candidates.find((x) => x.obj === anc)!.targets.map((t) => t.id);
      return { kind: 'attackers', attacks: [] };
    });
    tg.passTo('main2', 1);
    expect(alvos).toEqual([2]);
  });

  it('a restrição continua mesmo sem o Advokist no campo', () => {
    const tg = setup({ step: 'untap', battlefield: [[NOME], ['Indomitable Ancients']], library: [lib, lib] });
    tg.choose('Orzhov Advokist', ['Não colocar marcadores']);
    tg.choose('Orzhov Advokist', ['Indomitable Ancients']);
    tg.passTo('main1', 0);
    // o Advokist sai do campo
    tg.run(destroy(tg.g, [tg.bf(NOME)]));
    expect(tg.find(NOME)).toBeNull();
    tg.passTo('main1', 1);
    expect(attackCandidates(tg.g, 1)).toEqual([]);
  });
});
