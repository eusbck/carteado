// Erros automáticos do navegador: exceções e promessas rejeitadas que acontecem na página de qualquer jogador chegam
// sozinhas (sem ninguém apertar "Reportar erro") e são agrupadas por assinatura (a mensagem e o começo da pilha, sem
// os números que mudam a cada compilação). A área do desenvolvedor mostra quantas vezes cada um aconteceu, quando foi
// a primeira e a última, em quantos navegadores, e deixa marcar como resolvido (volta a abrir se acontecer de novo
// numa versão mais nova do servidor).

import { createHash } from 'node:crypto';
import type { Banco, ErroClienteGravado } from '../banco.ts';

export interface PedidoErroCliente {
  tipo: 'erro' | 'promessa';
  texto: string;
  pilha: string;
  tela: string;
  navegador: string;
}

const texto = (v: unknown, max: number) => (typeof v === 'string' ? v.slice(0, max) : '');

export function conferirErroCliente(b: unknown): PedidoErroCliente | null {
  if (!b || typeof b !== 'object') return null;
  const o = b as Record<string, unknown>;
  const t = texto(o.texto, 2000).trim();
  if (!t) return null;
  return {
    tipo: o.tipo === 'promessa' ? 'promessa' : 'erro',
    texto: t,
    pilha: texto(o.pilha, 6000),
    tela: texto(o.tela, 40),
    navegador: texto(o.navegador, 300),
  };
}

/** a assinatura: tipo, a primeira linha da mensagem e as 4 primeiras linhas da pilha, sem hash de arquivo, sem
 * números de linha/coluna e sem números soltos na mensagem (ids de objeto, índices) */
export function assinatura(p: Pick<PedidoErroCliente, 'tipo' | 'texto' | 'pilha'>): string {
  const msg = p.texto.split('\n')[0].replace(/\d+/g, '#');
  const pilha = p.pilha.split('\n').slice(0, 5)
    .map((l) => l.trim().replace(/https?:\/\/[^/\s)]+/g, '').replace(/-[A-Za-z0-9_]{8}\.js/g, '.js').replace(/:\d+:\d+/g, '').replace(/\?[^\s)]*/g, ''))
    .filter((l) => l && !l.startsWith(p.texto.split('\n')[0]))
    .join('|');
  return createHash('sha256').update(`${p.tipo}\n${msg}\n${pilha}`).digest('hex').slice(0, 16);
}

export class ErrosCliente {
  private banco: Banco;
  private versao: () => string | null;
  private porIp = new Map<string, number[]>();

  constructor(banco: Banco, versao: () => string | null) { this.banco = banco; this.versao = versao; }

  /** guarda um erro; false quando o endereço mandou erros demais na última hora (o navegador fica quieto) */
  receber(p: PedidoErroCliente, ip: string, agora = Date.now()): boolean {
    const l = (this.porIp.get(ip) ?? []).filter((t) => agora - t < 3600_000);
    if (l.length >= 120) return false;
    l.push(agora);
    this.porIp.set(ip, l);
    this.banco.registrarErroCliente({ assinatura: assinatura(p), ...p, em: agora, versao: this.versao() ?? '', ip: createHash('sha256').update(`ip:${ip}`).digest('hex').slice(0, 8) });
    return true;
  }

  listar(): ErroClienteGravado[] { return this.banco.errosCliente(); }
  marcar(assinatura: string, resolvido: boolean): boolean { return this.banco.marcarErroCliente(assinatura, resolvido); }
  apagar(assinatura: string): boolean { return this.banco.apagarErroCliente(assinatura); }
}
