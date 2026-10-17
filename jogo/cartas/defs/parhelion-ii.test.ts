import { describe, expect, it } from 'vitest';
import { hasKw, isAttacking } from '../../motor/api.ts';
import { fixture } from '../../testes/artefatos.ts';

const N = 'Parhelion II';

describe(N, () => {
  it('ao atacar, cria duas Angels 4/4 atacando, que causam dano', () => {
    const tg = fixture({ battlefield: [[N, 'Ripjaw Raptor'], []] });
    tg.choose('Tripular:', ['Ripjaw Raptor']).choose('Tripular:', ['done']).activate(N, 'Tripular').resolveAll();
    expect(hasKw(tg.g, tg.bf(N), 'first strike')).toBe(true);
    tg.attack([[N, 1]]).passTo('declareBlockers');
    const anjos = tg.all('Angel');
    expect(anjos).toHaveLength(2);
    for (const a of anjos) {
      expect(isAttacking(tg.g, a)).toBe(true);
      expect(tg.pt(a)).toEqual([4, 4]);
      expect(hasKw(tg.g, a, 'vigilance')).toBe(true);
    }
    tg.passTo('main2');
    expect(tg.life(1)).toBe(27);
  });
});

describe(`${N}: a quem as Angels atacam`, () => {
  it('CR 508.4: você escolhe, para cada Angel, um oponente ou um planeswalker dele', () => {
    const tg = fixture({ battlefield: [[N, 'Ripjaw Raptor'], ['Jace, Architect of Thought']] });
    tg.choose('Tripular:', ['Ripjaw Raptor']).choose('Tripular:', ['done']).activate(N, 'Tripular').resolveAll();
    const jace = tg.bf('Jace, Architect of Thought');
    let opcoes: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('Angel 1 de 2')) return null;
      opcoes = d.items.map((i) => i.label);
      return { kind: 'select', ids: [`o${jace}`] };
    });
    tg.choose('Angel 2 de 2', ['Bruno']);
    tg.attack([[N, 1]]).passTo('declareBlockers');
    expect(opcoes).toEqual(['Bruno', 'Jace, Architect of Thought (planeswalker de Bruno)']);
    const alvos = tg.state.combat!.attackers.filter((a) => tg.state.objects[a.id]?.def === 'Angel vigilância').map((a) => a.target);
    expect(alvos).toEqual([{ kind: 'obj', id: jace }, { kind: 'player', id: 1 }]);
    tg.passTo('main2');
    expect(tg.find('Jace, Architect of Thought')).toBeNull();
    expect(tg.life(1)).toBe(31);
  });
});
