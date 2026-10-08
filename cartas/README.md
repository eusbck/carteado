# Biblioteca local de Magic — nvvvm

Fonte solicitada: https://moxfield.com/users/nvvvm

**O estado atual da coleta está em `manifest.json`.** Esse arquivo informa quais etapas terminaram e quais arquivos ainda faltam. O ambiente de execução que preparou esta pasta tem restrições de rede, portanto o download deve ser iniciado pelo arquivo para Windows abaixo. As respostas já recebidas das fontes são preservadas para permitir a continuação da coleta.

O coletor **1.0.3** corrige a expansão indevida da versão 1.0.2: relações de fichas de volta a outras cartas que as criam não são percorridas. O campo `tokens` do Moxfield é conferido pelo tipo do objeto; cartas comuns que aparecem ali são preservadas na resposta original, mas não passam a fazer parte do deck nem da seleção auxiliar. A seleção é validada antes de qualquer download de imagem. Os arquivos excedentes da execução anterior são movidos para `.recovery/outside-scope-.../`, com um manifesto dos movimentos; não são apagados. O banco de 395,4 MB do Scryfall permanece no cache e é reaproveitado.

## Executar a coleta

Abra `BAIXAR-DECKS.cmd` com dois cliques. O Python já está instalado nesta máquina; não é necessário instalar bibliotecas, informar senha ou criar conta.

O coletor consulta todas as páginas dos decks públicos pela busca de decks filtrada com `authorUserNames=nvvvm`, preserva cada resposta do Moxfield e baixa os dados e imagens das cartas. Ele reúne também os decks fixados e elimina repetições. A rota alternativa de perfil é consultada apenas se a busca retornar 404 na primeira página. Erros registram a etapa, a URL e o código HTTP em `manifest.json`. Ele não consegue enumerar decks privados ou decks não listados que não apareçam no perfil público.

O arquivo bulk do Scryfall contém as edições em todos os idiomas. O formato atual é JSONL comprimido (`.jsonl.gz`), com um objeto de carta por linha; versões anteriores em array JSON também são aceitas. O coletor lê o endereço em `jsonl_download_uri` ou, em metadados antigos, `download_uri`. Seu cache pode ser grande, dependendo da compressão enviada pelo servidor, e o tamanho anunciado aparece no console. Ele é lido em partes, sem carregar todo o banco na memória. A biblioteca final inclui as edições exatas das listas, fichas/emblemas/marcadores válidos declarados na fonte, fichas e resultados de meld ligados diretamente às cartas dos decks, e uma variante em inglês/português de cada edição selecionada quando disponível. Não se percorrem relações a partir das fichas ou variantes de idioma. As imagens são baixadas apenas para as edições desse conjunto validado.

Antes de baixar imagens, o console mostra `Plano validado` com o total de edições e imagens, incluindo quantas imagens locais já podem ser reutilizadas. `data/download-plan.json` registra a razão de inclusão de cada edição e seus arquivos de imagem. Relações `all_parts` são metadados originais bidirecionais; não devem ser usadas como lista de arquivos a baixar ou como cartas adicionais do deck.

Quando o download acabar, abra `catalogo.html` para escolher um deck, filtrar cartas e consultar imagens e textos sem internet. Esse arquivo é gerado durante a coleta; ainda não existe na preparação inicial.

Se a conexão cair, execute o mesmo arquivo novamente. Respostas em cache com até 24 horas e downloads já concluídos e com hash correto serão reutilizados. Um arquivo bulk ou imagem interrompido será baixado novamente; não há retomada por faixa de bytes.

O status `complete` só é emitido quando a enumeração do perfil foi confirmada e não há pendências de cartas, imagens, relações, rulings ou símbolos. Traduções inexistentes e falha no download opcional das regras completas aparecem como avisos. `planned` indica que listas, textos e seleção de imagens foram preparados, mas os downloads complementares ainda faltam. `partial` indica material aproveitável com pendências ou um conjunto vindo de exportações locais cuja abrangência no perfil não foi confirmada. `blocked` indica uma falha que interrompeu uma etapa. `interrupted` indica uma interrupção com Ctrl+C; os arquivos concluídos são mantidos. Duas execuções simultâneas na mesma pasta são bloqueadas automaticamente pelo sistema operacional.

## Conteúdo produzido

| Caminho | Conteúdo |
|---|---|
| `decks/<nome>--<id>/deck.json` | Lista organizada por zona, quantidades, referências às cartas e às edições, acabamento e metadados disponíveis |
| `decks/<nome>--<id>/lista.txt` | Lista legível, com zonas, edição e número de coleção |
| `decks/<nome>--<id>/cartas.csv` | Listagem para consultar nomes, quantidades, zonas, idiomas e caminhos das imagens |
| `decks/<nome>--<id>/descricao.txt` | Descrição pública do deck, se fornecida pelo autor |
| `data/decks.json` | Índice de todos os decks coletados |
| `data/cards.json` | Índice de identidades de jogo: texto Oracle, custo, tipos, cores, palavras-chave, atributos, faces e legalidades |
| `data/printings.json` | Objetos completos das edições do Scryfall, com textos impressos, idioma, artista, créditos e imagens locais |
| `data/download-plan.json` | Seleção validada, razões de inclusão, URLs/caminhos de cada imagem e disponibilidade local na preparação do plano |
| `assets/cards/<scryfall-id>/front.png` | Imagem inteira da carta; PNG preferencial, JPEG quando o provedor só disponibiliza esse formato |
| `assets/cards/<scryfall-id>/back.png` | Outra face de cartas com imagens distintas para frente e verso |
| `data/rulings.json` | Decisões e esclarecimentos das cartas, agrupados por Oracle ID |
| `data/symbols.json` e `assets/symbols/` | Símbolos de mana/ações e suas imagens SVG |
| `rules/MagicCompRules.txt` | Regras completas, quando o link atual puder ser obtido na página oficial da Wizards |
| `raw/moxfield/` e `raw/scryfall/` | Respostas originais das fontes, preservadas para uma importação futura |
| `manifest.json` | Estado, contagens, fontes, datas, traduções ausentes e erros |
| `checksums.json` | Tamanho e SHA-256 dos arquivos produzidos |
| `.cache/` | Respostas temporárias e arquivos bulk usados para preparar a biblioteca |

