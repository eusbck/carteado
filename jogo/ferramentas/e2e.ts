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
const PORTA = Number(process.env.PORTA_E2E ?? 8092);
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
  ctx.setDefaultTimeout(20000);
  // todos os auxílios ligados (fase 8): o roteiro acha as jogadas pelo brilho e paga automaticamente
  await ctx.addInitScript(() => {
    if (!sessionStorage.getItem('e2e:prefs')) {
      sessionStorage.setItem('e2e:prefs', '1');
      localStorage.setItem('commander-da-mesa:preferencias', JSON.stringify({ nivel: 'personalizado', personalizado: { jogaveis: true, alvos: true, terrenos: true, avisos: true, pagarAuto: true } }));
    }
  });
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
  // tela inicial em passos: o nome primeiro, depois a escolha entre criar e entrar numa sala
  await p.getByLabel('Seu nome na mesa').fill(nome);
  await p.getByRole('button', { name: 'Continuar' }).click();
  await p.getByText(`Olá, ${nome}`).waitFor();
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

/** clica numa carta da mão com brilho e escolhe a ação do menu que combina com o texto */
async function jogarDaMao(p: Page, acao: RegExp): Promise<boolean> {
  const cartas = p.locator('.mao-cartas .carta.realce-acao');
  const n = await cartas.count();
  for (let i = 0; i < n; i++) {
    // no leque, cada carta fica coberta pela vizinha da direita: clica na borda esquerda
    await cartas.nth(i).click({ position: { x: 8, y: 40 }, timeout: 3000 }).catch(() => {});
    const b = p.locator('.menu-acoes button').filter({ hasText: acao }).first();
    if (await b.isVisible().catch(() => false)) { await b.click(); return true; }
    await p.locator('.menu-acoes').getByRole('button', { name: 'Cancelar' }).click({ timeout: 3000 }).catch(() => {});
  }
  return false;
}

/**
 * a abertura (VS) cobre a mesa por uns 4 s quando a partida começa. Devolve se ela apareceu nesta página (a marca
 * fica na sessão do navegador ao abrir) e, se ainda estiver na tela, pula com um clique ou com Esc.
 */
async function pularAbertura(p: Page, como: 'clique' | 'esc'): Promise<boolean> {
  const viu = await p.evaluate(() => Object.keys(sessionStorage).some((k) => k.startsWith('commander-da-mesa:vs:')));
  const vs = p.locator('.abertura');
  if (await vs.isVisible().catch(() => false)) {
    if (como === 'clique') await vs.click();
    else await p.keyboard.press('Escape');
    await vs.waitFor({ state: 'detached', timeout: 5000 });
  }
  return viu;
}

