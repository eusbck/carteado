# Artes dos comandantes — 11/10/2026

Foram criadas 33 artes novas pela ferramenta interna de geração de imagens: 18 banners e 15 ícones. Os nove conjuntos anteriores já estavam prontos em `artes-comandantes/feito/` e continuam no jogo.

Na retomada de 11/10/2026, foram gerados e integrados o [ícone de Doctor Doom](doctor-doom-icone.png), de 1254 × 1254 pixels com transparência real, e o [banner de Captain America](captain-america-banner.png), de 1672 × 941 pixels. As outras quatro artes receberam novamente `moderation_blocked`, na saída, categoria `other`, sem motivo específico. O histórico das seis chamadas está em [tentativas/retomada-2026-10-11.json](tentativas/retomada-2026-10-11.json), junto aos caminhos dos prompts e às referências utilizadas.

Uma nova tentativa com os mesmos quatro prompts gerou o [banner de Invisible Woman](invisible-woman-banner.png), de 1672 × 941 pixels, preservando o rosto, o cabelo loiro, o traje azul e o emblema “4”. Os três ícones restantes receberam novamente o mesmo bloqueio. Essa rodada está em [tentativas/nova-tentativa-2.json](tentativas/nova-tentativa-2.json), com os prompts completos, referências e identificadores das chamadas. Todos os 18 banners desta frente estão prontos; três ícones continuam pendentes.

Abra [a galeria](galeria.html) para ver cada banner, o ícone transparente e a aplicação do ícone na moldura da mesa. A galeria permite buscar pelo deck ou comandante e abrir os PNGs originais. Uma imagem com todos os decks está em [galeria.jpg](galeria.jpg).

## As duas duplas

- **Food and Fellowship:** Frodo e Sam juntos no [banner](food-and-fellowship-banner.png) e no [ícone](food-and-fellowship-icone.png).
- **Timey-Wimey:** o Décimo Doutor e Rose Tyler juntos no [banner](timey-wimey-banner.png) e no [ícone](timey-wimey-icone.png).

Cada dupla tem uma única composição e um único retrato, associados aos dois comandantes. As imagens estão preparadas para quando esses decks estiverem disponíveis no jogo; esta entrega de artes não importa nem altera listas ou regras dos decks.

## Arquivos do jogo

- Banners: `jogo/gerado/fundos/<id da imagem da carta>.webp`, com a resolução nativa de 1672 × 941 pixels.
- Ícones: `jogo/cliente/src/imagens/avatares/<id>.webp`, de 512 × 512 pixels, com alfa.
- Ícones menores da mesa: `jogo/cliente/src/imagens/avatares/mesa/<id>.webp`, de 256 × 256 pixels, com alfa.
- Fontes, prompts completos e destinos: [manifesto.json](manifesto.json). Os mesmos prompts ficam nos arquivos `<id>-banner.txt` e `<id>-icone.txt`.

Os banners estão vinculados às impressões alternativas das cartas quando existem. A identidade de Hatsune Miku usa a arte da impressão do Moxfield. Os ícones prontos entram no catálogo de retratos e são usados automaticamente pelo comandante do deck. O catálogo tem 24 retratos disponíveis: nove anteriores e 15 novos. Doctor Doom está associado a `Doctor Doom, King of Latveria`; o banner de Captain America usa a imagem `910a6dfc-04a2-4c6d-b2ba-507bc75ec821`.

## Três artes pendentes

A ferramenta interna recusou repetidamente as seguintes gerações com `moderation_blocked`, na etapa de saída, categoria `other`, sem fornecer um motivo mais específico:

| Comandante | Arquivo pendente |
| --- | --- |
| Black Panther | Ícone |
| Invisible Woman | Ícone |
| Captain America | Ícone |

Caio escolheu manter os arquivos ainda recusados pendentes para geração interna, sem substituir por recortes, imagens prontas, outra API ou outro modelo. Os banners de Doctor Doom, Black Panther, Invisible Woman e Captain America estão prontos e vinculados à mesa. Os três retratos ainda sem imagem ficam fora do catálogo de escolha. [pendencias.json](pendencias.json) conserva os identificadores anteriores, acrescenta as novas recusas e registra separadamente as três pendências resolvidas. Os prompts anteriores de Doom e dos banners de Captain America e Invisible Woman foram preservados em `tentativas/*-antes-*.txt`.

## Refinamento do banner de Captain America

