// Link e resposta do Moxfield: só links de deck do moxfield.com; zonas que o jogo não joga recusam o deck.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { baixarDeck, ErroDeck, lerLink, normalizar } from '../../servidor/catalogo/moxfield.ts';
import { ErroRede } from '../../servidor/catalogo/rede.ts';
import { RedeFalsa, respostaMox } from './ajuda.ts';

const V3 = JSON.parse(readFileSync(join(import.meta.dirname, 'dados', 'moxfield-v3.json'), 'utf8'));

describe('lerLink', () => {
  it('aceita o link do deck (com ou sem www, barra no fim, parâmetros) e o próprio id', () => {
    expect(lerLink('https://moxfield.com/decks/HAKhAXl1RHyly2_QGDPvzg')).toBe('HAKhAXl1RHyly2_QGDPvzg');
    expect(lerLink('  https://www.moxfield.com/decks/HAKhAXl1RHyly2_QGDPvzg/  ')).toBe('HAKhAXl1RHyly2_QGDPvzg');
    expect(lerLink('https://moxfield.com/decks/GlOgAc8-TnKWpvRoIoHulw?tab=stats#x')).toBe('GlOgAc8-TnKWpvRoIoHulw');
    expect(lerLink('shVPe5yzCU2zxRPfg2eOrQ')).toBe('shVPe5yzCU2zxRPfg2eOrQ');
  });

  it('recusa outros sites, outras páginas e ids estranhos', () => {
    for (const s of [
      '', 'moxfield', 'https://moxfield.com.evil.com/decks/HAKhAXl1RHyly2_QGDPvzg', 'https://evilmoxfield.com/decks/HAKhAXl1RHyly2_QGDPvzg',
      'https://moxfield.com/users/nvvvm', 'https://moxfield.com/decks/HAKhAXl1RHyly2_QGDPvzg/primer', 'https://moxfield.com/decks/../etc/passwd',
      'https://moxfield.com/decks/abc', 'ftp://moxfield.com/decks/HAKhAXl1RHyly2_QGDPvzg', 'javascript:alert(1)', '../../decks/x.json',
    ]) expect(lerLink(s), s).toBeNull();
  });
});

