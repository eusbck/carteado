// Medida de desempenho do cliente no navegador (Playwright + Chrome DevTools Protocol), em cenários fixos, para
// comparar duas versões do jogo (a de antes e a de depois de uma otimização). Sobe o servidor da raiz pedida (com o
// cliente já compilado nela), numa porta e numa pasta de dados próprias, e mede em cada cenário:
//   - quadros: média de quadros por segundo, quadro p95 e quadros acima de 50 ms (requestAnimationFrame);
//   - tarefas longas (> 50 ms, PerformanceObserver);
//   - trabalho da página pelo Chrome: tempo de tarefas, de script, de layout e de estilo (Performance.getMetrics);
//   - WebSocket: mensagens recebidas e KB (texto já descomprimido) e, na mesa, o trabalho por mensagem;
//   - memória: heap JS e nós do DOM no fim.
// Cenários: a entrada parada, o saguão parado, a mesa de 4 com 3 bots andando (você passa sempre), varrer a mão
// com o mouse, abrir o zoom das cartas do campo e recolher e abrir a barra lateral.
//
// Uso: node ferramentas/desempenho.ts [raiz do jogo] [saida.json]
//      node ferramentas/desempenho.ts comparar antes.json depois.json   → tabela em Markdown
// Variáveis: PORTA_DESEMPENHO (8130), DESEMPENHO_DADOS (pasta de dados; apagada no começo), MESA_SEGUNDOS (90).
// O Chrome sem janela desenha por software: os números servem para comparar versões na mesma máquina, não como
// medida absoluta do que se vê num navegador de verdade.

import { spawn, type ChildProcess } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, type BrowserContext, type CDPSession, type Page } from 'playwright';

const AQUI = join(dirname(fileURLToPath(import.meta.url)), '..');

interface Medida {
  segundos: number;
  fps: number;
  quadroP95: number;
  quadrosLentos: number;
  tarefasLongas: number;
  tarefaLongaMax: number;
  /** ms de trabalho da página por segundo de cenário */
  tarefaMsPorS: number;
  scriptMsPorS: number;
  layoutMsPorS: number;
  estiloMsPorS: number;
  layouts: number;
  mensagens: number;
  kbRecebidos: number;
  /** ms de tarefa por mensagem recebida (só faz sentido onde as mensagens são o trabalho principal) */
  tarefaMsPorMensagem: number | null;
  heapMb: number;
  nos: number;
  erros: number;
}
type Resultado = Record<string, Medida | string>;

// ------------------------------------------------------------------------------------------------ comparar
if (process.argv[2] === 'comparar') {
  const [a, b] = [process.argv[3], process.argv[4]].map((f) => JSON.parse(readFileSync(f, 'utf8')) as Resultado);
  const campos: [keyof Medida, string, 'menor' | 'maior'][] = [
    ['fps', 'quadros/s', 'maior'], ['quadroP95', 'quadro p95 (ms)', 'menor'], ['quadrosLentos', 'quadros > 50 ms', 'menor'],
    ['tarefasLongas', 'tarefas longas', 'menor'], ['tarefaLongaMax', 'maior tarefa (ms)', 'menor'],
    ['tarefaMsPorS', 'trabalho (ms/s)', 'menor'], ['scriptMsPorS', 'script (ms/s)', 'menor'], ['layoutMsPorS', 'layout (ms/s)', 'menor'],
    ['estiloMsPorS', 'estilo (ms/s)', 'menor'], ['mensagens', 'mensagens', 'menor'], ['kbRecebidos', 'KB recebidos', 'menor'],
    ['tarefaMsPorMensagem', 'trabalho por mensagem (ms)', 'menor'], ['heapMb', 'heap JS (MB)', 'menor'], ['nos', 'nós do DOM', 'menor'], ['erros', 'erros no console', 'menor'],
  ];
  for (const cenario of Object.keys(a)) {
    const x = a[cenario], y = b[cenario];
    if (typeof x !== 'object' || typeof y !== 'object') continue;
    console.log(`\n### ${cenario}\n\n| medida | antes | depois | variação |\n|---|---:|---:|---:|`);
    for (const [k, rot] of campos) {
      const va = x[k], vb = y[k];
      if (va === null || vb === null || va === undefined || vb === undefined) continue;
      const pct = va === 0 ? (vb === 0 ? 0 : Infinity) : ((vb - va) / va) * 100;
      console.log(`| ${rot} | ${va} | ${vb} | ${Number.isFinite(pct) ? `${pct > 0 ? '+' : ''}${pct.toFixed(0)}%` : '—'} |`);
    }
  }
  process.exit(0);
}

