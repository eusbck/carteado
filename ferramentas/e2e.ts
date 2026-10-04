// Teste de ponta a ponta com navegadores (Playwright): pessoas diferentes em contextos
// separados jogam pela interface. Cobre: sala com código e senha, escolha de deck, partida
// 1v1 e de 4, reinício do servidor no meio da partida (reconexão e retomada), concessão e fim.
// Uso: node ferramentas/e2e.ts

import { spawn, type ChildProcess } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, type Browser, type Page } from 'playwright';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const DADOS = join(RAIZ, '.cache', 'e2e-dados');
const SAIDA = join(RAIZ, '.cache', 'e2e');
const PORTA = 8092;
const URL = `http://localhost:${PORTA}`;
const SENHA = 'teste-e2e';

rmSync(DADOS, { recursive: true, force: true });
mkdirSync(SAIDA, { recursive: true });

let servidor!: ChildProcess;
async function subirServidor(): Promise<void> {
  servidor = spawn(process.execPath, [join(RAIZ, 'servidor', 'index.ts')], {
    env: { ...process.env, PORTA: String(PORTA), DADOS, SENHA_ACESSO: SENHA },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  servidor.stderr!.on('data', (d) => process.stderr.write(`[servidor] ${d}`));
  await new Promise<void>((ok, falha) => {
    const t = setTimeout(() => falha(new Error('servidor não subiu')), 60000);
    servidor.stdout!.on('data', (d) => { if (String(d).includes('http://localhost')) { clearTimeout(t); ok(); } });
  });
}
async function derrubarServidor(): Promise<void> {
  await new Promise<void>((ok) => { servidor.once('exit', () => ok()); servidor.kill(); });
}

function verificar(cond: unknown, msg: string): void {
  if (!cond) throw new Error(`Falhou: ${msg}`);
  console.log(`ok: ${msg}`);
}

const todas: Page[] = [];
async function novaPessoa(nav: Browser, nome: string): Promise<Page> {
  const ctx = await nav.newContext({ viewport: { width: 1500, height: 900 } });
  const p = await ctx.newPage();
  todas.push(p);
  p.on('pageerror', (e) => console.error(`[${nome}] ${e.message}`));
  p.on('console', (m) => { if (m.type() === 'error') console.error(`[${nome} console] ${m.text()}`); });
  p.on('requestfailed', (r) => console.error(`[${nome} falhou] ${r.url()} ${r.failure()?.errorText}`));
  p.on('websocket', (ws) => {
    ws.on('framereceived', (f) => { const t = String(f.payload); if (t.startsWith('{"t":"erro"')) console.error(`[${nome} erro do servidor] ${t}`); });
    ws.on('framesent', (f) => { const t = String(f.payload); if (t.includes('"conceder"')) console.error(`[${nome} enviou] ${t}`); });
    ws.on('close', () => console.error(`[${nome}] websocket fechou`));
  });
  const t0 = Date.now();
  await p.goto(URL);
  console.log(`[${nome}] página carregada em ${Date.now() - t0} ms`);
  await p.getByLabel('Senha do servidor').fill(SENHA);
  await p.getByRole('button', { name: 'Entrar' }).click();
  await p.getByLabel('Seu nome na mesa').fill(nome);
  return p;
}

async function clicar(p: Page, nome: string | RegExp): Promise<boolean> {
  const b = p.getByRole('button', { name: nome }).first();
  if (await b.isVisible().catch(() => false) && await b.isEnabled().catch(() => false)) {
    await b.click().catch(() => {});
    return true;
  }
  return false;
}

/** uma ação simples para a decisão pendente da pessoa (se houver); devolve true se agiu */
async function agir(p: Page): Promise<boolean> {
  const painel = p.locator('.lateral .decisao');
  if (!(await painel.isVisible().catch(() => false))) return false;
  const titulo = (await p.locator('.decisao-titulo').first().textContent().catch(() => '')) ?? '';
  if (titulo.includes('Você tem prioridade')) {
    if (await clicar(p, /^Jogar /)) return true;
    if (Math.random() < 0.5 && await clicar(p, /^Conjurar: /)) return true;
    return clicar(p, 'Passar');
  }
  if (titulo.includes('atacantes')) {
    const linhas = p.locator('.decisao .linha');
    const n = await linhas.count();
    for (let i = 0; i < n; i++) await linhas.nth(i).locator('button').first().click().catch(() => {});
    return clicar(p, /^(Atacar com|Não atacar)/);
  }
  if (titulo.includes('bloqueadores')) return clicar(p, /^Não bloquear/);
  const item = p.locator('.decisao .item:not([disabled])').first();
  if (await item.isVisible().catch(() => false)) {
    await item.click();
    if (await clicar(p, /^Confirmar/)) return true;
    return clicar(p, 'Nenhum');
  }
  for (const nome of ['Manter', 'Pagar automaticamente', 'Cancelar', /^Confirmar/, 'Nenhum']) if (await clicar(p, nome)) return true;
  return false;
}

async function turno(p: Page): Promise<number> {
  const t = (await p.locator('.turno-linha strong').textContent().catch(() => '')) ?? '';
  return Number(t.replace(/\D/g, '')) || 0;
}

/** todas as pessoas agem até a mesa chegar ao turno pedido */
async function jogarAte(pessoas: Page[], ate: number, limiteMs = 240000): Promise<void> {
  const fim = Date.now() + limiteMs;
  while (Date.now() < fim) {
    for (const p of pessoas) await agir(p);
    if ((await turno(pessoas[0])) >= ate) return;
    await pessoas[0].waitForTimeout(120);
  }
  throw new Error(`a partida não chegou ao turno ${ate} a tempo (está no ${await turno(pessoas[0])})`);
}

async function criarSala(anfitriao: Page, modo: '4p' | '1v1'): Promise<string> {
  if (modo === '1v1') await anfitriao.getByRole('button', { name: 'Um contra um' }).click();
  await anfitriao.locator('form').filter({ hasText: 'Criar sala' }).getByLabel('Senha da sala').fill('mesa-e2e');
  await anfitriao.getByRole('button', { name: 'Criar', exact: true }).click();
  await anfitriao.getByRole('heading', { name: 'Lugares' }).waitFor();
  return ((await anfitriao.locator('h1').textContent()) ?? '').replace('Sala ', '').trim();
}

async function entrarNaSala(p: Page, codigo: string): Promise<void> {
  const f = p.locator('form').filter({ hasText: 'Entrar numa sala' });
  await f.getByLabel('Código').fill(codigo);
  await f.getByLabel('Senha da sala').fill('mesa-e2e');
  await f.getByRole('button', { name: 'Entrar' }).click();
  await p.getByRole('heading', { name: 'Lugares' }).waitFor();
}

await subirServidor();
const nav = await chromium.launch();
try {
  // ------------------------------------------------ 1v1 entre duas pessoas
  const ana = await novaPessoa(nav, 'Ana');
  const codigo = await criarSala(ana, '1v1');
  const bruno = await novaPessoa(nav, 'Bruno');
  // senha errada não entra
  const f = bruno.locator('form').filter({ hasText: 'Entrar numa sala' });
  await f.getByLabel('Código').fill(codigo);
  await f.getByLabel('Senha da sala').fill('errada');
  await f.getByRole('button', { name: 'Entrar' }).click();
  await bruno.getByRole('alert').waitFor();
  verificar(await bruno.getByRole('alert').textContent().then((t) => t?.includes('senha')), 'senha errada da sala é recusada');
  await entrarNaSala(bruno, codigo);
  await ana.locator('.deck').nth(1).click();
  await bruno.locator('.deck').nth(4).click();
  await ana.waitForTimeout(300);
  await ana.getByRole('button', { name: 'Começar a partida' }).click();
  await Promise.all([ana.locator('.turno-linha').waitFor({ timeout: 30000 }), bruno.locator('.turno-linha').waitFor({ timeout: 30000 })]);
  verificar(true, 'as duas pessoas veem a partida começar');
  // cada um vê só a própria mão
  const maoAna = await ana.locator('.mao-cartas .carta').count();
  const maoBruno = await bruno.locator('.mao-cartas .carta').count();
  verificar(maoAna === 7 && maoBruno === 7, 'cada um vê as próprias 7 cartas');
  await jogarAte([ana, bruno], 4);
  verificar(true, 'a partida 1v1 chegou ao turno 4 pela interface');
  const antes = await turno(ana);
  // reinício do servidor no meio da partida
  await derrubarServidor();
  await ana.getByText('Reconectando ao servidor').waitFor({ timeout: 15000 });
  await subirServidor();
  await ana.getByText('Reconectando ao servidor').waitFor({ state: 'hidden', timeout: 30000 });
  await bruno.getByText('Reconectando ao servidor').waitFor({ state: 'hidden', timeout: 30000 });
  await ana.locator('.turno-linha').waitFor({ timeout: 15000 });
  verificar((await turno(ana)) === antes, `a partida voltou no mesmo turno (${antes}) depois do reinício`);
  await jogarAte([ana, bruno], antes + 2);
  verificar(true, 'a partida continua depois do reinício');
  await ana.screenshot({ path: join(SAIDA, '1v1-ana.png') });
  await bruno.screenshot({ path: join(SAIDA, '1v1-bruno.png') });
  // Bruno concede: Ana vence
  await bruno.getByRole('button', { name: 'Conceder' }).click();
  await bruno.locator('.modal').getByRole('button', { name: 'Conceder' }).click();
  await ana.getByText('Fim de partida').waitFor({ timeout: 15000 });
  verificar(await ana.getByText('Venceu: Ana.').isVisible(), '1v1 termina com a vitória de Ana');
  await bruno.getByText('Fim de partida').waitFor({ timeout: 15000 });
  verificar(await ana.getByRole('button', { name: 'Nova partida com a mesma mesa' }).isVisible(), 'quem criou a sala pode começar outra');
  await ana.context().close();
  await bruno.context().close();

  // ------------------------------------------------ quatro pessoas
  const nomes = ['Carla', 'Davi', 'Edu', 'Flor'];
  const pessoas: Page[] = [];
  for (const n of nomes) pessoas.push(await novaPessoa(nav, n));
  const cod4 = await criarSala(pessoas[0], '4p');
  for (const p of pessoas.slice(1)) await entrarNaSala(p, cod4);
  for (const [i, p] of pessoas.entries()) await p.locator('.deck').nth(i + 2).click();
  await pessoas[0].waitForTimeout(400);
  await pessoas[0].getByRole('button', { name: 'Começar a partida' }).click();
  for (const p of pessoas) await p.locator('.turno-linha').waitFor({ timeout: 30000 });
  verificar(true, 'as quatro pessoas veem a partida começar');
  await jogarAte(pessoas, 9, 420000);
  verificar(true, 'a partida de 4 chegou ao turno 9 pela interface');
  for (const [i, p] of pessoas.entries()) await p.screenshot({ path: join(SAIDA, `4p-${i}.png`) });
  // três concedem, uma de cada vez; os outros continuam (CR 800.4a)
  for (const p of pessoas.slice(1)) {
    await p.getByRole('button', { name: 'Conceder' }).click();
    await p.locator('.modal').getByRole('button', { name: 'Conceder' }).click();
    await p.locator('.area-eu .etiqueta.alerta').waitFor({ timeout: 10000 });
    for (const q of pessoas) await agir(q);
  }
  await pessoas[0].getByText('Fim de partida').waitFor({ timeout: 20000 });
  verificar(await pessoas[0].getByText('Venceu: Carla.').isVisible(), 'a partida de 4 termina com a vitória de quem sobrou');
  for (const p of pessoas.slice(1)) verificar(await p.getByText('Fim de partida').isVisible(), 'todos veem o fim da partida');
  console.log('\nTodas as verificações de ponta a ponta passaram.');
} catch (e) {
  for (const [i, p] of todas.entries()) {
    if (p.isClosed()) continue;
    await p.screenshot({ path: join(SAIDA, `falha-${i}.png`) }).catch(() => {});
    console.error(`[página ${i}] ${(await p.content().catch(() => '')).slice(0, 600)}`);
  }
  throw e;
} finally {
  await nav.close();
  servidor.kill();
}