describe('normalizar', () => {
  it('resposta real da v3: comandante, deck principal e versão; reserva e "talvez" ficam de fora', () => {
    const d = normalizar(V3, 'HAKhAXl1RHyly2_QGDPvzg');
    expect(d.publicId).toBe('HAKhAXl1RHyly2_QGDPvzg');
    expect(d.nome).toBe('Multiverse Reforged (Reality Fracture Commander Decklist)');
    expect(d.comandantes.map((c) => c.nome)).toEqual(['Jace, Multiverse Architect']);
    expect(d.comandantes[0].scryfallId).toBe('55cd03d9-2535-4cf3-a8b2-1418e1190f4a');
    expect(d.principal).toHaveLength(6);
    expect(d.versao).toBe(V3.version);
    expect(d.atualizadoEm).toBe(V3.lastUpdatedAtUtc);
  });

  it('v2 (zonas no topo) dá o mesmo resultado', () => {
    const { boards, ...resto } = V3;
    const v2 = { ...resto, commanders: boards.commanders.cards, mainboard: boards.mainboard.cards };
    const a = normalizar(V3, 'x12345678');
    const b = normalizar(v2, 'x12345678');
    expect(b.comandantes).toEqual(a.comandantes);
    expect(b.principal).toEqual(a.principal);
  });

  it('a mesma carta em duas linhas (edições diferentes) vira uma linha', () => {
    const r = respostaMox('Teste12345', 'T', { nome: 'Jace' }, [{ nome: 'Island', quantidade: 3 }, { nome: 'Island', quantidade: 2 }, { nome: 'Opt' }]);
    expect(normalizar(r, 'Teste12345').principal.map((e) => [e.nome, e.quantidade])).toEqual([['Island', 5], ['Opt', 1]]);
  });

  it('recusa sem comandante, com parceiros, com companheiro ou atrações, e ficha no deck', () => {
    const base = (extra: Record<string, unknown>, cmd = { nome: 'Jace' }) => respostaMox('Teste12345', 'T', cmd, [{ nome: 'Opt' }], extra);
    const semCmd = base({});
    semCmd.boards.commanders.cards = {};
    expect(() => normalizar(semCmd, 'x')).toThrow(/não tem comandante/);
    const dois = base({});
    dois.boards.commanders = respostaMox('a', 'b', { nome: 'A' }, [{ nome: 'A' }, { nome: 'B' }]).boards.mainboard;
    expect(() => normalizar(dois, 'x')).toThrow(/mais de um comandante/);
    const comp = base({});
    (comp.boards as Record<string, unknown>).companions = respostaMox('a', 'b', { nome: 'A' }, [{ nome: 'Lurrus' }]).boards.mainboard;
    expect(() => normalizar(comp, 'x')).toThrow(/companheiro/);
    const atr = base({});
    (atr.boards as Record<string, unknown>).attractions = respostaMox('a', 'b', { nome: 'A' }, [{ nome: 'Atração' }]).boards.mainboard;
    expect(() => normalizar(atr, 'x')).toThrow(/atrações/);
    const ficha = respostaMox('Teste12345', 'T', { nome: 'Jace' }, [{ nome: 'Treasure', ficha: true }]);
    expect(() => normalizar(ficha, 'x')).toThrow(/ficha/);
  });

  it('o nome do deck é limpo e cortado em 60 caracteres', () => {
    const r = respostaMox('Teste12345', `  Deck\u0000 com\n  ${'x'.repeat(80)}`, { nome: 'Jace' }, [{ nome: 'Opt' }]);
    const n = normalizar(r, 'Teste12345').nome;
    expect(n.startsWith('Deck com x')).toBe(true);
    expect(n).toHaveLength(60);
    // o corte cai num espaço: o nome não termina com ele
    const espaco = respostaMox('Teste12345', `${'y'.repeat(59)} depois`, { nome: 'Jace' }, [{ nome: 'Opt' }]);
    expect(normalizar(espaco, 'Teste12345').nome).toBe('y'.repeat(59));
  });
});

describe('baixarDeck', () => {
  it('usa a v3 e, se ela não achar, a v2', async () => {
    const rede = new RedeFalsa();
    rede.moxfield.set('v2:Antigo1234', { ...respostaMox('Antigo1234', 'Velho', { nome: 'Jace' }, [{ nome: 'Opt' }]), boards: undefined, commanders: { a: { quantity: 1, card: { name: 'Jace' } } }, mainboard: { b: { quantity: 1, card: { name: 'Opt' } } } });
    const { deck } = await baixarDeck(rede, 'Antigo1234');
    expect(deck.nome).toBe('Velho');
    expect(rede.pedidos).toEqual(['GET https://api2.moxfield.com/v3/decks/all/Antigo1234', 'GET https://api2.moxfield.com/v2/decks/all/Antigo1234']);
  });

  it('deck que não existe, recusa e página de bloqueio viram mensagens claras', async () => {
    const rede = new RedeFalsa();
    await expect(baixarDeck(rede, 'NaoExiste1')).rejects.toThrow(/não encontrado no Moxfield/);
    rede.moxfield.set('v3:Bloqueado1', new ErroRede('bloqueado', 'u', 403, 'recusou'));
    await expect(baixarDeck(rede, 'Bloqueado1')).rejects.toThrow(/recusou o pedido/);
    rede.moxfield.set('v3:Pagina123', new ErroRede('nao-json', 'u', 200, 'html'));
    await expect(baixarDeck(rede, 'Pagina123')).rejects.toBeInstanceOf(ErroDeck);
    await expect(baixarDeck(rede, '../x')).rejects.toThrow(/inválido/);
  });
});
