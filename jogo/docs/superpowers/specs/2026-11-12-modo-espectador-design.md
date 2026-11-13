# Modo espectador — desenho curto (12/11/2026)

## Intenção
Amigos que têm o endereço da mesa, o código e a senha de uma sala podem entrar só para assistir. Nunca são
recusados: entram no saguão, no meio da partida ou depois dela.

## Metas
- Botão "Assistir" na tela inicial, ao lado de "Entrar": pede código, senha e nome; não ocupa assento.
- O espectador só vê a mesa: campo, pilha, cemitérios, exílio, zona de comando, vidas, contadores e registro públicos.
  Mãos, grimórios e cartas viradas para baixo ficam escondidos de todos (vista neutra do motor, `buildView(g, null)`).
- Um jogador fica embaixo da mesa; o espectador pode trocar qual.
- Ao cair a conexão, o espectador volta sozinho (token próprio, como os jogadores).
- Os jogadores veem no saguão e na mesa quem está assistindo.

## Não-metas
- Espectador não conversa no chat, não toma decisões, não pede desfazer, não muda nada da sala.
- Sem atraso de transmissão; sem espectador que vê mãos.

## Anti-metas
- Nenhum vazamento de informação escondida para o espectador (nem pela vista, nem pelo registro, nem pelos avisos
  de carta revelada a um jogador, nem pelo chat).
- Entrar como espectador não pode mudar assentos, anfitrião, estado da sala ou partida.

## Abordagens
1. **Conexão sem assento na sala (escolhida):** a `Conexao` ganha `espectador`; a sala guarda espectadores (nome e
   token) à parte dos assentos; `transmitir` manda `sala` + `jogo` com vista neutra; o roteamento recusa toda mensagem
   de jogo vinda de espectador. Usa o que o motor já tem (vista com observador nulo).
2. Assento "fantasma" extra marcado como espectador: mexeria em contagem de assentos, modo 1v1/4p, anfitrião e bots.
   Descartada.
3. Servidor separado de transmissão: grande demais para amigos numa mesa privada. Descartada.

## Decisões
- Protocolo: `assistir {codigo, senhaSala, nome}` e `retomar` aceitando o token de espectador; `sala` traz
  `espectadores: string[]`; a mensagem `sala` para o espectador traz `voce: null`.
- O espectador não recebe `chat` nem `revelada`; `pensando` e `aviso` são públicos e vão.
- Cliente: a mesa aceita `vista.you === null`; jogador de baixo escolhido pelo espectador (padrão: o anfitrião);
  sem mão, sem área de decisão, sem paradas, sem chat.

## Fica para quem constrói
- Onde mostrar "Assistindo: …" no saguão e na mesa; o visual do seletor de jogador de baixo.
- Teto de espectadores por sala (sugestão: 8) para não pesar o servidor.
