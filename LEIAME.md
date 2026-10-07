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

## Abrir a mesa para o grupo pela internet

Clique duas vezes em `Abrir a mesa.cmd`. Ele sobe o servidor e abre um túnel da Cloudflare; a
janela mostra o endereço `https://` e a senha de acesso para mandar ao grupo. Detalhes em
`HOSPEDAGEM.md`.

## Como se joga

1. Entre com a senha do servidor.
2. Escolha um nome, crie uma sala (quatro jogadores ou um contra um) com uma senha e passe o
   código e a senha para os outros. Lugares vazios podem receber bots, que jogam com os mesmos decks e
   veem só o que um jogador veria.
3. Cada um escolhe um deck; quem criou a sala escolhe a regra de mulligan (Londres, o padrão, ou
   Livre: troca a mão inteira, até 3 vezes, sem pôr nada no fundo), a regra de auxílios
   (permitidos ou proibidos) e começa a partida.
4. Na mesa (o padrão é a **mesa real**: nada brilha e a mesa não explica o que não pode; tentou algo
   que não vale, a carta volta com um tremido):
   - **Auxílios:** em "Configurações", cada um escolhe Mesa real, Leve (só o brilho nas cartas
     jogáveis), Completo (tudo, menos pagar automaticamente) ou Personalizado. Vale na hora, só para
     você, e fica guardado no navegador. Se a sala proíbe, todos jogam em Mesa real.
   - **Jogar uma carta da mão:** arraste para o seu campo, dê duplo clique ou clique direito e escolha
     no menu. A carta fica tracejada onde você soltou até pagar, e a permanente entra ali.
   - **Pagar:** clique nos seus terrenos para virar (a mana vai para a reserva) e em "Confirmar
     pagamento". "Cancelar" devolve a carta para a mão e desvira os terrenos virados para ela. Com
     prioridade, clicar num terreno gera a mana antes de conjurar.
   - **Arrumar o campo:** arraste as suas permanentes para onde quiser; todos veem a sua arrumação.
     "Reorganizar meu campo" (clique direito no campo vazio) volta à arrumação padrão.
   - **Atacar:** clique na criatura (ela inclina e ganha uma espada; clique de novo para desmarcar) e,
     em 4 jogadores, no oponente que ela ataca (a próxima marcada vai no mesmo oponente até você
     clicar em outro). "Confirmar ataque" vira as criaturas. Arrastar até o oponente também vale.
   - **Bloquear:** clique na sua criatura e depois no atacante (escudo e linha azul) e em "Confirmar
     bloqueio". Setas, dano, ganho de vida e criaturas indo para o cemitério aparecem para todos.
   - **Desfazer:** o botão com a seta curva, ao lado de Passar, pede para voltar a sua última jogada
     deste turno (o que os outros fizeram depois volta junto). Os outros têm 30 segundos para aceitar;
     os bots aceitam na hora; uma recusa ou o prazo cancela. A mesa fica parada enquanto isso.
   - **Clique direito:** nas cartas, ver informações, revelar uma carta da mão e o ajuste manual
     (virar, marcadores, mover); no seu campo vazio, desvirar tudo, criar ficha e marcadores de jogador.
   - A faixa no meio da mesa mostra o turno, as cinco fases com as etapas e o botão Passar. Clicar
     numa etapa liga ou desliga a parada nela; "Paradas" na barra lateral tem todas as opções.
   - "Configurações" também tem o volume, os sons (passar o turno, dano, ganhar vida) e os efeitos
     visuais, que valem em qualquer sala.
   - A barra lateral recolhe (último botão) e abre de novo; as decisões aparecem à direita da mesa.
5. Todas as cartas dos sete decks têm o efeito automatizado. O ajuste manual continua disponível
   para corrigir alguma situação à mão, só quando você tem prioridade, e todo ajuste aparece no
   registro para todos.

Se a conexão cair ou o servidor reiniciar, a página reconecta sozinha e volta ao mesmo lugar.

## Desenvolvimento

| Comando | O que faz |
| --- | --- |
| `npm test` | toda a suíte de testes (motor, cartas, servidor) |
| `npm run typecheck` | checagem de tipos do servidor e do cliente |
| `npm run cliente:dev` | cliente com recarga automática (precisa do servidor rodando) |
| `npm run estresse` | partidas de bots procurando erros do motor (`node bots/estresse.ts [partidas] [jogadores] [aleatorio ou heuristico] [semente]`) |
| `node bots/comparar.ts <nívelA> <nívelB> [partidas] [semente] [processos]` | força dos níveis de bot: partidas 1v1 espelhadas (mesmos decks, assentos trocados), em até 6 processos; `mesa <n1,n2,n3,n4>` para 4 jogadores |
| `node ferramentas/humano-e-bots.ts [semente] [4p|1v1] [níveis]` | uma partida inteira no servidor com uma pessoa simulada e bots pensando nas threads de verdade; mostra cliques extras no turno dos bots, processador e memória |
| `node ferramentas/capturas.ts` | capturas de tela da interface em `.cache/capturas/` |
| `node ferramentas/e2e.ts` | partidas de ponta a ponta com navegadores (1v1, 4 jogadores, reinício do servidor) |
| `node ferramentas/cobertura.ts` | atualiza `COBERTURA.md` |

O progresso das fases está em `PROGRESSO.md`.
