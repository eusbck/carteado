// Capturas das salas de 2 a 6 lugares, para conferir o visual: a criação da sala com a escolha do número de
// jogadores, o saguão (lugares, regras e decks) com 3, 5 e 6 lugares, a mesa no meio da partida com 3, 5 e 6 jogadores
// (Ana no assento 0, o resto bots) e a abertura (VS) com 3, 5 e 6. Anota os erros do console de cada página e umas
// medidas de cada tela (nome cortado, vida coberta, cartas fora do campo, rolagem do saguão, nomes do VS encavalados).
//
// Sobe um servidor temporário (porta 8094, banco numa pasta temporária) servindo o cliente compilado numa pasta
// própria (.cache/capturas-lugares-cliente; não mexe em cliente/dist), recompilado quando algum arquivo do cliente
// é mais novo que a compilação. As mesas e as aberturas salvas são montadas antes de o servidor subir, com bots
// jogando por todos os assentos (como em cenarios.ts); a pessoa entra no assento 0 com o token `token-<CÓDIGO>`.
//
// Uso: node ferramentas/capturas-lugares.ts                     → imagens em .cache/capturas-lugares/
//      CAPTURAS_SAIDA=<pasta> node ferramentas/capturas-lugares.ts
//      PORTA_CAPTURAS=8095 node ferramentas/capturas-lugares.ts  (outra porta)
//      CAPTURAS_SO=saguao,mesas,aberturas                        (só essas partes; as outras imagens ficam)

import '../cartas/index.ts';
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';
import decksJson from '../gerado/decks.json' with { type: 'json' };
import { HeuristicBot } from '../bots/heuristico.ts';
import { defaultAnswer } from '../motor/ask.ts';
import { Game } from '../motor/game.ts';
import { rodadaDe } from '../motor/turn.ts';
import type { DeckList } from '../motor/state.ts';
import type { GameConfig } from '../motor/types.ts';
import { Banco } from '../servidor/banco.ts';
import { PARADAS_PADRAO } from '../servidor/salas.ts';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const SAIDA = process.env.CAPTURAS_SAIDA ?? join(RAIZ, '.cache', 'capturas-lugares');
const ESTATICOS = join(RAIZ, '.cache', 'capturas-lugares-cliente');
const PORTA = Number(process.env.PORTA_CAPTURAS ?? 8094);
const URL = `http://localhost:${PORTA}`;
const SENHA_ACESSO = 'teste-capturas';
const DECKS = decksJson as DeckList[];
const GRANDE = { width: 1920, height: 1080 };
const PEQUENA = { width: 1366, height: 768 };
const TELAS = [GRANDE, PEQUENA];

// ------------------------------------------------------------------ cliente compilado
/** o arquivo mais novo de uma pasta (recursivo), em ms */
function maisNovo(pasta: string): number {
  let t = 0;
  for (const f of readdirSync(pasta, { recursive: true, withFileTypes: true })) if (f.isFile()) t = Math.max(t, statSync(join(f.parentPath, f.name)).mtimeMs);
  return t;
}
function compilarCliente(): void {
  const indice = join(ESTATICOS, 'index.html');
  const fontes = Math.max(maisNovo(join(RAIZ, 'cliente', 'src')), maisNovo(join(RAIZ, 'cliente', 'public')), statSync(join(RAIZ, 'cliente', 'index.html')).mtimeMs, statSync(join(RAIZ, 'cliente', 'vite.config.ts')).mtimeMs);
  if (existsSync(indice) && statSync(indice).mtimeMs >= fontes) { console.log('cliente: compilação em dia'); return; }
  console.log('cliente: compilando (vite build)…');
  // o mesmo que `npm run cliente:build`, com a saída numa pasta própria (outra sessão pode estar servindo cliente/dist)
  const r = spawnSync(process.execPath, [join(RAIZ, 'node_modules', 'vite', 'bin', 'vite.js'), 'build', 'cliente', '--outDir', ESTATICOS, '--emptyOutDir'], { cwd: RAIZ, stdio: 'inherit' });
  if (r.status !== 0) throw new Error('a compilação do cliente falhou');
}

