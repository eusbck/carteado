import { describe, expect, it } from 'vitest';
import { counter } from '../../motor/api.ts';
import { chars } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Rin and Seri, Inseparable // Rin and Seri, Inseparable';
const terrenos = ['Mountain', 'Forest', 'Plains', 'Mountain', 'Forest', 'Plains', 'Mountain'];
const gato = { name: 'Cat verde 1/1', token: true };
const cao = { name: 'Dog branco 1/1', token: true };

describe(N, () => {
  it('carta reversível: vale a face da frente, uma criatura lendária Dog Cat 4/4 de valor de mana 4', () => {
    const tg = setup({ battlefield: [terrenos, []], hand: [[N], []] });
    const naMao = tg.find(N, 'hand', 0)!;
    expect(chars(tg.g, naMao).name).toBe('Rin and Seri, Inseparable');
    expect(chars(tg.g, naMao).manaValue).toBe(4);
    // uma opção só de conjurar: não há escolha de face
    expect(tg.actionIds().filter((a) => a.startsWith('cast:'))).toHaveLength(1);
    tg.cast(N).resolveAll();
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([4, 4]);
    expect(chars(tg.g, id).subtypes.sort()).toEqual(['Cat', 'Dog']);
    expect(chars(tg.g, id).supertypes).toContain('Legendary');
  });

  it('não dispara ao conjurar a própria Rin and Seri', () => {
    const tg = setup({ battlefield: [terrenos, []], hand: [[N], []] });
    tg.cast(N);
    expect(tg.state.zones.stack).toHaveLength(1);
    tg.resolveAll();
    expect(tg.all('Cat')).toHaveLength(0);
    expect(tg.all('Dog')).toHaveLength(0);
  });

  it('como comandante, é conjurada da zona de comando', () => {
    const tg = setup({ battlefield: [terrenos, []], command: [[{ name: N, commander: true }], []] });
    tg.cast(N, 'command').resolveAll();
    expect(tg.find(N)).not.toBeNull();
  });

  it('a ficha vem antes de a mágica resolver, mesmo que ela seja anulada', () => {
    // Taurean Mauler é polimorfo: mágica de Dog e de Cat ao mesmo tempo, dispara as duas habilidades
    const tg = setup({ battlefield: [[N, ...terrenos], []], hand: [['Taurean Mauler'], []] });
    tg.cast('Taurean Mauler');
    expect(tg.state.zones.stack).toHaveLength(3);
    tg.resolve();
    tg.resolve();
    expect(tg.all('Cat')).toHaveLength(1);
    expect(tg.all('Dog')).toHaveLength(1);
    expect(tg.state.zones.stack).toHaveLength(1);
    tg.run(counter(tg.g, tg.state.zones.stack[0]));
    tg.settle();
    expect(tg.find('Taurean Mauler')).toBeNull();
    expect(tg.all('Cat')).toHaveLength(1);
  });

  it('mágica que não é de Dog nem de Cat não cria fichas', () => {
    const tg = setup({ battlefield: [[N, ...terrenos], []], hand: [['Elvish Mystic'], []] });
    tg.cast('Elvish Mystic').resolveAll();
    expect(tg.all('Cat')).toHaveLength(0);
    expect(tg.all('Dog')).toHaveLength(0);
  });

  it('conta os Cães e Felinos na resolução, inclusive a própria Rin and Seri', () => {
    // Cães: Rin and Seri + duas fichas = 3 de dano; Felinos: Rin and Seri + uma ficha = 2 de vida
    const tg = setup({ battlefield: [[N, cao, cao, gato, ...terrenos], []] });
    tg.choose('qualquer alvo', ['Bruno']).activate('Rin and Seri, Inseparable').resolveAll();
    expect(tg.life(1)).toBe(37);
    expect(tg.life(0)).toBe(42);
    expect(tg.state.objects[tg.bf(N)].tapped).toBe(true);
  });
});