// ------------------------------------------------------------------------------------------------ servidor
const RAIZ = resolve(process.argv[2] ?? AQUI);
const SAIDA = resolve(process.argv[3] ?? join(AQUI, '.cache', 'desempenho', 'medida.json'));
const PORTA = Number(process.env.PORTA_DESEMPENHO ?? 8130);
const DADOS = process.env.DESEMPENHO_DADOS ?? join(AQUI, '.cache', 'desempenho-dados');
const URL = `http://localhost:${PORTA}`;
const SENHA = 'teste-desempenho';
const MESA_SEGUNDOS = Number(process.env.MESA_SEGUNDOS ?? 90);

rmSync(DADOS, { recursive: true, force: true });
mkdirSync(dirname(SAIDA), { recursive: true });

const servidor: ChildProcess = spawn(process.execPath, [join(RAIZ, 'servidor', 'index.ts')], {
  cwd: RAIZ, env: { ...process.env, PORTA: String(PORTA), DADOS, SENHA_ACESSO: SENHA }, stdio: ['ignore', 'pipe', 'pipe'],
});
servidor.stderr!.on('data', (d) => process.stderr.write(`[servidor] ${d}`));
await new Promise<void>((ok, falha) => {
  const t = setTimeout(() => falha(new Error('o servidor não subiu')), 60000);
  servidor.stdout!.on('data', (d) => { if (String(d).includes('http://localhost')) { clearTimeout(t); ok(); } });
});

// ------------------------------------------------------------------------------------------------ navegador
const navegador = await chromium.launch();
const resultado: Resultado = { raiz: RAIZ, quando: new Date().toISOString() };

/** instrumentos da página: quadros (rAF) e tarefas longas, ligados por window.__medir */
async function instrumentar(ctx: BrowserContext): Promise<void> {
  await ctx.addInitScript(() => {
    const w = window as unknown as { __medir: boolean; __quadros: number[]; __longas: number[] };
    w.__medir = false; w.__quadros = []; w.__longas = [];
    let ultimo = 0;
    const quadro = (t: number) => {
      if (w.__medir) { if (ultimo) w.__quadros.push(t - ultimo); ultimo = t; } else ultimo = 0;
      requestAnimationFrame(quadro);
    };
    requestAnimationFrame(quadro);
    try { new PerformanceObserver((l) => { if (w.__medir) for (const e of l.getEntries()) w.__longas.push(e.duration); }).observe({ type: 'longtask', buffered: false }); } catch { /* sem longtask */ }
    // todos os auxílios ligados e pagamento automático: a pessoa do roteiro só passa e responde o simples
    if (!sessionStorage.getItem('desempenho:prefs')) {
      sessionStorage.setItem('desempenho:prefs', '1');
      localStorage.setItem('commander-da-mesa:preferencias', JSON.stringify({ nivel: 'personalizado', personalizado: { jogaveis: true, alvos: true, terrenos: true, avisos: true, pagarAuto: true } }));
    }
  });
}

interface Sonda { cdp: CDPSession; mensagens: number; bytes: number; erros: number }
async function sondar(p: Page): Promise<Sonda> {
  const cdp = await p.context().newCDPSession(p);
  await cdp.send('Performance.enable');
  await cdp.send('Network.enable');
  const s: Sonda = { cdp, mensagens: 0, bytes: 0, erros: 0 };
  cdp.on('Network.webSocketFrameReceived', (e) => { s.mensagens++; s.bytes += e.response.payloadData.length; });
  p.on('console', (m) => { if (m.type() === 'error') { s.erros++; console.error(`  [console] ${m.text()}`); } });
  p.on('pageerror', (e) => { s.erros++; console.error(`  [página] ${e.message}`); });
  return s;
}
async function metricas(s: Sonda): Promise<Record<string, number>> {
  const { metrics } = await s.cdp.send('Performance.getMetrics');
  return Object.fromEntries(metrics.map((m) => [m.name, m.value]));
}

const r1 = (x: number) => Math.round(x * 10) / 10;

