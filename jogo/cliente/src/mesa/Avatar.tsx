// Avatar de um jogador na mesa, no estilo de um medalhão de fantasia: aura na cor do retrato, moldura circular
// dourada, o retrato recortado no círculo com a cabeça passando por cima da moldura (duas cópias da mesma imagem:
// uma presa ao círculo, outra só com a parte de cima) e a vida num medalhão pequeno embaixo. A vida vem da vista da
// partida (não há outra fonte); o medalhão da vida tem a classe .vida-n, que os efeitos de dano e cura e as setas de
// ataque já usam. Só a vida recebe cliques (escolher o jogador como alvo): o resto não atrapalha as cartas.

import { useState } from 'preact/hooks';
import type { AvatarCliente } from '../avatares.ts';

export interface AvatarProps {
  jogador: number;
  avatar: AvatarCliente | null;
  vida: number;
  nome: string;
  /** no meio, na base (o saguão e a escolha do retrato); na mesa, todos ficam no canto de cima à direita */
  local: boolean;
  /** o seu retrato à esquerda, numa coluna acima do Comando (Configurações), em vez do canto de cima à direita */
  lugar?: 'esquerda';
  /** jogador do turno: aura mais forte, respirando */
  ativo?: boolean;
  /** saiu da partida: apagado */
  fora?: boolean;
  /** diâmetro da moldura, em px */
  tamanho: number;
  /** cor do jogador nesta tela (usada quando não há retrato) */
  cor: string;
  /** clicar na vida (escolher o jogador como alvo de ataque ou de um efeito) */
  onVida?: () => void;
  realce?: 'escolhivel' | 'escolhido' | null;
  /** sempre o retrato de 512 px (a janela de escolha); sem isso, o navegador escolhe pelo tamanho na tela */
  retratoGrande?: boolean;
}

/** o retrato é desenhado com 118% do diâmetro da moldura (.avatar-retrato no estilo.css) */
const RETRATO = 1.18;

export function Avatar(p: AvatarProps) {
  const url = p.avatar?.url ?? null;
  // o estado vale para a imagem que carregou: trocar de retrato (outro endereço) volta a "carregando". Antes ele ficava
  // no estado da imagem anterior, e um retrato que tinha falhado nunca mais aparecia, nem trocando por outro
  const [carga, setCarga] = useState<{ url: string; estado: 'pronto' | 'erro' } | null>(null);
  const estado = carga && carga.url === url ? carga.estado : 'carregando';
  const comImagem = !!url && estado !== 'erro';
  // na mesa e no saguão, o de 256 px enquanto ele cobrir o tamanho na tela vezes a densidade (até o dobro, no maior
  // medalhão da mesa); acima disso, o de 512
  const mesa = !p.retratoGrande && p.avatar?.urlMesa ? { srcset: `${p.avatar.urlMesa} 256w, ${url} 512w`, sizes: `${Math.round(p.tamanho * RETRATO)}px` } : {};
  const classes = ['avatar', p.local ? 'avatar-local' : 'avatar-oponente', p.lugar === 'esquerda' ? 'avatar-esquerda' : '', p.ativo ? 'ativo' : '', p.fora ? 'fora' : '', p.realce ? `avatar-${p.realce}` : '', comImagem && estado === 'pronto' ? 'pronto' : ''].filter(Boolean).join(' ');
  return (
    <div class={classes} data-avatar={p.avatar?.id ?? ''} data-jogador-avatar={p.jogador}
      style={{ '--tam': `${p.tamanho}px`, '--aura': p.avatar?.aura ?? p.cor, '--cor': p.cor }}>
      <span class="avatar-aura" aria-hidden="true" />
      <span class="avatar-fundo" aria-hidden="true" />
      {/* a inicial aparece enquanto o retrato carrega, ou se ele não existir */}
      {(!comImagem || estado === 'carregando') && <span class="avatar-inicial" aria-hidden="true">{(p.nome || '?').slice(0, 1).toUpperCase()}</span>}
      {comImagem && <img class="avatar-retrato avatar-dentro" src={url!} {...mesa} alt="" draggable={false} onLoad={() => setCarga({ url: url!, estado: 'pronto' })} onError={() => setCarga({ url: url!, estado: 'erro' })} />}
      <span class="avatar-anel" aria-hidden="true" />
      {comImagem && <img class="avatar-retrato avatar-fora" src={url!} {...mesa} alt="" draggable={false} aria-hidden="true" />}
      <button type="button" class="vida-n avatar-vida" onClick={p.onVida} disabled={!p.onVida} title="Vida" aria-label={`Vida de ${p.nome}: ${p.vida}`}>
        {p.vida}
      </button>
    </div>
  );
}
