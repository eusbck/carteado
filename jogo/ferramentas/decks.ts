// Decks da mesa pela linha de comando (a tela Decks faz o mesmo pelo navegador).
//
//   node ferramentas/decks.ts migrar                       passa os 7 decks de ../cartas para decks/ (uma vez)
//   node ferramentas/decks.ts gerar                        regera gerado/ a partir de ../cartas e decks/ (e põe no
//                                                          saguão as versões em preparação que ficaram prontas)
//   node ferramentas/decks.ts pendentes [--json]           decks em preparação e as cartas que faltam implementar
//   node ferramentas/decks.ts importar <link> [--confirmar]
//   node ferramentas/decks.ts importar --arquivo resposta.json [--confirmar]
//                                                          (o JSON da API do Moxfield salvo pelo navegador, quando
//                                                          o Moxfield recusa os pedidos do servidor)
//   node ferramentas/decks.ts atualizar <id|todos> [--confirmar]
//   node ferramentas/decks.ts imagens                      baixa de novo as imagens das cartas novas que faltarem
//
// Sem --confirmar, importar e atualizar só mostram o que mudaria. Com a mesa aberta, prefira a tela Decks: o que a
// linha de comando muda só aparece no saguão quando o servidor subir de novo.

import '../cartas/index.ts';
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { oracle } from '../motor/oracle.ts';
import { Banco } from '../servidor/banco.ts';
import { cartasPorNome, rulingsPorOracle } from '../servidor/catalogo/base.ts';
import { pastasPadrao } from '../servidor/catalogo/caminhos.ts';
import { Catalogo } from '../servidor/catalogo/catalogo.ts';
import { lerNovas, nomesDaLista, regenerar } from '../servidor/catalogo/gerar.ts';
import { migrar } from '../servidor/catalogo/migrar.ts';
import { lerLink } from '../servidor/catalogo/moxfield.ts';
import { cartaPronta } from '../servidor/catalogo/prontidao.ts';
import { redeReal, type Rede } from '../servidor/catalogo/rede.ts';
import { TarefasDecks, mensagem } from '../servidor/catalogo/tarefas.ts';
import { comTrava } from '../servidor/catalogo/trava.ts';
import type { Proposta } from '../servidor/protocolo.ts';
import { preencherListasSalvas } from '../servidor/salas.ts';
import { slug } from './slug.ts';

const pastas = pastasPadrao();
const catalogo = new Catalogo({ pasta: pastas.decks, pronta: cartaPronta });
const [comando, ...resto] = process.argv.slice(2);
const confirmar = resto.includes('--confirmar');
const args = resto.filter((a) => !a.startsWith('--'));

/** erro de uso da linha de comando: só a mensagem */
class ErroUso extends Error {}

/** layouts que o motor já sabe jogar (os das 547 cartas de hoje) */
const LAYOUTS = new Set(['normal', 'transform', 'prepare', 'class', 'saga']);

function rede(): Rede {
  const real = redeReal();
  const i = resto.indexOf('--arquivo');
  if (i < 0) return real;
  const arquivo = resto[i + 1];
  if (!arquivo || !existsSync(arquivo)) throw new ErroUso('Informe o arquivo: --arquivo resposta.json');
  const dado = JSON.parse(readFileSync(arquivo, 'utf8'));
  // o deck vem do arquivo; o resto (Scryfall) da internet
  return {
    json: <T>(url: string, o?: { metodo?: 'GET' | 'POST'; corpo?: unknown }) => (url.includes('moxfield.com') ? Promise.resolve(dado as T) : real.json<T>(url, o)),
    binario: (url) => real.binario(url),
  };
}

