// CR 903.3 (25/09/2026): o comandante é uma carta lendária que é (a) criatura, (b) Veículo ou
// (c) Espaçonave com uma ou mais caixas de poder/resistência; ou diz que pode ser seu comandante (903.3a).
import { describe, expect, it } from 'vitest';
import { validateDeck } from '../motor/deck.ts';
import type { OracleCard, OracleFace } from '../motor/oracle.ts';

function carta(nome: string, f: Partial<OracleFace>): OracleCard {
  return {
    name: nome, oracleId: nome, layout: 'normal', manaValue: 3, colorIdentity: ['G'], keywords: [],
    faces: [{
      name: nome, manaCostText: '{2}{G}', manaCost: null, typeLine: '', supertypes: [], types: [], subtypes: [],
      oracleText: '', power: null, toughness: null, ptStar: false, loyalty: null, colors: ['G'], ...f,
    }],
  };
}

const floresta = carta('Forest', { supertypes: ['Basic'], types: ['Land'], subtypes: ['Forest'], colors: [] });

function problemas(cmd: OracleCard) {
  const buscar = (n: string) => (n === cmd.name ? cmd : floresta);
  return validateDeck({ id: 't', nome: 't', comandante: cmd.name, cartas: [{ nome: 'Forest', quantidade: 99 }] }, buscar)
    .map((p) => p.rule);
}

describe('quem pode ser comandante (CR 903.3)', () => {
  it('criatura lendária pode', () => {
    expect(problemas(carta('Lenda', { supertypes: ['Legendary'], types: ['Creature'], power: 2, toughness: 2 }))).toEqual([]);
  });
  it('Veículo lendário pode (903.3b do texto atual: "a Vehicle card")', () => {
    expect(problemas(carta('Carro', { supertypes: ['Legendary'], types: ['Artifact'], subtypes: ['Vehicle'], power: 4, toughness: 4 }))).toEqual([]);
  });
  it('Espaçonave lendária com poder/resistência pode (Hearthhull, the Worldseed)', () => {
    expect(problemas(carta('Hearthhull, the Worldseed', { supertypes: ['Legendary'], types: ['Artifact'], subtypes: ['Spacecraft'], power: 6, toughness: 7 }))).toEqual([]);
  });
  it('Espaçonave lendária sem poder/resistência não pode', () => {
    expect(problemas(carta('Nave', { supertypes: ['Legendary'], types: ['Artifact'], subtypes: ['Spacecraft'] }))).toContain('903.3');
  });
  it('artefato lendário comum não pode', () => {
    expect(problemas(carta('Anel', { supertypes: ['Legendary'], types: ['Artifact'] }))).toContain('903.3');
  });
  it('criatura não lendária não pode', () => {
    expect(problemas(carta('Soldado', { types: ['Creature'], power: 1, toughness: 1 }))).toContain('903.3');
  });
  it('"pode ser seu comandante" vale mesmo sem ser criatura (903.3a)', () => {
    expect(problemas(carta('Andarilho', { supertypes: ['Legendary'], types: ['Planeswalker'], oracleText: 'Andarilho can be your commander.' }))).toEqual([]);
  });
});