// ------------------------------------------------------------------ salas salvas
interface MesaSalva {
  codigo: string;
  nomes: string[];
  decks: number[];
  /** sem rodada: a partida fica no começo (a abertura e a mão inicial); com ela, Ana na principal 1 dessa rodada em diante */
  minRodada: number | null;
  /** a primeira semente tentada (`lugares-<código>-<k>`): a das rodadas anteriores que chegou na situação */
  primeira?: number;
}
const LONGO = 'Maximiliano Albuquerque'; // 23 caracteres (o servidor corta em 24)
const SALAS: MesaSalva[] = [
  { codigo: 'MESA3', nomes: ['Ana', 'Bruno', 'Carolina'], decks: [4, 31, 22], minRodada: 5 },
  { codigo: 'MESA5', nomes: ['Ana', 'Bruno', 'Carolina', 'Dani', 'Eduarda'], decks: [2, 28, 31, 30, 6], minRodada: 5 },
  { codigo: 'MESA6', nomes: ['Ana', 'Bruno', 'Carolina', 'Dani', 'Eduarda', LONGO], decks: [0, 7, 19, 31, 22, 3], minRodada: 5, primeira: 1 },
  // aberturas: nomes de deck longos, com emoji e com "//" no comandante
  { codigo: 'VSCIN', nomes: ['Ana', 'Bruno', 'Carolina', 'Dani', 'Eduarda'], decks: [2, 28, 10, 30, 6], minRodada: null },
  { codigo: 'VSSEI', nomes: ['Ana', 'Bruno', 'Carolina', 'Dani', 'Eduarda', LONGO], decks: [9, 32, 10, 17, 18, 34], minRodada: null },
  // abertura com os decks do lote 4 (Sin, Voja, Sephiroth, Yuriko, Hearthhull) e Inalla: o rosto de cada um no meio da faixa
  { codigo: 'VSLOTE4', nomes: ['Ana', 'Bruno', 'Carolina', 'Dani', 'Eduarda', 'Fábio'], decks: [41, 42, 43, 44, 45, 40], minRodada: null },
];

function gravarSala(banco: Banco, s: MesaSalva, game: Game, config: GameConfig): void {
  const paradas = { ...structuredClone(PARADAS_PADRAO), myTurn: ['main1', 'main2'], othersTurn: [], skipWhenNothing: false };
  banco.salvarSala(s.codigo, {
    codigo: s.codigo, senha: '00:00', estado: 'jogando', anfitriao: 0, mulligan: 'londres',
    assentos: s.nomes.map((nome, i) => ({ tipo: i === 0 ? 'humano' : 'bot', nome, deck: DECKS[s.decks[i]].id, token: i === 0 ? `token-${s.codigo}` : null, paradas: structuredClone(paradas) })),
    partida: { config, deckIds: s.decks.map((i) => DECKS[i].id), checkpoint: null, posicoes: {}, iniciadaEm: Date.now() - 25 * 60000 },
  });
  banco.adicionarEntradas(s.codigo, 0, game.inputs);
}

/** bots jogam por todos até Ana ter prioridade na principal 1 dela, com todos vivos e uns permanentes cada um */
function gerarSala(banco: Banco, s: MesaSalva): void {
  const t0 = Date.now();
  for (let k = s.primeira ?? 0; k < (s.primeira ?? 0) + 12; k++) {
    const seed = `lugares-${s.codigo}-${k}`;
    const config: GameConfig = {
      seed, players: s.nomes.map((name, i) => ({ name, deckId: DECKS[s.decks[i]].id })), startingLife: 40, turnLimit: null,
      multiplayer: s.nomes.length > 2, manualMode: true, mulligan: 'londres', desvirarTiraMana: true, desvirarSoComMana: true,
    };
    const game = Game.create(config, s.decks.map((i) => DECKS[i]));
    if (s.minRodada === null) { gravarSala(banco, s, game, config); console.log(`sala ${s.codigo}: no começo`); return; }
    const bots = s.nomes.map((_, i) => new HeuristicBot(`${seed}:${i}`, i, { simulacoes: 4 }));
    const n = s.nomes.length;
    let chegou = false;
    for (let passo = 0; passo < 40000 && game.pending && !game.isOver(); passo++) {
      const d = game.pending;
      const st = game.state;
      const rodada = rodadaDe(st);
      if (rodada >= s.minRodada && st.turn.number >= 8 && d.player === 0 && d.kind === 'priority' && st.turn.active === 0 && st.turn.step === 'main1' && !st.zones.stack.length) {
        const vivos = st.players.every((p) => !p.left);
        const permanentes = st.players.map((_, p) => st.zones.battlefield.filter((id) => st.objects[id].controller === p).length);
        if (vivos && permanentes.every((x) => x >= 5)) { chegou = true; console.log(`sala ${s.codigo}: semente ${seed}, rodada ${rodada}, turno ${st.turn.number}, permanentes ${permanentes.join('/')}`); break; }
      }
      if (rodada > s.minRodada + 4) break;
      const r = game.answer(d.player, bots[d.player].answer(d, game));
      if (!r.ok) game.answer(d.player, defaultAnswer(d));
    }
    if (!chegou) { console.log(`sala ${s.codigo}: semente ${seed} não chegou (${n} jogadores)`); continue; }
    gravarSala(banco, s, game, config);
    console.log(`sala ${s.codigo}: pronta em ${((Date.now() - t0) / 1000).toFixed(0)} s`);
    return;
  }
  throw new Error(`sala ${s.codigo}: nenhuma semente chegou na situação`);
}

