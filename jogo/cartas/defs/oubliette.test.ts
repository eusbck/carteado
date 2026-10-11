import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { attackCandidates } from '../../motor/combat.ts';
import { fixture as setup, removeCard } from '../../testes/artefatos.ts';

const N = 'Oubliette';
const Z = 'Zetalpa, Primal Dawn';
const pantanos = ['Swamp', 'Swamp', 'Swamp', 'Swamp', 'Swamp'];
// Darksteel Mutation: a criatura encantada é um Insect 0/1 indestrutível
const comAura = () => setup({
  battlefield: [pantanos, [{ name: Z, counters: { '+1/+1': 1 } }, { name: 'Darksteel Mutation', attachTo: Z }]],
  hand: [[N, 'Infernal Grasp'], []],
});

describe(N, () => {
  it('a criatura fora de fase não pode ser alvo nem atacar, e as Auras saem de fase com ela', () => {
    const tg = comAura();
    const z = tg.bf(Z);
    const aura = tg.bf('Darksteel Mutation');
    tg.choose('criatura alvo', [Z]).cast(N).resolveAll();
    expect(tg.state.objects[z].phasedOut).toBe(true);
    expect(tg.state.objects[aura].phasedOut).toBe(true);
    // continua no campo (CR 702.26d), mas é tratada como se não existisse
    expect(tg.state.objects[z].zone).toBe('battlefield');
    // sobram dois Swamps para Infernal Grasp, mas não há criatura para mirar
    expect(tg.canCast('Infernal Grasp')).toBe(false);
    expect(attackCandidates(tg.g, 1)).toEqual([]);
  });

  it('a criatura fora de fase não volta na etapa de desvirar do controlador', () => {
    const tg = comAura();
    const z = tg.bf(Z);
    tg.choose('criatura alvo', [Z]).cast(N).resolveAll();
    tg.passTo('main1', 1);
    expect(tg.state.objects[z].phasedOut).toBe(true);
    tg.passTo('main1', 0);
    expect(tg.state.objects[z].phasedOut).toBe(true);
  });

  it('saindo Oubliette, a criatura entra em fase virada, com as Auras e os marcadores', () => {
    const tg = comAura();
    const z = tg.bf(Z);
    const aura = tg.bf('Darksteel Mutation');
    tg.choose('criatura alvo', [Z]).cast(N).resolveAll();
    removeCard(tg, tg.bf(N));
    tg.resolveAll();
    expect(tg.state.objects[z].phasedOut).toBe(false);
    expect(tg.state.objects[z].tapped).toBe(true);
    expect(tg.state.objects[aura].phasedOut).toBe(false);
    expect(tg.state.objects[aura].attachedTo).toBe(z);
    expect(tg.pt(z)).toEqual([1, 2]);
    expect(hasKw(tg.g, z, 'indestructible')).toBe(true);
    // é o mesmo objeto: nada entrou nem saiu do campo
    expect(tg.bf(Z)).toBe(z);
  });

  it('se Oubliette sai do campo antes de o gatilho resolver, a criatura não sai de fase', () => {
    const tg = comAura();
    const z = tg.bf(Z);
    tg.choose('criatura alvo', [Z]).cast(N).resolve();
    // Oubliette no campo, com o gatilho de entrar na pilha
    expect(tg.state.zones.stack).toHaveLength(1);
    removeCard(tg, tg.bf(N));
    tg.resolveAll();
    expect(tg.state.objects[z].phasedOut).toBe(false);
    expect(tg.state.objects[z].tapped).toBe(false);
  });
});