function mostrar(p: Proposta): void {
  const nome = (c: { nome: string; pt: string | null; quantidade: number }) => `${c.quantidade > 1 ? `${c.quantidade}× ` : ''}${c.nome}${c.pt ? ` (${c.pt})` : ''}`;
  console.log(`\n${p.nome} (${p.link})${p.novo ? ' — deck novo' : ''}`);
  console.log(`Comandante: ${p.comandante}. Cartas com regras: ${p.prontas} de ${p.total}.`);
  if (p.trocaComandante) console.log(`Troca de comandante: ${p.trocaComandante.de} → ${p.trocaComandante.para}`);
  if (p.entram.length) console.log(`Entram (${p.entram.length}):\n${p.entram.map((c) => `  + ${nome(c)}${c.pronta ? '' : ' [sem regras]'}`).join('\n')}`);
  if (p.saem.length) console.log(`Saem (${p.saem.length}):\n${p.saem.map((c) => `  - ${nome(c)}`).join('\n')}`);
  if (p.faltam.length && p.novo) console.log(`Sem regras ainda (${p.faltam.length}):\n${p.faltam.map((c) => `  · ${c.nome}`).join('\n')}`);
  for (const e of p.erros) console.log(`ERRO: ${e}`);
  for (const a of p.avisos) console.log(`aviso: ${a}`);
  console.log(p.resumo);
}

/** salas salvas sem as listas guardadas recebem as atuais antes de alguma lista mudar */
function protegerSalas(): void {
  const arq = join(process.env.DADOS ?? join(pastas.gerado, '..', 'dados-locais'), 'jogo.sqlite');
  if (!existsSync(arq)) return;
  const banco = new Banco(arq);
  try {
    const n = preencherListasSalvas(banco, catalogo.listasJogaveis());
    if (n) console.log(`${n} sala(s) salva(s) receberam as listas atuais dos decks.`);
  } finally {
    banco.fechar();
  }
}

async function buscarEConfirmar(t: TarefasDecks, alvo: string): Promise<void> {
  const p = await t.verificar(alvo);
  mostrar(p);
  if (!confirmar || p.erros.length) return;
  if (p.destino === 'jogavel') protegerSalas();
  const r = await t.confirmar(p.token);
  console.log(`→ ${r.texto}`);
}

function tarefas(): TarefasDecks {
  let ultimo = '';
  return new TarefasDecks({
    pastas, rede: rede(), catalogo, pronta: cartaPronta,
    aoAndamento: (t) => {
      if (!process.stdout.isTTY) return;
      const linha = t && t.estado === 'andando' ? `${t.etapa}${t.total ? ` (${t.feito}/${t.total})` : ''}` : '';
      if (linha && linha !== ultimo) { process.stdout.write(`\r${linha.slice(0, 100).padEnd(100)}`); ultimo = linha; }
      if (t && t.estado !== 'andando' && ultimo) { process.stdout.write('\r'.padEnd(102) + '\r'); ultimo = ''; }
    },
  });
}

function pendentes(): void {
  const porNome = cartasPorNome(pastas);
  const rulings = rulingsPorOracle(pastas);
  const saida: unknown[] = [];
  for (const d of catalogo.todos()) {
    const l = d.preparacao ?? (d.atual && catalogo.faltam(d.atual).length ? d.atual : null);
    if (!l) continue;
    const faltam = catalogo.faltam(l).map((nome) => {
      const c = porNome.get(nome);
      let texto = '';
      let tipo = '';
      let custo = '';
      try { const o = oracle(nome); texto = o.faces.map((f) => f.oracleText).join('\n//\n'); tipo = o.faces.map((f) => f.typeLine).join(' // '); custo = o.faces[0].manaCostText; } catch { texto = c?.oracle_text ?? ''; }
      const fichas = (c?.all_parts ?? []).filter((p) => p.component === 'token').map((p) => p.name);
      return {
        nome, slug: slug(nome), layout: c?.layout ?? '?', custo, tipo, texto,
        rulings: (rulings[c?.oracle_id ?? ''] ?? []).length,
        fichas: [...new Set(fichas)],
        alerta: c && !LAYOUTS.has(c.layout) ? `layout ${c.layout}: o motor ainda não tem` : null,
      };
    });
    saida.push({ id: d.id, nome: d.nome, link: d.link, tipo: d.atual && d.preparacao ? 'atualização' : 'deck novo', total: nomesDaLista(l).length, faltam });
  }
  if (resto.includes('--json')) { console.log(JSON.stringify(saida, null, 1)); return; }
  if (!saida.length) { console.log('Nenhum deck em preparação.'); return; }
  for (const d of saida as { nome: string; link: string; tipo: string; total: number; faltam: { nome: string; slug: string; layout: string; custo: string; tipo: string; texto: string; rulings: number; fichas: string[]; alerta: string | null }[] }[]) {
    console.log(`\n## ${d.nome} (${d.tipo}; ${d.link}): faltam ${d.faltam.length} de ${d.total}`);
    for (const c of d.faltam) {
      console.log(`\n### ${c.nome} ${c.custo} — ${c.tipo}  [cartas/defs/${c.slug}.ts; ${c.rulings} rulings${c.fichas.length ? `; fichas: ${c.fichas.join(', ')}` : ''}]${c.alerta ? `  ⚠ ${c.alerta}` : ''}`);
      console.log(c.texto);
    }
  }
}