// ------------------------------------------------------------------ navegador
interface Erro { pagina: string; tipo: string; texto: string }
const erros: Erro[] = [];
const fotos: string[] = [];
const medidas: Record<string, unknown> = {};
let navegador: Browser;

function vigiar(p: Page, rotulo: string): void {
  p.on('console', (m) => { if (m.type() === 'error') erros.push({ pagina: rotulo, tipo: 'console', texto: m.text() }); });
  p.on('pageerror', (e) => erros.push({ pagina: rotulo, tipo: 'pageerror', texto: `${e.message}\n${e.stack ?? ''}` }));
  p.on('response', (r) => { if (r.status() >= 400) erros.push({ pagina: rotulo, tipo: `http ${r.status()}`, texto: r.url() }); });
  p.on('requestfailed', (r) => {
    const f = r.failure()?.errorText ?? '';
    // imagens abortadas ao fechar a página ou trocar de tela não são erro
    if (!f.includes('ERR_ABORTED')) erros.push({ pagina: rotulo, tipo: 'requestfailed', texto: `${r.url()} ${f}` });
  });
}

async function novaPagina(rotulo: string, tela = GRANDE): Promise<{ c: BrowserContext; p: Page }> {
  const c = await navegador.newContext({ viewport: tela });
  c.setDefaultTimeout(30000);
  // a abertura some sozinha 4,4 s depois de começar (setTimeout de DURACAO em Abertura.tsx): com a máquina ocupada a
  // foto chegava tarde. Aqui ela fica até o clique (fotoAbertura clica depois da foto)
  await c.addInitScript(() => {
    const original = window.setTimeout;
    window.setTimeout = ((fn: TimerHandler, ms?: number, ...args: unknown[]) => (ms === 4400 ? 0 : original(fn, ms, ...args))) as typeof window.setTimeout;
  });
  const p = await c.newPage();
  vigiar(p, rotulo);
  return { c, p };
}

async function foto(p: Page, nome: string, espera = 400): Promise<void> {
  await p.waitForTimeout(espera);
  const arq = join(SAIDA, `${nome}.png`);
  await p.screenshot({ path: arq });
  fotos.push(arq);
  console.log(`captura: ${arq}`);
}

/** tira a foto em cada tamanho de tela (a página volta para o primeiro) */
async function fotoNasTelas(p: Page, nome: string, medir?: (p: Page) => Promise<unknown>): Promise<void> {
  for (const t of TELAS) {
    await p.setViewportSize(t);
    await p.mouse.move(3, t.height / 2);
    await p.waitForTimeout(500);
    await foto(p, `${nome}-${t.width}`);
    if (medir) medidas[`${nome}-${t.width}`] = await medir(p);
  }
  await p.setViewportSize(TELAS[0]);
}

async function entrarNoServidor(p: Page): Promise<void> {
  await p.goto(URL);
  await p.getByLabel('Senha do servidor').fill(SENHA_ACESSO);
  await p.getByRole('button', { name: 'Entrar' }).click();
}
async function nomear(p: Page, nome: string): Promise<void> {
  await p.locator('.tela-passos').waitFor();
  await p.getByLabel('Seu nome na mesa').fill(nome);
  await p.getByRole('button', { name: 'Continuar' }).click();
  await p.getByText(`Olá, ${nome}`).waitFor();
}
async function escolher(p: Page, o: 'Criar sala' | 'Entrar numa sala'): Promise<void> {
  await p.getByRole('button', { name: new RegExp(`^${o}`) }).click();
  await p.locator('form').filter({ hasText: o }).waitFor();
}
/** escolha do número de jogadores (na criação e no saguão): os botões vão de 2 a 6 */
const botaoLugares = (p: Page, escopo: string, n: number) => p.locator(`${escopo} .escolha-lugares button`).nth(n - 2);

