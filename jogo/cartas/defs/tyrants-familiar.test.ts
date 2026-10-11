import { describe, expect, it } from 'vitest';
import { destroy, gainControl } from '../../motor/api.ts';
import { hasKw } from '../../motor/chars.ts';
import { setup, type TestGame } from '../../testes/harness.ts';

const T = "Tyrant's Familiar";
const CMD = { name: 'Lathliss, Dragon Queen', commander: true };
const ataque = (t: TestGame) => t.state.turn.step === 'declareAttackers' && t.state.zones.stack.length > 0;

describe(T, () => {
  it('voar e ímpeto; sem o comandante, 5/5 e sem o gatilho de ataque', () => {
    const tg = setup({ battlefield: [[{ name: T, ready: false }], ['Indomitable Ancients']] });
    const id = tg.bf(T);
    expect(hasKw(tg.g, id, 'flying') && hasKw(tg.g, id, 'haste')).toBe(true);
    expect(tg.pt(id)).toEqual([5, 5]);
    tg.attack([[T, 1]]).passTo('declareBlockers');
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].damage).toBe(0);
  });
  it('só vale com o seu comandante no campo sob o seu controle: +2/+2 e 7 de dano à criatura do defensor', () => {
    const tg = setup({ players: 3, battlefield: [[T, CMD], ['Indomitable Ancients'], ['Wall of Omens']] });
    expect(tg.pt(tg.bf(T))).toEqual([7, 7]);
    let opcoes: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('jogador defensor')) return null;
      opcoes = d.items.map((i) => i.label);
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Indomitable Ancients')!.id] };
    });
    tg.attack([[T, 1]]).passUntil(ataque).resolve();
    expect(opcoes).toEqual(['Indomitable Ancients']);
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].damage).toBe(7);
    // o comandante na zona de comando não conta
    const tg2 = setup({ battlefield: [[T], []], command: [['Lathliss, Dragon Queen'], []] });
    expect(tg2.pt(tg2.bf(T))).toEqual([5, 5]);
  });
  it('o comandante de outro jogador não conta', () => {
    const tg = setup({ battlefield: [[T], [CMD]] });
    expect(tg.pt(tg.bf(T))).toEqual([5, 5]);
    gainControl(tg.g, tg.bf('Lathliss, Dragon Queen'), 0, { kind: 'permanent' }, tg.bf(T));
    tg.refresh();
    expect(tg.pt(tg.bf(T))).toEqual([5, 5]);
  });
  it('sob o controle de outro jogador, vale o comandante desse jogador', () => {
    const tg = setup({ battlefield: [[T], [CMD]] });
    gainControl(tg.g, tg.bf(T), 1, { kind: 'permanent' }, tg.bf(T));
    tg.refresh();
    expect(tg.pt(tg.bf(T))).toEqual([7, 7]);
  });
  it('perdendo o comandante, o bônus some e a criatura pode morrer pelo dano marcado', () => {
    const tg = setup({ battlefield: [[{ name: T, damage: 6 }, CMD], []] });
    expect(tg.find(T)).not.toBeNull();
    tg.run(destroy(tg.g, [tg.bf('Lathliss, Dragon Queen')]));
    tg.settle();
    expect(tg.find(T)).toBeNull();
  });
  it('o gatilho já disparado resolve mesmo sem o comandante', () => {
    const tg = setup({ battlefield: [[T, CMD], ['Indomitable Ancients']] });
    tg.attack([[T, 1]]).passUntil(ataque);
    tg.run(destroy(tg.g, [tg.bf('Lathliss, Dragon Queen')]));
    tg.resolve();
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].damage).toBe(7);
  });
});
