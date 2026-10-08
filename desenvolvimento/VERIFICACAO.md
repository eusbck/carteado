# Verificação do pacote

Executada em **03/10/2026**.

## Resultado

- **36 verificações de motor, conteúdo e arquivos: aprovadas.**
- **12 verificações de interface via DOM: aprovadas.**
- Scripts JavaScript conferidos com `node --check`.
- Manual local: 8.017 linhas, sem lacunas na captura da fonte. SHA-256 no manifesto.
- Índice: 3.312 entradas de regras, 738 termos do glossário, 266 subseções de ações/habilidades e 51 cenários.
- Referências dos cenários e dos atalhos apontam para regras presentes na versão capturada.
- Recursos e links locais das três páginas de entrada/leitura/simulação existem.

O motor foi exercitado em respostas e anulações encadeadas, alvo que deixa a pilha, passes interrompidos, jogador sem prioridade, timing de feitiçaria/flash, terreno compartilhado entre as duas principais, limite de lealdade, habilidade de mana, ETB, combate sem atacantes, duas etapas de dano, limpeza normal/excepcional, compra inicial em duas pessoas e ordem com seis jogadores.

A interface foi executada com jsdom usando os arquivos entregues. Foram testados carregamento, mensagens de recusa, atualização da pilha, troca de jogador, desfazer, configuração, gabaritos, filtros, consultas numéricas, consultas em português, paginação de resultados e a limpeza excepcional. Isso verifica execução e interação no DOM, **não aparência renderizada**.

A tentativa de captura visual usando o Edge em modo headless terminou com falha de inicialização de GPU/acesso no ambiente. Não há uma captura visual aprovada incluída. O guia é fornecido em HTML de leitura/impressão; não foi gerado nem validado um PDF local.

## Reproduzir

Na pasta `Magic-Commander`:

```text
python desenvolvimento/montar-pacote.py
node desenvolvimento/verificar.mjs
node --check simulador/app.js
node --check simulador/motor.js
node --check simulador/dados.js
```

O teste opcional de interface precisa de jsdom instalado no ambiente de desenvolvimento:

```text
node desenvolvimento/verificar-interface.mjs
```

Ele também aceita, como primeiro argumento, um caminho para um módulo jsdom já existente. **As páginas, o guia, a busca e o laboratório não precisam de jsdom, Python ou Node para ser usados:** basta abrir o HTML no navegador.

Os testes não certificam a implementação de todo Magic. O recorte do motor didático e os campos ainda não implementados estão registrados em `dados/manifesto.json` e no roteiro de simulação.
