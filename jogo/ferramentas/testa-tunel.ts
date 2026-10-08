// Confere a mesa pelo endereço público: login com a senha, WebSocket com o cookie (cria uma sala e recebe a resposta)
// e WebSocket sem cookie recusado. Uso: node ferramentas/testa-tunel.ts <https://endereco> <senha>
import WebSocket from 'ws';

const [url, senha] = process.argv.slice(2);
if (!url || !senha) { console.log('uso: node ferramentas/testa-tunel.ts <https://endereco> <senha>'); process.exit(2); }

const r = await fetch(`${url}/api/entrar`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ senha }) });
const cookie = (r.headers.get('set-cookie') ?? '').split(';')[0];
console.log(`TESTE login (fetch): ${r.status === 200 && cookie.startsWith('sessao=')}`);

const wsUrl = url.replace(/^http/, 'ws') + '/ws';
function conecta(comCookie: boolean): Promise<string> {
  return new Promise((ok) => {
    const ws = new WebSocket(wsUrl, comCookie ? { headers: { cookie } } : {});
    const fim = setTimeout(() => { ws.terminate(); ok('tempo esgotado'); }, 20000);
    ws.on('open', () => ws.send(JSON.stringify({ t: 'criar', nome: 'Teste do túnel', senhaSala: 'teste-tunel', modo: '1v1' })));
    ws.on('message', (dados) => {
      const m = JSON.parse(String(dados));
      if (m.t === 'sala') { clearTimeout(fim); ws.close(); ok(`sala ${m.sala.codigo}`); }
    });
    ws.on('error', (e) => { clearTimeout(fim); ok(`erro: ${e.message}`); });
  });
}
const com = await conecta(true);
console.log(`TESTE WebSocket com cookie: ${com.startsWith('sala ')} (${com})`);
const sem = await conecta(false);
console.log(`TESTE WebSocket sem cookie recusado: ${sem.startsWith('erro')} (${sem})`);
process.exit(com.startsWith('sala ') && sem.startsWith('erro') ? 0 : 1);
