import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Make an Example';
const pantanos = ['Swamp', 'Swamp', 'Swamp', 'Swamp'];

describe(N, () => {
  it('cada oponente separa as criaturas em duas pilhas e você escolhe qual pilha de cada um é sacrificada', () => {
    const tg = setup({
      players: 3, hand: [[N], [], []],
      battlefield: [[...pantanos, 'Elvish Mystic'], ['Indomitable Ancients', 'Wall of Omens', 'Silver Myr'], ['Goldspan Dragon']],
    });
    const quemSeparou: number[] = [];
    const quemEscolheu: number[] = [];
    // Bruno põe Ancients na primeira pilha; Carla deixa a primeira pilha vazia
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('separe as suas criaturas')) return null;
      quemSeparou.push(d.player);
      return { kind: 'select', ids: d.player === 1 ? [d.items.find((i) => i.label === 'Indomitable Ancients')!.id] : [] };
    });
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('separe as suas criaturas')) return null;
      quemSeparou.push(d.player);
      return { kind: 'select', ids: [] };
    });
    // você escolhe a segunda pilha de Bruno (Wall e Myr) e a primeira de Carla (vazia)
    tg.script.push((d) => { if (d.kind !== 'select' || !d.prompt.includes('qual pilha Bruno')) return null; quemEscolheu.push(d.player); return { kind: 'select', ids: ['b'] }; });
    tg.script.push((d) => { if (d.kind !== 'select' || !d.prompt.includes('qual pilha Carla')) return null; quemEscolheu.push(d.player); return { kind: 'select', ids: ['a'] }; });
    tg.cast(N).resolveAll();
    expect(quemSeparou).toEqual([1, 2]);
    expect(quemEscolheu).toEqual([0, 0]);
    expect(tg.names(1, 'battlefield')).toEqual(['Indomitable Ancients']);
    expect(tg.names(1, 'graveyard').sort()).toEqual(['Silver Myr', 'Wall of Omens']);
    // a pilha vazia de Carla: nada é sacrificado; as suas criaturas não entram na conta
    expect(tg.find('Goldspan Dragon')).not.toBeNull();
    expect(tg.find('Elvish Mystic')).not.toBeNull();
  });

  it('oponente sem criaturas: as duas pilhas ficam vazias', () => {
    const tg = setup({ battlefield: [pantanos, []], hand: [[N], []] });
    tg.cast(N).resolveAll();
    expect(tg.find(N, 'graveyard', 0)).not.toBeNull();
  });
});
