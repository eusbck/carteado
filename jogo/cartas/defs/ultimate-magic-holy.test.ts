import { describe, expect, it } from 'vitest';
import { dealDamage, destroy, hasKw } from '../../motor/api.ts';
import { enterCard, fixture as setup, runEffect } from '../../testes/artefatos.ts';

const N = 'Ultimate Magic: Holy';

describe(N, () => {
  it('da mão: as suas permanentes ficam indestrutíveis até o fim do turno, mas o dano a você não é prevenido', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains', 'Serra Angel'], ['Indomitable Ancients']], hand: [[N], []] });
    tg.cast(N).resolve();
    const anjo = tg.bf('Serra Angel');
    expect(hasKw(tg.g, anjo, 'indestructible')).toBe(true);
    expect(hasKw(tg.g, tg.bf('Plains'), 'indestructible')).toBe(true);
    expect(hasKw(tg.g, tg.bf('Indomitable Ancients'), 'indestructible')).toBe(false);
    runEffect(tg, destroy(tg.g, [anjo]));
    expect(tg.bf('Serra Angel')).toBe(anjo);
    // CR 611.2c: quem entra depois da resolução não ganha
    const novo = enterCard(tg, 'Silver Myr', 0)!;
    expect(hasKw(tg.g, novo, 'indestructible')).toBe(false);
    dealDamage(tg.g, [{ source: tg.bf('Indomitable Ancients'), target: { kind: 'player', id: 0 }, amount: 3, combat: false }]);
    expect(tg.life(0)).toBe(37);
    // no turno seguinte, acabou
    tg.passTo('main1', 1);
    expect(hasKw(tg.g, anjo, 'indestructible')).toBe(false);
  });

  it('predita no seu turno, pode ser conjurada no turno do oponente pelo custo de predizer e previne o dano a você', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains', 'Plains', 'Plains', 'Serra Angel'], ['Indomitable Ancients']], hand: [[N], []] });
    const naMao = tg.find(N, 'hand', 0)!;
    tg.answer({ kind: 'priority', action: `foretell:${naMao}` });
    tg.settle();
    const ex = tg.find(N, 'exile')!;
    expect(tg.state.objects[ex].faceDown).toBe(true);
    // no turno em que foi predita, não dá para conjurar
    expect(tg.actionIds().some((a) => a.startsWith('cast:') && a.split(':').includes(String(ex)))).toBe(false);
    tg.passTo('main1', 1).pass();
    expect(tg.pending?.player).toBe(0);
    const acao = tg.actionIds().find((a) => a.startsWith('cast:') && a.split(':').includes(String(ex)) && a.endsWith(':foretell'));
    expect(acao).toBeDefined();
    tg.answer({ kind: 'priority', action: acao! });
    tg.resolve();
    expect(tg.find(N, 'graveyard')).not.toBeNull();
    expect(hasKw(tg.g, tg.bf('Serra Angel'), 'indestructible')).toBe(true);
    dealDamage(tg.g, [{ source: tg.bf('Indomitable Ancients'), target: { kind: 'player', id: 0 }, amount: 3, combat: false }]);
    expect(tg.life(0)).toBe(40);
    // o dano à criatura não é prevenido (só a você)
    dealDamage(tg.g, [{ source: tg.bf('Indomitable Ancients'), target: { kind: 'obj', id: tg.bf('Serra Angel') }, amount: 2, combat: false }]);
    expect(tg.state.objects[tg.bf('Serra Angel')].damage).toBe(2);
    // a prevenção vale só neste turno
    tg.passTo('main1', 0);
    dealDamage(tg.g, [{ source: tg.bf('Indomitable Ancients'), target: { kind: 'player', id: 0 }, amount: 3, combat: false }]);
    expect(tg.life(0)).toBe(37);
  });
});
