// Pede ao Codex (ferramenta interna de imagens) as artes dos decks do Lula e do Bolsonaro, na ordem combinada:
// primeiro as cartas, depois os banners, por último os ícones. Os prompts ficam em ../artes-brasil/prompts.json.
//
//   node ferramentas/artes-brasil.mjs                 gera o que falta (duas de cada vez)
//   node ferramentas/artes-brasil.mjs cartas|banners|icones
//   node ferramentas/artes-brasil.mjs --lista         só mostra o que falta
//   node ferramentas/artes-brasil.mjs --refazer "Nome da carta"
//
// Cada arte de carta é guardada em ../artes-brasil/<slug>.webp (o PNG original fica ao lado, fora do Git). O que o
// gerador recusar vai para ../artes-brasil/pendencias.json e a carta segue com a arte provisória.
// Depois: node ferramentas/cartas-proprias.ts imagens

import { spawn } from 'node:child_process';
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const pasta = resolve(dirname(fileURLToPath(import.meta.url)), '../../artes-brasil');
const prompts = JSON.parse(readFileSync(join(pasta, 'prompts.json'), 'utf8'));
const slug = (s) => s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/'/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const args = process.argv.slice(2);
const refazer = args.includes('--refazer') ? args[args.indexOf('--refazer') + 1] : null;
const so = ['cartas', 'banners', 'icones'].filter((t) => args.includes(t));
const SIMULTANEAS = 2;

const FORMATO = {
  cartas: 'Formato paisagem 3:2 (1536x1024), cena inteira sem bordas.',
  banners: 'Formato paisagem 16:9 (de preferência 2048x1152), fundo opaco de ponta a ponta, personagem grande nos 55% centrais com a cabeça perto de x=50%, y=28%.',
  icones: 'Formato quadrado (1024x1024), PNG com canal alfa: fundo realmente transparente fora do busto, bordas limpas, legível a 80 pixels.',
};

/** [tipo, nome, arquivo de saída sem extensão] na ordem combinada */
function fila() {
  const itens = [];
  for (const tipo of ['cartas', 'banners', 'icones']) {
    if (so.length && !so.includes(tipo)) continue;
    for (const nome of Object.keys(prompts[tipo])) {
      const base = tipo === 'cartas' ? slug(nome) : `${slug(nome)}-${tipo === 'banners' ? 'banner' : 'icone'}`;
      itens.push({ tipo, nome, base });
    }
  }
  return itens;
}
const pronta = (i) => existsSync(join(pasta, `${i.base}.png`)) || existsSync(join(pasta, `${i.base}.webp`));

function codex(prompt) {
  return new Promise((ok) => {
    const p = spawn('codex', ['exec', '--skip-git-repo-check', '--sandbox', 'workspace-write', '-'], { cwd: pasta, shell: true, stdio: ['pipe', 'pipe', 'pipe'] });
    let saida = '';
    p.stdout.on('data', (d) => { saida += d; });
    p.stderr.on('data', (d) => { saida += d; });
    const limite = setTimeout(() => p.kill(), 12 * 60 * 1000);
    p.on('close', (codigo) => { clearTimeout(limite); ok({ codigo, saida }); });
    p.stdin.end(prompt);
  });
}

async function gerar(i) {
  const arq = `${i.base}.png`;
  const prompt = [
    `Use a sua ferramenta interna de geração de imagens (image_gen) para criar UMA ilustração e salve o PNG nesta pasta com o nome exato ${arq}.`,
    FORMATO[i.tipo], prompts.estilo, `Cena: ${prompts[i.tipo][i.nome]}.`,
    'Não use outra API, não baixe imagens prontas e não escreva código para desenhar. Se o gerador recusar, tente uma vez com uma descrição mais branda da mesma cena; se recusar de novo, não crie arquivo.',
    'Ao terminar, responda só com o caminho do arquivo salvo ou com o motivo da recusa.',
  ].join('\n');
  const inicio = Date.now();
  const r = await codex(prompt);
  const png = join(pasta, arq);
  if (!existsSync(png)) return { ...i, ok: false, motivo: r.saida.split('\n').filter((l) => l.trim()).slice(-6).join(' | ').slice(0, 600) };
  // cartas: WebP de 1200 px de largura para o repositório; banners e ícones ficam em PNG para o preparador das artes
  if (i.tipo === 'cartas') await sharp(png).resize({ width: 1200, withoutEnlargement: true }).webp({ quality: 88 }).toFile(join(pasta, `${i.base}.webp`));
  return { ...i, ok: true, segundos: Math.round((Date.now() - inicio) / 1000) };
}

if (refazer) for (const ext of ['png', 'webp']) rmSync(join(pasta, `${slug(refazer)}.${ext}`), { force: true });
const faltam = fila().filter((i) => !pronta(i));
if (args.includes('--lista')) {
  console.log(faltam.length ? faltam.map((i) => `${i.tipo}: ${i.nome}`).join('\n') : 'Nenhuma arte faltando.');
} else {
  const arqPend = join(pasta, 'pendencias.json');
  const pendencias = existsSync(arqPend) ? JSON.parse(readFileSync(arqPend, 'utf8')) : {};
  console.log(`${faltam.length} artes para gerar.`);
  let proxima = 0;
  const trabalhador = async () => {
    while (proxima < faltam.length) {
      const i = faltam[proxima++];
      const r = await gerar(i);
      if (r.ok) { delete pendencias[i.base]; console.log(`ok   ${i.tipo}: ${i.nome} (${r.segundos}s)`); }
      else { pendencias[i.base] = { tipo: i.tipo, nome: i.nome, motivo: r.motivo, em: new Date().toISOString() }; console.log(`FALHOU ${i.tipo}: ${i.nome} — ${r.motivo}`); }
      writeFileSync(arqPend, JSON.stringify(pendencias, null, 1) + '\n');
    }
  };
  await Promise.all(Array.from({ length: SIMULTANEAS }, trabalhador));
  console.log(`Fim. Pendências: ${Object.keys(pendencias).length}.`);
}