async function criarSala(p: Page, nome: string, lugares: number, fotografar = false): Promise<string> {
  await entrarNoServidor(p);
  await nomear(p, nome);
  await escolher(p, 'Criar sala');
  if (fotografar) {
    await p.waitForTimeout(500);
    await fotoNasTelas(p, 'a1-criar-sala-padrao', medirTela);
  }
  await botaoLugares(p, 'form', lugares).click();
  await p.getByLabel('Senha da sala').fill('mesa123');
  if (fotografar) await fotoNasTelas(p, `a2-criar-sala-${lugares}-escolhido`, medirTela);
  await p.getByRole('button', { name: 'Criar', exact: true }).click();
  const codigo = p.locator('.saguao-codigo strong');
  await codigo.waitFor();
  return (await codigo.textContent())!.trim();
}
async function entrarNaSala(p: Page, nome: string, codigo: string): Promise<void> {
  await entrarNoServidor(p);
  await nomear(p, nome);
  await escolher(p, 'Entrar numa sala');
  await p.getByLabel('Código').fill(codigo);
  await p.getByLabel('Senha da sala').fill('mesa123');
  await p.getByRole('button', { name: 'Entrar', exact: true }).click();
  await p.locator('.saguao-codigo').waitFor();
}
/** saguão: põe um bot no lugar (contando de 1), com o nível, e espera ele aparecer */
async function porBot(p: Page, lugar: number, nivel?: string): Promise<void> {
  const l = p.locator('.lugar').nth(lugar - 1);
  if (nivel) await l.getByLabel('Nível').selectOption({ label: nivel });
  await p.getByRole('button', { name: `Pôr bot no lugar ${lugar}` }).click();
  await l.getByText('bot', { exact: true }).waitFor();
}
async function escolherDeck(p: Page, n: number): Promise<void> {
  await p.locator('.saguao-decks').waitFor();
  const deck = p.locator('.deck').nth(n);
  await deck.locator('.deck-escolher').click();
  await deck.locator('.deck-escolher[aria-pressed="true"]').waitFor();
}

/** volta pelo token do assento 0 a uma sala salva */
async function abrirSalva(codigo: string, rotulo: string, tela = GRANDE): Promise<{ c: BrowserContext; p: Page }> {
  const r = await novaPagina(rotulo, tela);
  await r.p.goto(URL);
  await r.p.evaluate((k) => localStorage.setItem('commander-da-mesa:sala', JSON.stringify({ codigo: k, token: `token-${k}` })), codigo);
  await r.p.getByLabel('Senha do servidor').fill(SENHA_ACESSO);
  await r.p.getByRole('button', { name: 'Entrar' }).click();
  await r.p.locator('.mesa').waitFor({ timeout: 90000 });
  return r;
}

/** espera as artes de fundo das áreas carregarem */
async function esperarFundos(p: Page): Promise<void> {
  await p.evaluate(async () => {
    await Promise.all([...document.querySelectorAll<HTMLElement>('.area-fundo')].map((f) => new Promise<void>((ok) => {
      const img = new Image();
      img.onload = img.onerror = () => ok();
      img.src = f.style.backgroundImage.replace(/^url\("?|"?\)$/g, '');
    })));
    await Promise.all([...document.querySelectorAll<HTMLImageElement>('img')].map((i) => (i.complete ? null : new Promise<void>((ok) => { i.onload = i.onerror = () => ok(); }))));
  });
}

/**
 * A abertura depois de tudo entrar (as faixas, o VS e os nomes, por volta de 3 s); ela fica parada até o clique
 * (novaPagina segura o tempo dela). Depois da foto e das medidas, clica para pular. Devolve false se ela não estava lá.
 */
