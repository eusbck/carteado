import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { setup, type TestGame } from '../../testes/harness.ts';

const D = 'Drakuseth, Maw of Flames';
const E = "Elspeth, Sun's Champion";
const ataque = (t: TestGame) => t.state.turn.step === 'declareAttackers' && t.state.zones.stack.length > 0;

describe(D, () => {
  it('voar; ao atacar, 4 de dano a um alvo e 3 a cada um de até dois outros', () => {
    const tg = setup({ players: 3, battlefield: [[D], ['Indomitable Ancients'], ['Wall of Omens']] });
    expect(hasKw(tg.g, tg.bf(D), 'flying')).toBe(true);
    tg.choose('escolha qualquer alvo (4 de dano)', ['Bruno']).choose('escolha até dois outros alvos', ['Indomitable Ancients', 'Carla']);
    tg.attack([[D, 1]]).passUntil(ataque).resolve();
    expect(tg.life(1)).toBe(36);
    expect(tg.life(2)).toBe(37);
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].damage).toBe(3);
  });
  it('o mesmo alvo não pode ser escolhido de novo', () => {
    const tg = setup({ battlefield: [[D], ['Indomitable Ancients']] });
    let outros: string[] = [];
    tg.choose('escolha qualquer alvo (4 de dano)', ['Bruno']);
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('escolha até dois outros alvos')) return null;
      outros = d.items.map((i) => i.label);
      return { kind: 'select', ids: [] };
    });
    tg.attack([[D, 1]]).passUntil(ataque);
    expect(outros).not.toContain('Bruno');
    expect(outros).toContain('Indomitable Ancients');
    tg.resolve();
    expect(tg.life(1)).toBe(36);
  });
  it('atacando um planeswalker que sai pelo dano, Drakuseth continua atacando', () => {
    const tg = setup({ battlefield: [[D], [{ name: E, counters: { loyalty: 4 } }]] });
    const pw = tg.bf(E);
    tg.choose('escolha qualquer alvo (4 de dano)', [E]).choose('escolha até dois outros alvos', []);
    tg.attack([[D, { kind: 'obj', id: pw }]]).passUntil(ataque).resolve();
    expect(tg.find(E)).toBeNull();
    expect(tg.state.combat?.attackers.find((a) => a.id === tg.bf(D))?.removed).toBe(false);
    tg.passTo('main2');
    expect(tg.life(1)).toBe(40); // sem bloqueio, não causa dano de combate a ninguém
  });
});
