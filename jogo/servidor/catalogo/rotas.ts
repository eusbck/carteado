// Rotas HTTP da tela Decks (todas exigem a sessão do servidor, conferida em servidor/index.ts):
//   GET  /api/catalogo                     decks da mesa (jogáveis e em preparação) e a tarefa em andamento
//   POST /api/catalogo/importar {link}     começa a buscar um deck pelo link (um link que já está na mesa atualiza)
//   POST /api/catalogo/<id>/verificar      começa a buscar de novo um deck da mesa (Atualizar)
//   POST /api/catalogo/confirmar {token}   confirma a prévia
//   GET  /api/catalogo/<id>/cartas         a lista atual de um deck (prévia no saguão)
// A busca roda em segundo plano: a resposta traz o número da tarefa, e o andamento e a prévia chegam pelo
// WebSocket (`catalogo`). Respostas longas pela rota esbarrariam no prazo do túnel.

import type { Catalogo, InfoDisco } from './catalogo.ts';
import { lerLink } from './moxfield.ts';
import { ErroOcupado, mensagem, type TarefasDecks } from './tarefas.ts';

export interface RespostaRota { status: number; corpo: unknown }

/** quantas buscas cada endereço pode começar por janela de 10 minutos */
const LIMITE = 20;
const JANELA = 10 * 60_000;

export class RotasCatalogo {
  private catalogo: Catalogo;
  private tarefas: TarefasDecks;
  private info: InfoDisco;
  private pedidos = new Map<string, number[]>();

  constructor(o: { catalogo: Catalogo; tarefas: TarefasDecks; info: InfoDisco }) {
    this.catalogo = o.catalogo;
    this.tarefas = o.tarefas;
    this.info = o.info;
  }

  /** null: não é uma rota do catálogo */
  tratar(metodo: string, caminho: string, corpo: string, ip: string): RespostaRota | null {
    if (caminho === '/api/catalogo' && metodo === 'GET') {
      return { status: 200, corpo: { decks: this.catalogo.publico(this.info), tarefa: this.tarefas.tarefa } };
    }
    if (!caminho.startsWith('/api/catalogo/')) return null;
    const lista = caminho.match(/^\/api\/catalogo\/([^/]+)\/cartas$/);
    if (lista && metodo === 'GET') {
      const l = /^[A-Za-z0-9_-]{8,40}$/.test(lista[1]) ? this.catalogo.lista(lista[1], this.info) : null;
      return l ? { status: 200, corpo: l } : { status: 404, corpo: { erro: 'Deck desconhecido' } };
    }
    if (metodo !== 'POST') return { status: 405, corpo: { erro: 'Método não permitido' } };
    let dados: Record<string, unknown> = {};
    try { dados = corpo ? JSON.parse(corpo) : {}; } catch { return { status: 400, corpo: { erro: 'Pedido inválido' } }; }

    try {
      if (caminho === '/api/catalogo/importar') {
        const link = String(dados.link ?? '');
        if (!lerLink(link)) return { status: 400, corpo: { erro: 'Cole o link de um deck do Moxfield (https://moxfield.com/decks/...)' } };
        if (this.muitos(ip)) return { status: 429, corpo: { erro: 'Muitas buscas seguidas; espere alguns minutos' } };
        return { status: 202, corpo: { tarefa: this.tarefas.iniciarVerificar(link) } };
      }
      if (caminho === '/api/catalogo/confirmar') {
        const token = String(dados.token ?? '');
        if (!/^[A-Za-z0-9_-]{8,64}$/.test(token)) return { status: 400, corpo: { erro: 'Pedido inválido' } };
        return { status: 202, corpo: { tarefa: this.tarefas.iniciarConfirmar(token) } };
      }
      const m = caminho.match(/^\/api\/catalogo\/([A-Za-z0-9_-]{8,40})\/verificar$/);
      if (m) {
        const d = this.catalogo.ler(m[1]);
        if (!d) return { status: 404, corpo: { erro: 'Deck desconhecido' } };
        if (this.muitos(ip)) return { status: 429, corpo: { erro: 'Muitas buscas seguidas; espere alguns minutos' } };
        return { status: 202, corpo: { tarefa: this.tarefas.iniciarVerificar(d.link) } };
      }
    } catch (e) {
      return { status: e instanceof ErroOcupado ? 409 : 500, corpo: { erro: mensagem(e) } };
    }
    return { status: 404, corpo: { erro: 'Rota desconhecida' } };
  }

  private muitos(ip: string): boolean {
    const agora = Date.now();
    const l = (this.pedidos.get(ip) ?? []).filter((t) => agora - t < JANELA);
    l.push(agora);
    this.pedidos.set(ip, l);
    return l.length > LIMITE;
  }
}
