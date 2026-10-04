# Commander da Mesa

Jogo de Commander online e privado para o grupo, com as regras aplicadas pelo servidor e os
7 decks de `../cartas/`.

## Rodar no seu computador

Precisa do Node.js 24 ou mais novo. A pasta `jogo/` tem de ficar ao lado de `cartas/` (as
imagens são lidas de lá; nada é copiado).

```
cd jogo
npm install
npm run cliente:build
npm run servidor
```

Abra `http://localhost:8080`. Na primeira vez o servidor cria uma senha de acesso e a mostra no
terminal (fica guardada em `dados-locais/senha-acesso.txt`). Para escolher a senha, defina a
variável `SENHA_ACESSO` antes de subir o servidor.

Variáveis opcionais:

| Variável | Para quê | Padrão |
| --- | --- | --- |
| `PORTA` | porta HTTP | `8080` |
| `SENHA_ACESSO` | senha para entrar no site | gerada na primeira vez |
| `DADOS` | pasta do banco (salas e partidas) | `dados-locais/` |
| `HTTPS` | `1` quando estiver atrás de um proxy com HTTPS (cookie seguro) | desligado |

## Como se joga

1. Entre com a senha do servidor.
2. Escolha um nome, crie uma sala (quatro jogadores ou um contra um) com uma senha e passe o
   código e a senha para os outros. Lugares vazios podem receber bots.
3. Cada um escolhe um deck; quem criou a sala começa a partida.
4. Durante a partida, a decisão pendente aparece no painel da direita. Clique numa carta para ver
   o que dá para fazer com ela. O botão "Paradas" define em que etapas o jogo espera você; fora
   delas, ele passa a prioridade sozinho.
5. Cartas marcadas como "manual" ainda não têm o efeito automatizado: depois de jogá-las, use
   "Ajuste manual" para aplicar o efeito (mover cartas, vida, marcadores, fichas…). Todo ajuste
   aparece no registro para todos.

Se a conexão cair ou o servidor reiniciar, a página reconecta sozinha e volta ao mesmo lugar.

## Desenvolvimento

| Comando | O que faz |
| --- | --- |
| `npm test` | toda a suíte de testes (motor, cartas, servidor) |
| `npm run typecheck` | checagem de tipos do servidor e do cliente |
| `npm run cliente:dev` | cliente com recarga automática (precisa do servidor rodando) |
| `npm run estresse` | partidas de bots aleatórios procurando erros do motor |
| `node ferramentas/capturas.ts` | capturas de tela da interface em `.cache/capturas/` |
| `node ferramentas/e2e.ts` | partidas de ponta a ponta com navegadores (1v1, 4 jogadores, reinício do servidor) |
| `node ferramentas/cobertura.ts` | atualiza `COBERTURA.md` |

O progresso das fases está em `PROGRESSO.md`.
