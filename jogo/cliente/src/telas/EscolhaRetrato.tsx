// Escolha do retrato (avatar) de quem joga, no saguão: os nove retratos e a opção automática (o do comandante do
// deck). A escolha vai para o servidor (todos veem) e fica guardada neste navegador, para as próximas salas.

import { Janela } from '../Janela.tsx';
import { CATALOGO, guardarAvatar } from '../avatares.ts';
import { loja } from '../loja.ts';
import { Avatar } from '../mesa/Avatar.tsx';

export function EscolhaRetrato({ atual, nome, cor, fechar }: { atual: string | null; nome: string; cor: string; fechar: () => void }) {
  const escolher = (id: string | null) => {
    guardarAvatar(id);
    loja.enviar({ t: 'avatar', avatar: id });
    fechar();
  };
  return (
    <Janela titulo="Escolha seu retrato" classe="retratos-janela" fechar={fechar}>
      <div class="retratos">
        {CATALOGO.map((a) => (
          <button key={a.id} type="button" class={`retrato-opcao ${atual === a.id ? 'ativo' : ''}`} aria-pressed={atual === a.id} onClick={() => escolher(a.id)}>
            <Avatar jogador={-1} avatar={a} vida={0} nome={a.nome} local tamanho={84} cor={cor} />
            <b>{a.nome}</b>
            <small>{a.deck}</small>
          </button>
        ))}
        <div class="retrato-auto">
          <span class="suave">Sem escolher, {nome || 'você'} usa o retrato do comandante do deck (se ele tiver um).</span>
          <button type="button" class={`botao ${atual === null ? 'ativo' : ''}`} onClick={() => escolher(null)}>Usar o do comandante</button>
        </div>
      </div>
    </Janela>
  );
}
