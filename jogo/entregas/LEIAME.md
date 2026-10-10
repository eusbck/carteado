# Versões dos novos decks

Esta frente usa a branch `decks/regras`, no worktree `Magic-Commander-regras-decks`, e começou em `06cc7f3`. A pasta principal `Magic-Commander` conserva suas alterações, seus nove decks e seu banco. Timey-Wimey e Planechase estão fora desta frente.

Cada entrega tem um manifesto de validação e uma referência Git fixa. A primeira é Keen Engineering, de Sai, Master Thopterist: 100 cartas, 67 nomes distintos, 59 definições novas, a ficha Thopter e 114 rulings novos. A lista mantém as quantidades e a ordem do Moxfield. Os fundos e retratos personalizados dos nove decks anteriores estão preservados; Sai usa a arte oficial e a inicial no medalhão.

## Prévia local

Na pasta `Magic-Commander-regras-decks/jogo`, execute:

```powershell
node ferramentas/previa-decks.ts
```

O endereço começa em `http://127.0.0.1:8096`; o iniciador procura a próxima porta livre se necessário. A senha está em `dados-previa/senha-acesso.txt`. Banco, imagens, cliente compilado, catálogo e caches pertencem a esta cópia. O endereço com `127.0.0.1` também mantém o cookie de acesso separado da mesa aberta em `localhost`. Essa prévia é local.

## Próxima abertura da mesa

Clique em **Abrir versao validada.cmd**, nesta cópia, depois de fechar a janela da mesa anterior. O iniciador:

1. Confere a aprovação da suíte completa e resolve a referência fixa do manifesto `keen-engineering.json`.
2. Prepara um worktree sem branch, nesse commit, com dependências, cliente, imagens e caches próprios.
3. Copia as partidas com o backup online do SQLite, incluindo alterações confirmadas ainda no WAL, e verifica a integridade da cópia.
4. Abre a versão validada na porta 8080, usando um novo banco e a senha anterior. O iniciador habitual pode abrir o túnel do grupo nessa abertura.

O banco da pasta principal permanece preservado. A primeira abertura copia dele; as seguintes copiam do último banco usado pela versão validada. Para consultar a referência sem abrir servidor, copiar bancos ou criar túnel:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File abrir-versao-validada.ps1 -Verificar
```

Para indicar outra pasta de origem na transferência, use `-JogoAnterior C:\caminho\da\copia\jogo`. Essa origem explícita prevalece sobre o último banco registrado pelo iniciador.

Para voltar à instalação anterior, feche a versão nova e use **Abrir a mesa.cmd** na pasta principal `Magic-Commander/jogo`. Ela conserva o código anterior desta frente e o banco que existia antes da ativação; partidas criadas depois, na versão nova, continuam guardadas no banco próprio dessa versão. A referência para retorno exato do código é `versao/anterior-decks-06cc7f3`, que aponta para `06cc7f3`.

## Evidências e continuidade

- `verificacao-base.json`: testes da base, antes das mudanças.
- `keen-engineering.json`: manifesto da entrega, incluindo suíte, tipos, cliente, conferência do Moxfield e referências dos commits.
- `partidas-keen.json`: sementes, decks, turnos, decisões e resultados das 14 partidas com Sai obrigatório. Dez empataram ao chegar ao limite de turnos do teste; todas concluíram sem erros do motor ou violações de invariantes.
- `restauracao-anteriores.json`: retomada de cinco partidas antigas em um snapshot consistente, sem credenciais de salas.
- `pendentes-apos-keen.json`: quinze decks ainda em preparação, ordenados pela pendência e pela ordem anterior do catálogo em caso de empate.

Os logs completos e as capturas de navegador ficam em `jogo/.cache/`. O único teste ignorado da suíte já existia na base: a verificação de LKI congelada depende da variável `CONGELAR_LKI=1`.

O relato detalhado está no `CODEX.md`, na raiz desta cópia; `PROGRESSO.md` permite consultar o andamento. Depois desta entrega, importar Food and Fellowship e recalcular a fila, incluindo as dependências de Sam, Loyal Attendant e Frodo, Adventurous Hobbit. Um deck só será liberado quando estiver completo, testado e com seus rulings conferidos.