/** mede `acao` (ou só espera `ms`) e guarda o resultado com o nome do cenário */
async function medir(nome: string, p: Page, s: Sonda, acao: (() => Promise<void>) | number): Promise<Medida> {
  await p.evaluate(() => { const w = window as unknown as { __medir: boolean; __quadros: number[]; __longas: number[] }; w.__quadros.length = 0; w.__longas.length = 0; w.__medir = true; });
  const m0 = await metricas(s);
  const msg0 = s.mensagens, b0 = s.bytes, e0 = s.erros;
  const t0 = Date.now();
  if (typeof acao === 'number') await p.waitForTimeout(acao); else await acao();
  const seg = (Date.now() - t0) / 1000;
  const m1 = await metricas(s);
  const { quadros, longas } = await p.evaluate(() => { const w = window as unknown as { __medir: boolean; __quadros: number[]; __longas: number[] }; w.__medir = false; return { quadros: [...w.__quadros], longas: [...w.__longas] }; });
  const ordenados = [...quadros].sort((a, b) => a - b);
  const media = quadros.length ? quadros.reduce((a, b) => a + b, 0) / quadros.length : 0;
  const d = (k: string) => (m1[k] ?? 0) - (m0[k] ?? 0);
  const mensagens = s.mensagens - msg0;
  const med: Medida = {
    segundos: r1(seg),
    fps: media ? r1(1000 / media) : 0,
    quadroP95: r1(ordenados[Math.floor(ordenados.length * 0.95)] ?? 0),
    quadrosLentos: quadros.filter((q) => q > 50).length,
    tarefasLongas: longas.length,
    tarefaLongaMax: r1(Math.max(0, ...longas)),
    tarefaMsPorS: r1((d('TaskDuration') * 1000) / seg),
    scriptMsPorS: r1((d('ScriptDuration') * 1000) / seg),
    layoutMsPorS: r1((d('LayoutDuration') * 1000) / seg),
    estiloMsPorS: r1((d('RecalcStyleDuration') * 1000) / seg),
    layouts: d('LayoutCount'),
    mensagens,
    kbRecebidos: r1((s.bytes - b0) / 1024),
    tarefaMsPorMensagem: mensagens >= 5 ? r1((d('TaskDuration') * 1000) / mensagens) : null,
    heapMb: r1((m1.JSHeapUsedSize ?? 0) / 1048576),
    nos: m1.Nodes ?? 0,
    erros: s.erros - e0,
  };
  resultado[nome] = med;
  console.log(`${nome}: ${JSON.stringify(med)}`);
  return med;
}

async function clicar(p: Page, nome: string | RegExp): Promise<boolean> {
  const b = p.getByRole('button', { name: nome }).first();
  if (await b.isVisible().catch(() => false) && await b.isEnabled().catch(() => false)) { await b.click().catch(() => {}); return true; }
  return false;
}

/** a resposta mais simples para o que estiver pendente para a pessoa: passa, mantém a mão, não ataca, não bloqueia */
async function responder(p: Page): Promise<void> {
  if (await p.locator('.abertura').isVisible().catch(() => false)) { await p.locator('.abertura').click().catch(() => {}); return; }
  if (await p.locator('.tela-mulligan').isVisible().catch(() => false)) { await clicar(p, 'Manter'); return; }
  if (await p.getByText('Você tem prioridade').isVisible().catch(() => false)) { await clicar(p, 'Passar'); return; }
  const titulo = (await p.locator('.coluna-dir .decisao-titulo, .janela-escolha .decisao-titulo').first().textContent({ timeout: 300 }).catch(() => '')) ?? '';
  if (titulo.includes('Ataque')) { await clicar(p, /^Não atacar/); return; }
  if (titulo.includes('Bloqueio')) { await clicar(p, /^Não bloquear/); return; }
  const item = p.locator('.janela-escolha .item:not([disabled])').first();
  if (await item.isVisible().catch(() => false)) { await item.click().catch(() => {}); if (await clicar(p, /^Confirmar/)) return; await clicar(p, 'Nenhum'); return; }
  for (const nome of ['Pagar automaticamente', 'Cancelar', /^Confirmar/, 'Nenhum']) if (await clicar(p, nome)) return;
}

/** joga (passando) até a pessoa ter prioridade com a mesa parada esperando por ela */
async function ateMinhaPrioridade(p: Page, limiteMs = 120000): Promise<boolean> {
  const fim = Date.now() + limiteMs;
  while (Date.now() < fim) {
    if (await p.getByText('Você tem prioridade').isVisible().catch(() => false) && await p.locator('.mao-cartas .carta').count() > 0) return true;
    await responder(p);
    await p.waitForTimeout(150);
  }
  return false;
}

