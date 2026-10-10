// Capturas de tela da interface com um navegador automatizado (Playwright), para conferir
// o visual. Sobe um servidor temporário (porta e dados próprios), joga um pouco e fotografa.
// As partes antigas jogam com todos os auxílios ligados (usam o brilho para achar o que jogar);
// as da fase 8 mostram a mesa real, o combate por cliques e o desfazer.
// Uso: node ferramentas/capturas.ts   → imagens em .cache/capturas/
//      CAPTURAS_SO=janelas node ferramentas/capturas.ts   → só as da fase 9 (janelas de escolha, zoom e log)
//      CAPTURAS_SO=decks node ferramentas/capturas.ts     → só a tela Decks (importar e atualizar pelo Moxfield)
//      CAPTURAS_SO=combate node ferramentas/capturas.ts   → só o combate com muitas fichas (atacar e bloquear)
//      CAPTURAS_SO=mesa node ferramentas/capturas.ts      → só a sua área (campo até a base, mão por cima, terrenos deitados)

import { spawn } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, type BrowserContext, type Page } from 'playwright';
import { hasOracle, oracle } from '../motor/oracle.ts';
import { Banco } from '../servidor/banco.ts';
import { gerarSalas, gerarSalasCombate, gerarSalasMesa, type IdsCombate, type IdsMesa } from './cenarios.ts';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const SAIDA = join(RAIZ, '.cache', 'capturas');
// CAPTURAS_DADOS e PORTA_CAPTURAS deixam duas rodadas correrem ao mesmo tempo (cada uma com o seu banco e a sua porta)
const DADOS = process.env.CAPTURAS_DADOS ?? join(RAIZ, '.cache', 'capturas-dados');
const PORTA = Number(process.env.PORTA_CAPTURAS ?? 8091);
const URL = `http://localhost:${PORTA}`;

rmSync(DADOS, { recursive: true, force: true });
// imagens de uma rodada anterior saem (nomes que mudaram não ficam para trás); rodando só um bloco
// (CAPTURAS_SO), as outras ficam
if (!process.env.CAPTURAS_SO) rmSync(SAIDA, { recursive: true, force: true });
mkdirSync(SAIDA, { recursive: true });
// os blocos que só usam salas fixas (montadas com o arcabouço de testes) não esperam os bots jogarem até as salas
// sorteadas abaixo (uns minutos)
const SO_FIXAS = ['mesa', 'combate'].includes(process.env.CAPTURAS_SO ?? '');
// salas prontas para as capturas de combate (ataque em 4 jogadores, bloqueio em 1v1)
if (!SO_FIXAS) {
  const banco = new Banco(join(DADOS, 'jogo.sqlite'));
  const prontas = gerarSalas(banco, ['ATACA', 'BLOQU']);
  banco.fechar();
  if (prontas.length < 2) throw new Error(`cenários de combate não ficaram prontos: ${prontas.join(', ')}`);
}
// --- fase 9: janelas de escolha, zoom e log ---
// CAPTURAS_SO=<bloco> roda só aquele bloco (as capturas antigas ficam de fora)
const SO = process.env.CAPTURAS_SO ?? '';
if (!SO_FIXAS) {
  const banco = new Banco(join(DADOS, 'jogo.sqlite'));
  const prontas = gerarSalas(banco, ['ORDEM']);
  banco.fechar();
  if (!prontas.length) throw new Error('o cenário dos gatilhos (ORDEM) não ficou pronto');
}
// --- fim da fase 9 ---
// --- fase 9: posicionar e seleção por arrasto ---
// sala pronta com o campo de Ana cheio, na fase principal dela (ARRUM). CAPTURAS_SO=posicionar roda só este bloco.
const SO_POSICIONAR = process.env.CAPTURAS_SO === 'posicionar';
if (!SO_FIXAS) {
  const banco = new Banco(join(DADOS, 'jogo.sqlite'));
  const prontas = gerarSalas(banco, ['ARRUM']);
  banco.fechar();
  if (!prontas.length) throw new Error('cenário de arrumar o campo (ARRUM) não ficou pronto');
}
// --- fim (fase 9: posicionar) ---
// --- combate com muitas fichas: atacar e bloquear ---
// salas fixas FICHA (Ana ataca com seis fichas iguais) e BLOQT (Ana bloqueia três fichas iguais e uma criatura com
// ameaça), montadas com o arcabouço de testes (cenarios.ts). CAPTURAS_SO=combate roda só este bloco.
const SO_COMBATE = process.env.CAPTURAS_SO === 'combate';
let idsCombate: IdsCombate | null = null;
if (!SO || SO_COMBATE) {
  const banco = new Banco(join(DADOS, 'jogo.sqlite'));
  idsCombate = gerarSalasCombate(banco);
  banco.fechar();
}
// --- fim (combate com muitas fichas) ---
// --- a sua área com o campo até a base: salas fixas MESA1 (1v1) e MESA4 (4 jogadores). CAPTURAS_SO=mesa roda só este bloco
const SO_MESA = process.env.CAPTURAS_SO === 'mesa';
let idsMesa: IdsMesa | null = null;
if (!SO || SO_MESA) {
  const banco = new Banco(join(DADOS, 'jogo.sqlite'));
  idsMesa = gerarSalasMesa(banco);
  banco.fechar();
}
// --- fim (a sua área) ---

const servidor = spawn(process.execPath, [join(RAIZ, 'servidor', 'index.ts')], {
  env: { ...process.env, PORTA: String(PORTA), DADOS, SENHA_ACESSO: 'teste-capturas' },
  stdio: ['ignore', 'pipe', 'pipe'],
});
servidor.stderr.on('data', (d) => process.stderr.write(`[servidor] ${d}`));
await new Promise<void>((ok, falha) => {
  // refazer as partidas das salas prontas leva uns 30 s com a máquina ocupada (outras rodadas ao mesmo tempo)
  const t = setTimeout(() => falha(new Error('servidor não subiu')), 120000);
  servidor.stdout.on('data', (d) => { if (String(d).includes('http://localhost')) { clearTimeout(t); ok(); } });
});

const navegador = await chromium.launch();
async function foto(p: Page, nome: string): Promise<void> {
  await p.waitForTimeout(400);
  await p.screenshot({ path: join(SAIDA, `${nome}.png`) });
  console.log(`captura: ${nome}.png`);
}

/** a mesa ocupa a tela inteira (sem faixa preta embaixo nem corte), com ou sem janela aberta */
async function conferirMesa(p: Page, quando: string): Promise<void> {
  const r = await p.evaluate(() => {
    const t = document.querySelector('.tabuleiro')!.getBoundingClientRect();
    const l = document.querySelector('.lateral')!.getBoundingClientRect();
    return { vw: innerWidth, vh: innerHeight, th: t.height, tw: t.width, lh: l.height, lw: l.width };
  });
  if (Math.abs(r.th - r.vh) > 1 || Math.abs(r.lh - r.vh) > 1 || Math.abs(r.tw + r.lw - r.vw) > 1) throw new Error(`mesa fora do lugar (${quando}): ${JSON.stringify(r)}`);
}

/** a janela aberta está no centro da tela e o X dela recebe o clique */
async function conferirJanela(p: Page, quando: string): Promise<void> {
  await p.locator('.janela-caixa').waitFor();
  // espera a animação de entrada terminar (com a máquina ocupada ela pode começar atrasada)
  await p.locator('.janela-caixa').evaluate((e) => Promise.all(e.getAnimations().map((a) => a.finished)));
  await p.waitForTimeout(50);
  const r = await p.evaluate(() => {
    const c = document.querySelector('.janela-caixa')!.getBoundingClientRect();
    const x = document.querySelector('.janela-caixa .janela-x')!.getBoundingClientRect();
    const sob = document.elementFromPoint(x.left + x.width / 2, x.top + x.height / 2)?.closest('button')?.getAttribute('aria-label');
    return { dx: c.left + c.width / 2 - innerWidth / 2, dy: c.top + c.height / 2 - innerHeight / 2, sob };
  });
  if (Math.abs(r.dx) > 2 || Math.abs(r.dy) > 2 || r.sob !== 'Fechar') throw new Error(`janela fora do lugar (${quando}): ${JSON.stringify(r)}`);
}

/** todos os auxílios ligados, como a mesa da fase 7 (as partes antigas acham as jogadas pelo brilho) */
async function comAuxilios(ctx: BrowserContext): Promise<void> {
  await ctx.addInitScript(() => {
    if (!sessionStorage.getItem('capturas:prefs')) {
      sessionStorage.setItem('capturas:prefs', '1');
      localStorage.setItem('commander-da-mesa:preferencias', JSON.stringify({ nivel: 'personalizado', personalizado: { jogaveis: true, alvos: true, terrenos: true, avisos: true, pagarAuto: true } }));
    }
  });
}

const paginas: Page[] = [];
async function entrar(p: Page): Promise<void> {
  paginas.push(p);
  p.on('console', (m) => { if (m.type() === 'error') console.error(`[navegador] ${m.text()}`); });
  p.on('pageerror', (e) => console.error(`[navegador] ${e.message}`));
  await p.goto(URL);
  await p.getByLabel('Senha do servidor').fill('teste-capturas');
  await p.getByRole('button', { name: 'Entrar' }).click();
  await p.locator('.tela-passos').waitFor();
}

/** tela inicial em passos: o nome primeiro (e Continuar), depois a escolha entre criar e entrar numa sala */
async function nomear(p: Page, nome: string): Promise<void> {
  await p.getByLabel('Seu nome na mesa').fill(nome);
  await p.getByRole('button', { name: 'Continuar' }).click();
  await p.getByText(`Olá, ${nome}`).waitFor();
}
async function escolher(p: Page, o: 'Criar sala' | 'Entrar numa sala'): Promise<void> {
  await p.getByRole('button', { name: new RegExp(`^${o}`) }).click();
  await p.locator('form').filter({ hasText: o }).waitFor();
}

/** saguão em passos: põe um bot no lugar (contando de 1), com o nível, e espera ele aparecer */
async function porBot(p: Page, lugar: number, nivel?: string): Promise<void> {
  const l = p.locator('.lugar').nth(lugar - 1);
  if (nivel) await l.getByLabel('Nível').selectOption({ label: nivel });
  await p.getByRole('button', { name: `Pôr bot no lugar ${lugar}` }).click();
  await l.getByText('bot', { exact: true }).waitFor();
}
/** o anfitrião passa dos lugares para as regras e das regras para os decks */
async function irParaDecks(p: Page): Promise<void> {
  await p.getByRole('button', { name: 'Continuar para as regras' }).click();
  await p.getByRole('button', { name: 'Continuar para os decks' }).click();
  await p.locator('.saguao-decks').waitFor();
}
/** escolhe um deck pela prévia (clicar no deck abre a lista de cartas) */
async function escolherDeck(p: Page, n: number): Promise<void> {
  await p.locator('.saguao-decks').waitFor();
  await p.locator('.deck').nth(n).click();
  await p.getByRole('button', { name: 'Escolher este deck' }).click();
  await p.locator('.previa-deck').waitFor({ state: 'detached' });
}
/** deck de um bot, no passo dos decks (índice na lista em ordem alfabética) */
async function deckDoBot(p: Page, lugar: number, indice: number): Promise<void> {
  await p.locator('.decks-lugares .assento').nth(lugar - 1).getByLabel('Deck do bot').selectOption({ index: indice });
  await p.waitForTimeout(150);
}

/** a abertura (VS) cobre a mesa por uns 4 s quando a partida começa: as capturas da mesa clicam nela para pular */
async function pularAbertura(p: Page): Promise<void> {
  const vs = p.locator('.abertura');
  await vs.waitFor({ timeout: 30000 });
  await vs.click();
  await vs.waitFor({ state: 'detached', timeout: 5000 });
}

async function clicar(p: Page, nome: string | RegExp): Promise<boolean> {
  const b = p.getByRole('button', { name: nome }).first();
  if (await b.isVisible().catch(() => false) && await b.isEnabled().catch(() => false)) { await b.click(); return true; }
  return false;
}

/**
 * Terrenos na mão inicial à vista (pela imagem de cada carta do leque). Com a mão sem terreno, Ana passava a
 * partida inteira sem jogar e as capturas de jogada (07, 17, 11c, 11d) eram puladas sem aviso.
 */
async function terrenosNaMaoInicial(p: Page): Promise<number> {
  const defs = await p.evaluate(async () => {
    const info: Record<string, { f: string | null }> = await fetch('/api/cartas').then((r) => r.json());
    const porImagem = new Map(Object.entries(info).filter(([, i]) => i.f).map(([d, i]) => [i.f!, d]));
    return [...document.querySelectorAll('.leque .carta img')].map((im) => porImagem.get(im.getAttribute('src')!.split('/')[2]) ?? '');
  });
  return defs.filter((d) => hasOracle(d) && oracle(d).faces[0].types.includes('Land')).length;
}
/** espera a vez de decidir a mão e pede mulligan enquanto ela tiver menos de dois terrenos */
async function mulliganSemTerreno(p: Page, vezes: number): Promise<void> {
  for (let k = 0; k < vezes; k++) {
    if (!await p.getByRole('button', { name: 'Mulligan' }).waitFor({ timeout: 20000 }).then(() => true, () => false)) return;
    const n = await terrenosNaMaoInicial(p);
    if (n >= 2) return;
    console.log(`  mão inicial com ${n} terreno(s): mulligan`);
    await p.getByRole('button', { name: 'Mulligan' }).click();
    await p.waitForTimeout(800);
  }
}

let fotoPagamento = false;

/** responde as decisões pendentes de forma simples; para quando Ana tem prioridade */
async function jogarAteMinhaPrioridade(p: Page, limite = 40): Promise<void> {
  for (let i = 0; i < limite; i++) {
    await p.waitForTimeout(250);
    if (await p.getByText('Você tem prioridade').isVisible()) return;
    // a primeira vez que aparece um pagamento: fotografa e paga virando um terreno na mesa
    if (!fotoPagamento && await p.locator('.coluna-dir .pagamento').isVisible().catch(() => false)) {
      fotoPagamento = true;
      await foto(p, '15-pagamento');
      // a de cima do leque (as de baixo ficam cobertas)
      const fonte = p.locator('.area-eu .campo .carta.realce-acao').last();
      if (await fonte.isVisible().catch(() => false)) {
        await fonte.click({ timeout: 3000 }).catch(() => {});
        await foto(p, '16-pagamento-virou-terreno');
      }
      continue;
    }
    if (await responderJanela(p)) continue;
    for (const nome of ['Manter', 'Pagar automaticamente', 'Confirmar', 'Não atacar', 'Não bloquear', 'Nenhum', /^Confirmar/]) if (await clicar(p, nome)) break;
  }
}

/**
 * Responde a janela de escolha aberta: confirma se a quantidade marcada já vale ("Nenhum" numa escolha
 * opcional); senão marca mais uma opção. Marcar sempre a primeira e confirmar travava a rodada: o Shadrix
 * Platinopena pede "0 ou 2 modos", a janela aceita 1 (mín. 0, máx. 2), o motor recusa e o clique seguinte
 * desmarcava a opção. Devolve se havia janela.
 */
async function responderJanela(p: Page): Promise<boolean> {
  const janela = p.locator('.janela-escolha:not(.recolhida)');
  if (!await janela.isVisible().catch(() => false)) return false;
  const confirmar = janela.getByRole('button', { name: /^(Confirmar|Nenhum)/ }).first();
  if (!await confirmar.isEnabled({ timeout: 300 }).catch(() => false)) await janela.locator('.item:not([disabled]):not(.escolhido)').first().click({ timeout: 2000 }).catch(() => {});
  await confirmar.click({ timeout: 1000 }).catch(() => {});
  return true;
}

/** clica numa carta da mão com brilho e escolhe a ação do menu que começa com o texto pedido */
async function jogarDaMao(p: Page, acao: RegExp): Promise<boolean> {
  const cartas = p.locator('.mao-cartas .carta.realce-acao');
  const n = await cartas.count();
  for (let i = 0; i < n; i++) {
    // no leque, cada carta fica coberta pela vizinha da direita: clica na borda esquerda
    await cartas.nth(i).click({ position: { x: 8, y: 40 }, timeout: 3000 }).catch(() => {});
    const b = p.locator('.menu-acoes button').filter({ hasText: acao }).first();
    if (await b.isVisible().catch(() => false)) { await b.click(); return true; }
    await p.locator('.menu-acoes').getByRole('button', { name: 'Cancelar' }).click({ timeout: 2000 }).catch(() => {});
  }
  return false;
}

/** joga terrenos e mágicas quando der; senão passa o turno */
async function jogarUmPouco(p: Page, rodadas: number): Promise<void> {
  for (let k = 0; k < rodadas; k++) {
    await jogarAteMinhaPrioridade(p, 80);
    if (await jogarDaMao(p, /^Jogar /)) continue;
    if (await jogarDaMao(p, /^Conjurar: /)) { await jogarAteMinhaPrioridade(p, 20); continue; }
    await clicar(p, 'Passar até o fim do turno');
  }
}

