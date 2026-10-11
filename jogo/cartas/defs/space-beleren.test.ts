import { describe, expect, it } from 'vitest';
import { gainControl } from '../../motor/actions.ts';
import { blockCandidates } from '../../motor/combat.ts';
import { setorDe, type Setor } from '../../motor/setores.ts';
import { buildView } from '../../motor/view.ts';
import { enterCard, fixture as setup, removeCard } from '../../testes/artefatos.ts';

const N = 'Space Beleren';
const E = 'Elvish Mystic';
const A = 'Indomitable Ancients';
const M = 'Silver Myr';
const beleren = (n: number) => ({ name: N, counters: { loyalty: n } });
type TG = ReturnType<typeof setup>;
/** a montagem já responde às escolhas de setor com o padrão; aqui cada criatura vai para o setor que o teste quer */
function poe(tg: TG, carta: string, qual: Setor): void {
  tg.state.objects[tg.bf(carta)].data.setor = qual;
  tg.g.bump();
  tg.refresh();
}
/** Elvish Mystic (sua) em alfa; do oponente, Indomitable Ancients em beta e Silver Myr em alfa */
function mesa(lealdade: number): TG {
  const tg = setup({ battlefield: [[beleren(lealdade), E], [A, M]] });
  poe(tg, E, 'alpha');
  poe(tg, A, 'beta');
  poe(tg, M, 'alpha');
  return tg;
}
const bloqueiam = (tg: TG) => blockCandidates(tg.g, 1).map((b) => tg.state.objects[b.obj].def).sort();

describe(N, () => {
  it('com Space Beleren no campo, cada criatura é posta num setor, os oponentes primeiro', () => {
    const tg = setup({ battlefield: [[E], [A]] });
    expect(setorDe(tg.g, tg.bf(E))).toBeNull();
    const quem: number[] = [];
    tg.script.push((d) => { if (d.kind === 'select' && d.prompt.includes('em qual setor fica')) quem.push(d.player); return null; });
    tg.choose(`em qual setor fica ${A}`, ['Gama']).choose(`em qual setor fica ${E}`, ['Beta']);
    enterCard(tg, N, 0);
    expect(quem).toEqual([1, 0]);
    expect(setorDe(tg.g, tg.bf(A))).toBe('gamma');
    expect(setorDe(tg.g, tg.bf(E))).toBe('beta');
    // Space Beleren não é criatura: não tem setor
    expect(setorDe(tg.g, tg.bf(N))).toBeNull();
    expect(tg.state.objects[tg.bf(N)].counters.loyalty).toBe(3);
    // todos veem o setor de cada criatura
    expect(buildView(tg.g, 1, null).battlefield.find((o) => o.id === tg.bf(E))?.sector).toBe('beta');
  });

  it('a criatura que entra depois é posta num setor por quem a controla', () => {
    const tg = mesa(3);
    let quem = -1;
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('em qual setor fica Fatespinner')) return null;
      quem = d.player;
      return { kind: 'select', ids: ['gamma'] };
    });
    const id = enterCard(tg, 'Fatespinner', 1)!;
    expect(quem).toBe(1);
    expect(setorDe(tg.g, id)).toBe('gamma');
  });

  it('+1: neste turno, a criatura de um setor só pode ser bloqueada por criaturas do mesmo setor', () => {
    const livre = mesa(3);
    livre.attack([[E, 1]]).passTo('declareBlockers');
    expect(bloqueiam(livre)).toEqual([A, M]);
    const tg = mesa(3);
    tg.activate(N, '+1').resolve();
    expect(tg.state.objects[tg.bf(N)].counters.loyalty).toBe(4);
    tg.attack([[E, 1]]).passTo('declareBlockers');
    expect(bloqueiam(tg)).toEqual([M]);
  });

  it('sem Space Beleren no campo os setores se perdem, e a restrição de bloqueio do +1 acaba', () => {
    const tg = mesa(3);
    tg.activate(N, '+1').resolve();
    removeCard(tg, tg.bf(N));
    expect(setorDe(tg.g, tg.bf(E))).toBeNull();
    expect(buildView(tg.g, 0, null).battlefield.find((o) => o.id === tg.bf(E))?.sector).toBeUndefined();
    tg.attack([[E, 1]]).passTo('declareBlockers');
    expect(bloqueiam(tg)).toEqual([A, M]);
    // outro Space Beleren começa do zero: as criaturas são postas em setores de novo
    let perguntas = 0;
    tg.script.push((d) => { if (d.kind === 'select' && d.prompt.includes('em qual setor fica')) perguntas++; return null; });
    enterCard(tg, N, 0);
    expect(perguntas).toBe(3);
  });

  it('um segundo Space Beleren não muda os setores já escolhidos', () => {
    const tg = mesa(3);
    tg.script.push((d) => { if (d.kind === 'select' && d.prompt.includes('em qual setor fica')) throw new Error('não devia perguntar'); return null; });
    enterCard(tg, N, 1);
    expect(setorDe(tg.g, tg.bf(E))).toBe('alpha');
    expect(setorDe(tg.g, tg.bf(A))).toBe('beta');
    // saindo o primeiro, o segundo mantém a divisão
    removeCard(tg, tg.bf(N, 0));
    expect(setorDe(tg.g, tg.bf(A))).toBe('beta');
  });

  it('a criatura que muda de controlador continua no mesmo setor', () => {
    const tg = mesa(3);
    tg.script.push((d) => { if (d.kind === 'select' && d.prompt.includes('em qual setor fica')) throw new Error('não devia perguntar'); return null; });
    const a = tg.bf(A);
    gainControl(tg.g, a, 0, { kind: 'permanent' }, tg.bf(N));
    tg.refresh();
    tg.settle();
    expect(setorDe(tg.g, a)).toBe('beta');
  });

  it('−1 e −5: o setor é escolhido na resolução', () => {
    const tg = mesa(6);
    tg.choose('marcador +1/+1 em cada criatura de qual setor', ['alpha']);
    tg.activate(N, '−1').resolve();
    expect(tg.pt(tg.bf(E))).toEqual([2, 2]);
    expect(tg.pt(tg.bf(M))).toEqual([2, 2]);
    expect(tg.pt(tg.bf(A))).toEqual([2, 10]);
    const destroi = mesa(6);
    destroi.choose('destrua todas as criaturas de qual setor', ['beta']);
    destroi.activate(N, '−5').resolve();
    expect(destroi.find(A)).toBeNull();
    expect(destroi.find(M)).not.toBeNull();
    expect(destroi.find(E)).not.toBeNull();
    expect(destroi.state.objects[destroi.bf(N)].counters.loyalty).toBe(1);
  });
});
