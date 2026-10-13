// Decks próprios da mesa (Lula e Bolsonaro): listas válidas, todas as cartas com regras e imagem, e cada skin com as
// mesmas habilidades da carta copiada.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import '../../cartas/index.ts';
import { SKINS } from '../../cartas/skins.ts';
import { validateDeck } from '../../motor/deck.ts';
import { cardDef } from '../../motor/defs.ts';
import { oracle } from '../../motor/oracle.ts';
import { RAIZ_JOGO } from '../../servidor/catalogo/caminhos.ts';
import { cartaPronta } from '../../servidor/catalogo/prontidao.ts';
import type { DeckArquivo } from '../../servidor/catalogo/tipos.ts';
import { idDe } from '../../ferramentas/cartas-proprias.ts';

const ler = (id: string) => JSON.parse(readFileSync(join(RAIZ_JOGO, 'decks', `${id}.json`), 'utf8')) as DeckArquivo;

describe('Decks próprios da mesa', () => {
  for (const id of ['brasil-lula', 'brasil-bolsonaro']) {
    it(`${id}: 100 cartas, regras de deck de Commander e todas as cartas prontas`, () => {
      const l = ler(id).atual!;
      expect(l.cartas.reduce((n, c) => n + c.quantidade, 0) + 1).toBe(100);
      expect(validateDeck({ id, nome: id, comandante: l.comandante, cartas: l.cartas }, oracle)).toEqual([]);
      expect([l.comandante, ...l.cartas.map((c) => c.nome)].filter((n) => !cartaPronta(n))).toEqual([]);
    });
  }

  it('toda carta própria tem a imagem montada', () => {
    const fonte = JSON.parse(readFileSync(join(RAIZ_JOGO, 'proprias', 'cartas.json'), 'utf8')) as { cartas: { nome: string }[] };
    const faltam = fonte.cartas.filter((c) => !existsSync(join(RAIZ_JOGO, 'proprias', 'imagens', idDe('impressao', c.nome), 'front.png'))).map((c) => c.nome);
    expect(faltam).toEqual([]);
  });

  it('cada skin tem os dados e as habilidades da carta copiada, com ids próprios', () => {
    expect(SKINS.length).toBeGreaterThan(30);
    for (const { nome, de } of SKINS) {
      const skin = cardDef(nome)!;
      const original = cardDef(de)!;
      expect(skin.pending, nome).toBeFalsy();
      expect(skin.faces[0].abilities?.length ?? 0, nome).toBe(original.faces[0].abilities?.length ?? 0);
      for (const a of skin.faces[0].abilities ?? []) expect(a.id!.startsWith(nome), `${nome}: ${a.id}`).toBe(true);
      for (const a of original.faces[0].abilities ?? []) expect(a.id!.startsWith(de), `${de}: ${a.id}`).toBe(true);
      const o = oracle(nome).faces[0];
      const b = oracle(de).faces[0];
      expect([o.manaCostText, o.typeLine, o.power, o.toughness], nome).toEqual([b.manaCostText, b.typeLine, b.power, b.toughness]);
    }
  });
});