// --- fase 9: fundos, sons e música ---
// Fundos dos comandantes em 1280×800, 1920×1080 e 2560×1440 (4 jogadores na sala ATACA e 1v1 na
// BLOQU, só olhando: as salas continuam iguais para o resto do roteiro) e Configurações com a
// música e os dois sons de turno. Com CAPTURAS_SO=fundos, roda só este bloco (e não apaga as
// outras capturas). Também anota o tamanho de cada área e da imagem de fundo servida.
const SO_CAPTURAS = process.env.CAPTURAS_SO ?? '';
async function capturasFase9(): Promise<void> {
  const telas = [[1280, 800], [1920, 1080], [2560, 1440]] as const;
  for (const [cod, nome] of [['ATACA', '4j'], ['BLOQU', '1v1']] as const) {
    for (const [w, h] of telas) {
      const c = await navegador.newContext({ viewport: { width: w, height: h } });
      c.setDefaultTimeout(20000);
      const pg = await c.newPage();
      paginas.push(pg);
      pg.on('console', (m) => { if (m.type() === 'error') console.error(`[navegador] ${m.text()}`); });
      pg.on('pageerror', (e) => console.error(`[navegador] ${e.message}`));
      await pg.goto(URL);
      await pg.evaluate((k) => localStorage.setItem('commander-da-mesa:sala', JSON.stringify({ codigo: k, token: `token-${k}` })), cod);
      await pg.getByLabel('Senha do servidor').fill('teste-capturas');
      await pg.getByRole('button', { name: 'Entrar' }).click();
      await pg.locator('.mesa').waitFor();
      // espera as imagens de fundo carregarem (a primeira vez o servidor ainda gera cada uma)
      await pg.locator('.area-fundo').first().waitFor();
      await pg.evaluate(async () => {
        await Promise.all([...document.querySelectorAll<HTMLElement>('.area-fundo')].map((f) => new Promise<void>((ok) => {
          const img = new Image();
          img.onload = img.onerror = () => ok();
          img.src = f.style.backgroundImage.replace(/^url\("?|"?\)$/g, '');
        })));
      });
      await pg.mouse.move(5, h / 2);
      await pg.waitForTimeout(600);
      const medidas = await pg.evaluate(async () => Promise.all([...document.querySelectorAll<HTMLElement>('.area')].map(async (a) => {
        const f = a.querySelector<HTMLElement>('.area-fundo');
        const src = f?.style.backgroundImage.replace(/^url\("?|"?\)$/g, '') ?? '';
        const img = new Image();
        img.src = src;
        await img.decode().catch(() => {});
        const r = a.getBoundingClientRect();
        return `${Math.round(r.width)}×${Math.round(r.height)} ← ${img.naturalWidth}×${img.naturalHeight}`;
      })));
      console.log(`fundos ${nome} ${w}×${h}: ${medidas.join('; ')}`);
      await foto(pg, `90-fundos-${nome}-${w}`);
      // a música: tocando depois do clique em "Entrar"; recarregada a página (sem gesto nenhum), espera
      // o primeiro clique sem erro nem aviso no console; depois as Configurações com ela e os sons de turno
      if (nome === '1v1' && w !== 2560) {
        const musica = () => pg.evaluate(() => document.documentElement.dataset.musica ?? 'sem estado');
        const avisos: string[] = [];
        pg.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') avisos.push(m.text()); });
        await pg.waitForFunction(() => document.documentElement.dataset.musica === 'tocando', null, { timeout: 45000 }).catch(() => {});
        if (await musica() !== 'tocando') throw new Error(`a música não começou depois do clique em Entrar: ${await musica()}`);
        // qualquer consulta do Playwright à página (evaluate, locator) conta como gesto para o navegador:
        // depois de recarregar, nada de consultar; só se olha a rede (a faixa não pode ser pedida)
        const pedidos: string[] = [];
        pg.on('request', (r) => { if (/\.mp3$/.test(new globalThis.URL(r.url()).pathname)) pedidos.push(r.url()); });
        await pg.reload();
        await pg.waitForTimeout(4000);
        if (pedidos.length) throw new Error(`sem gesto, a música não devia nem carregar: ${pedidos.join(', ')}`);
        // a consulta dá a ativação, mas sem clique nem tecla nada acontece: a música continua esperando
        if (await musica() !== 'esperando') throw new Error(`sem gesto, a música devia esperar: ${await musica()}`);
        const marca = await pg.locator('.marca-jogo').boundingBox();
        await pg.mouse.click(marca!.x + marca!.width / 2, marca!.y + marca!.height / 2);
        const t0 = Date.now();
        // baixar e decodificar a faixa (4 MB) leva um instante; com a máquina cheia, mais
        await pg.waitForFunction(() => document.documentElement.dataset.musica === 'tocando', null, { timeout: 45000 }).catch(() => {});
        if (await musica() !== 'tocando') throw new Error(`a música não começou depois do primeiro clique: ${await musica()}`);
        const demora = Date.now() - t0;
        if (avisos.length) throw new Error(`erro ou aviso no console com a música: ${avisos.join(' | ')}`);
        console.log(`música ${w}×${h}: tocando depois do clique (em ${demora} ms), esperando sem gesto, sem aviso no console`);
        await pg.getByRole('button', { name: 'Configurações' }).click();
        await conferirJanela(pg, `configurações › música ${w}`);
        await pg.locator('.credito-musica').scrollIntoViewIfNeeded();
        await foto(pg, `91-config-musica-${w}`);
        // volume da música no meio da partida (separado do dos efeitos), depois desligar a música e o som
        // de adversário: a música para e as escolhas ficam guardadas
        await pg.locator('#cfg-volume-musica').fill('20');
        if (await musica() !== 'tocando') throw new Error(`mudar o volume parou a música: ${await musica()}`);
        await pg.locator('#cfg-musica').uncheck();
        await pg.locator('#cfg-som-turnoAdversario').uncheck();
        await pg.waitForTimeout(1500);
        const guardado = await pg.evaluate(() => JSON.parse(localStorage.getItem('commander-da-mesa:preferencias') ?? '{}'));
        if (await musica() !== 'parada' || guardado.musica !== false || guardado.volumeMusica !== 0.2 || guardado.volume !== 0.7 || guardado.sons?.turnoAdversario !== false || guardado.sons?.turnoMeu !== true) {
          throw new Error(`desligar a música ou o som de adversário não valeu: ${await musica()} ${JSON.stringify(guardado)}`);
        }
        await foto(pg, `91b-config-musica-desligada-${w}`);
      }
      await c.close();
    }
  }
}
// --- importação de decks pelo Moxfield: tela Decks ---
/**
 * Tela Decks em 1280×800 e 1920×1080: a lista, os detalhes de um deck pronto e de um em preparação (se houver), e
 * "Atualizar" no Terra pela internet (nada mudou). A prévia de um deck novo, a diferença de uma atualização, o
 * andamento e o erro de regras vêm de mensagens injetadas no WebSocket (o servidor das capturas usa decks/ e gerado/
 * de verdade: confirmar uma importação aqui gravaria neles).
 * CAPTURAS_SO=decks roda só este bloco.
 */
async function capturasDecks(): Promise<void> {
  type Msg = Record<string, unknown>;
  for (const [w, h] of [[1280, 800], [1920, 1080]] as const) {
    const c = await navegador.newContext({ viewport: { width: w, height: h } });
    let injetar: (m: Msg) => void = () => { throw new Error('WebSocket ainda não abriu'); };
    await c.routeWebSocket(/\/ws$/, (ws) => { ws.connectToServer(); injetar = (m) => ws.send(JSON.stringify(m)); });
    const p = await c.newPage();
    await entrar(p);
    await p.getByRole('button', { name: 'Decks' }).click();
    await p.getByText('Decks da mesa').waitFor();
    await p.locator('.cat-deck').first().waitFor();
    await foto(p, `95-decks-lista-${w}`);
    const catalogo = await p.evaluate(async () => (await (await fetch('/api/catalogo')).json()).decks as { id: string; nome: string; estado: string }[]);
    const pronto = catalogo.find((d) => d.nome === 'Terra')!;
    await p.getByRole('button', { name: `Detalhes de ${pronto.nome}` }).click();
    await conferirJanela(p, 'detalhes do deck');
    await foto(p, `95b-decks-detalhe-pronto-${w}`);
    await p.keyboard.press('Escape');
    const prep = catalogo.find((d) => d.estado !== 'pronto');
    if (prep) {
      await p.getByRole('button', { name: `Detalhes de ${prep.nome}` }).click();
      await conferirJanela(p, 'deck em preparação');
      await p.waitForTimeout(600);
      await foto(p, `95c-decks-detalhe-preparacao-${w}`);
      await p.keyboard.press('Escape');
    } else console.log('aviso: nenhum deck em preparação para a captura 95c');
    // Atualizar de verdade (internet): o Terra não mudou no Moxfield
    await p.locator('.cat-deck', { hasText: 'Terra' }).getByRole('button', { name: 'Atualizar' }).click();
    await p.getByText(/Nenhuma carta mudou/).waitFor({ timeout: 30000 });
    await conferirJanela(p, 'atualizar sem mudança');
    await foto(p, `95d-decks-atualizar-nada-${w}`);
    await p.locator('.cat-acoes').getByRole('button', { name: 'Fechar' }).click();

    // prévias injetadas: a resposta da busca diz o número da tarefa; a prévia chega pelo WebSocket
    const info = await p.evaluate(async () => await (await fetch('/api/cartas')).json() as Record<string, { f: string | null; pt: string | null }>);
    const carta = (nome: string, pronta = true, quantidade = 1) => ({ nome, quantidade, pt: info[nome]?.pt ?? null, img: pronta ? info[nome]?.f ?? null : null, tipo: pronta ? 'Artifact' : 'Instant', pronta });
    let tarefa = 9000;
    const mostrar = async (tipo: string, proposta: Msg | null, extra: Msg = {}) => {
      tarefa++;
      const n = tarefa;
      await p.route('**/api/catalogo/importar', (r) => r.fulfill({ status: 202, contentType: 'application/json', body: JSON.stringify({ tarefa: n }) }));
      await p.locator('.cat-importar input').fill('https://moxfield.com/decks/HAKhAXl1RHyly2_QGDPvzg');
      await p.getByRole('button', { name: 'Buscar deck' }).click();
      await p.waitForFunction(() => !(document.querySelector('.cat-importar input') as HTMLInputElement).value);
      await p.unroute('**/api/catalogo/importar');
      injetar({ t: 'catalogo', mudou: false, tarefa: { id: n, tipo, deck: 'HAKhAXl1RHyly2_QGDPvzg', nome: 'Multiverse Reforged', etapa: 'Pronto', feito: 0, total: 0, estado: 'pronta', ...(proposta ? { proposta } : {}), ...extra } });
    };
    const faltam = ['Brainstorm', 'Chromatic Lantern', 'Lingering Souls', 'Dimir Signet', 'Underground River', 'Martial Coup', 'Polymorph', 'Shark Typhoon', 'Hullbreaker Horror', 'Sunfall', 'Nicol Bolas, Dragon-God', "Elspeth, Sun's Champion"].map((n) => carta(n, false));
    const base = { token: 'tokencaptura', id: 'HAKhAXl1RHyly2_QGDPvzg', link: 'https://moxfield.com/decks/HAKhAXl1RHyly2_QGDPvzg', comandante: 'Jace, Multiverse Architect', comandantePt: null, trocaComandante: null, erros: [], avisos: [] };
    await mostrar('verificar', {
      ...base, nome: 'Multiverse Reforged (Reality Fracture Commander Decklist)', novo: true, total: 93, prontas: 29, faltam, entram: [], saem: [], destino: 'preparacao',
      resumo: '64 cartas ainda não têm regras no jogo. O deck fica em preparação até elas ficarem prontas.',
    });
    await conferirJanela(p, 'prévia de deck novo');
    await foto(p, `96-decks-importar-previa-${w}`);
    await p.locator('.cat-faltam summary').click();
    await foto(p, `96b-decks-importar-previa-faltam-${w}`);
    await p.keyboard.press('Escape');
    await mostrar('verificar', {
      ...base, id: pronto.id, nome: 'Terra', novo: false, comandante: 'Terra, Herald of Hope', total: 93, prontas: 92, faltam: [carta('Brainstorm', false)],
      entram: [carta('Bag of Holding'), carta('Brainstorm', false), carta('Fellwar Stone')], saem: [carta('Arcane Signet'), carta('Mountain', true, 2), carta('Thrill of Possibility')],
      destino: 'preparacao', resumo: '1 carta ainda não tem regras no jogo. A atualização fica guardada e o deck segue com a lista atual até ela ficar pronta.',
      avisos: ['Só o comandante e o deck principal entram no jogo; ficam de fora: reserva (sideboard), "talvez" (maybeboard)'],
    });
    await conferirJanela(p, 'diferença da atualização');
    await foto(p, `96c-decks-atualizar-diferenca-${w}`);
    await p.keyboard.press('Escape');
    await mostrar('verificar', {
      ...base, nome: 'Deck com 99 cartas', novo: true, total: 92, prontas: 92, faltam: [], entram: [], saem: [], destino: 'jogavel',
      resumo: 'A lista não cumpre as regras de deck do Commander: corrija no Moxfield e busque de novo.',
      erros: ['O deck tem 99 cartas (precisa de 100) — CR 903.5a', 'Sol Ring aparece 2 vezes — CR 903.5b'], avisos: ['Dockside Extortionist está banida no Commander'],
    });
    await conferirJanela(p, 'erro de regras');
    await foto(p, `96d-decks-importar-erro-regras-${w}`);
    await p.keyboard.press('Escape');
    // andamento da confirmação (a janela fica aberta até terminar) e o resultado
    await mostrar('confirmar', null, { estado: 'andando', etapa: 'Baixando as cartas novas: Hullbreaker Horror', feito: 23, total: 64 });
    await p.locator('.cat-janela .cat-progresso').waitFor();
    await foto(p, `96e-decks-confirmar-andamento-${w}`);
    injetar({ t: 'catalogo', mudou: false, tarefa: { id: tarefa, tipo: 'confirmar', deck: 'HAKhAXl1RHyly2_QGDPvzg', nome: 'Multiverse Reforged', etapa: 'Pronto', feito: 64, total: 64, estado: 'pronta', resultado: { id: 'HAKhAXl1RHyly2_QGDPvzg', destino: 'preparacao', texto: 'Multiverse Reforged ficou em preparação: faltam regras para 64 cartas.' } } });
    await p.getByText(/ficou em preparação: faltam/).waitFor();
    await foto(p, `96f-decks-confirmar-resultado-${w}`);
    await p.locator('.cat-acoes').getByRole('button', { name: 'Fechar' }).click();
    // a tela inicial, com o botão Decks
    await p.getByRole('button', { name: 'Voltar' }).click();
    await p.locator('.tela-passos').waitFor();
    await foto(p, `97-inicio-com-decks-${w}`);
    await c.close();
  }
}
if (!SO_CAPTURAS || SO_CAPTURAS === 'decks') {
  try {
    await capturasDecks();
  } catch (e) {
    for (const [i, p] of paginas.entries()) if (!p.isClosed()) await p.screenshot({ path: join(SAIDA, `falha-decks-${i}.png`) }).catch(() => {});
    await navegador.close();
    servidor.kill();
    throw e;
  }
  if (SO_CAPTURAS) {
    await navegador.close();
    servidor.kill();
    process.exit(0);
  }
}
// --- fim (tela Decks) ---
if (!SO_CAPTURAS || SO_CAPTURAS === 'fundos') {
  try {
    await capturasFase9();
  } catch (e) {
    for (const [i, p] of paginas.entries()) if (!p.isClosed()) await p.screenshot({ path: join(SAIDA, `falha-fase9-${i}.png`) }).catch(() => {});
    await navegador.close();
    servidor.kill();
    throw e;
  }
  if (SO_CAPTURAS) {
    await navegador.close();
    servidor.kill();
    process.exit(0);
  }
}
// --- fim do bloco da fase 9 ---
// --- abertura da partida (tela VS) ---
/**
 * A VS do começo da partida: Ana contra um bot e Ana com três bots, em 1280×800, 1920×1080 e 2560×1440, fotografada
 * depois que o VS crava e os nomes entram. Em 1920×1080, três partidas de quatro passam pelos 9 decks em faixas
 * diferentes (o rosto do comandante tem de ficar no meio da faixa). Confere que ela cobre a tela inteira, que tem uma
 * faixa por jogador e que um clique pula para a mão inicial. CAPTURAS_SO=abertura roda só este bloco.
 */
