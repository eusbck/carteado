// Estado do cliente e conexão com o servidor (WebSocket com reconexão).
// O cliente nunca decide regras: só mostra a vista que o servidor manda e envia escolhas.

import { useEffect, useState } from 'preact/hooks';
import type { StopSettings } from '../../motor/autopass.ts';
import type { Answer, ManualAction } from '../../motor/types.ts';
import type { GameView } from '../../motor/view.ts';
import type { DeckCatalogo, DeckResumo, MsgChat, MsgCliente, MsgServidor, PedidoDesfazer, Posicoes, SalaPublica, TarefaPublica } from '../../servidor/protocolo.ts';
import { carregarCartas } from './cartas.ts';
import { auxiliosAtivos, preferencias } from './preferencias.ts';
import { tocar } from './sons.ts';
import { avatarGuardado } from './avatares.ts';

export interface Estado {
  fase: 'carregando' | 'entrada' | 'inicio' | 'decks' | 'sala';
  conectado: boolean;
  sala: SalaPublica | null;
  voce: number | null;
  vista: GameView | null;
  paradas: StopSettings | null;
  /** onde cada pessoa arrumou as próprias permanentes */
  posicoes: Posicoes;
  /** cartas que alguém mostrou da mão, por alguns segundos */
  reveladas: { id: number; de: number; def: string; para: number[] | 'todos' }[];
  erro: string | null;
  decks: DeckResumo[];
  /** decisão já respondida, esperando a próxima vista (evita clique duplo) */
  respondida: number | null;
  /** há jogada sua deste turno para desfazer */
  desfazivel: boolean;
  /** pedido de desfazer aberto, com a hora local em que expira */
  desfazer: (PedidoDesfazer & { ate: number }) | null;
  /** avisos curtos do servidor para a mesa */
  avisos: { id: number; texto: string }[];
  /** conta as recusas sem texto (auxílio de avisos desligado): a mesa treme o que você acabou de tocar */
  recusa: number;
  /** assento do bot que está pensando há mais de um segundo (a mesa mostra "Fulano está pensando…") */
  pensando: number | null;
  /** tela Decks: todos os decks da mesa (null até abrir a tela) */
  catalogo: DeckCatalogo[] | null;
  /** importação ou atualização de deck em andamento (de qualquer pessoa) */
  tarefaDeck: TarefaPublica | null;
  /** a tarefa que esta tela começou (a prévia e o resultado aparecem só para quem pediu) */
  minhaTarefa: number | null;
  /** o último estado dela: fica mesmo se outra pessoa começar outra importação logo depois */
  minhaTarefaEstado: TarefaPublica | null;
  /** chat da sala (as mensagens guardadas no servidor e as que chegaram depois) */
  chat: MsgChat[];
}

const CHAVE = 'commander-da-mesa:sala';