async function imagens(): Promise<void> {
  const r = redeReal();
  let n = 0;
  for (const p of Object.values(lerNovas(pastas.decks).printings)) {
    for (const i of p.local_images ?? []) {
      const arq = join(pastas.imagens, p.id, `${i.face}.png`);
      if (existsSync(arq) || !i.source_url) continue;
      const b = await r.binario(i.source_url);
      mkdirSync(dirname(arq), { recursive: true });
      writeFileSync(arq + '.parcial', b);
      renameSync(arq + '.parcial', arq);
      n++;
      console.log(`${p.name}: ${i.face}`);
    }
  }
  console.log(n ? `${n} imagens baixadas.` : 'Nenhuma imagem faltando.');
}

try {
  switch (comando) {
    case 'migrar': {
      const r = await comTrava(pastas.decks, async () => migrar(pastas, catalogo));
      console.log(`decks/: ${r.criados.length} criados, ${r.existentes.length} já existiam.`);
      break;
    }
    case 'gerar': {
      // versões em preparação cujas cartas ganharam regras (implementadas desde a última vez) entram agora
      const s = await comTrava(pastas.decks, async () => {
        if (catalogo.todos().some((d) => d.preparacao && !catalogo.faltam(d.preparacao).length)) protegerSalas();
        const aplicados = catalogo.aplicarPreparacoesProntas();
        if (aplicados.length) console.log(`Ficaram prontos: ${aplicados.map((id) => catalogo.ler(id)?.nome ?? id).join(', ')}`);
        return regenerar(pastas, catalogo.todos());
      });
      for (const a of s.avisos) console.log(`aviso: ${a}`);
      console.log(`cartas: ${Object.keys(s.cartas.cartas).length}, fichas/auxiliares: ${s.cartas.fichas.length}, decks jogáveis: ${s.decks.length}`);
      break;
    }
    case 'pendentes':
      pendentes();
      break;
    case 'importar': {
      const alvo = resto.includes('--arquivo') ? String((JSON.parse(readFileSync(resto[resto.indexOf('--arquivo') + 1], 'utf8')) as { publicId?: string }).publicId ?? '') : args[0];
      if (!alvo || !lerLink(alvo)) throw new ErroUso('Uso: node ferramentas/decks.ts importar <link do Moxfield> [--confirmar]');
      await buscarEConfirmar(tarefas(), alvo);
      break;
    }
    case 'atualizar': {
      const ids = args[0] === 'todos' ? catalogo.todos().map((d) => d.id) : args;
      if (!ids.length) throw new ErroUso('Uso: node ferramentas/decks.ts atualizar <id|todos> [--confirmar]');
      const t = tarefas();
      for (const id of ids) {
        const d = catalogo.ler(id);
        if (!d) { console.log(`${id}: não está em decks/`); continue; }
        try { await buscarEConfirmar(t, d.link); } catch (e) { console.log(`${d.nome}: ${mensagem(e)}`); }
      }
      break;
    }
    case 'imagens':
      await imagens();
      break;
    default:
      console.log(readFileSync(new URL(import.meta.url), 'utf8').split('\n').filter((l) => l.startsWith('//')).map((l) => l.slice(3)).join('\n'));
  }
} catch (e) {
  console.error(e instanceof ErroUso ? e.message : mensagem(e));
  process.exitCode = 1;
}
