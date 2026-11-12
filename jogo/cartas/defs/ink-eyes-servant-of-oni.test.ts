import { describe, expect, it } from 'vitest';
import { controllerOf, regenerationShields } from '../../motor/api.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Ink-Eyes, Servant of Oni';

describe(N, () => {
  it('a criatura que morreu no mesmo dano de combate já pode ser o alvo', () => {
    // Memnite bloqueia Indomitable Ancients e morre no mesmo dano em que Ink-Eyes atinge o jogador
    const tg = setup({ players: 3, battlefield: [[N, 'Indomitable Ancients'], ['Memnite'], []], graveyard: [[], ['Wall of Omens'], ['Ornithopter']] });
    let opcoes: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('cemitério desse jogador')) return null;
      opcoes = d.items.map((i) => i.label).sort();
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Memnite')!.id] };
    });
    tg.yes('Ink-Eyes', true);
    tg.attack([[N, 1], ['Indomitable Ancients', 1]]).block([['Memnite', 'Indomitable Ancients']]).passTo('main2', 0);
    expect(opcoes).toEqual(['Memnite', 'Wall of Omens']);
    expect(controllerOf(tg.g, tg.bf('Memnite'))).toBe(0);
    expect(tg.find('Wall of Omens', 'graveyard', 1)).not.toBeNull();
  });
  it('{1}{B}: regenera', () => {
    const tg = setup({ battlefield: [[N, 'Swamp', 'Swamp'], []] });
    tg.activate(N, 'Regenere').resolve();
    expect(regenerationShields(tg.g, tg.bf(N)).length).toBe(1);
  });
});
