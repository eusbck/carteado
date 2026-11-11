// Presságio / omen (CR 720): a carta de presságio se conjura como a criatura ou como o presságio (720.3); fora da pilha
// e na pilha sem ser presságio, só as características normais (720.4); como presságio, só as alternativas (720.3b) e,
// ao resolver, é embaralhada no grimório do dono (720.3d). O Moxfield traz Marang River Regent na impressão reversível
// (layout 'reversible_card' com três faces); motor/oracle.ts a reduz a uma face por nome.
import { describe, expect, it } from 'vitest';
import { setup } from './harness.ts';
import { chars, counter, ehPresagio } from '../motor/api.ts';
import { ehReversivel, facesConjuraveis, rotuloConjurar, temVariasFaces } from '../motor/formatos.ts';
import { oracle } from '../motor/oracle.ts';

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
});
