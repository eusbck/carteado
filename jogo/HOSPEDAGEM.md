# Hospedagem

Como deixar o jogo acessível para o grupo pela internet.

**Escolha do grupo (05/10/2026): opção A, no computador do Caio, com o túnel rápido da Cloudflare.**
Já está instalado e testado. Para jogar:

1. Clique duas vezes em `jogo/Abrir a mesa.cmd`.
2. A janela mostra o **endereço** (`https://….trycloudflare.com`) e a **senha de acesso**. Mande
   os dois para o grupo. No seu computador, dá para usar `http://localhost:8080`.
3. Deixe a janela aberta durante a partida. Aperte Enter nela para fechar a mesa.

O endereço muda cada vez que a mesa abre. A senha de acesso fica em
`jogo/dados-locais/senha-acesso.txt`; para trocar, apague o arquivo (o servidor cria outra) ou
escreva a nova senha nele. Para conferir a instalação sem abrir para o grupo, rode
`powershell -ExecutionPolicy Bypass -File jogo/abrir-mesa.ps1 -Teste`. Ele abre o túnel, testa
pela internet a página, o login, a senha errada e o WebSocket, e fecha em seguida.

As outras opções ficam abaixo, para quando quiserem trocar.

## O que o servidor precisa

- Node.js 24 ou mais novo.
- As pastas `jogo/` e `cartas/` lado a lado (cerca de 1 GB, quase tudo imagens de cartas). As duas
  vêm juntas no repositório do GitHub; quem clona pode ser anfitrião (veja o `README.md` da raiz).
- Uma pasta gravável para o banco (`dados-locais/` por padrão; é ali que ficam as salas e as
  partidas em andamento).
- Uma porta HTTP (8080 por padrão). O navegador fala com o servidor por HTTP e WebSocket na
  mesma porta.

Proteções que já vêm prontas:

- **Senha de acesso** para entrar no site (`SENHA_ACESSO`). Sem ela não se vê nada, nem as
  imagens das cartas.
- **Salas com código e senha**. Não há cadastro aberto.
- **Informação oculta no servidor**: cada navegador só recebe o que o jogador pode ver.
- **HTTPS**: quem cuida é o túnel ou o proxy. Com `HTTPS=1`, o cookie de sessão só trafega
  criptografado.

Para guardar as partidas, basta copiar `dados-locais/jogo.sqlite` de vez em quando.

## Opção A — um computador de vocês e um túnel (grátis)

Um de vocês deixa o jogo rodando no próprio computador durante as partidas. Um túnel dá um
endereço `https://` público que leva até ele, sem abrir porta no roteador.

1. No computador anfitrião: `cd jogo`, `npm install`, `npm run cliente:build`.
2. Suba o servidor com HTTPS ligado e uma senha escolhida por vocês:
   - Windows (PowerShell): `$env:HTTPS='1'; $env:SENHA_ACESSO='uma-senha-boa'; npm run servidor`
   - Linux/macOS: `HTTPS=1 SENHA_ACESSO='uma-senha-boa' npm run servidor`
3. Instale o `cloudflared` (programa gratuito da Cloudflare) e, em outro terminal, rode
   `cloudflared tunnel --url http://localhost:8080`. Ele mostra um endereço
   `https://algo-aleatorio.trycloudflare.com`. É esse endereço que vocês compartilham.

Vantagens: custo zero, as imagens ficam no próprio computador, sobe em minutos. O túnel rápido
nem pede conta.

Limites: o computador precisa estar ligado durante as partidas, e o endereço muda toda vez que o
túnel reinicia. Para ter um endereço fixo, é preciso uma conta gratuita na Cloudflare e um
domínio próprio (uns R$ 40 por ano).

## Opção B — rede privada com Tailscale (grátis, nada público)

Cada jogador instala o Tailscale (gratuito para uso pessoal, entra com conta Google ou
Microsoft). O anfitrião compartilha o computador com o grupo. Cada um abre
`http://<nome-do-computador>:8080`. Nada fica exposto na internet.

Vantagens: é a opção mais fechada de todas, e o custo é zero.
Limites: todo mundo precisa instalar o Tailscale e ter uma conta, e o computador anfitrião
também precisa estar ligado.

## Opção C — servidor sempre ligado

Para jogar a qualquer hora, sem depender do computador de ninguém:

- **Oracle Cloud "Always Free"**: uma máquina virtual gratuita para sempre, de sobra para o jogo.
  Pede conta com cartão de crédito, só para verificação.
- **Hetzner CX22**: por volta de € 4 por mês, mais simples de configurar.

Passos, em linhas gerais: criar a máquina (Ubuntu), instalar o Node 24, copiar `jogo/` e
`cartas/` (cerca de 1 GB), deixar o servidor rodando como serviço do sistema e pôr HTTPS na
frente. O HTTPS pode vir de um túnel da Cloudflare, como na opção A, ou do Caddy com um
domínio. Exemplo de serviço (`/etc/systemd/system/commander.service`):

```
[Unit]
Description=Magic Commander
After=network.target

[Service]
WorkingDirectory=/opt/mesa/jogo
Environment=PORTA=8080 HTTPS=1 SENHA_ACESSO=troque-esta-senha
ExecStart=/usr/bin/node servidor/index.ts
Restart=always
User=mesa

[Install]
WantedBy=multi-user.target
```

## Recomendação

Comecem pela **opção A** numa noite de teste: não custa nada e mostra se o jogo aguenta uma
partida de verdade pela internet. Se o grupo quiser jogar sem depender de um computador ligado,
a **opção C** com a Oracle (grátis) ou a Hetzner (cerca de € 4 por mês) resolve.

## O que eu preciso de vocês

1. Qual opção usar.
2. Na A: quem vai ser o anfitrião, e a confirmação de que posso abrir o túnel (o site fica
   acessível pela internet, protegido pela senha de acesso).
3. Na B: que cada um crie a conta no Tailscale.
4. Na C: a conta no provedor escolhido. Eu não crio contas nem assumo custos por vocês.
