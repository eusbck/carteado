import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { chars, counter } from '../../motor/api.ts';

const MR = 'Marang River Regent // Coil and Catch // Marang River Regent';
const ILHAS = ['Island', 'Island', 'Island', 'Island', 'Island', 'Island'];
const LIB = ['Plains', 'Swamp', 'Forest', 'Mountain'];

describe('Marang River Regent // Coil and Catch', () => {
  it('ao conjurar, escolhe a criatura ou o presságio', () => {
    const tg = setup({ battlefield: [ILHAS, []], hand: [[MR], []] });
    const id = tg.find(MR, 'hand')!;
    expect(tg.actionIds()).toEqual(expect.arrayContaining([`cast:${id}:hand`, `cast:${id}:hand@1`]));
  });

  it('fora da pilha é uma carta de criatura Dragon azul de valor 6', () => {
    const tg = setup({ hand: [[MR], []] });
    const c = chars(tg.g, tg.find(MR, 'hand')!);
    expect(c.name).toBe('Marang River Regent');
    expect(c.types).toEqual(['Creature']);
    expect(c.subtypes).toEqual(['Dragon']);
    expect(c.manaValue).toBe(6);
    expect([c.power, c.toughness]).toEqual([6, 7]);
  });

  it('a criatura: ao entrar, devolve até dois outros permanentes não terreno', () => {
    const tg = setup({ battlefield: [[...ILHAS, 'Sol Ring'], ['Dragon Whelp', 'Forest']], hand: [[MR], []] });
    tg.choose('outro permanente não terreno', ['Sol Ring', 'Dragon Whelp']).cast(MR, 'hand').resolve().resolve();
    expect(tg.names(0, 'hand')).toEqual(['Sol Ring']);
    expect(tg.names(1, 'hand')).toEqual(['Dragon Whelp']);
    expect(tg.find('Forest', 'battlefield', 1)).not.toBeNull();
    expect(tg.find(MR, 'battlefield', 0)).not.toBeNull();
  });

  it('na pilha como presságio, só as características de Coil and Catch', () => {
    const tg = setup({ battlefield: [ILHAS, []], hand: [[MR], []], library: [LIB, []] });
    tg.cast(MR, 'hand@1');
    const c = chars(tg.g, tg.state.zones.stack[0]);
    expect(c.name).toBe('Coil and Catch');
    expect(c.types).toEqual(['Instant']);
    expect(c.subtypes).toEqual(['Omen']);
    expect(c.manaValue).toBe(4);
    // pagou só {3}{U}
    expect(tg.state.zones.battlefield.filter((id) => tg.state.objects[id].tapped).length).toBe(4);
  });

  it('o presságio resolvido é embaralhado no grimório do dono', () => {
    const tg = setup({ battlefield: [ILHAS, []], hand: [[MR], []], library: [LIB, []] });
    tg.choose('Descarte', ['Plains']).cast(MR, 'hand@1').resolve();
    // comprou três e descartou uma
    expect(tg.names(0, 'hand').sort()).toEqual(['Forest', 'Swamp']);
    expect(tg.names(0, 'graveyard')).toEqual(['Plains']);
    expect(tg.names(0, 'library').sort()).toEqual(['Marang River Regent', 'Mountain']);
    expect(tg.find(MR, 'library', 0)).not.toBeNull();
  });

  it('anulado, o presságio vai para o cemitério', () => {
    const tg = setup({ battlefield: [ILHAS, []], hand: [[MR], []], library: [LIB, []] });
    tg.cast(MR, 'hand@1');
    tg.run(counter(tg.g, tg.state.zones.stack[0]));
    expect(tg.find(MR, 'graveyard', 0)).not.toBeNull();
    expect(chars(tg.g, tg.find(MR, 'graveyard')!).name).toBe('Marang River Regent');
  });
});