async function fotoAbertura(p: Page, nome: string): Promise<boolean> {
  const vs = p.locator('.abertura');
  await vs.waitFor({ timeout: 60000 });
  await p.locator('.abertura.tocando').waitFor({ timeout: 10000 });
  await p.waitForFunction(() => {
    const nomes = [...document.querySelectorAll('.abertura.tocando .vs-nome, .abertura.tocando .vs-emblema, .abertura.tocando .vs-lado')];
    return nomes.length > 0 && nomes.every((n) => n.getAnimations().every((a) => a.playState === 'finished'));
  }, null, { polling: 'raf', timeout: 15000 }).catch(() => console.log(`aviso: ${nome}: as animações da abertura não terminaram em 15 s`));
  // a onda e o clarão do impacto passam
  await p.waitForTimeout(800);
  if (!await p.locator('.abertura.tocando').isVisible()) return false;
  const arq = join(SAIDA, `${nome}.png`);
  await p.screenshot({ path: arq });
  medidas[nome] = await medirAbertura(p);
  fotos.push(arq);
  console.log(`captura: ${arq}`);
  await vs.click();
  await vs.waitFor({ state: 'detached', timeout: 10000 });
  return true;
}

// ------------------------------------------------------------------ medidas
/** a tela rola? o que passa da janela? textos cortados (com reticências) */
async function medirTela(p: Page): Promise<unknown> {
  return p.evaluate(() => {
    const vw = innerWidth, vh = innerHeight;
    const se = document.scrollingElement!;
    const rolaveis = [...document.querySelectorAll<HTMLElement>('*')].filter((e) => {
      const cs = getComputedStyle(e);
      return (cs.overflowY === 'auto' || cs.overflowY === 'scroll') && e.scrollHeight > e.clientHeight + 1;
    }).map((e) => `${e.tagName.toLowerCase()}.${[...e.classList].join('.')} (${e.clientHeight}/${e.scrollHeight})`);
    const fora = [...document.querySelectorAll<HTMLElement>('button, .lugar, .saguao-rodape, input, select, .escolha-lugares, .deck, .assento')].filter((e) => {
      const r = e.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && (r.right > vw + 1 || r.bottom > vh + 1 || r.left < -1 || r.top < -1);
    }).map((e) => `${e.tagName.toLowerCase()}.${[...e.classList].join('.')} "${(e.textContent ?? '').trim().slice(0, 40)}"`);
    const cortados = [...document.querySelectorAll<HTMLElement>('.assento-nome, .lugar-sub, .escolha-lugares button, .botao, .rot, .suave, .deck-nome, b, strong, small')].filter((e) => e.clientWidth > 0 && e.scrollWidth > e.clientWidth + 1)
      .map((e) => `${e.tagName.toLowerCase()}.${[...e.classList].join('.')} "${(e.textContent ?? '').trim().slice(0, 50)}" ${e.clientWidth}/${e.scrollWidth}`);
    return { tela: `${vw}×${vh}`, documento: `${se.scrollWidth}×${se.scrollHeight}`, rolaveis, fora, cortados };
  });
}

