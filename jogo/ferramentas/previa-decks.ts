// Prévia isolada. Não usa o banco, a compilação nem os arquivos gerados da mesa em 8080.
// Uso: node ferramentas/previa-decks.ts [porta mínima >= 8096]
import { spawn, execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createServer } from 'node:net';
import { join } from 'node:path';
import { RAIZ_JOGO } from '../servidor/catalogo/caminhos.ts';

const branch = execFileSync('git', ['branch', '--show-current'], { cwd: RAIZ_JOGO, encoding: 'utf8' }).trim();
if (!branch.startsWith('decks/')) throw new Error('A prévia deve ser iniciada na branch isolada decks/*');
if (!existsSync(join(RAIZ_JOGO, 'cliente', 'dist', 'index.html'))) throw new Error('Compile o cliente desta cópia: npm run cliente:build');
let porta = Number(process.argv[2] ?? 8096);
if (!Number.isInteger(porta) || porta < 8096 || porta > 65535) throw new Error('A porta mínima deve estar entre 8096 e 65535');
for (; porta <= 65535; porta++) {
  const livre = await new Promise<boolean>((ok) => {
    const s = createServer();
    s.once('error', () => ok(false));
    s.listen(porta, () => s.close(() => ok(true)));
  });
  if (livre) break;
}
if (porta > 65535) throw new Error('Nenhuma porta livre para a prévia');
const dados = join(RAIZ_JOGO, 'dados-previa');
mkdirSync(dados, { recursive: true });
// A senha fica no arquivo da prévia para consultar sem expor credenciais da mesa atual.
const senhaArquivo = join(dados, 'senha-acesso.txt');
if (!existsSync(senhaArquivo)) writeFileSync(senhaArquivo, 'previa-decks-local\n');
const senha = readFileSync(senhaArquivo, 'utf8').trim();
const servidor = spawn(process.execPath, ['servidor/index.ts'], {
  cwd: RAIZ_JOGO, stdio: 'inherit',
  env: { ...process.env, PORTA: String(porta), DADOS: dados, IMAGENS: join(RAIZ_JOGO, 'dados-locais', 'imagens'), ESTATICOS: join(RAIZ_JOGO, 'cliente', 'dist'), SENHA_ACESSO: senha, HTTPS: '0' },
});
console.log(`Prévia: http://127.0.0.1:${porta} — branch ${branch}; banco ${dados}`);
servidor.once('exit', (code) => { process.exitCode = code ?? 1; });
for (const signal of ['SIGINT', 'SIGTERM'] as const) process.once(signal, () => servidor.kill());
