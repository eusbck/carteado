import { describe, expect, it } from 'vitest';
import { controllerOf, nameOf } from '../../motor/chars.ts';
import { blockCandidates } from '../../motor/combat.ts';
import { fixture as setup, removeCard } from '../../testes/artefatos.ts';

const N = 'Jeskai Infiltrator';
const ilhas = Array(8).fill('Island');
const viradas = (tg: ReturnType<typeof setup>) => tg.state.zones.battlefield.filter((id) => tg.state.objects[id].faceDown);

describe(N, () => {
  it('causando dano de combate, ela e a carta do topo do grimório viram duas criaturas 2/2 viradas para baixo', () => {
    const tg = setup({ battlefield: [[N], []], library: [['Sol Ring', ...ilhas], ilhas] });
    expect(tg.pt(tg.bf(N))).toEqual([2, 3]);
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.life(1)).toBe(38);
    const ids = viradas(tg);
    expect(ids).toHaveLength(2);
    for (const id of ids) {
      expect(tg.pt(id)).toEqual([2, 2]);
      expect(controllerOf(tg.g, id)).toBe(0);
      expect(nameOf(tg.g, id)).not.toBe(N);
      expect(tg.state.objects[id].data.manifestada).toBe(true);
    }
    expect(ids.map((id) => tg.state.objects[id].def).sort()).toEqual([N, 'Sol Ring']);
    expect(tg.state.zones.exile).toHaveLength(0);
    expect(tg.names(0, 'library')).toHaveLength(8);
  });

  it('a carta de criatura manifestada pode ser virada para cima pelo custo de mana; a que não é de criatura, não', () => {
    const tg = setup({ battlefield: [[N, 'Island', 'Island', 'Island'], []], library: [['Sol Ring', ...ilhas], ilhas] });
    tg.attack([[N, 1]]).passTo('main2', 0);
    const ids = viradas(tg);
    const infiltradora = ids.find((id) => tg.state.objects[id].def === N)!;
    const anel = ids.find((id) => tg.state.objects[id].def === 'Sol Ring')!;
    expect(tg.actionIds()).toContain(`faceup:${infiltradora}`);
    expect(tg.actionIds()).not.toContain(`faceup:${anel}`);
    tg.answer({ kind: 'priority', action: `faceup:${infiltradora}` });
    tg.settle();
    expect(tg.state.objects[infiltradora].faceDown).toBe(false);
    expect(nameOf(tg.g, infiltradora)).toBe(N);
    expect(tg.pt(infiltradora)).toEqual([2, 3]);
  });

  it('se ela já saiu do campo, só a carta do topo do grimório é manifestada', () => {
    const tg = setup({ battlefield: [[N], []], library: [['Sol Ring', ...ilhas], ilhas] });
    tg.attack([[N, 1]]).passUntil((t) => t.state.zones.stack.length > 0);
    removeCard(tg, tg.bf(N));
    tg.resolveAll();
    const ids = viradas(tg);
    expect(ids.map((id) => tg.state.objects[id].def)).toEqual(['Sol Ring']);
    expect(tg.names(0, 'graveyard')).toEqual([N]);
  });

  it('não pode ser bloqueada enquanto você não controlar outras criaturas', () => {
    const sozinha = setup({ battlefield: [[N], ['Indomitable Ancients']] });
    sozinha.attack([[N, 1]]).passTo('declareBlockers');
    expect(blockCandidates(sozinha.g, 1)).toEqual([]);
    const acompanhada = setup({ battlefield: [[N, 'Silver Myr'], ['Indomitable Ancients']] });
    acompanhada.attack([[N, 1]]).passTo('declareBlockers');
    expect(blockCandidates(acompanhada.g, 1).map((b) => acompanhada.state.objects[b.obj].def)).toEqual(['Indomitable Ancients']);
  });
});