/** por área: nome cortado, vida coberta, tamanho das cartas, cartas fora do campo e peças que passam da área */
async function medirMesa(p: Page): Promise<unknown> {
  return p.evaluate(() => {
    const dentro = (r: DOMRect, c: DOMRect) => r.left >= c.left - 1 && r.right <= c.right + 1 && r.top >= c.top - 1 && r.bottom <= c.bottom + 1;
    const desc = (e: Element) => `${e.tagName.toLowerCase()}.${[...e.classList].join('.')}`;
    const ret = (r: DOMRect) => `${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}×${Math.round(r.height)}`;
    const areas = [...document.querySelectorAll<HTMLElement>('.area')].map((a) => {
      const ra = a.getBoundingClientRect();
      const nome = a.querySelector<HTMLElement>('.tag-jogador');
      const vida = a.querySelector<HTMLElement>('.avatar-vida');
      const campo = a.querySelector<HTMLElement>('.campo');
      const rc = campo?.getBoundingClientRect();
      const cartas = [...a.querySelectorAll<HTMLElement>('.campo > .carta')];
      let vidaCoberta: string | null = null;
      if (vida) {
        const r = vida.getBoundingClientRect();
        const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        if (el && !vida.contains(el)) vidaCoberta = desc(el);
      }
      const passam = [...a.querySelectorAll<HTMLElement>('.area-topo, .area-selos > *, .vida, .avatar, .avatar-vida, .zonas, .zona, .zona-rotulo, .campo > .carta, .grupo-n')]
        .filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && !dentro(r, ra); }).map(desc);
      const rotulosCortados = [...a.querySelectorAll<HTMLElement>('.zona-rotulo, .tag-jogador, .selo')].filter((e) => e.clientWidth > 0 && e.scrollWidth > e.clientWidth + 1).map((e) => `${(e.textContent ?? '').trim()} ${e.clientWidth}/${e.scrollWidth}`);
      return {
        jogador: a.dataset.jogador, area: ret(ra), eu: a.classList.contains('area-eu'),
        nome: nome ? { texto: nome.textContent, visivel: `${nome.clientWidth}/${nome.scrollWidth}`, cortado: nome.scrollWidth > nome.clientWidth + 1 } : null,
        vida: vida?.textContent ?? null, vidaCoberta,
        campo: rc ? ret(rc) : null, cartas: cartas.length, cartaW: campo?.dataset.cartaW, tile: `${campo?.dataset.tileW}×${campo?.dataset.tileH}`,
        cartasForaDoCampo: rc ? cartas.filter((c) => !dentro(c.getBoundingClientRect(), rc)).length : 0,
        leques: a.querySelectorAll('.grupo-n').length,
        passamDaArea: [...new Set(passam)], rotulosCortados,
      };
    });
    // as áreas dos oponentes se sobrepõem?
    const ops = [...document.querySelectorAll<HTMLElement>('.area-oponente')].map((a) => a.getBoundingClientRect());
    const sobrepostas: string[] = [];
    for (let i = 0; i < ops.length; i++) for (let j = i + 1; j < ops.length; j++) {
      const a = ops[i], b = ops[j];
      if (a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1) sobrepostas.push(`${i}×${j}`);
    }
    return { tela: `${innerWidth}×${innerHeight}`, areas, sobrepostas };
  });
}

/** os nomes das faixas do VS: cortados, encavalados entre si ou com o emblema, fora da tela */
async function medirAbertura(p: Page): Promise<unknown> {
  return p.evaluate(() => {
    const nomes = [...document.querySelectorAll<HTMLElement>('.vs-nome')];
    const rs = nomes.map((n) => n.getBoundingClientRect());
    const emblema = document.querySelector('.vs-letras.frente')?.getBoundingClientRect();
    const toca = (a: DOMRect, b: DOMRect) => a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1;
    const encavalados: string[] = [];
    for (let i = 0; i < rs.length; i++) for (let j = i + 1; j < rs.length; j++) if (toca(rs[i], rs[j])) encavalados.push(`${i}×${j}`);
    return {
      tela: `${innerWidth}×${innerHeight}`,
      nomes: nomes.map((n, i) => ({
        texto: [...n.children].map((c) => (c.textContent ?? '').trim()).join(' | '),
        caixa: `${Math.round(rs[i].left)}..${Math.round(rs[i].right)} × ${Math.round(rs[i].top)}..${Math.round(rs[i].bottom)}`,
        cortados: [...n.children].filter((c) => (c as HTMLElement).scrollWidth > (c as HTMLElement).clientWidth + 1).map((c) => (c.textContent ?? '').trim()),
        foraDaTela: rs[i].left < 0 || rs[i].right > innerWidth || rs[i].bottom > innerHeight,
        comEmblema: emblema ? toca(rs[i], emblema) : false,
      })),
      encavalados,
    };
  });
}

