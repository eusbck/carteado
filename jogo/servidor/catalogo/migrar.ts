// Passa os decks coletados em ../cartas (coletar.py) para decks/, com o link do Moxfield, para que também possam
// ser atualizados pela tela. Não mexe num deck que já está em decks/.

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import type { Pastas } from './caminhos.ts';
import type { Catalogo } from './catalogo.ts';
import { lerOriginais } from './gerar.ts';
import { linkDoDeck } from './moxfield.ts';
import type { DeckArquivo, EntradaLista } from './tipos.ts';

export function migrar(pastas: Pastas, catalogo: Catalogo): { criados: string[]; existentes: string[] } {
  const { cards, decks } = lerOriginais(pastas.cartasOriginais);
  const pastaDecks = join(pastas.cartasOriginais, 'decks');
  const pastasDeck = existsSync(pastaDecks) ? readdirSync(pastaDecks).sort() : [];
  const criados: string[] = [];
  const existentes: string[] = [];
  decks.forEach((d, ordem) => {
    if (catalogo.ler(d.id)) { existentes.push(d.id); return; }
    let comandante = '';
    const cartas: EntradaLista[] = [];
    for (const e of d.entries) {
      const c = e.card_id ? cards[e.card_id] : undefined;
      if (!c) throw new Error(`${d.name}: carta sem dados em ../cartas (${e.card_id})`);
      if (e.zone === 'commanders') comandante = c.name;
      else if (e.zone === 'mainboard') cartas.push({ nome: c.name, quantidade: e.quantity });
    }
    const bruto = join(pastas.cartasOriginais, 'raw', 'moxfield', `${d.id}.json`);
    const mox = existsSync(bruto) ? JSON.parse(readFileSync(bruto, 'utf8')) as { version?: number; lastUpdatedAtUtc?: string } : {};
    const pasta = pastasDeck.find((p) => p.endsWith(`--${d.id}`));
    const quando = new Date(statSync(join(pastaDecks, pasta ?? '', 'deck.json')).mtimeMs).toISOString();
    const arq: DeckArquivo = {
      formato: 1,
      id: d.id,
      ordem,
      nome: d.name,
      link: d.source_url ?? linkDoDeck(d.id),
      importadoEm: quando,
      verificadoEm: null,
      atual: { comandante, cartas, origem: { versao: mox.version ?? null, atualizadoEm: mox.lastUpdatedAtUtc ?? null }, desde: quando },
      preparacao: null,
    };
    catalogo.salvar(arq);
    criados.push(d.id);
  });
  return { criados, existentes };
}