async function capturasAbertura(): Promise<void> {
  // [modo, largura, altura, deck de Ana, decks dos bots (índices nas listas do saguão), sufixo da foto]
  const rodadas: ['1v1' | '4p', number, number, number, number[], string][] = [
    ['1v1', 1280, 800, 4, [1], ''], ['1v1', 1920, 1080, 4, [1], ''], ['1v1', 2560, 1440, 4, [1], ''],
    ['4p', 1280, 800, 4, [1, 3, 6], ''], ['4p', 2560, 1440, 4, [1, 3, 6], ''],
    ['4p', 1920, 1080, 0, [1, 2, 3], '-a'], ['4p', 1920, 1080, 4, [5, 6, 7], '-b'], ['4p', 1920, 1080, 8, [0, 4, 2], '-c'],
  ];
  for (const [modo, w, h, deckAna, decksBots, sufixo] of rodadas) {
    {
      const c = await navegador.newContext({ viewport: { width: w, height: h } });
      c.setDefaultTimeout(20000);
      const q = await c.newPage();
      await entrar(q);
      await nomear(q, 'Ana');
      await escolher(q, 'Criar sala');
      if (modo === '1v1') await q.getByRole('button', { name: 'Um contra um' }).click();
      await q.locator('form').filter({ hasText: 'Criar sala' }).getByLabel('Senha da sala').fill('mesa');
      await q.getByRole('button', { name: 'Criar', exact: true }).click();
      await q.locator('.lugares').waitFor();
      const bots = modo === '1v1' ? [2] : [2, 3, 4];
      for (const l of bots) await porBot(q, l, l === 3 ? 'Difícil' : undefined);
      await irParaDecks(q);
      for (const [i, l] of bots.entries()) await deckDoBot(q, l, decksBots[i]);
      await escolherDeck(q, deckAna);
      await q.getByRole('button', { name: 'Começar a partida' }).click();
      const vs = q.locator('.abertura');
      await q.locator('.abertura.tocando').waitFor({ timeout: 30000 });
      const caixa = await vs.boundingBox();
      if (!caixa || caixa.x > 0 || caixa.y > 0 || caixa.width < w || caixa.height < h) throw new Error(`abertura ${modo} ${w}×${h}: não cobre a tela (${JSON.stringify(caixa)})`);
      const faixas = await vs.locator('.vs-lado').count();
      if (faixas !== bots.length + 1) throw new Error(`abertura ${modo} ${w}×${h}: ${faixas} faixas para ${bots.length + 1} jogadores`);
      const nomes = await vs.locator('.vs-deck').allTextContents();
      // o VS crava em 1,5 s e os nomes terminam de entrar em 2,5 s; a tela começa a sair em 4,4 s (foto espera 0,4 s)
      await q.waitForTimeout(2200);
      await foto(q, `93-abertura-${modo}-${w}${sufixo}`);
      // com a máquina ocupada a tela pode já estar saindo sozinha: aí não há o que clicar
      const pulou = await vs.evaluate((e) => !e.classList.contains('saindo')).catch(() => false) && await vs.click({ timeout: 2000 }).then(() => true).catch(() => false);
      await vs.waitFor({ state: 'detached', timeout: 5000 });
      await q.getByText('Mão inicial').waitFor();
      console.log(`abertura ${modo} ${w}×${h}: ${nomes.join(' × ')}; ${pulou ? 'um clique pulou' : 'saiu sozinha'} para a mão inicial`);
      await c.close();
    }
  }
}
if (!SO_CAPTURAS || SO_CAPTURAS === 'abertura') {
  try {
    await capturasAbertura();
  } catch (e) {
    for (const [i, p] of paginas.entries()) if (!p.isClosed()) await p.screenshot({ path: join(SAIDA, `falha-abertura-${i}.png`) }).catch(() => {});
    await navegador.close();
    servidor.kill();
    throw e;
  }
  if (SO_CAPTURAS) {
    await navegador.close();
    servidor.kill();
    process.exit(0);
  }
}
// --- fim (abertura da partida) ---
// --- fase 9: posicionar e seleção por arrasto ---
/**
 * Itens 1.3 e 2.4: carta pega pelo canto e solta (a mira marca onde o ponteiro soltou), retângulo de
 * seleção, grupo selecionado e grupo movido, em 1280×800 e 1920×1080. Também mede: o ponto pego tem
 * de ficar sob o ponteiro (menos de 0,5 px) e o grupo anda junto sem mexer nas outras cartas.
 */
async function capturasPosicionar(): Promise<void> {
  type Info = { x: number; y: number; virada: boolean; deitada: boolean; leque: boolean; sel: boolean; ow: number; oh: number; vis: { x: number; y: number; w: number; h: number } };
  const cartas = (pg: Page) => pg.evaluate(() => Object.fromEntries([...document.querySelectorAll('.area-eu .campo > .carta[data-obj]')].map((e) => {
    const h = e as HTMLElement, r = h.getBoundingClientRect();
    return [h.dataset.obj!, { x: parseFloat(h.style.left), y: parseFloat(h.style.top), virada: h.classList.contains('virada'), deitada: h.classList.contains('deitada'), leque: h.classList.contains('no-leque'),
      sel: h.classList.contains('selecionada'), ow: h.offsetWidth, oh: h.offsetHeight, vis: { x: r.left, y: r.top, w: r.width, h: r.height } }];
  }))) as Promise<Record<string, Info>>;
  // a mira faz o papel do ponteiro (a captura de tela não mostra o mouse)
  const mira = (pg: Page, x: number, y: number) => pg.evaluate(([mx, my]) => {
    let m = document.getElementById('mira-captura');
    if (!m) {
      m = document.createElement('div');
      m.id = 'mira-captura';
      m.style.cssText = 'position:fixed;z-index:9999;pointer-events:none;width:24px;height:24px;margin:-12px 0 0 -12px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 0 1.5px #000,inset 0 0 0 1.5px #000;background:radial-gradient(circle,#ff3b3b 0 3px,transparent 3.5px)';
      document.body.appendChild(m);
    }
    m.style.left = `${mx}px`;
    m.style.top = `${my}px`;
  }, [x, y]);
  const semMira = (pg: Page) => pg.evaluate(() => document.getElementById('mira-captura')?.remove());
  const arrastar = async (pg: Page, x0: number, y0: number, x1: number, y1: number, antesDeSoltar?: () => Promise<void>) => {
    await pg.mouse.move(x0, y0);
    await pg.waitForTimeout(300);
    await pg.mouse.down();
    for (let k = 1; k <= 14; k++) await pg.mouse.move(x0 + (x1 - x0) * k / 14, y0 + (y1 - y0) * k / 14);
    if (antesDeSoltar) await antesDeSoltar();
    await pg.mouse.up();
    await pg.waitForTimeout(700);
  };

  for (const [largura, altura] of [[1280, 800], [1920, 1080]]) {
    const c = await navegador.newContext({ viewport: { width: largura, height: altura } });
    c.setDefaultTimeout(20000);
    const pg = await c.newPage();
    paginas.push(pg);
    pg.on('pageerror', (e) => console.error(`[navegador] ${e.message}`));
    await pg.goto(URL);
    await pg.evaluate(() => localStorage.setItem('commander-da-mesa:sala', JSON.stringify({ codigo: 'ARRUM', token: 'token-ARRUM' })));
    await pg.getByLabel('Senha do servidor').fill('teste-capturas');
    await pg.getByRole('button', { name: 'Entrar' }).click();
    await pg.locator('.mesa').waitFor();
    await pg.waitForTimeout(1200);
    const campo = (await pg.locator('.area-eu .campo').boundingBox())!;
    // começa da arrumação padrão (a rodada da outra tela deixou cartas postas): clique direito num ponto vazio do campo
    const vazio = await pg.evaluate(() => {
      const c = document.querySelector('.area-eu .campo')!, r = c.getBoundingClientRect();
      for (const fy of [.5, .3, .7, .15, .85]) for (const fx of [.6, .5, .7, .4, .8]) {
        const x = r.left + r.width * fx, y = r.top + r.height * fy;
        if (document.elementFromPoint(x, y) === c) return { x, y };
      }
      return null;
    });
    if (!vazio) throw new Error(`campo sem espaço vazio (${largura})`);
    await pg.mouse.click(vazio.x, vazio.y, { button: 'right' });
    await pg.locator('.menu-acoes').getByText('Reorganizar meu campo').click();
    await pg.waitForTimeout(600);
    const sufixo = `-${largura}`;

    // 1.3: pega uma criatura pelo canto de cima à esquerda e solta mais à direita e abaixo
    let c0 = await cartas(pg);
    const [id, carta] = Object.entries(c0).filter(([, x]) => !x.virada).sort((a, b) => a[1].y - b[1].y || a[1].x - b[1].x)[0];
    await pg.mouse.move(carta.vis.x + 6, carta.vis.y + 6);
    await pg.waitForTimeout(300);
    const v0 = (await cartas(pg))[id].vis;
    const gx = carta.vis.x + 6, gy = carta.vis.y + 6;
    const fx = (gx - v0.x) / v0.w, fy = (gy - v0.y) / v0.h;
    const tx = campo.x + campo.width * .42, ty = campo.y + campo.height * .38;
    await arrastar(pg, gx, gy, tx, ty, async () => { await mira(pg, tx, ty); await foto(pg, `40-posicionar-pega-pelo-canto${sufixo}`); });
    const v1 = (await cartas(pg))[id];
    const erro = [v1.vis.x + fx * v1.vis.w - tx, v1.vis.y + fy * v1.vis.h - ty];
    if (Math.hypot(erro[0], erro[1]) > 0.5) throw new Error(`carta solta fora do ponteiro (${largura}): ${erro.map((n) => n.toFixed(2)).join(', ')} px`);
    const outras = Object.keys(c0).filter((x) => x !== id);
    const c1 = await cartas(pg);
    if (outras.some((x) => c1[x].x !== c0[x].x || c1[x].y !== c0[x].y)) throw new Error(`soltar a carta mexeu nas outras (${largura})`);
    await foto(pg, `40b-posicionar-solta${sufixo}`);
    console.log(`   posicionar ${largura}: ponto pego a ${erro.map((n) => n.toFixed(2)).join(', ')} px do ponteiro`);
    await semMira(pg);

    // terreno deitado: mais largo que alto, e pego pelo canto ele também fica sob o ponteiro
    c0 = await cartas(pg);
    const deitadas = Object.entries(c0).filter(([, x]) => x.deitada);
    if (!deitadas.length) throw new Error(`nenhum terreno deitado no campo (${largura})`);
    if (deitadas.some(([, x]) => x.ow <= x.oh)) throw new Error(`terreno deitado mais alto que largo (${largura})`);
    const [idT, t] = deitadas.filter(([, x]) => !x.leque && !x.virada).sort((a, b) => b[1].y - a[1].y)[0] ?? deitadas[0];
    await pg.mouse.move(t.vis.x + 5, t.vis.y + 5);
    await pg.waitForTimeout(300);
    const vt0 = (await cartas(pg))[idT].vis;
    const gtx = t.vis.x + 5, gty = t.vis.y + 5;
    const ftx = (gtx - vt0.x) / vt0.w, fty = (gty - vt0.y) / vt0.h;
    const ttx = campo.x + campo.width * .55, tty = campo.y + campo.height * .3;
    await arrastar(pg, gtx, gty, ttx, tty, async () => { await mira(pg, ttx, tty); await foto(pg, `40c-posicionar-terreno-deitado${sufixo}`); });
    const vt1 = (await cartas(pg))[idT];
    const erroT = [vt1.vis.x + ftx * vt1.vis.w - ttx, vt1.vis.y + fty * vt1.vis.h - tty];
    if (Math.hypot(erroT[0], erroT[1]) > 0.5) throw new Error(`terreno deitado solto fora do ponteiro (${largura}): ${erroT.map((n) => n.toFixed(2)).join(', ')} px`);
    if (!vt1.deitada || vt1.ow <= vt1.oh) throw new Error(`o terreno deixou de ser deitado ao ser movido (${largura})`);
    console.log(`   posicionar ${largura}: terreno deitado (${t.ow}×${t.oh}) pego a ${erroT.map((n) => n.toFixed(2)).join(', ')} px do ponteiro`);
    await semMira(pg);

    // 2.4: retângulo do espaço vazio embaixo à direita até o meio do campo: pega os terrenos e a carta que
    // acabou de ser posta (a criatura de cima fica de fora)
    c0 = await cartas(pg);
    // começa num ponto vazio do campo (sem carta nem avatar por cima) e termina logo abaixo da criatura de cima
    const ay = campo.y + campo.height * .97;
    const ax = await pg.evaluate(({ x0, x1, y }) => {
      for (let x = x0; x < x1; x += 8) { const el = document.elementFromPoint(x, y); if (el?.classList.contains('campo')) return x; }
      return x0;
    }, { x0: campo.x + campo.width * .58, x1: campo.x + campo.width * .97, y: ay });
    const topoCriatura = Math.min(...Object.values(c0).map((v) => v.vis.y + v.vis.h));
    const fimY = Math.max(campo.y + campo.height * .45, Math.min(ay - 40, topoCriatura + 6));
    await arrastar(pg, ax, ay, campo.x + 6, fimY, async () => {
      if (!await pg.locator('.retangulo-selecao').count() || !await pg.locator('.area-eu .carta.na-selecao').count()) throw new Error(`retângulo de seleção não apareceu (${largura})`);
      await foto(pg, `41-selecao-retangulo${sufixo}`);
    });
    await pg.mouse.move(campo.x + campo.width * .6, campo.y + 4);
    c0 = await cartas(pg);
    const sel = Object.keys(c0).filter((x) => c0[x].sel);
    if (sel.length < 3) throw new Error(`seleção com poucas cartas (${largura}): ${sel.length}`);
    if (!sel.some((x) => c0[x].deitada)) throw new Error(`o retângulo não pegou terreno deitado (${largura})`);
    await foto(pg, `41b-selecao-grupo${sufixo}`);
    // arrasta uma das selecionadas pelo canto: todas andam juntas
    const pega = c0[sel[sel.length - 1]];
    // sobe no máximo até perto do topo do campo (o jogo segura o grupo dentro do campo, e aí ele não anda inteiro)
    const topoSel = Math.min(...sel.map((x) => c0[x].vis.y));
    const dx = campo.width * .18, dy = -Math.max(0, Math.min(campo.height * .15, topoSel - campo.y - 6));
    await arrastar(pg, pega.vis.x + 8, pega.vis.y + 8, pega.vis.x + 8 + dx, pega.vis.y + 8 + dy);
    await pg.mouse.move(campo.x + campo.width * .6, campo.y + 4);
    await pg.waitForTimeout(300);
    const c2 = await cartas(pg);
    const desvio = Math.max(...sel.map((x) => Math.hypot(c2[x].x - c0[x].x - dx, c2[x].y - c0[x].y - dy)));
    if (desvio > 0.5 || sel.some((x) => !c2[x].sel)) throw new Error(`grupo não andou junto (${largura}): desvio de ${desvio.toFixed(2)} px`);
    if (Object.keys(c0).filter((x) => !sel.includes(x)).some((x) => c2[x].x !== c0[x].x || c2[x].y !== c0[x].y)) throw new Error(`mover o grupo mexeu nas outras (${largura})`);
    await foto(pg, `41c-selecao-grupo-movido${sufixo}`);
    console.log(`   seleção ${largura}: ${sel.length} cartas andaram juntas (desvio máximo ${desvio.toFixed(2)} px)`);
    await c.close();
  }
}
if (SO_POSICIONAR) {
  try { await capturasPosicionar(); } catch (e) {
    for (const [i, p] of paginas.entries()) if (!p.isClosed()) await p.screenshot({ path: join(SAIDA, `falha-${i}.png`) }).catch(() => {});
    throw e;
  } finally { await navegador.close(); servidor.kill(); }
  process.exit(0);
}
// --- fim (fase 9: posicionar) ---

// --- combate com muitas fichas: atacar e bloquear ---
/**
 * O relato do teste de mesa: com muitas fichas não dava para escolher o atacante nem bloquear com mais de uma. Mede
 * que o centro da faixa à vista de cada ficha do leque recebe o clique dela (antes e depois de marcar), marca pelo
 * retângulo, pelo selo ×n e por "Atacar com todas" (um clique no oponente vale para todas), e bloqueia fichas iguais
 * com dois bloqueadores, troca o atacante, solta pelo "×", mostra o motivo da recusa (ameaça) e aceita o clique que
 * tremeu 9 px.
 */
