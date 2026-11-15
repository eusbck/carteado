// Presságio / omen (CR 720): a carta de presságio se conjura como a criatura ou como o presságio (720.3); fora da pilha
// e na pilha sem ser presságio, só as características normais (720.4); como presságio, só as alternativas (720.3b) e,
// ao resolver, é embaralhada no grimório do dono (720.3d). O Moxfield traz Marang River Regent na impressão reversível
// (layout 'reversible_card' com três faces); motor/oracle.ts a reduz a uma face por nome.
import { describe, expect, it } from 'vitest';
import { setup } from './harness.ts';
import { chars, counter, ehPresagio } from '../motor/api.ts';
import { ehReversivel, facesConjuraveis, rotuloConjurar, temVariasFaces } from '../motor/formatos.ts';
import { oracle } from '../motor/oracle.ts';
import { copySpell, defineAbility, staticAbility, untilEndOfTurn } from '../motor/api.ts';
import { runEffect } from './artefatos.ts';
import { novoDiario } from '../motor/diario.ts';

const MR = 'Marang River Regent // Coil and Catch // Marang River Regent';

describe('Presságio (CR 720)', () => {
  it('a impressão reversível vira uma carta de presságio com duas faces; o texto do presságio é o do Oracle', () => {
    const o = oracle(MR);
    expect(o.faces.map((f) => f.name)).toEqual(['Marang River Regent', 'Coil and Catch']);
    expect(o.faces[1].oracleText).toContain('Draw three cards, then discard a card');
    expect([o.faces[1].power, o.faces[1].toughness]).toEqual([null, null]);
    expect(ehPresagio(MR)).toBe(true);
    // as reversíveis de verdade (as duas faces iguais) continuam como antes
    expect(ehReversivel('Dragonlord Kolaghan // Dragonlord Kolaghan')).toBe(true);
    expect(ehPresagio('Dragonlord Kolaghan // Dragonlord Kolaghan')).toBe(false);
    expect(oracle('Dragonlord Kolaghan // Dragonlord Kolaghan').faces.length).toBe(2);
    expect(temVariasFaces('Dragonlord Kolaghan // Dragonlord Kolaghan')).toBe(false);
  });

  it('CR 720.3: as duas faces se conjuram, da mão e de outras zonas; o rótulo diz "presságio"', () => {
    expect(facesConjuraveis(MR, 'hand')).toEqual([0, 1]);
    expect(facesConjuraveis(MR, 'exile')).toEqual([0, 1]);
    expect(rotuloConjurar(MR, 1)).toBe('Conjurar Coil and Catch (presságio)');
  });

  it('CR 720.4: fora da pilha, só as características normais', () => {
    const tg = setup({ graveyard: [[MR], []] });
    const c = chars(tg.g, tg.find(MR, 'graveyard')!);
    expect(c.types).toEqual(['Creature']);
    expect(c.manaValue).toBe(6);
  });

  it('CR 720.3b, 720.3d: como presságio, características alternativas e embaralhada no grimório ao resolver', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island', 'Island'], []], hand: [[MR], []], library: [['Plains', 'Swamp', 'Forest', 'Mountain'], []] });
    tg.choose('Descarte', ['Plains']).cast(MR, 'hand@1');
    expect(chars(tg.g, tg.state.zones.stack[0]).types).toEqual(['Instant']);
    tg.resolve();
    expect(tg.find(MR, 'library', 0)).not.toBeNull();
    expect(tg.find(MR, 'graveyard', 0)).toBeNull();
  });

  it('CR 720.3d: conjurada como criatura, entra no campo normalmente', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island', 'Island', 'Island', 'Island'], []], hand: [[MR], []] });
    tg.cast(MR, 'hand').resolve();
    expect(tg.find(MR, 'battlefield', 0)).not.toBeNull();
  });

  it('presságio anulado vai para o cemitério (não é embaralhado)', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island', 'Island'], []], hand: [[MR], []] });
    tg.cast(MR, 'hand@1');
    tg.run(counter(tg.g, tg.state.zones.stack[0]));
    expect(tg.find(MR, 'graveyard', 0)).not.toBeNull();
  });

  it('CR 720.3c-d, 704.5e: a cópia é embaralhada antes de deixar de existir, e só seu dono embaralha', () => {
    const tg = setup({ battlefield: [Array(4).fill('Island'), []], hand: [[MR], []], library: [Array(6).fill('Island'), Array(6).fill('Forest')] });
    tg.cast(MR, 'hand@1');
    runEffect(tg, copySpell(tg.g, tg.state.zones.stack[0], 1));
    tg.g.diario = novoDiario();
    tg.resolve();
    const eventos = tg.g.diario.entradas.map((e) => e.ev);
    expect(eventos.filter((e) => e.type === 'zone' && e.cause === 'omen' && e.to === 'library')).toHaveLength(1);
    expect(eventos.filter((e) => e.type === 'shuffle').map((e) => e.type === 'shuffle' ? e.player : -1)).toEqual([1]);
    expect(Object.values(tg.state.objects).some((o) => o.isCopy)).toBe(false);
    expect(tg.state.zones.stack).toHaveLength(1);
  });

  it('CR 720.3a: uma permissão que só conjura criaturas não oferece a face de presságio', () => {
    const tg = setup({ battlefield: [['Thundermane Dragon', ...Array(6).fill('Island')], []], library: [[MR, 'Forest'], []] });
    const id = tg.find(MR, 'library')!;
    const acoes = tg.actionIds().filter((a) => a.startsWith(`cast:${id}:`));
    expect(acoes).toHaveLength(1);
    expect(acoes[0]).not.toContain('@1');
    expect(chars(tg.g, id).types).toEqual(['Creature']);
  });

  it.each([false, true])('CR 720.3a: uma permissão apenas para instantâneas encontra o presságio mesmo com teste no filtro (%s)', (noFiltro) => {
    const habilidade = defineAbility(`teste:presagio-do-topo:${noFiltro}`, staticAbility({ rules: {
      mayPlayFrom: (c, p, carta) => {
        if (p !== c.you || c.g.state.zones.library[p][0] !== carta) return null;
        const instantanea = () => chars(c.g, carta).types.includes('Instant');
        if (!noFiltro && !instantanea()) return null;
        return { key: 'teste-presagio', label: 'Conjurar instantânea do topo', ...(noFiltro ? { filter: instantanea } : {}) };
      },
    } }));
    const tg = setup({ battlefield: [['Sol Ring', ...Array(4).fill('Island')], []], library: [[MR, 'Forest'], []] });
    const fonte = tg.bf('Sol Ring');
    const id = tg.find(MR, 'library')!;
    untilEndOfTurn({ g: tg.g, you: 0, source: fonte }, [fonte], [{ k: 'addAbility', id: habilidade.id! }]);
    tg.refresh();
    const acoes = tg.actionIds().filter((a) => a.startsWith(`cast:${id}:`));
    expect(acoes).toHaveLength(1);
    expect(acoes[0]).toContain('@1');
    // A consulta terminou: a carta continua no grimório e com as características normais (CR 720.4).
    expect(tg.state.objects[id].zone).toBe('library');
    expect(chars(tg.g, id).manaValue).toBe(6);
    expect(chars(tg.g, id).types).toEqual(['Creature']);
  });

  it('CR 720.3a-b: Bolas\'s Citadel oferece ambas as faces e cobra o valor de mana da face escolhida', () => {
    const tg = setup({ battlefield: [["Bolas's Citadel"], []], library: [[MR, 'Forest'], []] });
    const id = tg.find(MR, 'library')!;
    const acoes = tg.pending?.kind === 'priority' ? tg.pending.actions.filter((a) => a.obj === id && a.kind === 'cast') : [];
    expect(acoes).toHaveLength(2);
    const presagio = acoes.find((a) => a.id.endsWith('@1'))!;
    expect(presagio.label).toContain('4 de vida');
    expect(acoes.find((a) => !a.id.endsWith('@1'))!.label).toContain('6 de vida');
    tg.answer({ kind: 'priority', action: presagio.id });
    tg.settle();
    expect(tg.life(0)).toBe(36);
    expect(chars(tg.g, tg.state.zones.stack[0]).name).toBe('Coil and Catch');
  });
});
