// Bots e pilhas (Fact or Fiction, Jace, Make an Example, Abstract Performance): quem separa equilibra as duas pilhas e
// quem escolhe fica com a que vale mais. Antes, a separação punha as cinco cartas numa pilha só.
import { describe, expect, it } from 'vitest';
import { setup } from './harness.ts';
import { escolher, HeuristicBot } from '../bots/heuristico.ts';
import { seedFrom } from '../motor/rng.ts';
import type { Answer, Decision } from '../motor/types.ts';

type Select = Extract<Decision, { kind: 'select' }>;
const ids = (a: Answer) => (a as Extract<Answer, { kind: 'select' }>).ids;
const BIB = ['Sol Ring', 'Cultivate', 'Path to Exile', 'Kami of Ancient Law', 'Arcane Signet', 'Island'];

describe('bots: pilhas', () => {
  it('Fact or Fiction marca a separação e as pilhas', () => {
    const tg = setup({ players: 2, hand: [['Fact or Fiction'], []], battlefield: [['Island', 'Island', 'Island', 'Island'], []], library: [BIB, []] });
    const vistas: Select[] = [];
    tg.script.push((d) => { if (d.kind === 'select' && d.prompt.startsWith('Fact or Fiction')) vistas.push(d); return null; });
    tg.cast('Fact or Fiction').resolve();
    const [separar, escolher_] = vistas;
    expect(separar.split).toBe(true);
    expect(escolher_.items.every((i) => Array.isArray(i.pile))).toBe(true);
    expect(escolher_.items.flatMap((i) => i.pile!).length).toBe(5);
  });

  for (const nivel of ['facil', 'intermediario', 'dificil'] as const) {
    it(`${nivel}: separa as cinco cartas em duas pilhas parecidas e quem conjurou fica com a melhor`, () => {
      const tg = setup({ players: 2, hand: [['Fact or Fiction'], []], battlefield: [['Island', 'Island', 'Island', 'Island'], []], library: [BIB, []] });
      const bot = new HeuristicBot('pilhas', 1, { nivel });
      const dono = new HeuristicBot('dono', 0, { nivel });
      let pilha1: string[] = [];
      let escolhida: string[] = [];
      // cada função do script responde uma decisão só: uma para separar, outra para escolher
      const responde = (d: Decision): Answer | null => {
        if (d.kind !== 'select' || !d.prompt.startsWith('Fact or Fiction')) return null;
        if (d.split) { const a = bot.answer(d, tg.game); pilha1 = ids(a); return a; }
        const a = dono.answer(d, tg.game);
        escolhida = d.items.find((i) => i.id === ids(a)[0])!.pile!.map((id) => tg.state.objects[id].def);
        return a;
      };
      tg.script.push(responde, responde);
      bot.rastro.observar(tg.game);
      dono.rastro.observar(tg.game);
      tg.cast('Fact or Fiction').resolve();
      // nem vazia nem com as cinco
      expect(pilha1.length).toBeGreaterThan(0);
      expect(pilha1.length).toBeLessThan(5);
      // quem conjurou escolheu uma das pilhas (pelo bot) e ela foi para a mão
      expect(tg.state.zones.hand[0].map((id) => tg.state.objects[id].def).sort()).toEqual([...escolhida].sort());
      expect(escolhida.length).toBeGreaterThan(0);
    });
  }

  it('escolher a pilha: fica com a que vale mais', () => {
    const tg = setup({ players: 2, battlefield: [[], ['Grave Titan', 'Elvish Mystic', 'Llanowar Elves']] });
    const titan = tg.find('Grave Titan', 'battlefield', 1)!;
    const elfos = [tg.find('Elvish Mystic', 'battlefield', 1)!, tg.find('Llanowar Elves', 'battlefield', 1)!];
    const d: Select = {
      kind: 'select', id: 1, player: 0, prompt: 'Make an Example: qual pilha Bruno sacrifica?', min: 1, max: 1,
      items: [{ id: 'a', label: 'Primeira pilha', pile: elfos }, { id: 'b', label: 'Segunda pilha', pile: [titan] }],
    };
    expect(ids(escolher(d, tg.g, 0, seedFrom('x'), false))).toEqual(['b']);
  });

  it('Make an Example: separa as criaturas para perder o mínimo', () => {
    const tg = setup({ players: 2, battlefield: [[], ['Grave Titan', 'Elvish Mystic', 'Llanowar Elves']] });
    const criaturas = tg.state.zones.battlefield.filter((id) => tg.state.objects[id].controller === 1);
    const d: Select = {
      kind: 'select', id: 1, player: 1, prompt: 'Make an Example: separe as suas criaturas em duas pilhas', min: 0, max: 3, split: true,
      items: criaturas.map((id) => ({ id: String(id), label: tg.state.objects[id].def, obj: id })),
    };
    const um = ids(escolher(d, tg.g, 1, seedFrom('x'), false));
    const titan = String(tg.find('Grave Titan', 'battlefield', 1));
    // o Titan sozinho numa pilha e os elfos na outra (o outro escolhe o Titan, mas não perde os dois lados)
    const pilhaDoTitan = um.includes(titan) ? um : criaturas.map(String).filter((x) => !um.includes(x));
    expect(pilhaDoTitan).toEqual([titan]);
  });
});