async function capturasCombate(): Promise<void> {
  const ids = idsCombate!;
  const abrir = async (codigo: string, tela: { width: number; height: number }, titulo: string) => {
    const c = await navegador.newContext({ viewport: tela });
    c.setDefaultTimeout(20000);
    const pg = await c.newPage();
    paginas.push(pg);
    pg.on('pageerror', (e) => console.error(`[navegador] ${e.message}`));
    await pg.goto(URL);
    await pg.evaluate((cod) => localStorage.setItem('commander-da-mesa:sala', JSON.stringify({ codigo: cod, token: `token-${cod}` })), codigo);
    await pg.getByLabel('Senha do servidor').fill('teste-capturas');
    await pg.getByRole('button', { name: 'Entrar' }).click();
    await pg.locator('.mesa').waitFor();
    await pg.locator('.coluna-dir .decisao-titulo', { hasText: titulo }).waitFor({ timeout: 90000 });
    // os leques abrem com a decisão: espera as cartas chegarem
    await pg.waitForTimeout(900);
    return { c, pg };
  };
  const longe = (pg: Page) => pg.mouse.move(3, 3);
  /** o centro da faixa à vista de cada carta do leque (a parte que a seguinte não cobre) e quem recebe o clique ali */
  const faixas = (pg: Page, lista: number[]) => pg.evaluate((lista) => {
    const caixas = lista.map((id) => ({ id, r: document.querySelector(`.campo [data-obj="${id}"]`)!.getBoundingClientRect() })).sort((a, b) => a.r.left - b.r.left);
    return caixas.map((k, i) => {
      const prox = caixas[i + 1];
      const dir = prox && prox.r.left < k.r.right ? prox.r.left : k.r.right;
      const x = (k.r.left + dir) / 2, y = k.r.top + k.r.height / 2;
      const sob = (document.elementFromPoint(x, y) as HTMLElement | null)?.closest('[data-obj]') as HTMLElement | null;
      return { id: k.id, x, y, larg: dir - k.r.left, w: Math.min(k.r.width, k.r.height), sob: sob ? Number(sob.dataset.obj) : null };
    });
  }, lista);
  const conferirFaixas = async (pg: Page, lista: number[], quando: string) => {
    const f = await faixas(pg, lista);
    const erradas = f.filter((k) => k.sob !== k.id);
    if (erradas.length) throw new Error(`faixa de ficha que não recebe o próprio clique (${quando}): ${JSON.stringify(erradas)}`);
    console.log(`   ${quando}: ${f.length} faixas, a menor com ${Math.min(...f.map((k) => k.larg)).toFixed(1)} px (${(Math.min(...f.map((k) => k.larg / k.w)) * 100).toFixed(0)}% da carta)`);
    return f;
  };
  const contar = (pg: Page, sel: string) => pg.locator(sel).count();
  const esperarContagem = async (pg: Page, sel: string, n: number, quando: string) => {
    for (let i = 0; i < 20 && await contar(pg, sel) !== n; i++) await pg.waitForTimeout(100);
    const k = await contar(pg, sel);
    if (k !== n) throw new Error(`${quando}: ${k} em "${sel}", esperava ${n}`);
  };
  const marcadas = '.area-eu .campo > .carta.inclinada';
  /** linhas do resumo do combate inteiras à vista acima dos botões presos no pé do painel */
  const linhasVisiveis = (pg: Page) => pg.evaluate(() => {
    const painel = document.querySelector('.coluna-dir .decisao.combate')!;
    const limite = painel.querySelector(':scope > .botoes-linha')!.getBoundingClientRect().top;
    const topo = painel.getBoundingClientRect().top;
    const ls = [...painel.querySelectorAll('.linha-combate')].map((l) => l.getBoundingClientRect());
    return { total: ls.length, visiveis: ls.filter((r) => r.top >= topo - 1 && r.bottom <= limite + 1).length };
  });
  const conferirLinhas = async (pg: Page, minimo: number, quando: string) => {
    const l = await linhasVisiveis(pg);
    if (l.visiveis < Math.min(minimo, l.total)) throw new Error(`${quando}: só ${l.visiveis} de ${l.total} linhas à vista no painel`);
    console.log(`   ${quando}: ${l.visiveis} de ${l.total} linhas à vista no painel`);
  };
  /** com a decisão na coluna, o seu retrato fica à esquerda dela (no canto do campo), sem carta embaixo */
  const conferirRetrato = async (pg: Page, quando: string) => {
    await pg.waitForTimeout(400);
    const r = await pg.evaluate(() => {
      const av = document.querySelector('.area-eu .avatar')!.getBoundingClientRect();
      const col = document.querySelector('.coluna-dir .cartao')!.getBoundingClientRect();
      const cartas = [...document.querySelectorAll('.area-eu .campo > .carta')].filter((e) => {
        const q = e.getBoundingClientRect();
        return q.left < av.right && q.right > av.left && q.top < av.bottom && q.bottom > av.top;
      }).length;
      return { avDireita: av.right, colEsquerda: col.left, colTopo: col.top, avTopo: av.top, cartas };
    });
    if (r.avDireita > r.colEsquerda + 1 || r.cartas) throw new Error(`${quando}: retrato com a coluna aberta ${JSON.stringify(r)}`);
  };

  // ---------------- FICHA: Ana ataca com seis fichas iguais (e duas criaturas)
  for (const tela of [{ width: 1920, height: 1080 }, { width: 1280, height: 800 }]) {
    const { c, pg } = await abrir('FICHA', tela, 'Ataque', );
    const sufixo = `-${tela.width}`;
    const fichas = ids.FICHA.fichas;
    await longe(pg);
    await foto(pg, `50-ficha-decisao${sufixo}`);
    const f0 = await conferirFaixas(pg, fichas, `FICHA ${tela.width} antes de marcar`);
    // a #2 e a #4 marcadas, inclinadas no leque (na ordem do leque, embaixo das seguintes): as vizinhas continuam
    // recebendo o próprio clique, e a marcada recebe o clique na faixa dela e na borda de cima, que sobe acima da seguinte
    for (const k of [f0[1], f0[3]]) await pg.mouse.click(k.x, k.y);
    await longe(pg);
    await esperarContagem(pg, marcadas, 2, 'marcadas alternadas');
    await pg.waitForTimeout(350);
    await conferirFaixas(pg, fichas, `FICHA ${tela.width} #2 e #4 marcadas, inclinadas`);
    const bordas = await pg.evaluate((pares) => pares.map(([id, prox]) => {
      const r = document.querySelector(`.campo [data-obj="${prox}"]`)!.getBoundingClientRect();
      const x = r.left + 10, y = r.top - 4;
      const sob = (document.elementFromPoint(x, y) as HTMLElement | null)?.closest('[data-obj]') as HTMLElement | null;
      return { id, x, y, sob: sob ? Number(sob.dataset.obj) : null };
    }), [[f0[1].id, f0[2].id], [f0[3].id, f0[4].id]]);
    if (bordas.some((k) => k.sob !== k.id)) throw new Error(`borda de cima da marcada não recebe o clique dela: ${JSON.stringify(bordas)}`);
    await foto(pg, `50a-ficha-inclinadas-no-leque${sufixo}`);
    // na borda de cima: o primeiro clique escolhe a #2 (a escolhida era a #4), o segundo a desmarca
    await pg.mouse.click(bordas[0].x, bordas[0].y);
    await longe(pg);
    if (!await pg.locator(`.area-eu [data-obj="${bordas[0].id}"].combate-ativa`).count()) throw new Error('clique na borda de cima não escolheu a marcada');
    await esperarContagem(pg, marcadas, 2, 'clique na borda de cima');
    await pg.mouse.click(bordas[0].x, bordas[0].y);
    await longe(pg);
    await esperarContagem(pg, marcadas, 1, 'segundo clique na borda de cima');
    // a #4 sai pelo "×" da linha no painel
    await pg.locator('.linha-combate', { hasText: '#4' }).getByRole('button').click();
    await esperarContagem(pg, marcadas, 0, '"×" da linha do ataque');
    // um clique no centro da faixa de cada ficha marca aquela ficha
    for (const k of f0) await pg.mouse.click(k.x, k.y);
    await longe(pg);
    await esperarContagem(pg, marcadas, 6, 'cliques nas faixas');
    await conferirFaixas(pg, fichas, `FICHA ${tela.width} depois de marcar`);
    await conferirRetrato(pg, `FICHA ${tela.width}`);
    await conferirLinhas(pg, 4, `FICHA ${tela.width}, seis fichas marcadas`);
    await foto(pg, `50b-ficha-marcadas-por-clique${sufixo}`);
    // a marcada que não é a escolhida: o primeiro clique a escolhe, o segundo desmarca
    const f1 = await faixas(pg, fichas);
    await pg.mouse.click(f1[2].x, f1[2].y);
    await esperarContagem(pg, marcadas, 6, 'clique na marcada não escolhida');
    if (!await pg.locator(`.area-eu [data-obj="${f1[2].id}"].combate-ativa`).count()) throw new Error('a marcada clicada não ficou escolhida');
    await pg.mouse.click(f1[2].x, f1[2].y);
    await esperarContagem(pg, marcadas, 5, 'segundo clique na escolhida');
    await pg.getByRole('button', { name: 'Limpar' }).click();
    await esperarContagem(pg, marcadas, 0, 'Limpar');
    if (tela.width !== 1920) {
      // as oito de uma vez: mais de seis linhas, as fichas iguais com o mesmo alvo numa linha só
      await pg.getByRole('button', { name: 'Atacar com todas' }).click();
      await longe(pg);
      await esperarContagem(pg, marcadas, 8, `Atacar com todas (${tela.width})`);
      await conferirLinhas(pg, 4, `FICHA ${tela.width}, oito marcadas`);
      await foto(pg, `50g-ficha-todas-sem-alvo${sufixo}`);
      await c.close();
      continue;
    }

    // retângulo do espaço vazio à direita da fileira de criaturas até o canto de cima: marca as oito
    const ponto = await pg.evaluate((lista) => {
      const campo = document.querySelector('.area-eu .campo')!;
      const rs = lista.map((id) => document.querySelector(`.area-eu [data-obj="${id}"]`)!.getBoundingClientRect());
      const y = Math.max(...rs.map((r) => r.top + r.height / 2));
      const x0 = Math.max(...rs.map((r) => r.right)) + 12;
      for (let x = x0; x < campo.getBoundingClientRect().right - 4; x += 6) if (document.elementFromPoint(x, y) === campo) return { x, y, cx: campo.getBoundingClientRect().left + 3, cy: campo.getBoundingClientRect().top + 3 };
      return null;
    }, [...fichas, ...ids.FICHA.criaturas]);
    if (!ponto) throw new Error('FICHA: sem espaço vazio no campo para o retângulo');
    await pg.mouse.move(ponto.x, ponto.y);
    await pg.mouse.down();
    for (let k = 1; k <= 12; k++) await pg.mouse.move(ponto.x + (ponto.cx - ponto.x) * k / 12, ponto.y + (ponto.cy - ponto.y) * k / 12);
    await foto(pg, `50c-ficha-retangulo${sufixo}`);
    await pg.mouse.up();
    await longe(pg);
    await esperarContagem(pg, marcadas, 8, 'retângulo');
    if (await contar(pg, '.area-eu .carta.selecionada')) throw new Error('o retângulo marcou para atacar e também selecionou para mover');
    await foto(pg, `50d-ficha-retangulo-marcou${sufixo}`);
    await pg.getByRole('button', { name: 'Limpar' }).click();
    await esperarContagem(pg, marcadas, 0, 'Limpar depois do retângulo');

    // o selo ×6 do leque: marca as seis; de novo, desmarca
    const selo = pg.locator('.area-eu button.grupo-n');
    if (await selo.count() !== 1) throw new Error(`FICHA: ${await selo.count()} selos ×n clicáveis, esperava 1`);
    await selo.click();
    await longe(pg);
    await esperarContagem(pg, marcadas, 6, 'selo ×6');
    await conferirFaixas(pg, fichas, 'FICHA marcadas pelo selo');
    await foto(pg, `50e-ficha-selo-marcou${sufixo}`);
    await selo.click();
    await esperarContagem(pg, marcadas, 0, 'selo ×6 de novo');

    // "Atacar com todas": as oito, sem alvo; um clique no Bruno vale para todas
    await pg.getByRole('button', { name: 'Atacar com todas' }).click();
    await longe(pg);
    await esperarContagem(pg, marcadas, 8, 'Atacar com todas');
    await esperarContagem(pg, '.area-eu .selo-combate.espera', 8, 'sem alvo antes do clique no oponente');
    await foto(pg, `50f-ficha-todas-sem-alvo${sufixo}`);
    await pg.locator('.area-oponente', { hasText: 'Bruno' }).getByRole('button', { name: /^Bruno/ }).first().click();
    await longe(pg);
    await esperarContagem(pg, '.area-eu .selo-combate.espada', 8, 'um clique no Bruno');
    // oito linhas viram três: "Goblin #1–#6 → Bruno", o Kami e o Eletromante
    const linhas = await pg.locator('.linha-combate').allInnerTexts();
    if (linhas.length !== 3 || !linhas.every((l) => l.includes('Bruno'))) throw new Error(`resumo do ataque: ${JSON.stringify(linhas)}`);
    if (!/#1–#6/.test(linhas[0])) throw new Error(`resumo sem o grupo das fichas: ${JSON.stringify(linhas)}`);
    await conferirLinhas(pg, 4, `FICHA ${tela.width}, oito no Bruno`);
    await foto(pg, `50g-ficha-todas-no-bruno${sufixo}`);
    console.log(`   FICHA: resumo ${linhas.map((l) => `"${l.replace(/\s+/g, ' ')}"`).join(', ')}`);
    // o "×" do grupo desmarca as seis
    await pg.locator('.linha-combate', { hasText: '#1–#6' }).getByRole('button').click();
    await esperarContagem(pg, marcadas, 2, '"×" do grupo');
    await c.close();
  }

  // ---------------- BLOQT em 1280×800: quatro bloqueios, as quatro linhas à vista acima dos botões
  {
    const b = ids.BLOQT;
    const { c, pg } = await abrir('BLOQT', { width: 1280, height: 800 }, 'Bloqueio');
    const carta = (id: number) => pg.locator(`.campo [data-obj="${id}"]`);
    const clicarFaixa = async (id: number) => {
      const lista = b.contraAna.includes(id) ? b.contraAna : b.fichasAna.includes(id) ? b.fichasAna : [id];
      const k = (await faixas(pg, lista)).find((x) => x.id === id)!;
      await pg.mouse.click(k.x, k.y);
      await pg.waitForTimeout(120);
    };
    await carta(b.kami).click();
    await clicarFaixa(b.contraAna[0]);
    await carta(b.ancients).click();
    await clicarFaixa(b.contraAna[1]);
    await clicarFaixa(b.fichasAna[0]);
    await clicarFaixa(b.contraAna[2]);
    await clicarFaixa(b.fichasAna[1]);
    await carta(b.ameaca).click();
    await longe(pg);
    await conferirRetrato(pg, 'BLOQT 1280');
    await conferirLinhas(pg, 4, 'BLOQT 1280, quatro bloqueios');
    await foto(pg, `50n-bloqt-quatro-bloqueios-1280`);
    await c.close();
  }

  // ---------------- BLOQT: Ana bloqueia três fichas iguais e a Defiling Daemogoth (ameaça); Diego é atacado por outras duas
  {
    const b = ids.BLOQT;
    const { c, pg } = await abrir('BLOQT', { width: 1920, height: 1080 }, 'Bloqueio');
    const sufixo = '-1920';
    await longe(pg);
    await foto(pg, `50h-bloqt-decisao${sufixo}`);
    await conferirFaixas(pg, b.contraAna, 'BLOQT atacantes contra Ana');
    // as que atacam Diego ficam noutro leque (o outro selo da área é o dos terrenos)
    const leques = await pg.evaluate((a) => {
      const area = document.querySelector(`[data-obj="${a}"]`)!.closest('.area')!;
      return [...area.querySelectorAll('.grupo-n')].map((g) => g.textContent);
    }, b.contraAna[0]);
    if (!leques.includes('×3') || !leques.includes('×2') || leques.includes('×5')) throw new Error(`BLOQT: leques de Bruno ${JSON.stringify(leques)}, esperava ×3 (contra Ana) e ×2 (contra Diego)`);
    const carta = (id: number) => pg.locator(`.campo [data-obj="${id}"]`);
    const clicarFaixa = async (id: number) => {
      const lista = b.contraAna.includes(id) ? b.contraAna : b.fichasAna.includes(id) ? b.fichasAna : [id];
      const k = (await faixas(pg, lista)).find((x) => x.id === id)!;
      await pg.mouse.click(k.x, k.y);
      await pg.waitForTimeout(120);
    };
    const linhasBloqueio = async () => (await pg.locator('.linha-combate').allInnerTexts()).map((l) => l.replace(/\s+/g, ' ').trim());

    // escolhe o Kami: os atacantes contra Ana ganham o anel azul; os que atacam Diego, não (e ficam apagados)
    await carta(b.kami).click();
    await longe(pg);
    await esperarContagem(pg, '.campo .carta.realce-bloqueavel', 4, 'anel azul nos atacantes que o Kami pode bloquear');
    if (!await carta(b.kami).evaluate((e) => e.classList.contains('realce-ativo'))) throw new Error('o Kami não ficou escolhido');
    for (const id of b.contraDiego) if (!await carta(id).evaluate((e) => e.classList.contains('combate-alheio') && !e.classList.contains('realce-bloqueavel'))) throw new Error('atacante contra Diego sem o apagado');
    const numeros = await pg.evaluate((l) => l.map((id) => document.querySelector(`[data-obj="${id}"] .carta-n`)?.textContent ?? null), b.contraAna);
    if (numeros.join() !== '#1,#2,#3') throw new Error(`números das fichas atacantes: ${JSON.stringify(numeros)}`);
    await foto(pg, `50i-bloqt-escolhida${sufixo}`);
    // Kami bloqueia a ficha #1; o Ancients, a #2
    await clicarFaixa(b.contraAna[0]);
    await carta(b.ancients).click();
    await clicarFaixa(b.contraAna[1]);
    await longe(pg);
    let ls = await linhasBloqueio();
    if (ls.length !== 2 || !ls[0].includes('Goblin #1') || !ls[1].includes('Goblin #2')) throw new Error(`dois bloqueios: ${JSON.stringify(ls)}`);
    await foto(pg, `50j-bloqt-dois-bloqueios${sufixo}`);
    // o Kami, que já bloqueia, passa para a #3 (troca, não soma)
    await carta(b.kami).click();
    await clicarFaixa(b.contraAna[2]);
    await longe(pg);
    ls = await linhasBloqueio();
    if (ls.length !== 2 || !ls.some((l) => l.includes('Goblin #3')) || ls.some((l) => l.includes('Goblin #1'))) throw new Error(`troca de atacante: ${JSON.stringify(ls)}`);
    // a linha sob o mouse acende as duas cartas na mesa
    await pg.locator('.linha-combate').first().hover();
    await esperarContagem(pg, '.campo .carta.realce-linha', 2, 'linha sob o mouse');
    await foto(pg, `50k-bloqt-troca-e-linha-acesa${sufixo}`);
    // o "×" da linha do Ancients solta o bloqueio dele
    await pg.locator('.linha-combate', { hasText: 'Goblin #2' }).getByRole('button').click();
    await longe(pg);
    ls = await linhasBloqueio();
    if (ls.length !== 1 || !ls[0].includes('Goblin #3')) throw new Error(`"×" da linha: ${JSON.stringify(ls)}`);
    await esperarContagem(pg, '.campo .carta.realce-linha', 0, 'linha que saiu');
    // um bloqueador só na criatura com ameaça: o motor recusa e o motivo aparece no painel (na mesa real também)
    await carta(b.ancients).click();
    await carta(b.ameaca).click();
    await longe(pg);
    if ((await linhasBloqueio()).length !== 2) throw new Error('bloqueio na criatura com ameaça não entrou');
    await pg.getByRole('button', { name: 'Confirmar bloqueio' }).click();
    await pg.locator('.coluna-dir .erro-decisao').waitFor({ timeout: 10000 });
    const motivo = await pg.locator('.coluna-dir .erro-decisao').innerText();
    if (!/menace|ameaça/i.test(motivo)) throw new Error(`motivo da recusa: ${motivo}`);
    await foto(pg, `50l-bloqt-ameaca-recusada${sufixo}`);
    console.log(`   BLOQT: recusa no painel: "${motivo}"`);
    // o clique que tremeu: botão desce, anda 9 px e sobe (na ficha do leque de Ana, o ponteiro sai para a vizinha)
    const tremido = async (id: number, dx: number, quando: string) => {
      const lista = b.fichasAna.includes(id) ? b.fichasAna : [id];
      const k = (await faixas(pg, lista)).find((x) => x.id === id)!;
      await pg.mouse.move(k.x, k.y);
      await pg.mouse.down();
      for (let s = 1; s <= 4; s++) await pg.mouse.move(k.x + dx * s / 4, k.y);
      await pg.mouse.up();
      await longe(pg);
      await pg.waitForTimeout(150);
      if (!await carta(id).evaluate((e) => e.classList.contains('realce-ativo'))) throw new Error(`clique que tremeu não escolheu a criatura (${quando})`);
    };
    await tremido(b.fichasAna[0], 9, 'ficha do leque, 9 px para a vizinha');
    await tremido(b.kami, 9, 'Kami, 9 px');
    // passou do limite (vira arrasto) e soltou perto: ainda é um clique
    await carta(b.kami).click();
    await tremido(b.kami, 16, 'Kami, 16 px');
    await foto(pg, `50m-bloqt-clique-tremido${sufixo}`);
    await c.close();
  }
}
if (SO_COMBATE) {
  try { await capturasCombate(); } catch (e) {
    for (const [i, p] of paginas.entries()) if (!p.isClosed()) await p.screenshot({ path: join(SAIDA, `falha-${i}.png`) }).catch(() => {});
    throw e;
  } finally { await navegador.close(); servidor.kill(); }
  process.exit(0);
}
// --- fim (combate com muitas fichas) ---

// --- a sua área com o campo até a base, a mão por cima e os terrenos deitados ---
/**
 * O campo chega à base da sua área; a mão descansa abaixada (uns 41% da carta à vista) e sobe inteira com o mouse,
 * descendo só um pouco depois de ele sair; o retrato fica no canto de cima à direita; os terrenos ficam deitados. Em
 * 1v1 (MESA1) e 4 jogadores (MESA4), em 1280×800 e 1920×1080. Depois, quadros da transformação da carta jogada no
 * terreno deitado (arrastando, em MESA1; com duplo clique, em MESA4), com as animações paradas em 0, 150, 300 e 440 ms:
 * o tamanho da caixa anda sem pulo do da carta ao da peça.
 */
async function capturasMesa(): Promise<void> {
  const ids = idsMesa!;
  const abrir = async (codigo: string, tela: { width: number; height: number }) => {
    const c = await navegador.newContext({ viewport: tela });
    c.setDefaultTimeout(20000);
    const pg = await c.newPage();
    paginas.push(pg);
    pg.on('pageerror', (e) => console.error(`[navegador] ${e.message}`));
    await pg.goto(URL);
    await pg.evaluate((cod) => localStorage.setItem('commander-da-mesa:sala', JSON.stringify({ codigo: cod, token: `token-${cod}` })), codigo);
    await pg.getByLabel('Senha do servidor').fill('teste-capturas');
    await pg.getByRole('button', { name: 'Entrar' }).click();
    await pg.locator('.mesa').waitFor();
    await pg.getByText('Você tem prioridade').waitFor({ timeout: 90000 });
    await pg.mouse.move(3, 3);
    await pg.waitForTimeout(900);
    return { c, pg };
  };
  type Geo = { area: DOMRect; campo: DOMRect; avatar: DOMRect; mao: { id: number; r: DOMRect; h: number }[]; deitadas: { w: number; h: number }[]; rotulo: DOMRect };
  const geometria = (pg: Page) => pg.evaluate(() => {
    const ret = (e: Element) => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height, top: r.top, left: r.left, right: r.right, bottom: r.bottom } as DOMRect; };
    const area = document.querySelector('.area-eu')!;
    return {
      area: ret(area), campo: ret(area.querySelector('.campo')!), avatar: ret(area.querySelector('.avatar')!), rotulo: ret(area.querySelector('.mao-rotulo')!),
      mao: [...area.querySelectorAll<HTMLElement>('.mao-cartas .carta')].map((e) => ({ id: Number(e.dataset.obj), r: ret(e), h: e.offsetHeight })),
      deitadas: [...area.querySelectorAll<HTMLElement>('.campo > .carta.deitada')].map((e) => ({ w: e.offsetWidth, h: e.offsetHeight })),
    };
  }) as Promise<Geo>;
  /** quanto da carta do meio da mão aparece acima da base da área */
  const visivel = (g: Geo) => { const k = g.mao[Math.floor(g.mao.length / 2)]; return Math.min(1, (g.area.bottom - k.r.top) / k.r.height); };

  for (const codigo of ['MESA1', 'MESA4'] as const) {
    for (const tela of [{ width: 1280, height: 800 }, { width: 1920, height: 1080 }]) {
      const { c, pg } = await abrir(codigo, tela);
      const nome = `${codigo === 'MESA1' ? '1v1' : '4p'}-${tela.width}`;
      const g = await geometria(pg);
      if (g.area.bottom - g.campo.bottom > 8) throw new Error(`${nome}: o campo não chega à base da área (${(g.area.bottom - g.campo.bottom).toFixed(1)} px)`);
      if (!(g.avatar.right <= g.area.right + 1 && g.avatar.left > g.area.right - 220 && g.avatar.top < g.area.top + 60)) throw new Error(`${nome}: o retrato não está no canto de cima à direita ${JSON.stringify(g.avatar)}`);
      if (!g.deitadas.length || g.deitadas.some((t) => t.w <= t.h)) throw new Error(`${nome}: terrenos deitados ${JSON.stringify(g.deitadas)}`);
      const repouso = visivel(g);
      if (repouso < .3 || repouso > .52) throw new Error(`${nome}: a mão em repouso mostra ${(repouso * 100).toFixed(0)}% da carta`);
      if (g.rotulo.bottom > g.mao[Math.floor(g.mao.length / 2)].r.top + 2) throw new Error(`${nome}: o rótulo da mão não fica acima da faixa à vista`);
      await foto(pg, `60-mesa-${nome}-repouso`);
      // o mouse na faixa à vista de uma carta: a mão sobe inteira
      const meio = g.mao[Math.floor(g.mao.length / 2)];
      await pg.mouse.move(meio.r.left + meio.r.width / 2, g.area.bottom - 12);
      await pg.waitForTimeout(450);
      const erguida = visivel(await geometria(pg));
      if (erguida < .95) throw new Error(`${nome}: a mão erguida mostra só ${(erguida * 100).toFixed(0)}% da carta`);
      await foto(pg, `60b-mesa-${nome}-mao-erguida`);
      // saiu da mão: ela fica erguida por um instante (atravessar um vão não a fecha) e depois desce
      await pg.mouse.move(g.campo.left + g.campo.width * .35, g.campo.top + g.campo.height * .25);
      await pg.waitForTimeout(120);
      if (visivel(await geometria(pg)) < .9) throw new Error(`${nome}: a mão desceu na hora em que o mouse saiu`);
      await pg.waitForTimeout(700);
      if (visivel(await geometria(pg)) > .55) throw new Error(`${nome}: a mão não desceu depois de o mouse sair`);
      console.log(`   ${nome}: campo até ${(g.area.bottom - g.campo.bottom).toFixed(0)} px da base; mão em repouso ${(repouso * 100).toFixed(0)}%, erguida ${(erguida * 100).toFixed(0)}%; ${g.deitadas.length} terrenos deitados (${g.deitadas[0].w}×${g.deitadas[0].h})`);
      if (tela.width === 1920) await quadrosDaTransformacao(pg, codigo, nome);
      if (codigo === 'MESA4' && tela.width === 1920) await outrasOpcoes(pg, nome);
      await c.close();
    }
  }

  /** as outras opções das Configurações: o retrato à esquerda, acima do Comando, e os terrenos como cartas inteiras */
  async function outrasOpcoes(pg: Page, nome: string): Promise<void> {
    const recarregar = async (pref: Record<string, unknown>) => {
      await pg.evaluate((p) => localStorage.setItem('commander-da-mesa:preferencias', JSON.stringify(p)), pref);
      await pg.reload();
      await pg.locator('.mesa').waitFor();
      await pg.getByText('Você tem prioridade').waitFor({ timeout: 30000 });
      await pg.mouse.move(3, 3);
      await pg.waitForTimeout(900);
    };
    await recarregar({ avatarCanto: false });
    const g = await pg.evaluate(() => {
      const area = document.querySelector('.area-eu')!.getBoundingClientRect();
      const av = document.querySelector('.area-eu .avatar')!.getBoundingClientRect();
      const cmd = document.querySelector('.area-eu .zona[aria-label="Zona de comando"]')!.getBoundingClientRect();
      // as cartas da arrumação padrão (sem posição escolhida) que encostam no retrato
      const encostam = [...document.querySelectorAll('.area-eu .campo > .carta')].filter((e) => {
        const r = e.getBoundingClientRect();
        return r.left < av.right && r.right > av.left && r.top < av.bottom && r.bottom > av.top;
      }).length;
      return { area, av, cmd, encostam };
    });
    if (!(g.av.left < g.area.left + 120 && g.av.bottom <= g.cmd.top + 4)) throw new Error(`${nome}: o retrato à esquerda não fica acima do Comando ${JSON.stringify(g)}`);
    if (g.encostam) throw new Error(`${nome}: ${g.encostam} carta(s) embaixo do retrato à esquerda`);
    await foto(pg, `62-mesa-${nome}-retrato-a-esquerda`);
    await recarregar({ terrenosDeitados: false });
    if (await pg.locator('.area-eu .campo > .carta.deitada').count()) throw new Error(`${nome}: terrenos deitados com a opção "Cartas inteiras"`);
    await foto(pg, `62b-mesa-${nome}-terrenos-de-pe`);
    await pg.evaluate(() => localStorage.removeItem('commander-da-mesa:preferencias'));
  }

  /** joga o terreno da mão (arrastando em MESA1, com duplo clique em MESA4) e fotografa a transformação parada no meio */
  async function quadrosDaTransformacao(pg: Page, codigo: 'MESA1' | 'MESA4', nome: string): Promise<void> {
    const deitadasAntes = (await geometria(pg)).deitadas.length;
    const animacoes = (acao: 'pausar' | 'seguir' | number) => pg.evaluate((acao) => {
      const lista = document.getAnimations().filter((a) => ((a.effect as KeyframeEffect | null)?.target as Element | null)?.closest?.('.morfose'));
      for (const a of lista) { if (acao === 'pausar') a.pause(); else if (acao === 'seguir') a.play(); else a.currentTime = acao; }
      const m = document.querySelector('.morfose');
      const r = m?.getBoundingClientRect();
      return { n: lista.length, w: m ? (m as HTMLElement).offsetWidth : 0, h: m ? (m as HTMLElement).offsetHeight : 0, x: r?.left ?? 0, y: r?.top ?? 0 };
    }, acao);
    const id = codigo === 'MESA1' ? ids.MESA1.arrastar : ids.MESA4.duploClique;
    const carta = pg.locator(`.mao-cartas [data-obj="${id}"]`);
    await carta.hover();
    await pg.waitForTimeout(400);
    const r = (await carta.boundingBox())!;
    if (codigo === 'MESA1') {
      // arrasta até um ponto vazio do campo; a transformação começa ao soltar
      const alvo = await pg.evaluate(() => {
        const campo = document.querySelector('.area-eu .campo')!, rc = campo.getBoundingClientRect();
        for (const fy of [.42, .5, .35, .3]) for (const fx of [.45, .55, .35, .6, .3]) { const x = rc.left + rc.width * fx, y = rc.top + rc.height * fy; if (document.elementFromPoint(x, y) === campo) return { x, y }; }
        return null;
      });
      if (!alvo) throw new Error(`${nome}: sem espaço vazio no campo para soltar o terreno`);
      const x0 = r.x + r.width / 2, y0 = r.y + r.height * .3;
      await pg.mouse.move(x0, y0);
      await pg.mouse.down();
      for (let k = 1; k <= 14; k++) await pg.mouse.move(x0 + (alvo.x - x0) * k / 14, y0 + (alvo.y - y0) * k / 14);
      await pg.waitForTimeout(150);
      await foto(pg, `61-transformacao-${nome}-arrastando`);
      await pg.mouse.up();
    } else {
      await carta.dblclick();
      await pg.locator('.morfose').waitFor({ timeout: 8000 });
    }
    const p = await animacoes('pausar');
    if (!p.n) throw new Error(`${nome}: a transformação não começou`);
    const quadros: { t: number; w: number; h: number; x: number; y: number }[] = [];
    for (const t of [0, 150, 300, 440]) {
      const q = await animacoes(t);
      quadros.push({ t, ...q });
      await pg.screenshot({ path: join(SAIDA, `61-transformacao-${nome}-${String(t).padStart(3, '0')}ms.png`) });
      console.log(`captura: 61-transformacao-${nome}-${String(t).padStart(3, '0')}ms.png (caixa ${q.w}×${q.h} em ${q.x.toFixed(0)},${q.y.toFixed(0)})`);
    }
    // contínua: a largura e a altura andam sempre no mesmo sentido, da carta à peça deitada (sem troca de forma no meio)
    const sentido = (k: 'w' | 'h') => quadros.slice(1).every((q, i) => Math.sign(q[k] - quadros[i][k]) === Math.sign(quadros[3][k] - quadros[0][k]) || q[k] === quadros[i][k]);
    if (!sentido('w') || !sentido('h')) throw new Error(`${nome}: a transformação não é contínua ${JSON.stringify(quadros)}`);
    if (!(quadros[0].h > quadros[0].w && quadros[3].w > quadros[3].h)) throw new Error(`${nome}: a transformação não vai da carta de pé à peça deitada ${JSON.stringify(quadros)}`);
    await animacoes('seguir');
    // no fim, o terreno de verdade no lugar e a caixa fora (no quadro seguinte)
    await pg.waitForFunction(() => !document.querySelector('.morfose') && !document.querySelector('.campo > .carta.chegando'), undefined, { timeout: 8000 });
    await pg.mouse.move(3, 3);
    await pg.waitForTimeout(400);
    const depois = await geometria(pg);
    if (depois.deitadas.length !== deitadasAntes + 1) throw new Error(`${nome}: depois da transformação ${depois.deitadas.length} terrenos deitados, eram ${deitadasAntes}`);
    await foto(pg, `61-transformacao-${nome}-fim`);
  }
}
if (SO_MESA) {
  try { await capturasMesa(); } catch (e) {
    for (const [i, p] of paginas.entries()) if (!p.isClosed()) await p.screenshot({ path: join(SAIDA, `falha-${i}.png`) }).catch(() => {});
    throw e;
  } finally { await navegador.close(); servidor.kill(); }
  process.exit(0);
}
// --- fim (a sua área com o campo até a base) ---

