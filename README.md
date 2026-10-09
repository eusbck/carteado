# Magic Commander

Jogo de Magic: The Gathering no formato Commander, online e privado, para o nosso grupo. O servidor
aplica as regras, e os lugares vazios podem receber bots. Este repositório traz tudo o que é preciso
para jogar: o jogo, os decks com as imagens das cartas, as regras oficiais e o guia de estudo.

## Entrar numa mesa que alguém abriu

Não precisa instalar nada nem baixar este repositório. Quem abriu a mesa manda um endereço
`https://….trycloudflare.com` e a senha de acesso. Basta abrir o endereço no navegador.

## Abrir a mesa no seu computador (Windows)

1. **Baixe o repositório** (só na primeira vez; são cerca de 1,1 GB, quase tudo imagens de cartas).
   O repositório é privado: aceite antes o convite do dono no GitHub.
   - Mais fácil: instale o [GitHub Desktop](https://desktop.github.com), entre com a sua conta e use
     *File → Clone repository*.
   - Ou, com o Git: `git clone <endereço do repositório>`.
2. Na pasta `jogo`, clique duas vezes em **`Abrir a mesa.cmd`**. Na primeira vez, ele oferece instalar
   o Node.js e o cloudflared (responda `S`), instala as dependências e prepara a interface. Isso leva
   alguns minutos.
3. A janela mostra o **endereço** e a **senha de acesso** para mandar ao grupo, e o navegador abre a
   mesa no seu computador. Deixe a janela aberta durante a partida. Aperte Enter nela para fechar a
   mesa.

Cada anfitrião tem a própria senha de acesso, criada na primeira vez em
`jogo/dados-locais/senha-acesso.txt`, e as próprias partidas salvas. Nada disso vai para o
repositório. Sem o cloudflared, a mesa abre só no seu computador, e dá para jogar contra os bots.

Em Linux ou macOS, ou para rodar à mão, veja `jogo/LEIAME.md`. As outras formas de hospedar estão em
`jogo/HOSPEDAGEM.md`.

### Atualizar

No GitHub Desktop, use *Fetch origin* e depois *Pull origin*. Com o Git, rode `git pull`. Depois
abra a mesa de novo: ela reinstala e recompila o que tiver mudado.

### Depois de importar ou atualizar um deck

A tela **Decks** grava os arquivos do deck no repositório (`jogo/decks/`, `jogo/gerado/` e
`jogo/dados-locais/imagens/`). Para os outros receberem o deck, faça commit e push desses arquivos.
Combinem quem importa, para duas pessoas não mexerem nos mesmos arquivos ao mesmo tempo.

## O que tem aqui

| Caminho | Conteúdo |
| --- | --- |
| `jogo/` | o jogo: motor de regras, servidor, interface, bots e testes. Como se joga em `jogo/LEIAME.md`; o histórico do desenvolvimento em `jogo/PROGRESSO.md` |
| `cartas/` | os 7 decks originais, coletados do Moxfield e do Scryfall: listas, dados, rulings e imagens das cartas (`cartas/README.md`) |
| `jogo/decks/`, `jogo/dados-locais/imagens/` | os decks que entraram depois pela tela Decks e as imagens das cartas novas |
| `dados/` | regras completas, glossário e lista de banidas do Commander, em JSON |
| `fontes-oficiais/` | texto integral das Comprehensive Rules vigentes desde 25/09/2026 |
| `ABRA-AQUI.html`, `guia/`, `simulador/` | guia de estudo em português e laboratório de prioridade e pilha (`LEIA-ME.md`) |
| `referências/` | capturas usadas como referência visual da mesa |
| `PROMPT-*.md`, `desenvolvimento/` | os pedidos de cada fase do jogo e as ferramentas do pacote de estudo |

## Uso

Projeto particular do grupo, sem fins comerciais e sem afiliação com a Wizards of the Coast. Magic:
The Gathering, os nomes, os textos e as imagens das cartas pertencem à Wizards of the Coast. As
imagens vêm do [Scryfall](https://scryfall.com). Música da mesa: "The Snow Queen", de Kevin MacLeod
(incompetech.com), CC BY 4.0 (créditos em `jogo/cliente/src/musica/CREDITOS.md`).
