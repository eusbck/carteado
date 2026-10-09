// Chat da sala, na barra lateral da mesa. As mensagens ficam guardadas com a sala no servidor: voltam ao
// reconectar e continuam numa partida nova com a mesma mesa. Enter envia; Esc sai do campo.

import { useLayoutEffect, useRef, useState } from 'preact/hooks';
import type { MsgChat } from '../../../servidor/protocolo.ts';
import { IconeEnviar } from '../icones.tsx';
import { loja } from '../loja.ts';

/** o mesmo limite do servidor (CHAT_TAMANHO em servidor/salas.ts) */
const TAMANHO = 280;
/** mensagens da mesma pessoa com menos que isto de intervalo ficam juntas, sem repetir o nome */
const JUNTAS_MS = 2 * 60 * 1000;

/** o que você estava escrevendo continua no campo se a barra recolher e abrir de novo */
let rascunho = '';

export const hora = (em: number) => new Date(em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

export function Chat({ msgs, eu, cor }: { msgs: MsgChat[]; eu: number; cor: (p: number) => string }) {
  const [texto, setTextoLocal] = useState(rascunho);
  const setTexto = (t: string) => { rascunho = t; setTextoLocal(t); };
  const lista = useRef<HTMLOListElement>(null);
  // segue a conversa enquanto você está no fim dela; quem subiu para ler fica onde está
  const noFim = useRef(true);
  useLayoutEffect(() => {
    const el = lista.current;
    if (el && noFim.current) el.scrollTop = el.scrollHeight;
  }, [msgs.length]);
  const rolou = () => {
    const el = lista.current;
    if (el) noFim.current = el.scrollHeight - el.scrollTop - el.clientHeight < 24;
  };
  const enviar = (ev: Event) => {
    ev.preventDefault();
    const t = texto.trim();
    if (!t) return;
    loja.enviar({ t: 'chat', texto: t });
    setTexto('');
    noFim.current = true;
  };
  return (
    <section class="chat" aria-label="Chat da mesa">
      <h2>Chat</h2>
      <ol ref={lista} onScroll={rolou} aria-live="polite">
        {msgs.length === 0 && <li class="chat-vazio">Nenhuma mensagem ainda. O que você escrever aqui todos na sala leem.</li>}
        {msgs.map((m, k) => {
          const ant = msgs[k - 1];
          const junta = !!ant && ant.de === m.de && ant.nome === m.nome && m.em - ant.em < JUNTAS_MS;
          return (
            <li key={m.id} class={`${junta ? 'junta' : ''} ${m.de === eu ? 'minha' : ''}`} title={hora(m.em)}>
              {!junta && <b class="chat-quem" style={{ color: cor(m.de) }}>{m.de === eu ? 'Você' : m.nome}</b>}
              <span class="chat-texto">{m.texto}</span>
            </li>
          );
        })}
      </ol>
      <form class="chat-escrever" onSubmit={enviar}>
        <input type="text" value={texto} maxLength={TAMANHO} placeholder="Escreva para a mesa…" aria-label="Mensagem para a mesa" autoComplete="off"
          onInput={(ev) => setTexto((ev.target as HTMLInputElement).value)}
          onKeyDown={(ev) => { if (ev.key === 'Escape') (ev.target as HTMLInputElement).blur(); }} />
        <button type="submit" class="chat-enviar" aria-label="Enviar" title="Enviar (Enter)" disabled={!texto.trim()}><IconeEnviar /></button>
      </form>
    </section>
  );
}
