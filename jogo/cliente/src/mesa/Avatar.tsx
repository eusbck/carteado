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
  /** o seu (embaixo, acima da mão) ou de um oponente (em cima) */
  local: boolean;
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
}

export function Avatar(p: AvatarProps) {
  const [estado, setEstado] = useState<'carregando' | 'pronto' | 'erro'>('carregando');
  const url = p.avatar?.url ?? null;
  const comImagem = !!url && estado !== 'erro';
  const classes = ['avatar', p.local ? 'avatar-local' : 'avatar-oponente', p.ativo ? 'ativo' : '', p.fora ? 'fora' : '', p.realce ? `avatar-${p.realce}` : '', comImagem && estado === 'pronto' ? 'pronto' : ''].filter(Boolean).join(' ');
  return (
    <div class={classes} data-avatar={p.avatar?.id ?? ''} data-jogador-avatar={p.jogador}
      style={{ '--tam': `${p.tamanho}px`, '--aura': p.avatar?.aura ?? p.cor, '--cor': p.cor }}>
      <span class="avatar-aura" aria-hidden="true" />
      <span class="avatar-fundo" aria-hidden="true" />
      {/* a inicial aparece enquanto o retrato carrega, ou se ele não existir */}
      {(!comImagem || estado === 'carregando') && <span class="avatar-inicial" aria-hidden="true">{(p.nome || '?').slice(0, 1).toUpperCase()}</span>}
      {comImagem && <img class="avatar-retrato avatar-dentro" src={url!} alt="" draggable={false} onLoad={() => setEstado('pronto')} onError={() => setEstado('erro')} />}
      <span class="avatar-anel" aria-hidden="true" />
      {comImagem && <img class="avatar-retrato avatar-fora" src={url!} alt="" draggable={false} aria-hidden="true" />}
      <button type="button" class="vida-n avatar-vida" onClick={p.onVida} disabled={!p.onVida} title="Vida" aria-label={`Vida de ${p.nome}: ${p.vida}`}>
        {p.vida}
      </button>
    </div>
  );
}