function salaGuardada(): { codigo: string; token: string } | null {
  try {
    const s = localStorage.getItem(CHAVE);
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}
function guardarSala(v: { codigo: string; token: string } | null): void {
  try {
    if (v) localStorage.setItem(CHAVE, JSON.stringify(v));
    else localStorage.removeItem(CHAVE);
  } catch { /* sem armazenamento: só não reconecta sozinho */ }
}

class Loja {
  e: Estado = { fase: 'carregando', conectado: false, sala: null, voce: null, vista: null, paradas: null, posicoes: {}, reveladas: [], erro: null, decks: [], respondida: null, desfazivel: false, desfazer: null, avisos: [], recusa: 0, pensando: null, catalogo: null, tarefaDeck: null, minhaTarefa: null, minhaTarefaEstado: null, chat: [] };
  private ouvintes = new Set<() => void>();
  private ws: WebSocket | null = null;
  private fila: MsgCliente[] = [];
  private tentativas = 0;
  private timerErro: ReturnType<typeof setTimeout> | null = null;
  private seqRevelada = 0;
  /** salas em que o retrato guardado neste navegador já foi mandado (uma vez por sala enquanto a página está aberta) */
  private avatarMandado = new Set<string>();

  mudar(p: Partial<Estado>): void {
    this.e = { ...this.e, ...p };
    for (const f of this.ouvintes) f();
  }
  assinar(f: () => void): () => void {
    this.ouvintes.add(f);
    return () => this.ouvintes.delete(f);
  }

  /** jogada que não pode: com o auxílio de avisos, o motivo; sem ele, só um tremido */
  recusar(motivo: string): void {
    if (this.avisosLigados()) this.erro(motivo);
    else this.mudar({ recusa: this.e.recusa + 1 });
  }

  avisosLigados(): boolean { return auxiliosAtivos(preferencias(), this.e.sala?.auxilios === 'proibidos').avisos; }

  erro(msg: string): void {
    this.mudar({ erro: msg });
    if (this.timerErro) clearTimeout(this.timerErro);
    this.timerErro = setTimeout(() => this.mudar({ erro: null }), 7000);
  }

  async iniciar(): Promise<void> {
    try {
      const r = await fetch('/api/sessao');
      const { ok } = await r.json();
      if (ok) await this.aposEntrar();
      else this.mudar({ fase: 'entrada' });
    } catch {
      this.mudar({ fase: 'entrada' });
      this.erro('Não foi possível falar com o servidor');
    }
  }

  async entrar(senha: string): Promise<void> {
    const r = await fetch('/api/entrar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ senha }) });
    if (!r.ok) {
      const { erro } = await r.json().catch(() => ({ erro: 'Não foi possível entrar' }));
      this.erro(erro);
      return;
    }
    await this.aposEntrar();
  }

  private async aposEntrar(): Promise<void> {
    const [decks] = await Promise.all([fetch('/api/decks').then((r) => r.json()), carregarCartas()]);
    this.mudar({ decks, fase: 'inicio' });
    this.conectar();
  }

  private conectar(): void {
    const ws = new WebSocket(`${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws`);
    this.ws = ws;
    ws.onopen = () => {
      this.tentativas = 0;
      this.mudar({ conectado: true });
      const s = salaGuardada();
      if (s) ws.send(JSON.stringify({ t: 'retomar', codigo: s.codigo, token: s.token } satisfies MsgCliente));
      for (const m of this.fila.splice(0)) ws.send(JSON.stringify(m));
    };
    ws.onmessage = (ev) => this.tratar(JSON.parse(String(ev.data)) as MsgServidor);
    ws.onclose = () => {
      this.ws = null;
      this.mudar({ conectado: false });
      const espera = Math.min(10000, 500 * 2 ** this.tentativas++);
      setTimeout(() => this.conectar(), espera);
    };
  }

  // ---------------------------------------------------------------- tela Decks

  async abrirDecks(): Promise<void> {
    this.mudar({ fase: 'decks' });
    await this.recarregarCatalogo();
  }

  voltarDoCatalogo(): void {
    const andando = this.e.minhaTarefaEstado?.estado === 'andando';
    // aberta pelo saguão: volta para a sala
    this.mudar({ fase: this.e.sala ? 'sala' : 'inicio', minhaTarefa: andando ? this.e.minhaTarefa : null, minhaTarefaEstado: andando ? this.e.minhaTarefaEstado : null });
  }

  /** guarda a tarefa de qualquer pessoa e, se for a desta tela, o estado dela */
  private tarefa(t: TarefaPublica | null): Partial<Estado> {
    return { tarefaDeck: t, ...(t && t.id === this.e.minhaTarefa ? { minhaTarefaEstado: t } : {}) };
  }

  async recarregarCatalogo(): Promise<void> {
    try {
      const r = await fetch('/api/catalogo');
      if (!r.ok) throw new Error(String(r.status));
      const { decks, tarefa } = await r.json() as { decks: DeckCatalogo[]; tarefa: TarefaPublica | null };
      this.mudar({ catalogo: decks, ...this.tarefa(tarefa) });
    } catch {
      this.erro('Não foi possível carregar os decks');
    }
  }

  /** começa uma busca no Moxfield: importar um link ou atualizar um deck da mesa */
  async buscarDeck(o: { link: string } | { id: string }): Promise<boolean> {
    const url = 'link' in o ? '/api/catalogo/importar' : `/api/catalogo/${encodeURIComponent(o.id)}/verificar`;
    return this.pedirTarefa(url, 'link' in o ? { link: o.link } : {});
  }

  confirmarDeck(token: string): Promise<boolean> {
    return this.pedirTarefa('/api/catalogo/confirmar', { token });
  }

  /** esquece a prévia ou o resultado da sua última tarefa (fechar a janela) */
  fecharTarefa(): void {
    this.mudar({ minhaTarefa: null, minhaTarefaEstado: null });
  }

  private async pedirTarefa(url: string, corpo: unknown): Promise<boolean> {
    try {
      const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(corpo) });
      const j = await r.json().catch(() => ({})) as { tarefa?: number; erro?: string };
      if (!r.ok || typeof j.tarefa !== 'number') { this.erro(j.erro ?? 'Não foi possível começar'); return false; }
      // o andamento pode ter chegado pelo WebSocket antes da resposta
      this.mudar({ minhaTarefa: j.tarefa, minhaTarefaEstado: this.e.tarefaDeck?.id === j.tarefa ? this.e.tarefaDeck : null });
      return true;
    } catch {
      this.erro('Não foi possível falar com o servidor');
      return false;
    }
  }

  enviar(m: MsgCliente): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify(m));
    else this.fila.push(m);
  }

  responder(decisao: number, resposta: Answer): void {
    if (this.e.respondida === decisao) return;
    this.enviar({ t: 'responder', decisao, resposta });
    this.mudar({ respondida: decisao });
  }
  manual(decisao: number, manual: ManualAction): void { this.responder(decisao, { kind: 'priority', action: 'manual', manual }); }

  private tratar(m: MsgServidor): void {
    switch (m.t) {
      case 'sala': {
        guardarSala({ codigo: m.sala.codigo, token: m.token });
        // o retrato escolhido antes (noutra sala) vale também nesta
        const meu = m.sala.assentos[m.voce];
        const guardado = avatarGuardado();
        if (guardado && meu?.tipo === 'humano' && (meu.avatar ?? null) !== guardado && !this.avatarMandado.has(m.sala.codigo)) {
          this.avatarMandado.add(m.sala.codigo);
          this.enviar({ t: 'avatar', avatar: guardado });
        }
        // a tela Decks aberta pelo saguão continua aberta enquanto a partida não começa (alguém entrou, trocou de deck…)
        this.mudar({ sala: m.sala, voce: m.voce, fase: this.e.fase === 'decks' && m.sala.estado !== 'jogando' ? 'decks' : 'sala', vista: m.sala.estado === 'espera' ? null : this.e.vista });
        break;
      }
      case 'jogo':
        this.mudar({
          vista: m.vista, paradas: m.paradas, posicoes: m.posicoes ?? {}, respondida: m.vista.decision?.id === this.e.respondida ? this.e.respondida : null,
          desfazivel: !!m.desfazivel, desfazer: m.desfazer ? { ...m.desfazer, ate: Date.now() + m.desfazer.restanteMs } : null,
        });
        break;
      case 'aviso': {
        const id = ++this.seqRevelada;
        this.mudar({ avisos: [...this.e.avisos, { id, texto: m.msg }].slice(-3) });
        setTimeout(() => this.mudar({ avisos: this.e.avisos.filter((a) => a.id !== id) }), 7000);
        break;
      }
      case 'revelada': {
        const id = ++this.seqRevelada;
        this.mudar({ reveladas: [...this.e.reveladas, { id, de: m.de, def: m.def, para: m.para }].slice(-3) });
        setTimeout(() => this.mudar({ reveladas: this.e.reveladas.filter((r) => r.id !== id) }), 8000);
        break;
      }
      case 'pensando':
        this.mudar({ pensando: m.assento });
        break;
      case 'chat': {
        if (m.tudo) { this.mudar({ chat: m.msgs }); break; }
        const vistas = new Set(this.e.chat.map((x) => x.id));
        const novas = m.msgs.filter((x) => !vistas.has(x.id));
        if (!novas.length) break;
        this.mudar({ chat: [...this.e.chat, ...novas].slice(-200) });
        if (novas.some((x) => x.de !== this.e.voce)) tocar('chat');
        break;
      }
      case 'decks':
        this.mudar({ decks: m.decks });
        break;
      case 'catalogo':
        this.mudar(this.tarefa(m.tarefa));
        if (this.e.catalogo && (m.mudou || (m.tarefa?.tipo === 'confirmar' && m.tarefa.estado !== 'andando'))) void this.recarregarCatalogo();
        break;
      case 'saiu':
        guardarSala(null);
        this.mudar({ sala: null, voce: null, vista: null, fase: 'inicio', chat: [] });
        break;
      case 'erro':
        // resposta a uma decisão que já mudou (clique atrasado): nada a avisar
        if (/já passou|Não é a sua vez de decidir/.test(m.msg)) { this.mudar({ respondida: null }); break; }
        if (/voltar à sala/.test(m.msg)) { guardarSala(null); this.mudar({ fase: 'inicio' }); }
        // resposta recusada pelo motor (falta mana, alvo que não vale…): na mesa real, sem explicação
        if (this.e.respondida !== null && !this.avisosLigados() && !/Erro interno/.test(m.msg)) { this.mudar({ respondida: null, recusa: this.e.recusa + 1 }); break; }
        this.mudar({ respondida: null });
        this.erro(m.msg);
        break;
    }
  }
}

export const loja = new Loja();

export function useLoja(): Estado {
  const [, forcar] = useState(0);
  const visto = loja.e;
  useEffect(() => {
    const desfazer = loja.assinar(() => forcar((x) => x + 1));
    // o estado pode ter mudado entre a renderização e a assinatura (o efeito roda depois)
    if (loja.e !== visto) forcar((x) => x + 1);
    return desfazer;
  }, []);
  return loja.e;
}