// ------------------------------------------------------------------ roteiro
async function saguoes(): Promise<void> {
  // (a) e (b): Ana cria uma sala de 6; Bruno e um nome comprido entram; o anfitrião vê a escolha de lugares e
  // "Continuar com 3 jogadores"; segue com os três (a sala fica com 3 lugares) até a abertura de três
  const ana = await novaPagina('saguao6-ana');
  const codigo = await criarSala(ana.p, 'Ana Clara', 6, true);
  console.log(`sala de 6 criada: ${codigo}`);
  const bruno = await novaPagina('saguao6-bruno');
  await entrarNaSala(bruno.p, 'Bruno', codigo);
  await fotoNasTelas(ana.p, 'b1-saguao-6-lugares-2-pessoas', medirTela);
  const caio = await novaPagina('saguao6-henrique');
  await entrarNaSala(caio.p, 'Henrique Vasconcelos', codigo);
  await ana.p.locator('.lugar').nth(2).getByText('Henrique Vasconcelos').waitFor();
  await fotoNasTelas(ana.p, 'b2-saguao-6-lugares-3-pessoas-anfitriao', medirTela);
  await fotoNasTelas(bruno.p, 'b3-saguao-6-lugares-3-pessoas-convidado', medirTela);
  // o anfitrião diminui para 5 (tira um lugar livre) e segue com os três
  await botaoLugares(ana.p, '.saguao-tamanho', 5).click();
  await ana.p.locator('.lugares-5').waitFor();
  await fotoNasTelas(ana.p, 'b4-saguao-diminuiu-para-5', medirTela);
  await ana.p.getByRole('button', { name: 'Continuar com 3 jogadores' }).click();
  await ana.p.getByRole('button', { name: 'Continuar para os decks' }).waitFor();
  await fotoNasTelas(ana.p, 'b5-saguao-regras-3-jogadores', medirTela);
  await ana.p.getByRole('button', { name: 'Continuar para os decks' }).click();
  await escolherDeck(ana.p, 3);
  await escolherDeck(bruno.p, 7);
  await escolherDeck(caio.p, 12);
  await fotoNasTelas(ana.p, 'b6-saguao-decks-3-jogadores', medirTela);
  await ana.p.getByRole('button', { name: 'Começar a partida' }).click();
  if (!await fotoAbertura(ana.p, 'e0-abertura-3-jogadores-saguao-1920')) console.log('aviso: a abertura de três sumiu antes da foto');
  for (const x of [ana, bruno, caio]) await x.c.close();

  // (c): Dani cria uma sala de 5 com dois bots e dois lugares livres; depois completa com bots e vai até a abertura
  const dani = await novaPagina('saguao5-dani');
  await criarSala(dani.p, 'Dani', 5);
  await porBot(dani.p, 2, 'Magic God');
  await porBot(dani.p, 4, 'Fácil');
  await fotoNasTelas(dani.p, 'c1-saguao-5-lugares-2-bots', medirTela);
  await porBot(dani.p, 3);
  await porBot(dani.p, 5, 'Cartomante');
  await fotoNasTelas(dani.p, 'c2-saguao-5-lugares-cheio', medirTela);
  await dani.p.getByRole('button', { name: 'Continuar para as regras' }).click();
  await dani.p.getByRole('button', { name: 'Continuar para os decks' }).click();
  await escolherDeck(dani.p, 5);
  await fotoNasTelas(dani.p, 'c3-saguao-decks-5-jogadores', medirTela);
  await dani.p.getByRole('button', { name: 'Começar a partida' }).click();
  if (!await fotoAbertura(dani.p, 'e1-abertura-5-jogadores-saguao-1920')) console.log('aviso: a abertura de cinco (saguão) sumiu antes da foto');
  await dani.p.locator('.abertura').waitFor({ state: 'detached', timeout: 10000 });
  await dani.p.getByText('Mão inicial').waitFor({ timeout: 60000 });
  await esperarFundos(dani.p);
  await fotoNasTelas(dani.p, 'e2-mao-inicial-5-jogadores', medirMesa);
  await dani.c.close();
}

async function mesas(): Promise<void> {
  for (const [codigo, n] of [['MESA3', 3], ['MESA5', 5], ['MESA6', 6]] as const) {
    const { c, p } = await abrirSalva(codigo, `mesa${n}`);
    await p.locator('.area-eu').waitFor();
    await esperarFundos(p);
    await p.waitForTimeout(1500);
    await fotoNasTelas(p, `d-mesa-${n}-jogadores`, medirMesa);
    await c.close();
  }
}

async function aberturas(): Promise<void> {
  for (const [codigo, n, rotulo] of [['VSCIN', 5, '5'], ['VSSEI', 6, '6'], ['VSLOTE4', 6, '6-lote4']] as const) {
    for (const t of TELAS) {
      let ok = false;
      // cada contexto novo vê a abertura de novo (ela fica marcada no sessionStorage da página)
      for (let tentativa = 0; tentativa < 3 && !ok; tentativa++) {
        const { c, p } = await abrirSalva(codigo, `vs${rotulo}-${t.width}`, t);
        ok = await fotoAbertura(p, `e-abertura-${rotulo}-jogadores-${t.width}`);
        if (ok && codigo === 'VSSEI') {
          await p.locator('.abertura').waitFor({ state: 'detached', timeout: 10000 });
          await p.getByText('Mão inicial').waitFor({ timeout: 60000 });
          await esperarFundos(p);
          await p.mouse.move(3, t.height / 2);
          await foto(p, `e-mao-inicial-6-jogadores-${t.width}`, 1200);
          medidas[`e-mao-inicial-6-jogadores-${t.width}`] = await medirMesa(p);
        }
        await c.close();
        if (!ok) console.log(`abertura ${codigo} ${t.width}: sumiu antes da foto, tentando de novo`);
      }
    }
  }
}

