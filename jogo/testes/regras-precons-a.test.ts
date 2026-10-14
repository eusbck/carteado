// Recursos do motor e de cartas/culpa.ts acrescentados para os precons Blame Game e Squirreled Away (branch precons-a):
// suspeitar (CR 701.60), evento de dano prevenido (CR 615), redirecionamento para criatura ou planeswalker (CR 614.9),
// encobrir (CR 701.58), quem causou dano a um jogador no turno, o que entrou no campo no turno e o X das habilidades
// de mana "vire X fichas: adicione X manas".
import { describe, expect, it } from 'vitest';
import { setup } from './harness.ts';
import { dealDamage, defineAbility, on, ruleEffect, triggered, untilEndOfTurn } from '../motor/api.ts';
import { hasKw } from '../motor/chars.ts';
import type { Ctx, StaticDef } from '../motor/defs.ts';
import { suspeita, suspeitar } from '../cartas/culpa.ts';

const vistos: Record<string, unknown>[] = [];
const OBSERVA = defineAbility('teste:observa-prevencao', triggered(on.custom((e) => (e.type === 'damagePrevented' ? { source: e.source, target: e.target, amount: e.amount, combat: e.combat } : false)), function* (c) { vistos.push(c.event); }));

const ctxDe = (tg: ReturnType<typeof setup>, you: number, source: number) => ({ g: tg.g, you, source }) as unknown as Ctx;

describe('suspeitar (cartas/culpa.ts)', () => {
  it('CR 701.60: suspeita tem ameaçar e não pode bloquear até sair do campo', () => {
    const tg = setup({ battlefield: [['Wall of Omens'], ['Indomitable Ancients']] });
    const anc = tg.bf('Indomitable Ancients');
    expect(suspeitar(tg.g, anc, 0)).toBe(true);
    expect(suspeita(tg.g, anc)).toBe(true);
    expect(hasKw(tg.g, anc, 'menace')).toBe(true);
    expect(hasKw(tg.g, anc, 'cantBlock')).toBe(true);
  });

  it('CR 701.60d: suspeitar de novo não faz nada', () => {
    const tg = setup({ battlefield: [[], ['Indomitable Ancients']] });
    const anc = tg.bf('Indomitable Ancients');
    suspeitar(tg.g, anc, 0);
    const efeitos = tg.state.effects.length;
    expect(suspeitar(tg.g, anc, 0)).toBe(false);
    expect(tg.state.effects.length).toBe(efeitos);
  });

  it('CR 701.60c: perdendo todas as habilidades depois, perde ameaçar e "não pode bloquear", mas continua suspeita', () => {
    const tg = setup({ battlefield: [[], ['Indomitable Ancients']] });
    const anc = tg.bf('Indomitable Ancients');
    suspeitar(tg.g, anc, 0);
    untilEndOfTurn(ctxDe(tg, 0, anc), [anc], [{ k: 'loseAllAbilities' }]);
    expect(hasKw(tg.g, anc, 'menace')).toBe(false);
    expect(hasKw(tg.g, anc, 'cantBlock')).toBe(false);
    expect(suspeita(tg.g, anc)).toBe(true);
  });

  it('CR 701.60a: a suspeita bloqueadora não é oferecida como bloqueadora; sair do campo acaba com a suspeita', () => {
    const tg = setup({ battlefield: [['Zetalpa, Primal Dawn'], ['Indomitable Ancients', 'Wall of Omens']] });
    const anc = tg.bf('Indomitable Ancients');
    suspeitar(tg.g, anc, 0);
    let podem: number[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'blockers') return null;
      podem = d.candidates.filter((x) => x.canBlock.length > 0).map((x) => x.obj);
      return { kind: 'blockers', blocks: [] };
    });
    tg.attack([['Zetalpa, Primal Dawn', 1]]).passTo('main2');
    expect(podem).not.toContain(anc);
  });
});

describe('dano prevenido (evento damagePrevented)', () => {
  it('CR 615.1a: a prevenção emite um evento com a fonte, o alvo e a quantidade prevenida; dano sem prevenção não', () => {
    const PREV = defineAbility<StaticDef>('teste:previne-tudo-a-ana', { kind: 'static', rules: { preventsDamage: (_c, alvo) => alvo.kind === 'player' && alvo.id === 0 } });
    const tg = setup({ battlefield: [['Wall of Omens'], ['Indomitable Ancients']] });
    const anc = tg.bf('Indomitable Ancients');
    ruleEffect(ctxDe(tg, 0, anc), PREV.id!, { kind: 'endOfTurn' });
    untilEndOfTurn(ctxDe(tg, 0, tg.bf('Wall of Omens')), [tg.bf('Wall of Omens')], [{ k: 'addAbility', id: OBSERVA.id! }]);
    vistos.length = 0;
    dealDamage(tg.g, [
      { source: anc, target: { kind: 'player', id: 0 }, amount: 4, combat: false },
      { source: anc, target: { kind: 'player', id: 1 }, amount: 2, combat: false },
    ]);
    tg.refresh().resolveAll();
    expect(tg.life(0)).toBe(40);
    expect(tg.life(1)).toBe(38);
    expect(vistos).toEqual([{ source: anc, target: { kind: 'player', id: 0 }, amount: 4, combat: false }]);
  });
});

describe('redirecionamento para a criatura ou planeswalker escolhido (rule:redirectDamageTo com permanents)', () => {
  it('CR 614.9: dano a você e a qualquer permanente sua vai para a escolhida; se ela deixa de ser criatura ou planeswalker, nada é redirecionado', () => {
    const tg = setup({ battlefield: [['Indomitable Ancients', 'Sol Ring'], ['Zetalpa, Primal Dawn']] });
    const anc = tg.bf('Indomitable Ancients');
    const z = tg.bf('Zetalpa, Primal Dawn');
    ruleEffect(ctxDe(tg, 0, anc), 'rule:redirectDamageTo', { kind: 'endOfTurn' }, { params: { controller: 0, to: anc, permanents: true } });
    dealDamage(tg.g, [{ source: z, target: { kind: 'player', id: 0 }, amount: 3, combat: false }]);
    expect(tg.life(0)).toBe(40);
    expect(tg.state.objects[anc].damage).toBe(3);
    // deixa de ser criatura: o dano vai para o jogador
    untilEndOfTurn(ctxDe(tg, 0, anc), [anc], [{ k: 'removeTypes', types: ['Creature'] }]);
    dealDamage(tg.g, [{ source: z, target: { kind: 'player', id: 0 }, amount: 2, combat: false }]);
    expect(tg.life(0)).toBe(38);
  });
});