/** uma ação simples para a decisão pendente da pessoa (se houver); devolve true se agiu */
async function agir(p: Page): Promise<boolean> {
  if (await p.getByText('Você tem prioridade').isVisible().catch(() => false)) {
    if (await jogarDaMao(p, /^Jogar /)) return true;
    if (Math.random() < 0.5 && await jogarDaMao(p, /^Conjurar: /)) return true;
    return clicar(p, 'Passar');
  }
  // mão inicial: fica com as sete
  if (await p.locator('.tela-mulligan').isVisible().catch(() => false)) return clicar(p, 'Manter');
  // combate e pagamento ficam na coluna da direita; as escolhas, na janela do meio da mesa (fase 9)
  const painel = p.locator('.coluna-dir .decisao, .janela-escolha').first();
  if (!(await painel.isVisible().catch(() => false))) return false;
  const titulo = (await p.locator('.coluna-dir .decisao-titulo, .janela-escolha .decisao-titulo').first().textContent().catch(() => '')) ?? '';
  // painéis de combate da fase 8 ("Ataque" e "Bloqueio"); com os auxílios ligados, a lista tem um botão por alvo
  if (titulo.includes('Ataque')) {
    const linhas = p.locator('.decisao .linha');
    const n = await linhas.count();
    for (let i = 0; i < n; i++) await linhas.nth(i).locator('button').first().click().catch(() => {});
    return clicar(p, /^(Confirmar ataque|Não atacar)/);
  }
  if (titulo.includes('Bloqueio')) return clicar(p, /^Não bloquear/);
  const item = p.locator('.janela-escolha .item:not([disabled])').first();
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

/** escreve no chat da barra lateral e envia com Enter */
async function escrever(p: Page, texto: string): Promise<void> {
  const campo = p.getByLabel('Mensagem para a mesa');
  await campo.fill(texto);
  await campo.press('Enter');
}

async function criarSala(anfitriao: Page, modo: '4p' | '1v1'): Promise<string> {
  await anfitriao.getByRole('button', { name: /^Criar sala/ }).click();
  if (modo === '1v1') await anfitriao.getByRole('button', { name: 'Um contra um' }).click();
  await anfitriao.locator('form').filter({ hasText: 'Criar sala' }).getByLabel('Senha da sala').fill('mesa-e2e');
  await anfitriao.getByRole('button', { name: 'Criar', exact: true }).click();
  await anfitriao.locator('.lugares').waitFor();
  return ((await anfitriao.locator('h1').textContent()) ?? '').replace('Sala ', '').trim();
}

async function entrarNaSala(p: Page, codigo: string): Promise<void> {
  const f = p.locator('form').filter({ hasText: 'Entrar numa sala' });
  // depois de uma senha errada a pessoa continua no passo de entrar
  if (!(await f.isVisible())) await p.getByRole('button', { name: /^Entrar numa sala/ }).click();
  await f.getByLabel('Código').fill(codigo);
  await f.getByLabel('Senha da sala').fill('mesa-e2e');
  await f.getByRole('button', { name: 'Entrar' }).click();
  await p.locator('.lugares').waitFor();
}

/** saguão em passos: o anfitrião passa dos lugares para as regras e das regras para os decks */
async function irParaDecks(anfitriao: Page): Promise<void> {
  await anfitriao.getByRole('button', { name: 'Continuar para as regras' }).click();
  await anfitriao.getByRole('button', { name: 'Continuar para os decks' }).click();
  await anfitriao.locator('.saguao-decks').waitFor();
}

/** escolhe um deck pela prévia (clicar no deck abre a lista de cartas, com o botão de escolher) */
async function escolherDeck(p: Page, n: number): Promise<void> {
  await p.locator('.saguao-decks').waitFor();
  await p.locator('.deck').nth(n).click();
  await p.getByRole('button', { name: 'Escolher este deck' }).click();
  await p.locator('.previa-deck').waitFor({ state: 'detached' });
}

await subirServidor();
const nav = await chromium.launch();
try {
  // ------------------------------------------------ 1v1 entre duas pessoas
  const ana = await novaPessoa(nav, 'Ana');
  const codigo = await criarSala(ana, '1v1');
  const bruno = await novaPessoa(nav, 'Bruno');
  // senha errada não entra
  await bruno.getByRole('button', { name: /^Entrar numa sala/ }).click();
  const f = bruno.locator('form').filter({ hasText: 'Entrar numa sala' });
  await f.getByLabel('Código').fill(codigo);
  await f.getByLabel('Senha da sala').fill('errada');
  await f.getByRole('button', { name: 'Entrar' }).click();
  await bruno.getByRole('alert').waitFor();
  verificar(await bruno.getByRole('alert').textContent().then((t) => t?.includes('senha')), 'senha errada da sala é recusada');
  await entrarNaSala(bruno, codigo);
  // saguão em passos: Bruno acompanha o anfitrião escolher as regras, e cada um escolhe o deck pela prévia
  await ana.getByRole('button', { name: 'Continuar para as regras' }).click();
  await bruno.getByText('O anfitrião está escolhendo as regras.').waitFor({ timeout: 10000 });
  await ana.getByRole('radio', { name: /^Livre/ }).click();
  await bruno.getByRole('radio', { name: /^Livre/, checked: true }).waitFor({ timeout: 10000 });
  verificar(await bruno.getByRole('radio', { name: /^Londres/ }).isDisabled(), 'quem não criou a sala acompanha as regras sem poder mudar');
  await ana.getByRole('radio', { name: /^Londres/ }).click();
  await ana.getByRole('button', { name: 'Continuar para os decks' }).click();
  await escolherDeck(ana, 1);
  await bruno.locator('.deck').nth(4).click();
  await bruno.locator('.previa-grupo').first().waitFor({ timeout: 10000 });
  verificar((await bruno.locator('.previa-grupo li').count()) > 20 && (await bruno.locator('.previa-topo-linha').textContent())?.includes('100 cartas'), 'a prévia do deck mostra as 100 cartas separadas por tipo');
  await bruno.getByRole('button', { name: 'Escolher este deck' }).click();
  await ana.waitForTimeout(300);
  await ana.getByRole('button', { name: 'Começar a partida' }).click();
  // a abertura (VS) aparece junto com a mesa, antes da mão inicial
  await ana.locator('.abertura').waitFor({ timeout: 30000 });
  const nomesVS = await ana.locator('.abertura .vs-nome b').allTextContents();
  verificar(nomesVS.length === 2 && nomesVS[0] === 'Ana' && nomesVS.includes('Bruno'), 'a tela VS mostra os dois jogadores, você primeiro');
  await Promise.all([ana.locator('.turno-linha').waitFor({ timeout: 30000 }), bruno.locator('.turno-linha').waitFor({ timeout: 30000 })]);
  verificar(true, 'as duas pessoas veem a partida começar');
  const viramVS = await Promise.all([pularAbertura(ana, 'clique'), pularAbertura(bruno, 'esc')]);
  verificar(viramVS.every(Boolean), 'a VS aparece para as duas pessoas; clicar ou apertar Esc pula');
  // cada um vê só a própria mão
  const maoAna = await ana.locator('.mao-cartas .carta').count();
  const maoBruno = await bruno.locator('.mao-cartas .carta').count();
  verificar(maoAna === 7 && maoBruno === 7, 'cada um vê as próprias 7 cartas');
  // chat: Ana escreve e Bruno lê na barra
  await escrever(ana, 'oi Bruno, boa partida');
  await bruno.locator('.chat li', { hasText: 'oi Bruno, boa partida' }).waitFor({ timeout: 10000 });
  verificar(await bruno.locator('.chat .chat-quem', { hasText: 'Ana' }).isVisible() && await ana.locator('.chat .chat-quem', { hasText: 'Você' }).isVisible(), 'o chat chega ao outro navegador com o nome de quem escreveu');
  // com a barra recolhida, a mensagem nova aparece por uns segundos e conta no botão de abrir
  await bruno.getByRole('button', { name: 'Recolher a barra' }).click();
  await escrever(ana, 'tudo certo aí?');
  await bruno.locator('.aviso-chat', { hasText: 'tudo certo aí?' }).waitFor({ timeout: 10000 });
  verificar((await bruno.locator('.nao-lidas').textContent()) === '1', 'com a barra recolhida, a mensagem nova aparece na mesa e conta no botão de abrir');
  // (a janela da mão inicial cobre a mesa e o aviso, mas não a barra lateral)
  await bruno.getByRole('button', { name: 'Abrir a barra' }).click();
  await bruno.locator('.chat li', { hasText: 'tudo certo aí?' }).waitFor({ timeout: 5000 });
  verificar(!(await bruno.locator('.nao-lidas').isVisible()) && !(await bruno.locator('.aviso-chat').isVisible()), 'abrir a barra mostra a mensagem no chat, zera a contagem e tira o aviso da mesa');
  await jogarAte([ana, bruno], 4);
  verificar(true, 'a partida 1v1 chegou ao turno 4 pela interface');
  // o turno só é lido com a mesa esperando uma pessoa decidir: com passes automáticos em andamento,
  // a partida podia virar o turno entre a leitura e o reinício
  for (let k = 0; k < 150; k++) {
    let esperando = false;
    for (const p of [ana, bruno]) if (await p.getByText(/Você tem prioridade|Sua vez de decidir/).first().isVisible().catch(() => false)) esperando = true;
    if (esperando) break;
    await ana.waitForTimeout(100);
  }
  await ana.waitForTimeout(400);
  const antes = await turno(ana);
  // reinício do servidor no meio da partida
  await derrubarServidor();
  await ana.getByText('Reconectando ao servidor').waitFor({ timeout: 15000 });
  await subirServidor();
  await ana.getByText('Reconectando ao servidor').waitFor({ state: 'hidden', timeout: 30000 });
  await bruno.getByText('Reconectando ao servidor').waitFor({ state: 'hidden', timeout: 30000 });
  await ana.locator('.turno-linha').waitFor({ timeout: 15000 });
  verificar((await turno(ana)) === antes, `a partida voltou no mesmo turno (${antes}) depois do reinício`);
  verificar((await bruno.locator('.chat li').allTextContents()).join(' | ').includes('tudo certo aí?'), 'a conversa do chat volta depois do reinício do servidor');
  await jogarAte([ana, bruno], antes + 2);
  verificar(true, 'a partida continua depois do reinício');
  await ana.screenshot({ path: join(SAIDA, '1v1-ana.png') });
  await bruno.screenshot({ path: join(SAIDA, '1v1-bruno.png') });
  // Bruno concede: Ana vence
  await bruno.getByRole('button', { name: 'Conceder' }).click();
  await bruno.locator('.janela-caixa').getByRole('button', { name: 'Conceder' }).click();
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
  await irParaDecks(pessoas[0]);
  for (const [i, p] of pessoas.entries()) await escolherDeck(p, i + 2);
  await pessoas[0].waitForTimeout(400);
  await pessoas[0].getByRole('button', { name: 'Começar a partida' }).click();
  await pessoas[0].locator('.abertura').waitFor({ timeout: 30000 });
  verificar((await pessoas[0].locator('.abertura .vs-lado').count()) === 4, 'a VS de quatro jogadores tem uma faixa para cada um');
  for (const p of pessoas) await p.locator('.turno-linha').waitFor({ timeout: 30000 });
  verificar(true, 'as quatro pessoas veem a partida começar');
  verificar((await Promise.all(pessoas.map((p) => pularAbertura(p, 'clique')))).every(Boolean), 'as quatro pessoas veem a VS');
  await jogarAte(pessoas, 9, 420000);
  verificar(true, 'a partida de 4 chegou ao turno 9 pela interface');
  for (const [i, p] of pessoas.entries()) await p.screenshot({ path: join(SAIDA, `4p-${i}.png`) });
  // três concedem, uma de cada vez; os outros continuam (CR 800.4a)
  for (const p of pessoas.slice(1)) {
    await p.getByRole('button', { name: 'Conceder' }).click();
    await p.locator('.janela-caixa').getByRole('button', { name: 'Conceder' }).click();
    await p.locator('.area-eu .etiqueta.alerta').waitFor({ timeout: 10000 });
    for (const q of pessoas) await agir(q);
  }
  await pessoas[0].getByText('Fim de partida').waitFor({ timeout: 20000 });
  verificar(await pessoas[0].getByText('Venceu: Carla.').isVisible(), 'a partida de 4 termina com a vitória de quem sobrou');
  for (const p of pessoas.slice(1)) verificar(await p.getByText('Fim de partida').isVisible(), 'todos veem o fim da partida');
  for (const p of pessoas) await p.context().close();

  // ------------------------------------------------ uma pessoa e três bots
  const gil = await novaPessoa(nav, 'Gil');
  await criarSala(gil, '4p');
  for (let i = 1; i < 4; i++) {
    await gil.getByRole('button', { name: `Pôr bot no lugar ${i + 1}` }).click();
    await gil.locator('.lugar').nth(i).getByText('bot', { exact: true }).waitFor({ timeout: 10000 });
  }
  await irParaDecks(gil);
  await escolherDeck(gil, 0);
  await gil.waitForTimeout(300);
  await gil.getByRole('button', { name: 'Começar a partida' }).click();
  await gil.locator('.turno-linha').waitFor({ timeout: 30000 });
  verificar(true, 'a partida de uma pessoa com três bots começa');
  verificar(await pularAbertura(gil, 'esc'), 'a VS aparece também na partida contra bots');
  await jogarAte([gil], 9, 900000);
  verificar(true, 'a partida com uma pessoa e três bots chegou ao turno 9 pela interface');
  // o registro abre numa janela do menu, como Paradas e Configurações
  await gil.getByRole('button', { name: 'Registro', exact: true }).click();
  const registro = (await gil.locator('.registro-lista').textContent({ timeout: 10000 })) ?? '';
  await gil.keyboard.press('Escape');
  verificar(/Bot \d|joga |conjura /.test(registro) && (registro.match(/ joga /g) ?? []).length >= 3, 'os bots jogaram terrenos e mágicas pela vez deles');
  verificar((await gil.locator('.mao-cartas .carta').count()) > 0 && !(await gil.getByText('Erro interno do motor').isVisible().catch(() => false)), 'a pessoa continua vendo a própria mão e nenhum erro do motor apareceu');
  await gil.screenshot({ path: join(SAIDA, 'bots-gil.png') });
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
