import { describe, expect, it } from 'vitest';
import { chars } from '../../motor/chars.ts';
import { activateMana, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Lazotep Quarry';

describe(N, () => {
  it('{T}: {C}; {T}, sacrifique uma criatura: uma mana de qualquer cor', () => {
    const tg = setup({ battlefield: [[N, 'Silver Myr'], []] });
    activateMana(tg, N, 'C');
    expect(tg.state.players[0].manaPool.map((u) => u.type)).toEqual(['C']);
    const outro = setup({ battlefield: [[N, 'Silver Myr'], []] });
    const d = outro.pending;
    const acao = d?.kind === 'priority' ? d.actions.find((a) => a.kind === 'mana' && a.obj === outro.bf(N) && a.label.includes('{R}')) : undefined;
    expect(acao).toBeDefined();
    outro.answer({ kind: 'priority', action: acao!.id });
    outro.settle();
    expect(outro.find('Silver Myr')).toBeNull();
    expect(outro.state.players[0].manaPool.map((u) => u.type)).toEqual(['R']);
  });

  it('exila a carta de criatura de valor de mana X do cemitério e cria uma cópia Zombie 4/4 preta', () => {
    // Serra Angel tem valor de mana 5: {X}{2} com X = 5 são sete manas
    const tg = setup({ battlefield: [[N, ...Array(7).fill('Island')], []], graveyard: [['Serra Angel', 'Silver Myr'], []] });
    tg.number('X', 5);
    tg.choose('carta de criatura alvo com valor de mana X', ['Serra Angel']);
    tg.activate(N, 'Sacrifique um Desert').resolveAll();
    expect(tg.find(N)).toBeNull();
    expect(tg.find('Serra Angel', 'exile')).not.toBeNull();
    const ficha = tg.bf('Serra Angel');
    const c = chars(tg.g, ficha);
    expect(tg.state.objects[ficha].isToken).toBe(true);
    expect(tg.pt(ficha)).toEqual([4, 4]);
    expect(c.colors).toEqual(['B']);
    expect(c.subtypes).toEqual(['Zombie']);
    expect(c.types).toEqual(['Creature']);
    // as habilidades impressas continuam
    expect(c.abilities.some((a) => a.kw === 'flying')).toBe(true);
  });
});