O banner preserva o capacete completo com “A”, a máscara, o rosto, o traje azul, as luvas vermelhas e o escudo com estrela. A região inferior tem mais detalhes e contraste do que o desejado para as cartas. Uma edição interna para acalmar apenas esse terço também foi recusada com `moderation_blocked`, na saída, categoria `other`. A versão inicialmente gerada foi integrada; esse refinamento continua pendente e está registrado em `pendencias.json`, em `refinamentos`, e no histórico da retomada. Nenhuma edição externa foi aplicada ao PNG.

## Atualizar os arquivos

O preparador local só copia, converte e organiza imagens já geradas; ele não chama nenhuma API de geração:

```powershell
node jogo/ferramentas/artes-comandantes.mjs import <id> banner <caminho-do-png>
node jogo/ferramentas/artes-comandantes.mjs import <id> icone <caminho-do-png>
node jogo/ferramentas/artes-comandantes.mjs gallery --capturar
```

Quando um dos três retratos pendentes for gerado, inclua a entrada correspondente em `jogo/servidor/avatares.ts` e atualize o total no teste de catálogo. Para usar os novos retratos na aplicação, compile o cliente e reabra a mesa, para o servidor carregar o catálogo atualizado.

## Conferência

Os 30 PNGs conferidos na primeira sessão foram preservados. As três imagens geradas nas novas tentativas foram inspecionadas visualmente, e o alfa do ícone de Doom foi verificado no PNG e nas duas versões WebP. A galeria usa os estilos de recorte e moldura do jogo para mostrar os ícones a 80 pixels; as duas duplas foram conferidas na primeira sessão, e Doom foi conferido na retomada. [conferencia.json](conferencia.json) registra dimensões, alfa e vínculos com as imagens que o jogo usa atualmente. As prévias são [doctor-doom-previa.png](doctor-doom-previa.png), [captain-america-previa.png](captain-america-previa.png) e [invisible-woman-previa.png](invisible-woman-previa.png).

Na retomada, a checagem de tipos e a compilação do cliente passaram. Os dois arquivos de testes existentes de retratos e fundos passaram novamente: 19 testes, zero falhas, em 22,57 segundos, com no máximo dois workers. As 62 imagens da galeria carregaram, e o ícone de Doom foi conferido na moldura de 80 pixels. A comparação de SHA-256 de 7.996 arquivos existentes não encontrou mudanças fora dos arquivos desta frente de artes. Os identificadores das recusas anteriores e os prompts anteriores de Doom e Captain America também foram conferidos. [validacao-retomada.json](validacao-retomada.json) reúne essas evidências. O cliente compilado está atualizado em `jogo/cliente/dist/`; a mesa em execução não foi reiniciada.

Na nova tentativa e após a compressão, tipos e compilação do cliente passaram novamente. Os mesmos dois arquivos de testes passaram: 19 testes, zero falhas, em 23,93 segundos, com dois workers. A galeria carregou 63 imagens sem falha; todos os banners possuem seus fundos vinculados. Invisible Woman usa o foco `[0.39, 0.22]`, e a versão do cache dos fundos é `5`. O catálogo continua com 24 retratos, pois nenhum dos três ícones pendentes foi gerado. As evidências estão em [validacao-nova-tentativa-2.json](validacao-nova-tentativa-2.json).

## Compressão das imagens usadas no jogo

Foram analisados os 48 arquivos de retratos e testadas amostras dos banners e PNGs. A compressão adicional sem perda reduziu 38 WebPs: 15 retratos de 512 pixels e 23 de 256 pixels. A economia total foi de 52.236 bytes, cerca de 52,2 KB ou 0,83% dos retratos. Os arquivos já estavam bastante comprimidos; nas amostras de banners, a codificação sem perda produziu arquivos maiores e não foi aplicada.

Cada arquivo alterado manteve exatamente os mesmos pixels RGBA no decodificador local e no Chromium, inclusive transparência, cores e dimensões. Os perfis de cor e a orientação também foram preservados. Nenhum PNG original foi alterado. Foi usado Sharp/libwebp local, com `lossless`, `exact`, compressão de alfa sem perda e esforço máximo. [otimizacao-imagens.json](otimizacao-imagens.json) registra os tamanhos, hashes, verificações e caminhos dos backups anteriores, guardados em `jogo/.cache/compressao-artes/originais/`.

Geração: ferramenta interna `image_gen`; modelo solicitado pelo usuário: GPT IMAGE 2. A interface da ferramenta não expõe um seletor ou metadado de modelo.
