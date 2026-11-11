// CR 903.3 (25/09/2026): o comandante é uma carta lendária que é (a) criatura, (b) Veículo ou
// (c) Espaçonave com uma ou mais caixas de poder/resistência; ou diz que pode ser seu comandante (903.3a).
import { describe, expect, it } from 'vitest';
import { validateDeck } from '../motor/deck.ts';
import type { OracleCard, OracleFace } from '../motor/oracle.ts';
import { Game } from '../motor/game.ts';
import type { DeckList } from '../motor/state.ts';
import { commanderTax } from '../motor/stack.ts';
import decks from './decks-teste.json' with { type: 'json' };

const DECKS = decks as DeckList[];

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

// ---------------------------------------------------------------- parceiros (CR 702.124)

const lenda = (nome: string, texto = '', extra: Partial<OracleFace> = {}) =>
  carta(nome, { supertypes: ['Legendary'], types: ['Creature'], subtypes: ['Human'], power: 2, toughness: 2, oracleText: texto, ...extra });

function problemasDupla(a: OracleCard, b: OracleCard, cartas = [{ nome: 'Forest', quantidade: 98 }]) {
  const buscar = (n: string) => (n === a.name ? a : n === b.name ? b : floresta);
  return validateDeck({ id: 't', nome: 't', comandante: a.name, parceiro: b.name, cartas }, buscar).map((p) => p.rule);
}

describe('dois comandantes (CR 702.124)', () => {
  it('702.124h: os dois com partner', () => {
    expect(problemasDupla(lenda('Tana', 'Partner (You can have two commanders if both have partner.)'), lenda('Tymna', 'Flying\nPartner'))).toEqual([]);
  });
  it('702.124h: só um com partner não vale', () => {
    expect(problemasDupla(lenda('Tana', 'Partner'), lenda('Outra'))).toContain('702.124');
  });
  it('702.124i: partner—[texto] só com o mesmo texto', () => {
    expect(problemasDupla(lenda('Will', 'Partner—Friends forever'), lenda('Mike', 'Friends forever'))).toEqual([]);
    expect(problemasDupla(lenda('Will', 'Partner—Friends forever'), lenda('Joel', 'Partner—Survivors'))).toContain('702.124');
  });
  it('702.124f: partner e partner—[texto] não se combinam', () => {
    expect(problemasDupla(lenda('Tana', 'Partner'), lenda('Will', 'Partner—Friends forever'))).toContain('702.124');
  });
  it('702.124j: partner with só com o par nomeado, nos dois sentidos', () => {
    const frodo = lenda('Frodo, Adventurous Hobbit', 'Partner with Sam, Loyal Attendant (When this creature enters, target player may put Sam into their hand from their library, then shuffle.)');
    const sam = lenda('Sam, Loyal Attendant', 'Partner with Frodo, Adventurous Hobbit');
    expect(problemasDupla(frodo, sam)).toEqual([]);
    expect(problemasDupla(frodo, lenda('Pippin', 'Partner with Merry'))).toContain('702.124');
  });
  it('702.124k: choose a Background com um Background lendário (que só é comandante nessa dupla)', () => {
    const wilson = lenda('Wilson', 'Choose a Background');
    const bg = carta('Raised by Giants', { supertypes: ['Legendary'], types: ['Enchantment'], subtypes: ['Background'] });
    expect(problemasDupla(wilson, bg)).toEqual([]);
    expect(problemasDupla(lenda('Outra'), bg)).toEqual(expect.arrayContaining(['702.124', '903.3']));
  });
  it("702.124m: Doctor's companion com um Time Lord Doctor sem outros tipos", () => {
    const rose = lenda('Rose Tyler', "Doctor’s companion (You can have two commanders if the other is the Doctor.)");
    const doutor = lenda('The Tenth Doctor', '', { subtypes: ['Time Lord', 'Doctor'] });
    expect(problemasDupla(rose, doutor)).toEqual([]);
    expect(problemasDupla(rose, lenda('Outro Doutor', '', { subtypes: ['Human', 'Doctor'] }))).toContain('702.124');
  });
  it('702.124b: 100 cartas contando os dois comandantes', () => {
    expect(problemasDupla(lenda('Tana', 'Partner'), lenda('Tymna', 'Partner'), [{ nome: 'Forest', quantidade: 99 }])).toContain('903.5a');
  });
  it('702.124c: a identidade de cor é a dos dois juntos', () => {
    const a = { ...lenda('Tana', 'Partner'), colorIdentity: ['G'] as OracleCard['colorIdentity'] };
    const b = { ...lenda('Tymna', 'Partner'), colorIdentity: ['W'] as OracleCard['colorIdentity'] };
    const branca = carta('Swords', { types: ['Instant'] });
    branca.colorIdentity = ['W'];
    const buscar = (n: string) => (n === a.name ? a : n === b.name ? b : n === 'Swords' ? branca : floresta);
    const cartas = [{ nome: 'Forest', quantidade: 97 }, { nome: 'Swords', quantidade: 1 }];
    expect(validateDeck({ id: 't', nome: 't', comandante: a.name, parceiro: b.name, cartas }, buscar)).toEqual([]);
    expect(validateDeck({ id: 't', nome: 't', comandante: a.name, cartas: [...cartas, { nome: 'Forest', quantidade: 1 }] }, buscar).map((p) => p.rule)).toContain('903.5c');
  });
});

describe('partida com dois comandantes (CR 702.124b, 702.124d)', () => {
  it('os dois começam na zona de comando e o imposto de um não conta para o outro', () => {
    const base = DECKS[0];
    const parceiro = DECKS[1].comandante;
    const deck = { ...base, id: 'dupla', parceiro };
    const g = Game.create({ seed: 'parceiros', players: [{ name: 'A', deckId: 'dupla' }, { name: 'B', deckId: DECKS[2].id }], startingLife: 40, turnLimit: 5, multiplayer: false }, [deck, DECKS[2]]);
    const s = g.state;
    expect(s.players[0].commanders.length).toBe(2);
    const naZona = s.zones.command.map((id) => s.objects[id]).filter((o) => o.owner === 0).map((o) => o.def).sort();
    expect(naZona).toEqual([base.comandante, parceiro].sort());
    const [c1, c2] = s.players[0].commanders;
    s.players[0].commanderCasts[String(c1)] = 2;
    const obj = (cid: number) => s.objects[s.zones.command.find((id) => s.objects[id].card === cid)!];
    expect(commanderTax(g as never, 0, obj(c1))).toBe(4);
    expect(commanderTax(g as never, 0, obj(c2))).toBe(0);
  });
});