// ------------------------------------------------------------------ principal
const PARTES = (process.env.CAPTURAS_SO ?? 'saguao,mesas,aberturas').split(',').map((x) => x.trim());
const TUDO = !process.env.CAPTURAS_SO;
mkdirSync(SAIDA, { recursive: true });
// rodando tudo, as imagens de antes saem (nomes que mudaram não ficam para trás)
if (TUDO) for (const f of readdirSync(SAIDA)) if (f.endsWith('.png') || f.endsWith('.json')) rmSync(join(SAIDA, f));
compilarCliente();

const DADOS = mkdtempSync(join(tmpdir(), 'capturas-lugares-'));
{
  const banco = new Banco(join(DADOS, 'jogo.sqlite'));
  const precisa = (s: MesaSalva) => (s.minRodada === null ? PARTES.includes('aberturas') : PARTES.includes('mesas'));
  try { for (const s of SALAS) if (precisa(s)) gerarSala(banco, s); } finally { banco.fechar(); }
}

const servidor = spawn(process.execPath, [join(RAIZ, 'servidor', 'index.ts')], {
  env: { ...process.env, PORTA: String(PORTA), DADOS, ESTATICOS, SENHA_ACESSO },
  stdio: ['ignore', 'pipe', 'pipe'],
});
const errosServidor: string[] = [];
servidor.stderr.on('data', (d) => { process.stderr.write(`[servidor] ${d}`); errosServidor.push(String(d)); });
await new Promise<void>((ok, falha) => {
  const t = setTimeout(() => falha(new Error('servidor não subiu')), 180000);
  servidor.stdout.on('data', (d) => { if (String(d).includes('http://localhost')) { clearTimeout(t); ok(); } });
  servidor.on('exit', (c) => falha(new Error(`servidor saiu (${c})`)));
});

navegador = await chromium.launch();
let falhou: unknown = null;
try {
  if (PARTES.includes('saguao')) await saguoes();
  if (PARTES.includes('mesas')) await mesas();
  if (PARTES.includes('aberturas')) await aberturas();
} catch (e) {
  falhou = e;
  console.error('FALHOU:', e);
  for (const c of navegador.contexts()) for (const [i, p] of c.pages().entries()) {
    if (!p.isClosed()) await p.screenshot({ path: join(SAIDA, `falha-${Date.now()}-${i}.png`) }).catch(() => {});
  }
} finally {
  await navegador.close();
  // no Windows o banco fica preso até o processo do servidor acabar de sair
  const saiu = new Promise<void>((ok) => { if (servidor.exitCode !== null) ok(); else servidor.once('exit', () => ok()); });
  servidor.kill();
  await Promise.race([saiu, new Promise((ok) => setTimeout(ok, 10000))]);
  try { rmSync(DADOS, { recursive: true, force: true, maxRetries: 10, retryDelay: 500 }); } catch (e) { console.log(`aviso: a pasta temporária ${DADOS} ficou (${(e as Error).message})`); }
}

const sufixo = TUDO ? '' : `-${PARTES.join('-')}`;
writeFileSync(join(SAIDA, `medidas${sufixo}.json`), JSON.stringify(medidas, null, 2));
writeFileSync(join(SAIDA, `erros${sufixo}.json`), JSON.stringify({ navegador: erros, servidor: errosServidor }, null, 2));
console.log(`\n${fotos.length} capturas em ${SAIDA}`);
console.log(`erros do navegador: ${erros.length}`);
for (const e of erros) console.log(`  [${e.pagina}] ${e.tipo}: ${e.texto.split('\n')[0]}`);
if (errosServidor.length) console.log(`saída de erro do servidor: ${errosServidor.length} trechos (ver erros.json)`);
if (falhou) process.exit(1);
