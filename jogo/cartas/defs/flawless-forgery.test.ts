import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Flawless Forgery';
const ilhas = Array(5).fill('Island');
const forests = Array(10).fill('Forest');

describe(N, () => {
  it('exila a carta do cemitério do oponente e conjura uma cópia dela de graça; a carta continua exilada', () => {
    // Breath Weapon: 2 de dano a cada criatura que não é Dragon
    const tg = setup({
      battlefield: [ilhas, ['Indomitable Ancients']], hand: [[N], []],
      graveyard: [['Breath Weapon'], ['Breath Weapon', 'Elvish Mystic']], library: [forests, forests],
    });
    let alvos: number[] = [];
    tg.choose('custo adicional opcional', ['Não pagar']);
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('cemitério de um oponente')) return null;
      alvos = d.items.filter((i) => !i.disabled).map((i) => i.obj!);
      return { kind: 'select', ids: [d.items.find((i) => !i.disabled)!.id] };
    });
    tg.yes(N, true);
    tg.cast(N).resolveAll();
    // só a instantânea do oponente; nem a criatura dele nem a sua instantânea
    expect(alvos).toHaveLength(1);
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].damage).toBe(2);
    expect(tg.names(1, 'graveyard')).toEqual(['Elvish Mystic']);
    // a carta original fica exilada; a cópia deixou de existir depois de resolver
    expect(tg.state.zones.exile.map((id) => tg.state.objects[id].def)).toEqual(['Breath Weapon']);
    expect(tg.names(0, 'graveyard').sort()).toEqual(['Breath Weapon', N]);
  });

  it('pode não conjurar a cópia: a carta é exilada do mesmo jeito', () => {
    const tg = setup({ battlefield: [ilhas, ['Indomitable Ancients']], hand: [[N], []], graveyard: [[], ['Breath Weapon']], library: [forests, forests] });
    tg.choose('custo adicional opcional', ['Não pagar']).yes(N, false);
    tg.cast(N).resolveAll();
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].damage).toBe(0);
    expect(tg.names(1, 'graveyard')).toEqual([]);
  });
});