try {
  const ctx = await navegador.newContext({ viewport: { width: 1920, height: 1080 } });
  ctx.setDefaultTimeout(20000);
  await instrumentar(ctx);
  const p = await ctx.newPage();
  const s = await sondar(p);

  // --- entrada parada (brasas, aurora, joias) ---
  await p.goto(URL);
  await p.getByLabel('Senha do servidor').waitFor();
  await p.waitForTimeout(4000); // a abertura em sequência termina
  await medir('entrada', p, s, 8000);

  // --- saguão parado (wallpaper com fade e zoom lento, painéis translúcidos) ---
  await p.getByLabel('Senha do servidor').fill(SENHA);
  await p.getByRole('button', { name: 'Entrar' }).click();
  await p.getByLabel('Seu nome na mesa').fill('Ana');
  await p.getByRole('button', { name: 'Continuar' }).click();
  await p.getByText('Olá, Ana').waitFor();
  await p.getByRole('button', { name: /^Criar sala/ }).click();
  await p.locator('form').filter({ hasText: 'Criar sala' }).getByLabel('Senha da sala').fill('mesa');
  await p.getByRole('button', { name: 'Criar', exact: true }).click();
  await p.locator('.lugares').waitFor();
  for (const l of [2, 3, 4]) {
    await p.getByRole('button', { name: `Pôr bot no lugar ${l}` }).click();
    await p.locator('.lugar').nth(l - 1).getByText('bot', { exact: true }).waitFor();
  }
  await p.waitForTimeout(1500);
  await medir('saguao', p, s, 8000);

  // --- mesa de 4 com 3 bots ---
  await p.getByRole('button', { name: 'Continuar para as regras' }).click();
  await p.getByRole('button', { name: 'Continuar para os decks' }).click();
  await p.locator('.saguao-decks').waitFor();
  for (const [i, l] of [2, 3, 4].entries()) {
    await p.locator('.decks-lugares .assento').nth(l - 1).getByLabel('Deck do bot').selectOption({ index: [1, 3, 6][i] });
    await p.waitForTimeout(150);
  }
  await p.locator('.deck').nth(4).click();
  await p.getByRole('button', { name: 'Escolher este deck' }).click();
  await p.locator('.previa-deck').waitFor({ state: 'detached' });
  await p.getByRole('button', { name: 'Começar a partida' }).click();
  await p.locator('.tabuleiro, .abertura').first().waitFor({ timeout: 30000 });
  // a partida anda: a pessoa só passa e responde o simples
  await medir('mesa-bots', p, s, async () => {
    const fim = Date.now() + MESA_SEGUNDOS * 1000;
    while (Date.now() < fim) { await responder(p); await p.waitForTimeout(150); }
  });

  // --- com a mesa parada esperando a pessoa: varrer a mão, zoom no campo, barra lateral ---
  if (await ateMinhaPrioridade(p)) {
    const mao = p.locator('.mao-cartas .carta');
    await medir('varrer-mao', p, s, async () => {
      for (let volta = 0; volta < 4; volta++) {
        const n = await mao.count();
        for (let i = 0; i < n; i++) {
          const c = await mao.nth(i).boundingBox();
          if (c) await p.mouse.move(c.x + 10, c.y + c.height / 2, { steps: 4 });
          await p.waitForTimeout(60);
        }
        await p.mouse.move(960, 400, { steps: 4 });
      }
    });
    const campo = p.locator('.area .campo .carta');
    await medir('zoom-campo', p, s, async () => {
      const n = Math.min(await campo.count(), 24);
      for (let i = 0; i < n; i++) {
        const c = await campo.nth(i).boundingBox().catch(() => null);
        if (c) await p.mouse.move(c.x + c.width / 2, c.y + c.height / 2, { steps: 3 });
        await p.waitForTimeout(120);
      }
      await p.mouse.move(960, 540);
    });
    await medir('barra-lateral', p, s, async () => {
      // o mesmo botão recolhe e abre ("Recolher a barra" / "Abrir a barra")
      for (let i = 0; i < 6; i++) {
        await p.locator('button.recolher').click().catch(() => {});
        await p.waitForTimeout(700);
      }
    });
  } else {
    console.warn('a pessoa não chegou a ter prioridade com a mesa parada: cenários de mouse pulados');
  }
  await p.screenshot({ path: SAIDA.replace(/\.json$/, '.png') });
  await ctx.close();
} finally {
  writeFileSync(SAIDA, JSON.stringify(resultado, null, 1));
  console.log(`resultado em ${SAIDA}`);
  await navegador.close();
  servidor.kill();
}