try {
  if (!SO) { // capturas das fases 7 e 8 (CAPTURAS_SO pula)
  // ---------------- quatro jogadores
  const ctx = await navegador.newContext({ viewport: { width: 1920, height: 1080 } });
  ctx.setDefaultTimeout(20000);
  await comAuxilios(ctx);
  const p = await ctx.newPage();
  await p.goto(URL);
  // a entrada abre em sequência (logo, título, joias de mana, texto, senha): a foto sai com ela completa
  await p.waitForTimeout(3200);
  await foto(p, '01-entrada');
  await entrar(p);
  // tela inicial em passos: o nome, a escolha e os campos de cada escolha (com Voltar)
  await p.getByLabel('Seu nome na mesa').fill('Ana');
  await foto(p, '02-inicio-nome');
  await p.getByRole('button', { name: 'Continuar' }).click();
  await p.getByText('Olá, Ana').waitFor();
  await p.waitForTimeout(450);
  await foto(p, '02b-inicio-escolha');
  await escolher(p, 'Entrar numa sala');
  await p.waitForTimeout(450);
  await foto(p, '02d-inicio-entrar');
  await p.getByRole('button', { name: 'Voltar' }).click();
  await escolher(p, 'Criar sala');
  await p.waitForTimeout(450);
  await foto(p, '02c-inicio-criar');
  await p.locator('form').filter({ hasText: 'Criar sala' }).getByLabel('Senha da sala').fill('mesa');
  await p.getByRole('button', { name: 'Criar', exact: true }).click();
  // saguão em passos: lugares (três bots), regras, decks (o dos bots e o da Ana pela prévia)
  await p.locator('.lugares').waitFor();
  await p.waitForTimeout(450);
  await foto(p, '03a-saguao-lugares');
  for (let i = 2; i <= 4; i++) await porBot(p, i);
  await p.waitForTimeout(700);
  await foto(p, '03b-saguao-lugares-cheios');
  await p.getByRole('button', { name: 'Continuar para as regras' }).click();
  await p.waitForTimeout(450);
  await foto(p, '03c-saguao-regras');
  await p.getByRole('button', { name: 'Continuar para os decks' }).click();
  await p.locator('.saguao-decks').waitFor();
  for (let i = 2; i <= 4; i++) await deckDoBot(p, i, i - 1);
  await p.locator('.deck').first().click();
  await p.locator('.previa-grupo').first().waitFor();
  await p.locator('.previa-grupo button').nth(3).hover();
  await p.waitForTimeout(450);
  await foto(p, '03d-saguao-previa');
  await p.getByRole('button', { name: 'Escolher este deck' }).click();
  await p.locator('.previa-deck').waitFor({ state: 'detached' });
  await p.mouse.move(5, 5);
  await p.waitForTimeout(700);
  await foto(p, '03-saguao');
  await p.getByRole('button', { name: 'Começar a partida' }).click();
  await pularAbertura(p);
  await p.getByText('Mão inicial').waitFor({ timeout: 20000 });
  await foto(p, '04-mulligan');
  // a carta sob o mouse sobe e cresce de leve, e as vizinhas se afastam
  await p.locator('.leque .carta').nth(3).hover();
  await foto(p, '04b-mulligan-hover');
  await p.mouse.move(5, 500);
  // em 4 jogadores o primeiro mulligan é grátis (sem escolher cartas para o fundo)
  await mulliganSemTerreno(p, 1);
  await jogarAteMinhaPrioridade(p);
  await foto(p, '05-mesa-prioridade');
  const carta = p.locator('.mao-cartas .carta').first();
  await carta.hover();
  await foto(p, '06-zoom');
  const comAcao = p.locator('.carta.realce-acao').first();
  if (await comAcao.count()) {
    await comAcao.click();
    await foto(p, '07-menu-acoes');
    await p.locator('.menu-acoes').getByRole('button', { name: 'Cancelar' }).click();
  }
  // arrastar uma carta da mão até o campo (fotografa no meio do caminho)
  // passa o mouse antes: a carta sobe, endireita e fica por cima das vizinhas; pega pelo meio dela (a da ponta
  // do leque fica inclinada e o canto da caixa caía fora da carta: o arrasto não começava)
  const jogavel = p.locator('.mao-cartas .carta.realce-acao').first();
  const campo = await p.locator('.area-eu .campo').boundingBox();
  await jogavel.hover({ position: { x: 12, y: 40 }, timeout: 3000 }).catch(() => {});
  await p.waitForTimeout(350);
  const caixa = await jogavel.boundingBox().catch(() => null);
  if (caixa && campo) {
    const x0 = caixa.x + caixa.width / 2, y0 = caixa.y + caixa.height * .3;
    await p.mouse.move(x0, y0);
    await p.mouse.down();
    for (let k = 1; k <= 8; k++) await p.mouse.move(x0 + (campo.x + campo.width * .45 - x0) * k / 8, y0 + (campo.y + campo.height * .4 - y0) * k / 8);
    await foto(p, '07b-arrastar-da-mao');
    await p.mouse.up();
    await jogarAteMinhaPrioridade(p, 30);
    await foto(p, '07c-depois-de-soltar');
  }
  // clique direito: numa permanente sua, no espaço vazio do seu campo e numa carta da mão. Com a prioridade
  // de Ana: o menu fecha quando chega uma decisão nova (no turno dos bots ele sumia antes da foto) e os
  // ajustes manuais só valem com prioridade
  await jogarAteMinhaPrioridade(p, 80);
  const permanente = p.locator('.area-eu .campo .carta').last();
  if (await permanente.isVisible().catch(() => false)) {
    await permanente.click({ button: 'right', timeout: 3000 }).catch(() => {});
    const marcadores = p.locator('.menu-acoes').getByRole('menuitem', { name: 'Marcadores' });
    if (await marcadores.isVisible().catch(() => false)) await marcadores.hover();
    await foto(p, '17-menu-direito-carta');
    await p.keyboard.press('Escape');
    await p.locator('.menu-acoes').getByRole('button', { name: 'Cancelar' }).click({ timeout: 3000 }).catch(() => {});
  }
  // um ponto vazio de verdade (desde a fase 9 a carta fica onde foi solta, no meio do campo)
  const campoMeu = await p.evaluate(() => {
    const c = document.querySelector('.area-eu .campo')!, r = c.getBoundingClientRect();
    for (const fy of [.35, .2, .5, .65]) for (const fx of [.5, .3, .7, .2, .8]) {
      const x = r.left + r.width * fx, y = r.top + r.height * fy;
      if (document.elementFromPoint(x, y) === c) return { x, y };
    }
    return null;
  });
  if (campoMeu) {
    await p.mouse.click(campoMeu.x, campoMeu.y, { button: 'right' });
    await foto(p, '18-menu-direito-campo');
    await p.locator('.menu-acoes').getByRole('button', { name: 'Cancelar' }).click({ timeout: 3000 }).catch(() => {});
  }
  const daMao = p.locator('.mao-cartas .carta').first();
  await daMao.click({ button: 'right', position: { x: 8, y: 40 }, timeout: 3000 }).catch(() => {});
  const revelar = p.locator('.menu-acoes').getByRole('menuitem', { name: 'Revelar' });
  if (await revelar.isVisible().catch(() => false)) {
    await revelar.hover();
    await p.locator('.menu-acoes.submenu').getByRole('menuitem', { name: 'Para todos' }).click({ timeout: 3000 }).catch(() => {});
    await foto(p, '19-carta-revelada');
  } else await p.locator('.menu-acoes').getByRole('button', { name: 'Cancelar' }).click({ timeout: 3000 }).catch(() => {});
  // o ajuste manual só vale com prioridade (a partida pode ter andado durante os menus)
  await jogarAteMinhaPrioridade(p, 80);
  await p.getByRole('button', { name: 'Ajuste manual' }).click();
  await foto(p, '08-ajuste-manual');
  await p.getByRole('button', { name: 'Criar ficha' }).click();
  await foto(p, '09-ajuste-ficha');
  await p.getByRole('button', { name: 'Fechar' }).click();
  await p.getByRole('button', { name: 'Paradas' }).click();
  await conferirJanela(p, 'paradas');
  await foto(p, '10-paradas');
  await p.keyboard.press('Escape');
  // janela da barra lateral com a barra recolhida (antes cortava a mesa e deixava uma faixa preta)
  await p.getByRole('button', { name: 'Recolher a barra' }).click();
  await p.waitForTimeout(400);
  await conferirMesa(p, 'barra recolhida');
  await p.getByRole('button', { name: 'Ajuste manual' }).click();
  await conferirJanela(p, 'ajuste manual com a barra recolhida');
  await conferirMesa(p, 'ajuste manual com a barra recolhida');
  await foto(p, '10b-janela-barra-recolhida-1920');
  await p.mouse.click(12, 1068);
  await p.getByRole('button', { name: 'Abrir a barra' }).click();
  await p.waitForTimeout(400);
  await conferirMesa(p, 'barra aberta de novo');
  // efeito de ganhar vida: ajuste manual de +3 na própria vida
  await jogarAteMinhaPrioridade(p, 80);
  await p.getByRole('button', { name: 'Ajuste manual' }).click();
  await p.locator('.janela-caixa .aba').filter({ hasText: 'Vida' }).click();
  for (let k = 0; k < 3; k++) await p.locator('.janela-caixa').getByRole('button', { name: '+', exact: true }).click();
  await p.locator('.janela-caixa').getByRole('button', { name: 'Ganhar 3' }).click();
  await p.locator('.fx-numero.vida').waitFor({ timeout: 10000 });
  await p.waitForTimeout(250);
  await p.screenshot({ path: join(SAIDA, '25b-vida.png') });
  console.log('captura: 25b-vida.png');
  // Configurações › Auxílios: Mesa real e Completo, trocados no meio da partida
  await jogarAteMinhaPrioridade(p, 80);
  await p.getByRole('button', { name: 'Configurações' }).click();
  await p.getByRole('radio', { name: /Mesa real/ }).click();
  await conferirJanela(p, 'configurações › auxílios');
  await foto(p, '20-config-auxilios');
  await p.keyboard.press('Escape');
  await p.mouse.move(5, 500);
  if (await p.locator('.realce-acao').count()) throw new Error('mesa real com carta brilhando');
  await foto(p, '21-mesa-real');
  await p.getByRole('button', { name: 'Configurações' }).click();
  await p.getByRole('radio', { name: /Completo/ }).click();
  await p.keyboard.press('Escape');
  await p.mouse.move(5, 500);
  await foto(p, '21b-mesa-completo');
  // de volta a todos os auxílios ligados (o resto do roteiro acha as jogadas pelo brilho e paga sozinho)
  await p.getByRole('button', { name: 'Configurações' }).click();
  await p.getByRole('radio', { name: /Personalizado/ }).click();
  await p.locator('#aux-pagarAuto').check();
  await p.keyboard.press('Escape');
  // algumas voltas da mesa com os bots. Desde a fase 9 as paradas padrão ficam só no próprio turno: cada
  // "passar até o fim do turno" anda a mesa inteira, e com 24 voltas Ana às vezes morria (turno 36) e as
  // capturas 11c e 11d eram puladas
  await jogarUmPouco(p, 14);
  await jogarAteMinhaPrioridade(p, 80);
  if (await p.locator('.area-eu .selo.alerta').isVisible().catch(() => false)) console.log('aviso: Ana saiu da partida (11c e 11d puladas)');
  await foto(p, '11-mesa-depois');
  // com prioridade, clicar numa fonte de mana gera a mana: a reserva aparece do lado da vida. Terreno que só
  // gera mana não brilha (o brilho é das jogadas) e vira direto no clique; com mais habilidades abre o menu
  const fontes = p.locator('.area-eu .campo .carta:not(.virada):not(:has(.carta-pt))');
  for (let i = await fontes.count() - 1; i >= 0; i--) {
    await fontes.nth(i).click({ timeout: 3000 }).catch(() => {});
    const adicionar = p.locator('.menu-acoes').getByRole('menuitem', { name: /adicionar/ }).first();
    const menu = await p.locator('.menu-acoes').isVisible().catch(() => false);
    const gerou = !menu || await adicionar.isVisible().catch(() => false);
    if (menu && gerou) await adicionar.click({ timeout: 3000 }).catch(() => {});
    else if (menu) await p.locator('.menu-acoes').getByRole('button', { name: 'Cancelar' }).click({ timeout: 2000 }).catch(() => {});
    // a reserva só aparece quando a resposta do servidor chega
    if (await p.locator('.area-eu .selo.reserva').waitFor({ timeout: gerou ? 2500 : 300 }).then(() => true, () => false)) {
      await p.mouse.move(5, 500);
      await foto(p, '11d-reserva');
      break;
    }
  }
  // mover uma permanente para outro lugar da área
  const minha = p.locator('.area-eu .campo .carta').first();
  const cm = await minha.boundingBox().catch(() => null);
  const cc = await p.locator('.area-eu .campo').boundingBox();
  if (cm && cc) {
    await p.mouse.move(cm.x + cm.width / 2, cm.y + cm.height / 2);
    await p.mouse.down();
    for (let k = 1; k <= 8; k++) await p.mouse.move(cm.x + cm.width / 2 + (cc.x + cc.width * .55 - cm.x) * k / 8, cm.y + cm.height / 2 + (cc.y + cc.height * .5 - cm.y) * k / 8);
    await p.mouse.up();
    await foto(p, '11c-carta-movida');
  }
  await p.getByRole('button', { name: 'Recolher a barra' }).click();
  await p.waitForTimeout(400);
  await conferirMesa(p, 'mesa recolhida');
  await foto(p, '11b-mesa-recolhida-1920');
  await p.getByRole('button', { name: 'Abrir a barra' }).click();
  // a janela de escolha (fase 9) fica no meio da mesa: responde o que estiver pendente antes de abrir o cemitério
  await jogarAteMinhaPrioridade(p, 80);
  await p.locator('.botao-zona').first().click();
  await foto(p, '12-cemiterio');
  await ctx.close();

  // ---------------- um contra um, tela menor
  const ctx2 = await navegador.newContext({ viewport: { width: 1280, height: 800 } });
  ctx2.setDefaultTimeout(20000);
  await comAuxilios(ctx2);
  const q = await ctx2.newPage();
  await entrar(q);
  await nomear(q, 'Bruno');
  await escolher(q, 'Criar sala');
  await q.getByRole('button', { name: 'Um contra um' }).click();
  await q.locator('form').filter({ hasText: 'Criar sala' }).getByLabel('Senha da sala').fill('mesa');
  await q.getByRole('button', { name: 'Criar', exact: true }).click();
  await q.locator('.lugares').waitFor();
  await porBot(q, 2);
  await q.getByRole('button', { name: 'Continuar para as regras' }).click();
  await q.getByRole('radio', { name: /^Livre/ }).click();
  await q.waitForTimeout(450);
  await foto(q, '13a-saguao-mulligan-livre');
  await q.getByRole('button', { name: 'Continuar para os decks' }).click();
  await q.locator('.saguao-decks').waitFor();
  await deckDoBot(q, 2, 4);
  await escolherDeck(q, 3);
  await q.getByRole('button', { name: 'Começar a partida' }).click();
  await pularAbertura(q);
  await q.getByText('Mão inicial').waitFor({ timeout: 20000 });
  await foto(q, '13b-mao-inicial-livre');
  await q.getByRole('button', { name: 'Mulligan' }).click();
  await q.waitForTimeout(800);
  await foto(q, '13c-depois-do-mulligan-livre');
  // mulligan livre: troca a mão inteira, sem cartas para o fundo
  await mulliganSemTerreno(q, 2);
  await jogarAteMinhaPrioridade(q);
  await foto(q, '13-duelo');
  await jogarUmPouco(q, 10);
  await jogarAteMinhaPrioridade(q, 40);
  await foto(q, '14-duelo-depois');
  await q.getByRole('button', { name: 'Recolher a barra' }).click();
  await q.waitForTimeout(400);
  await conferirMesa(q, 'duelo recolhido');
  await foto(q, '14b-duelo-recolhida-1280');
  await q.getByRole('button', { name: 'Configurações' }).click();
  await conferirJanela(q, 'configurações no duelo');
  await conferirMesa(q, 'configurações no duelo');
  await foto(q, '14c-janela-1280');
  await q.locator('.janela-x').click();
  await q.getByRole('button', { name: 'Abrir a barra' }).click();
  await ctx2.close();

  // ---------------- fase 8: sala sem auxílios entre duas pessoas, e o desfazer com aceite
  const pessoa = async (nome: string) => {
    const c = await navegador.newContext({ viewport: { width: 1600, height: 900 } });
    c.setDefaultTimeout(20000);
    const pg = await c.newPage();
    await entrar(pg);
    await nomear(pg, nome);
    return pg;
  };
  const ana = await pessoa('Ana');
  await escolher(ana, 'Criar sala');
  await ana.getByRole('button', { name: 'Um contra um' }).click();
  await ana.locator('form').filter({ hasText: 'Criar sala' }).getByLabel('Senha da sala').fill('mesa');
  await ana.getByRole('button', { name: 'Criar', exact: true }).click();
  await ana.locator('.lugares').waitFor();
  const codigo = (await ana.locator('.sala-codigo').textContent())!.replace('Sala', '').trim();
  const bruno = await pessoa('Bruno');
  await escolher(bruno, 'Entrar numa sala');
  const entrarNaSala = bruno.locator('form').filter({ hasText: 'Entrar numa sala' });
  await entrarNaSala.getByLabel('Código').fill(codigo);
  await entrarNaSala.getByLabel('Senha da sala').fill('mesa');
  await entrarNaSala.getByRole('button', { name: 'Entrar' }).click();
  await bruno.locator('.lugares').waitFor();
  // Bruno acompanha o anfitrião proibir os auxílios (sem poder mudar)
  await ana.getByRole('button', { name: 'Continuar para as regras' }).click();
  await ana.getByRole('radio', { name: /^Proibidos/ }).click();
  await bruno.getByRole('radio', { name: /^Proibidos/, checked: true }).waitFor();
  await bruno.waitForTimeout(450);
  await foto(bruno, '27-saguao-auxilios-proibidos');
  await ana.getByRole('button', { name: 'Continuar para os decks' }).click();
  await escolherDeck(ana, 0);
  await escolherDeck(bruno, 3);
  await ana.getByRole('button', { name: 'Começar a partida' }).click();
  await Promise.all([pularAbertura(ana), pularAbertura(bruno)]);
  await ana.getByText('Mão inicial').waitFor();
  // a mão inicial é decidida um de cada vez
  for (let k = 0; k < 40 && (await ana.getByText('Mão inicial').isVisible() || await bruno.getByText('Mão inicial').isVisible()); k++) {
    for (const pg of [ana, bruno]) await pg.getByRole('button', { name: 'Manter' }).click({ timeout: 500 }).catch(() => {});
    await ana.waitForTimeout(250);
  }
  await ana.waitForTimeout(800);
  await ana.getByRole('button', { name: 'Configurações' }).click();
  await conferirJanela(ana, 'configurações travadas pela sala');
  await foto(ana, '28-config-travada');
  await ana.keyboard.press('Escape');
  // quem está no próprio turno joga um terreno (pelo clique direito: na mesa real nada brilha)
  const jogarTerreno = async (pg: Page) => {
    // básicos primeiro: um terreno com gatilho de alvo (Pântano de Bojuka) abre uma janela por cima do botão de desfazer
    const basico = /^(Planície|Ilha|Pântano|Montanha|Floresta|Plains|Island|Swamp|Mountain|Forest)$/;
    const todas = pg.locator('.mao-cartas .carta');
    const ordem: number[] = [];
    for (let i = 0; i < await todas.count(); i++) if (basico.test((await todas.nth(i).locator('img').getAttribute('alt').catch(() => '')) ?? '')) ordem.push(i);
    for (let i = 0; i < await todas.count(); i++) if (!ordem.includes(i)) ordem.push(i);
    const cartas = { count: async () => ordem.length, nth: (k: number) => todas.nth(ordem[k]) };
    for (let i = 0; i < await cartas.count(); i++) {
      await cartas.nth(i).click({ button: 'right', position: { x: 8, y: 40 }, timeout: 3000 }).catch(() => {});
      const jogar = pg.locator('.menu-acoes .menu-item.acao').filter({ hasText: /^Jogar / }).first();
      if (await jogar.isVisible().catch(() => false)) { await jogar.click(); return true; }
      await pg.locator('.menu-acoes').getByRole('button', { name: 'Cancelar' }).click({ timeout: 800 }).catch(() => {});
    }
    return false;
  };
  let quem: Page | null = null;
  for (let k = 0; k < 60 && !quem; k++) {
    for (const pg of [ana, bruno]) {
      if (!await pg.getByText('Você tem prioridade').isVisible().catch(() => false)) continue;
      if (await pg.locator('.area-eu .selo.turno').isVisible().catch(() => false) && await jogarTerreno(pg)) { quem = pg; break; }
      await pg.getByRole('button', { name: 'Passar', exact: true }).click().catch(() => {});
    }
    await ana.waitForTimeout(300);
  }
  if (!quem) throw new Error('ninguém jogou um terreno para desfazer');
  const outro = quem === ana ? bruno : ana;
  await quem.waitForTimeout(700);
  await quem.locator('.fases-acao .desfazer').click();
  await outro.locator('.pedido-desfazer').waitFor();
  await foto(outro, '29-desfazer-pedido');
  await foto(quem, '29b-desfazer-esperando');
  await outro.getByRole('button', { name: 'Aceitar' }).click();
  await quem.locator('.pedido-desfazer').waitFor({ state: 'detached' });
  await foto(quem, '29c-desfeito');
  await ana.context().close();
  await bruno.context().close();

  // ---------------- fase 8: combate por cliques (salas prontas de ferramentas/cenarios.ts)
  const sala = async (cod: string) => {
    const c = await navegador.newContext({ viewport: { width: 1600, height: 900 } });
    c.setDefaultTimeout(20000);
    const pg = await c.newPage();
    paginas.push(pg);
    pg.on('pageerror', (e) => console.error(`[navegador] ${e.message}`));
    await pg.goto(URL);
    await pg.evaluate((k) => localStorage.setItem('commander-da-mesa:sala', JSON.stringify({ codigo: k, token: `token-${k}` })), cod);
    await pg.getByLabel('Senha do servidor').fill('teste-capturas');
    await pg.getByRole('button', { name: 'Entrar' }).click();
    await pg.locator('.mesa').waitFor();
    await pg.waitForTimeout(1200);
    return pg;
  };
  const ataque = await sala('ATACA');
  const minhas = ataque.locator('.area-eu .campo .carta');
  // marca a primeira criatura que pode atacar: inclina e fica esperando o alvo (4 jogadores)
  for (let i = 0; i < await minhas.count(); i++) {
    await minhas.nth(i).click({ force: true });
    await ataque.waitForTimeout(150);
    if (await ataque.locator('.area-eu .carta.inclinada').count()) break;
  }
  await ataque.mouse.move(5, 450);
  await foto(ataque, '30-ataque-marcado');
  // clica no oponente do meio: a seta aparece; a próxima marcada vai no mesmo oponente
  await ataque.locator('.area-oponente').nth(1).click({ position: { x: 200, y: 110 } });
  for (let i = await minhas.count() - 1; i >= 0; i--) {
    if (await minhas.nth(i).evaluate((e) => e.classList.contains('inclinada'))) continue;
    await minhas.nth(i).click({ force: true });
    await ataque.waitForTimeout(150);
    if (await ataque.locator('.area-eu .carta.inclinada').count() >= 2) break;
  }
  await ataque.mouse.move(5, 450);
  await foto(ataque, '30b-ataque-com-alvo');
  await ataque.context().close();

  const bloqueio = await sala('BLOQU');
  const meus = bloqueio.locator('.area-eu .campo .carta');
  for (let i = 0; i < await meus.count(); i++) {
    await meus.nth(i).click({ force: true });
    await bloqueio.waitForTimeout(150);
    if (await bloqueio.locator('.area-eu .carta.combate-ativa').count()) {
      await bloqueio.locator('.area-oponente .campo .carta:has(.selo-combate)').first().click({ force: true });
      await bloqueio.waitForTimeout(300);
      if (await bloqueio.locator('.area-eu .selo-combate.escudo').count()) break;
    }
  }
  await bloqueio.mouse.move(5, 450);
  await foto(bloqueio, '31-bloqueio');
  await bloqueio.getByRole('button', { name: /Confirmar bloqueio|Não bloquear/ }).click();
  // os números do golpe nascem invisíveis e batem no impacto (mesa/impacto.ts): a foto sai no meio da leva
  await bloqueio.locator('.fx-numero').first().waitFor({ timeout: 15000 });
  await bloqueio.waitForTimeout(700);
  await bloqueio.screenshot({ path: join(SAIDA, '31b-dano.png') });
  console.log('captura: 31b-dano.png');
  await bloqueio.context().close();
  } // fim das capturas das fases 7 e 8

  // --- fase 9: janelas de escolha, zoom e log ---
  // sala pronta (ferramentas/cenarios.ts, ORDEM): Ana atacou e ordena três gatilhos; depois, pelo ajuste
  // manual, a busca no grimório inteiro (grade), a janela recolhida e o Espaço; o zoom (pouco e muito
  // texto); o chat, a janela do registro e a barra recolhida; alvos de uma Aura (cartas grandes); sim ou não (comandante); a vidência
  // e o descarte. Cada captura em 1920×1080 e 1280×800, conferida (posição, tamanho, nada cortado).
  if (!SO || SO === 'janelas') {
    const TELAS = [{ width: 1920, height: 1080 }, { width: 1280, height: 800 }];
    const c9 = await navegador.newContext({ viewport: TELAS[0] });
    c9.setDefaultTimeout(20000);
    const pg = await c9.newPage();
    paginas.push(pg);
    pg.on('pageerror', (e) => console.error(`[navegador] ${e.message}`));
    const entrarNaMesa = async () => {
      if (await pg.getByLabel('Senha do servidor').isVisible().catch(() => false)) {
        await pg.getByLabel('Senha do servidor').fill('teste-capturas');
        await pg.getByRole('button', { name: 'Entrar' }).click();
      }
      await pg.locator('.mesa').waitFor();
      await pg.waitForTimeout(1200);
    };
    await pg.goto(URL);
    await pg.evaluate((k) => localStorage.setItem('commander-da-mesa:sala', JSON.stringify({ codigo: k, token: `token-${k}` })), 'ORDEM');
    await entrarNaMesa();
    const tela = async (t: { width: number; height: number }) => { await pg.setViewportSize(t); await pg.waitForTimeout(450); };

    /** a janela de escolha cabe na mesa, fica centrada na divisa (ou encostada numa margem, se for alta) e o "Ver a mesa" recebe o clique */
    const conferirEscolha = async (quando: string) => {
      const j = pg.locator('.janela-escolha:not(.recolhida)');
      await j.waitFor();
      await j.evaluate((e) => Promise.all(e.getAnimations().map((a) => a.finished)));
      await pg.waitForTimeout(80);
      const r = await pg.evaluate(() => {
        const mesa = document.querySelector('.tabuleiro') as HTMLElement;
        const t = mesa.getBoundingClientRect();
        const c = document.querySelector('.janela-escolha')!.getBoundingClientRect();
        const divisa = t.top + t.height * parseFloat(getComputedStyle(mesa).getPropertyValue('--divisa')) / 100;
        const b = document.querySelector('.janela-escolha .ver-mesa')!.getBoundingClientRect();
        const sob = !!document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2)?.closest('.ver-mesa');
        const corpo = document.querySelector('.janela-escolha .escolha-corpo')!;
        return { topo: c.top - t.top, baixo: t.bottom - c.bottom, esq: c.left - t.left, dir: t.right - c.right, centro: Math.round(c.top + c.height / 2 - divisa), sob, rola: corpo.scrollHeight > corpo.clientHeight + 1, w: Math.round(c.width), h: Math.round(c.height) };
      });
      const fora = r.topo < 11 || r.baixo < 11 || r.esq < 15 || r.dir < 15;
      const centrada = Math.abs(r.centro) <= 2 || r.topo <= 13 || r.baixo <= 13;
      if (fora || !centrada || !r.sob) throw new Error(`janela de escolha fora do lugar (${quando}): ${JSON.stringify(r)}`);
      console.log(`  janela (${quando}): ${r.w}×${r.h}, ${r.rola ? 'rola por dentro' : 'sem rolagem'}, centro ${r.centro} px da divisa`);
    };
    /** o zoom fica dentro da tela, centralizado na altura e sem nada cortado */
    const conferirZoom = async (quando: string) => {
      await pg.locator('.zoom').waitFor({ timeout: 3000 });
      const r = await pg.evaluate(() => {
        const z = document.querySelector('.zoom') as HTMLElement;
        const c = z.getBoundingClientRect();
        const tx = z.querySelector('.zoom-texto') as HTMLElement;
        return { topo: Math.round(c.top), baixo: Math.round(innerHeight - c.bottom), esq: Math.round(c.left), dir: Math.round(innerWidth - c.right), w: Math.round(c.width), h: Math.round(c.height), modo: z.dataset.modo, corta: z.scrollHeight > z.clientHeight + 1 || tx.scrollHeight > tx.clientHeight + 1, letras: tx.textContent!.length };
      });
      if (r.topo < 15 || r.baixo < 15 || r.esq < 15 || r.dir < 15 || Math.abs(r.topo - r.baixo) > 2 || r.corta) throw new Error(`zoom fora do lugar (${quando}): ${JSON.stringify(r)}`);
      console.log(`  zoom (${quando}): ${r.w}×${r.h}, texto ${r.modo === 'lado' ? 'ao lado' : 'embaixo'}, ${r.letras} letras`);
    };
    /** responde o que vier (gatilhos na ordem, primeira opção) até Ana ter a prioridade */
    const ateAPrioridade = async () => {
      for (let k = 0; k < 120; k++) {
        if (await pg.getByText('Você tem prioridade').isVisible().catch(() => false)) return;
        const janela = pg.locator('.janela-escolha:not(.recolhida)');
        if (await janela.isVisible().catch(() => false)) {
          const item = janela.locator('.item:not([disabled])').first();
          if (!await janela.locator('.item.escolhido').count() && await item.isVisible().catch(() => false)) await item.click().catch(() => {});
          await janela.getByRole('button', { name: /^(Confirmar|Nenhum)/ }).click({ timeout: 1000 }).catch(() => {});
        } else for (const nome of [/^Confirmar/, 'Não atacar', 'Não bloquear', 'Cancelar']) if (await clicar(pg, nome)) break;
        await pg.waitForTimeout(250);
      }
      throw new Error('Ana não recebeu a prioridade');
    };
    const ajusteManual = async (aba: string) => {
      await pg.getByRole('button', { name: 'Ajuste manual' }).click();
      await pg.locator('.janela-caixa .aba').filter({ hasText: aba }).click();
    };

    // ordem dos gatilhos: arrasta o último para o topo da fila (o de cima resolve primeiro)
    const fila = pg.locator('.janela-escolha.f-fila .fila-linha');
    await fila.first().waitFor({ timeout: 30000 });
    const antes = await fila.first().textContent();
    await fila.last().dragTo(fila.first());
    if (await fila.first().textContent() === antes) throw new Error('arrastar na fila de gatilhos não mudou a ordem');
    for (const t of TELAS) { await tela(t); await conferirEscolha(`gatilhos ${t.width}`); await foto(pg, `40-ordem-gatilhos-${t.width}`); }
    await tela(TELAS[0]);
    await pg.locator('.janela-escolha').getByRole('button', { name: 'Confirmar' }).click();
    await ateAPrioridade();

    // busca no grimório inteiro (Ajuste manual › Procurar no grimório › Mão): grade com filtro
    await ajusteManual('Procurar no grimório');
    await pg.locator('.janela-caixa').getByRole('button', { name: 'Mão', exact: true }).click();
    const grade = pg.locator('.janela-escolha.f-grade');
    await grade.waitFor();
    const nCartas = await grade.locator('.item').count();
    console.log(`  busca: ${nCartas} itens na grade`);
    for (const t of TELAS) {
      await tela(t);
      await conferirEscolha(`busca ${t.width}`);
      await pg.mouse.move(5, 5);
      await foto(pg, `41-busca-grimorio-${t.width}`);
    }
    // o zoom por cima da grade (passando o mouse numa carta da janela)
    await grade.locator('.item .carta').nth(2).hover();
    await conferirZoom('carta da busca 1280');
    await foto(pg, '41b-busca-zoom-1280');
    await grade.locator('.escolha-filtro').fill('pântano');
    await pg.waitForTimeout(200);
    const filtradas = await grade.locator('.item').count();
    if (filtradas >= nCartas) throw new Error('o filtro da busca não filtrou');
    await foto(pg, '41c-busca-filtro-1280');
    await grade.locator('.escolha-filtro').fill('');

    // recolher para olhar a mesa: a decisão continua pendente num cartão da coluna da direita
    await grade.getByRole('button', { name: 'Ver a mesa' }).click();
    await pg.locator('.escolha-recolhida').waitFor();
    if (await grade.isVisible()) throw new Error('a janela recolhida continua à vista');
    for (const t of [...TELAS].reverse()) {
      await tela(t);
      await conferirMesa(pg, `escolha recolhida ${t.width}`);
      await foto(pg, `42-escolha-recolhida-${t.width}`);
    }
    await pg.getByRole('button', { name: 'Voltar à escolha' }).click();
    await conferirEscolha('busca de volta 1920');
    // segurar Espaço esconde a janela enquanto a tecla está apertada
    await pg.mouse.move(5, 5);
    await pg.keyboard.down('Space');
    await pg.waitForTimeout(200);
    if (!await pg.locator('.janela-escolha.espiando').count()) throw new Error('segurar Espaço não escondeu a janela');
    await foto(pg, '42b-espiando-com-espaco-1920');
    await pg.keyboard.up('Space');
    await pg.waitForTimeout(200);
    if (await pg.locator('.janela-escolha.espiando').count()) throw new Error('soltar Espaço não trouxe a janela de volta');
    await grade.locator('.item:not([disabled])').first().click();
    await grade.getByRole('button', { name: 'Confirmar' }).click();
    await ateAPrioridade();

    // zoom: a carta com menos texto e a com mais texto da mesa (o nome no zoom confere com a carta)
    const cartas = pg.locator('.campo .carta, .zonas .slot .carta');
    const medidas: { i: number; letras: number; nome: string }[] = [];
    for (let i = 0; i < await cartas.count(); i++) {
      const nome = (await cartas.nth(i).getAttribute('aria-label')) ?? '';
      await pg.mouse.move(5, 5);
      await cartas.nth(i).hover({ force: true, timeout: 1500 }).catch(() => {});
      await pg.waitForTimeout(80);
      const z = await pg.locator('.zoom .zoom-texto').evaluate((e) => ({ nome: e.querySelector('strong')?.textContent ?? '', letras: e.textContent!.length }), undefined, { timeout: 400 }).catch(() => null);
      if (z && z.nome === nome) medidas.push({ i, letras: z.letras, nome });
    }
    medidas.sort((a, b) => a.letras - b.letras);
    if (medidas.length < 2) throw new Error('não deu para medir o zoom das cartas da mesa');
    const pouco = medidas[0], muito = medidas[medidas.length - 1];
    console.log(`  zoom: pouco texto = ${pouco.nome} (${pouco.letras} letras), muito texto = ${muito.nome} (${muito.letras} letras)`);
    for (const t of TELAS) {
      await tela(t);
      for (const [m, nome] of [[pouco, 'pouco'], [muito, 'muito']] as const) {
        await pg.mouse.move(5, 5);
        await cartas.nth(m.i).hover({ force: true });
        await conferirZoom(`${nome} texto ${t.width}`);
        await foto(pg, `43-zoom-${nome}-texto-${t.width}`);
      }
    }
    // notebook (1366×768 menos a barra do navegador): a carta com mais texto continua inteira e centralizada
    await tela({ width: 1366, height: 657 });
    await pg.mouse.move(5, 5);
    await cartas.nth(muito.i).hover({ force: true });
    await conferirZoom('muito texto 1366×657');
    await foto(pg, '43-zoom-muito-texto-1366x657');
    // tela baixa (1080p com escala de 150% no Windows): a carta encolhe e o texto fica embaixo, inteiro
    await tela({ width: 1280, height: 600 });
    await pg.mouse.move(5, 5);
    await cartas.nth(muito.i).hover({ force: true });
    await conferirZoom('muito texto 1280×600');
    await foto(pg, '43-zoom-muito-texto-1280x600');
    await pg.mouse.move(5, 5);

    // chat na barra lateral: escrever e ver a mensagem ali (a sala tem uma pessoa e bots: aparece como "Você")
    await tela(TELAS[0]);
    for (const texto of ['boa noite, mesa!', 'alguém tem remoção para aquele dragão?']) {
      await pg.getByLabel('Mensagem para a mesa').fill(texto);
      await pg.getByLabel('Mensagem para a mesa').press('Enter');
      await pg.locator('.chat li', { hasText: texto }).waitFor({ timeout: 5000 });
    }
    if (await pg.locator('.chat .chat-quem').count() !== 1) throw new Error('mensagens seguidas da mesma pessoa deviam ficar juntas, com o nome uma vez só');
    for (const t of TELAS) {
      await tela(t);
      await conferirMesa(pg, `chat ${t.width}`);
      await foto(pg, `44-chat-${t.width}`);
    }

    // registro da partida: abre numa janela do menu, como Paradas e Configurações, com a busca
    await tela(TELAS[0]);
    await pg.getByRole('button', { name: 'Registro', exact: true }).click();
    await pg.locator('.registro-janela').waitFor();
    if (await pg.locator('.registro-turno-bloco').count() < 2) throw new Error('o registro devia separar as linhas por turno');
    const fimDoRegistro = await pg.locator('.registro-lista').evaluate((e) => e.scrollHeight - e.scrollTop - e.clientHeight);
    if (fimDoRegistro > 40) throw new Error(`o registro devia abrir no fim (faltam ${fimDoRegistro} px)`);
    await foto(pg, '44b-registro-janela-1920');
    await pg.getByLabel('Procurar no registro').fill('joga');
    await pg.waitForTimeout(200);
    const linhasBusca = await pg.locator('.registro-turno-bloco li').allTextContents();
    if (!linhasBusca.length || linhasBusca.some((l) => !/joga/i.test(l))) throw new Error('a busca do registro devia deixar só as linhas com "joga"');
    await foto(pg, '44c-registro-busca-1920');
    await pg.keyboard.press('Escape');
    await pg.locator('.registro-janela').waitFor({ state: 'hidden' });

    // barra recolhida: fica só com os ícones (sem o chat), a mesa ocupa o resto e a escolha fica guardada
    const larguraMesa = await pg.locator('.tabuleiro').evaluate((e) => e.getBoundingClientRect().width);
    await pg.getByRole('button', { name: 'Recolher a barra', exact: true }).click();
    await pg.waitForTimeout(400);
    for (const t of TELAS) {
      await tela(t);
      await conferirMesa(pg, `barra recolhida ${t.width}`);
      const lat = await pg.locator('.lateral').evaluate((e) => e.getBoundingClientRect().width);
      if (lat > 70 || await pg.locator('.chat').isVisible()) throw new Error(`barra recolhida, mas ela tem ${lat} px`);
      await foto(pg, `44d-barra-recolhida-${t.width}`);
    }
    await tela(TELAS[0]);
    if (await pg.locator('.tabuleiro').evaluate((e) => e.getBoundingClientRect().width) <= larguraMesa) throw new Error('a mesa não cresceu com a barra recolhida');
    await pg.reload();
    await entrarNaMesa();
    if (await pg.locator('.chat').isVisible()) throw new Error('a barra recolhida não ficou guardada no navegador');
    await pg.getByRole('button', { name: 'Abrir a barra', exact: true }).click();
    await pg.locator('.chat').waitFor();
    // a conversa volta depois de recarregar a página (fica guardada na sala, no servidor)
    await pg.locator('.chat li', { hasText: 'boa noite, mesa!' }).waitFor({ timeout: 5000 });
    await ateAPrioridade();

    // alvos: conjurar da mão uma carta que pede alvo; a janela mostra as cartas da mesa (e os jogadores) grandes
    let comAlvo = false;
    const mao = pg.locator('.mao-cartas .carta');
    for (let i = 0; i < await mao.count() && !comAlvo; i++) {
      await mao.nth(i).click({ button: 'right', position: { x: 8, y: 40 }, timeout: 3000 }).catch(() => {});
      const conjurar = pg.locator('.menu-acoes .menu-item.acao').filter({ hasText: /^Conjurar/ }).first();
      if (!await conjurar.isVisible().catch(() => false)) { await pg.locator('.menu-acoes').getByRole('button', { name: 'Cancelar' }).click({ timeout: 800 }).catch(() => {}); continue; }
      await conjurar.click();
      await pg.waitForTimeout(800);
      const j = pg.locator('.janela-escolha:not(.recolhida)');
      if (await j.isVisible().catch(() => false) && await j.locator('.item-carta-grande, .item-jogador').count()) { comAlvo = true; break; }
      // não pediu alvo: desiste no pagamento
      await pg.locator('.coluna-dir').getByRole('button', { name: 'Cancelar' }).click({ timeout: 2000 }).catch(() => {});
      await ateAPrioridade();
    }
    if (comAlvo) {
      for (const t of TELAS) { await tela(t); await conferirEscolha(`alvos ${t.width}`); await pg.mouse.move(5, 5); await foto(pg, `47-alvos-${t.width}`); }
      // escolhe na janela e recolhe: a carta escolhida aparece marcada na mesa e a decisão fica no cartão da direita
      await pg.locator('.janela-escolha .item:not([disabled])').first().click();
      await pg.locator('.janela-escolha').getByRole('button', { name: 'Ver a mesa' }).click();
      await pg.locator('.escolha-recolhida').waitFor();
      await pg.mouse.move(5, 5);
      await foto(pg, '47b-alvo-escolhido-recolhida-1280');
      await pg.locator('.escolha-recolhida').getByRole('button', { name: 'Confirmar' }).click();
      await pg.locator('.coluna-dir').getByRole('button', { name: 'Cancelar' }).click({ timeout: 5000 }).catch(() => {});
      await ateAPrioridade();
      await tela(TELAS[0]);
    } else console.log('  alvos: nenhuma carta da mão pediu alvo agora (captura 47 pulada)');

    // sim ou não: o comandante vai para o cemitério pelo ajuste manual e o motor pergunta se ele volta ao comando
    const comandante = pg.locator('.area-eu .campo .carta[aria-label^="Killian"]').first();
    if (await comandante.isVisible().catch(() => false)) {
      await comandante.click({ button: 'right', force: true });
      await pg.locator('.menu-acoes').getByRole('menuitem', { name: 'Mover para…' }).click();
      await pg.locator('.menu-acoes.submenu').getByRole('menuitem', { name: 'Cemitério' }).click();
      const simNao = pg.locator('.janela-escolha.f-simnao');
      await simNao.waitFor();
      for (const t of TELAS) { await tela(t); await conferirEscolha(`sim ou não ${t.width}`); await pg.mouse.move(5, 5); await foto(pg, `48-sim-nao-${t.width}`); }
      await tela(TELAS[0]);
      await simNao.locator('.item').first().click();
      await ateAPrioridade();
    } else console.log('  sim ou não: o comandante não está no campo (captura 48 pulada)');

    // vidência 3: faixas de topo e fundo, com uma carta mandada para o fundo
    await ajusteManual('Vidência');
    for (let k = 0; k < 2; k++) await pg.locator('.janela-caixa').getByRole('button', { name: '+', exact: true }).click();
    await pg.locator('.janela-caixa').getByRole('button', { name: /^Vidência 3/ }).click();
    const arranjo = pg.locator('.janela-escolha.f-arranjo');
    await arranjo.waitFor();
    await arranjo.locator('.arranjo-carta').first().getByRole('button', { name: 'Fundo' }).click();
    for (const t of TELAS) { await tela(t); await conferirEscolha(`vidência ${t.width}`); await pg.mouse.move(5, 5); await foto(pg, `45-videncia-${t.width}`); }
    await tela(TELAS[0]);
    await arranjo.getByRole('button', { name: 'Confirmar' }).click();
    await ateAPrioridade();

    // descarte na limpeza com 8 cartas na mão: linha de cartas grandes
    const naMao = await pg.locator('.mao-cartas .carta').count();
    if (naMao < 8) {
      await ajusteManual('Comprar');
      for (let k = 1; k < 8 - naMao; k++) await pg.locator('.janela-caixa').getByRole('button', { name: '+', exact: true }).click();
      await pg.locator('.janela-caixa').getByRole('button', { name: /^Comprar \d/ }).click();
      await ateAPrioridade();
    }
    await pg.getByRole('button', { name: 'Passar até o fim do turno' }).click();
    const descarte = pg.locator('.janela-escolha').filter({ hasText: 'Descarte' });
    for (let k = 0; k < 120 && !await descarte.isVisible().catch(() => false); k++) {
      if (await pg.getByText('Você tem prioridade').isVisible().catch(() => false)) await clicar(pg, 'Passar');
      await pg.waitForTimeout(250);
    }
    await descarte.waitFor({ timeout: 5000 });
    for (const t of TELAS) { await tela(t); await conferirEscolha(`descarte ${t.width}`); await pg.mouse.move(5, 5); await foto(pg, `46-descarte-${t.width}`); }
    await c9.close();
  }
  // --- fim da fase 9 ---

  // --- fase 9: níveis dos bots, "está pensando…" e o aviso de quem a mesa espera ---
  // CAPTURAS_SO=niveis roda só este bloco.
  if (!SO || SO === 'niveis') {
    const TELAS = [{ width: 1920, height: 1080 }, { width: 1280, height: 800 }];
    const cn = await navegador.newContext({ viewport: TELAS[0] });
    cn.setDefaultTimeout(20000);
    const pn = await cn.newPage();
    await entrar(pn);
    await nomear(pn, 'Ana');
    await escolher(pn, 'Criar sala');
    await pn.locator('form').filter({ hasText: 'Criar sala' }).getByLabel('Senha da sala').fill('mesa');
    await pn.getByRole('button', { name: 'Criar', exact: true }).click();
    await pn.locator('.lugares').waitFor();
    // três bots com níveis diferentes: o nome sorteado aparece com o nível ("ROBSON · Cartomante")
    const niveis = ['Magic God', 'Cartomante', 'Iniciante'];
    for (let i = 0; i < 3; i++) await porBot(pn, i + 2, niveis[i]);
    await pn.waitForTimeout(300);
    for (let i = 0; i < 3; i++) {
      const texto = await pn.locator('.lugar').nth(i + 1).locator('.assento-nome').innerText();
      if (!/^[A-ZÁÉÍÓÚÂÊÔÃÕÇ]+ · /.test(texto) || !texto.includes(niveis[i])) throw new Error(`assento ${i + 1} sem nome · nível: ${texto}`);
    }
    for (const t of TELAS) { await pn.setViewportSize(t); await foto(pn, `92-saguao-niveis-${t.width}`); }
    await cn.close();

    // 1v1 contra um Magic God: "está pensando…" quando ele pensa mais de 1 s; e, com "Mágicas dos oponentes"
    // e a etapa final dos outros marcadas, o aviso grande de que a mesa espera Ana
    const cp = await navegador.newContext({ viewport: TELAS[0] });
    cp.setDefaultTimeout(20000);
    const q = await cp.newPage();
    await entrar(q);
    await nomear(q, 'Ana');
    await escolher(q, 'Criar sala');
    await q.getByRole('button', { name: 'Um contra um' }).click();
    await q.locator('form').filter({ hasText: 'Criar sala' }).getByLabel('Senha da sala').fill('mesa');
    await q.getByRole('button', { name: 'Criar', exact: true }).click();
    await q.locator('.lugares').waitFor();
    await porBot(q, 2, 'Magic God');
    await irParaDecks(q);
    await deckDoBot(q, 2, 1);
    await escolherDeck(q, 4);
    await q.getByRole('button', { name: 'Começar a partida' }).click();
    await pularAbertura(q);
    await q.getByText('Mão inicial').waitFor({ timeout: 30000 });
    await clicar(q, 'Manter');
    let pensando = false;
    let aviso = false;
    let marcou = false;
    for (let i = 0; i < 1200 && !(pensando && aviso); i++) {
      await q.waitForTimeout(250);
      if (!pensando && await q.locator('.fases .prioridade.pensando').isVisible().catch(() => false)) {
        pensando = true;
        for (const t of TELAS) { await q.setViewportSize(t); await foto(q, `93-bot-pensando-${t.width}`); }
        await q.setViewportSize(TELAS[0]);
        continue;
      }
      if (await q.locator('.aviso-prioridade').isVisible().catch(() => false)) {
        if (!aviso) {
          aviso = true;
          for (const t of TELAS) { await q.setViewportSize(t); await foto(q, `94-aviso-sua-vez-${t.width}`); }
          await q.setViewportSize(TELAS[0]);
        }
        await clicar(q, 'Passar');
        continue;
      }
      // depois do primeiro aviso de pensando: liga as paradas do turno dos outros (mágicas e etapa final)
      if (pensando && !marcou && await q.getByRole('button', { name: 'Mágicas dos oponentes' }).isVisible().catch(() => false)) {
        marcou = true;
        await q.getByRole('button', { name: 'Mágicas dos oponentes' }).click();
        await q.getByTitle(/Parar aqui no turno dos outros/).first().click().catch(() => {});
      }
      if (await q.getByText('Você tem prioridade').isVisible().catch(() => false)) { await clicar(q, 'Passar'); continue; }
      for (const nome of ['Manter', 'Não atacar', 'Não bloquear', 'Confirmar', 'Nenhum']) if (await clicar(q, nome)) break;
      await responderJanela(q);
    }
    if (!pensando) throw new Error('o aviso "está pensando…" não apareceu');
    if (!aviso) console.log('aviso: a mesa não chegou a esperar Ana fora do turno dela nesta partida (captura 94 opcional)');
    await cp.close();
  }

  // --- fase 9: posicionar e seleção por arrasto ---
  if (!SO) await capturasPosicionar();
  // --- fim (fase 9: posicionar) ---
  // --- combate com muitas fichas ---
  if (!SO) await capturasCombate();
  // --- fim (combate com muitas fichas) ---
  // --- a sua área com o campo até a base ---
  if (!SO) await capturasMesa();
  // --- fim (a sua área) ---

} catch (e) {
  for (const [i, p] of paginas.entries()) if (!p.isClosed()) await p.screenshot({ path: join(SAIDA, `falha-${i}.png`) }).catch(() => {});
  throw e;
} finally {
  await navegador.close();
  servidor.kill();
}