Os decks compartilham as imagens das mesmas edições, evitando arquivos repetidos. A edição indicada no Moxfield é preservada quando há Scryfall ID ou coleção/número. Uma escolha feita apenas pelo nome é identificada como `name_only_edition_unknown`, com aviso explícito.

Cartas com duas faces têm ambas as imagens. Cartas split/adventure mantêm a imagem física completa e os textos de todas as faces. Fichas, emblemas e objetos auxiliares necessários são incluídos pelas regras de seleção acima; os relacionamentos completos permanecem na fonte, inclusive referências a cartas que não serão baixadas. Não se inventam vínculos ausentes na fonte.

As variantes em português podem pertencer a outra edição quando a edição original não teve impressão em português. Os campos `printed_name`, `printed_type_line` e `printed_text` são o texto daquela impressão. Eles não são tradução automática nem substituem o texto Oracle atualizado em inglês. Ausência de português é registrada em `cards_without_portuguese`.

## Importar na futura simulação

Cada entrada de deck contém `zone`, `quantity`, `card_id` e `printing_id`. Use `card_id` para consultar os dados de jogo em `data/cards.json`; use `printing_id` para obter a edição e `local_images[].path` em `data/printings.json`. Os caminhos são relativos à raiz desta pasta e devem ser resolvidos a partir dela.

`language_variants` na entrada oferece IDs alternativos em inglês e português. O valor `null` indica que aquela versão não foi encontrada. `support_printing_ids` lista os objetos auxiliares do deck; `support_language_variants` oferece os idiomas desses objetos. Quantidades desses objetos auxiliares não são inventadas: o motor do jogo deverá criá-los conforme as regras. `archive_reasons` em cada impressão e `data/download-plan.json` permitem identificar por que ela está na biblioteca.

Os dados e as imagens constituem a base do futuro simulador. A resolução automática de habilidades, fases, prioridade, combate e sincronização multiplayer ainda precisa ser implementada no jogo.

## Verificar ou atualizar

No terminal, dentro desta pasta:

```powershell
python coletar.py --verify
python coletar.py --refresh
python coletar.py --plan --offline
```

`--verify` confere os hashes, referências, imagens declaradas, quantidades e escopo sem internet. `--refresh` consulta novamente as fontes e atualiza os arquivos; arquivos fora da seleção ativa são preservados em `.recovery/`. `--plan --offline` usa exclusivamente o cache existente para preparar dados, validar o conjunto de cartas e gerar o catálogo, sem acessar a rede ou baixar novas imagens. Esse modo não conclui a coleta. Para continuar, execute `BAIXAR-DECKS.cmd` normalmente, sem argumentos.

Se o Moxfield recusar o acesso à API, o coletor informa o motivo e interrompe a consulta. Como alternativa, coloque exportações do Moxfield em uma pasta `importar` e execute:

```powershell
python coletar.py --imports importar
```

São aceitos JSONs com os boards do deck ou listas TXT no formato `1 Nome (SET) número`, com seções `Commander`, `Deck`, `Sideboard` etc. O marcador `*CMDR*` também é aceito. Importações locais não comprovam a coleta de todos os decks do perfil.

Os testes de desenvolvimento usam pequenos dados sintéticos em pastas temporárias e respostas reais capturadas do Scryfall, incluindo os relacionamentos de uma ficha Treasure que causavam a expansão indevida. Eles não adicionam decks de exemplo à biblioteca. Execute `python -m unittest discover -s tests -v` para verificar a ferramenta. A conferência das listas reais salvas está em `validation-lists.json`. `validation-scope.json` registra a auditoria do plano preparado a partir dos sete decks reais, a preservação de todas as quantidades/edições e a integridade das imagens já disponíveis. Esse relatório não comprova downloads posteriores à sua data; o andamento atual está em `manifest.json`.

## Fontes e créditos

- Listas: [perfil nvvvm no Moxfield](https://moxfield.com/users/nvvvm).
- Imagens e dados: [Scryfall API](https://scryfall.com/docs/api), com os campos descritos no [repositório oficial de tipos](https://github.com/scryfall/api-types).
- Regras: [página oficial de regras de Magic](https://magic.wizards.com/en/rules).

Os nomes, textos e imagens das cartas pertencem à Wizards of the Coast e aos respectivos titulares. As imagens completas mantêm o copyright e o crédito dos artistas. A coleta não altera, recorta ou coloca marcas nas imagens.
