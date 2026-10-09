// Retratos dos jogadores no cliente: as imagens (imagens/avatares/<id>.webp) ligadas ao catálogo do servidor, o
// retrato que vale para cada assento e a escolha guardada neste navegador (reenviada ao entrar numa sala).

import { AVATARES, avatarDoComandante, type Avatar } from '../../servidor/avatares.ts';

const IMAGENS = import.meta.glob<string>('./imagens/avatares/*.webp', { eager: true, query: '?url', import: 'default' });

export interface AvatarCliente extends Avatar { url: string | null }

export const CATALOGO: AvatarCliente[] = AVATARES.map((a) => ({ ...a, url: IMAGENS[`./imagens/avatares/${a.id}.webp`] ?? null }));

export const avatarPorId = (id: string | null | undefined): AvatarCliente | null => (id ? CATALOGO.find((a) => a.id === id) ?? null : null);

/** o retrato de um assento: o escolhido, ou o do comandante do deck dele */
export function avatarDoAssento(escolhido: string | null | undefined, comandante: string | null | undefined): AvatarCliente | null {
  return avatarPorId(escolhido) ?? avatarPorId(avatarDoComandante(comandante));
}

const CHAVE = 'commander-da-mesa:avatar';
export function avatarGuardado(): string | null {
  try { return localStorage.getItem(CHAVE); } catch { return null; }
}
export function guardarAvatar(id: string | null): void {
  try { if (id) localStorage.setItem(CHAVE, id); else localStorage.removeItem(CHAVE); } catch { /* sem armazenamento: vale até fechar a página */ }
}
