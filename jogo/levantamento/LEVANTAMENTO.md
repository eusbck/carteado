# Levantamento das cartas

Gerado por `ferramentas/levantamento.mjs` a partir de `../cartas/data/cards.json`, `rulings.json` e `decks/*/deck.json`. Não edite à mão; rode o script de novo.

## Totais

| | Cartas |
| --- | ---: |
| Entradas em `cards.json` | 547 |
| Cartas dos decks (únicas) | 507 |
| — terrenos básicos | 5 |
| — terrenos não básicos | 100 |
| — outras cartas | 402 |
| Fichas e objetos auxiliares (Treasure, Monarch, Copy, Manifest, Poison Counter etc.) | 40 |
| Rulings das cartas dos decks | 1285 (em 366 cartas) |

## Camadas de implementação

| Camada | O que é | Cartas dos decks | Fichas/aux. |
| --- | --- | ---: | ---: |
| dados | só características e palavras-chave comuns (básicos, fichas, criaturas sem texto) | 7 | 40 |
| genérico | cabe na linguagem de efeitos, usando os mecanismos do motor | 463 | 0 |
| especial | precisa de código específico | 37 | 0 |

Divisão proposta da fase de cartas: parte A (genéricas sem mecanismo raro nem Auras, marcadores, cemitério, outras zonas, cópias, faces ou custos alternativos) = 229 cartas, 85 delas terrenos; parte B = 271 cartas, incluindo as 37 especiais.

## Padrões de habilidade (cartas não básicas dos decks; uma carta pode estar em vários)

| Padrão | Cartas |
| --- | ---: |
| Habilidade de mana | 141 |
| Entra virado (com ou sem condição) | 63 |
| Gatilho de entrada no campo | 77 |
| Gatilho de morte ou de sair do campo | 46 |
| Gatilho de ataque ou de dano de combate | 69 |
| Gatilho de início de etapa ou fase | 61 |
| Gatilho de conjurar ou copiar | 22 |
| Gatilho de carta saindo do cemitério | 11 |
| Marcadores (+1/+1, -1/-1 e outros), proliferar, blight | 81 |
| Ganho e perda de vida | 63 |
| Sacrifício | 75 |
| Habilidade ativada (não de mana) | 90 |
| Habilidade estática (bônus, custo, proibição) | 118 |
| Efeito de substituição ou "ao entrar" | 37 |
| Cópia de permanente ou de mágica | 36 |
| Cria fichas | 72 |
| Custo alternativo, adicional, X ou redução | 53 |
| Faces duplas, preparação, Saga ou Classe | 13 |
| Aura ou Equipamento | 44 |
| Remoção (destruir, exilar, dano, -X/-X) | 109 |
| Do cemitério para o campo | 35 |
| Busca no grimório | 22 |
| Jogar ou conjurar de outra zona | 27 |
| Afeta oponentes/jogadores (relevante em multijogador) | 94 |
| Aleatoriedade (embaralhar, ao acaso) | 33 |
| Informação oculta (olhar, revelar, buscar, virada para baixo) | 60 |
| Modal (escolha um ou mais modos) | 17 |

## Casos especiais (37)

| Carta | Decks | Por quê |
| --- | --- | --- |
| Abstract Performance | Pri | pilha virada para baixo no exílio; um oponente escolhe a pilha; conjurar grátis de entre as cartas |
| Advanced Reconstruction | Lor | Classe; exílio aleatório do cemitério com permissão de jogar; redução para mágicas conjuradas fora da mão |
| Animate Dead | Sil | Aura que troca a própria habilidade "encantar" e devolve a criatura anexada (303.4) |
| Banon, the Returners' Leader | Lor, Ter | Pray: conjurar do cemitério só cartas que chegaram lá neste turno sem vir do campo (histórico de zona) |
| Breena, the Demagogue | Sil | gatilho para ataques de qualquer jogador comparando vidas dos seus oponentes |
| Brudiclad, Telchor Engineer | Pri | todas as outras fichas viram cópia de uma ficha escolhida |
| Cursed Mirror | Pri | ao entrar vira cópia de uma criatura até o fim do turno, com exceção (haste) |
| Dance with Calamity | Pri | exilar quantas quiser até soma de valor de mana 13; conjurar várias grátis |
| Dawnhand Dissident | Bli | conjurar do exílio pagando com remoção de três marcadores de criaturas |
| Espers to Magicite | Ter | ficha cópia de carta no exílio, exceto que é artefato e perde outros tipos |
| Everlasting Torment | Bli | todo dano como se a fonte tivesse wither; dano não pode ser prevenido; ninguém ganha vida |
| Gogo, Mysterious Mime | Ter | vira cópia de outra criatura exceto o nome; as duas devem atacar |
| Hofri Ghostforge | Lor | ficha cópia com exceções e habilidade vinculada que devolve a carta exilada |
| Inkshield | Sil | prevenção que conta o dano prevenido para criar fichas |
| Joshua, Phoenix's Dominant // Phoenix, Warden of Fire | Ter | exilar e voltar transformado numa Saga criatura; capítulo III volta com a frente para cima |
| Kefka, Dancing Mad | Ter | exílio aleatório dos cemitérios dos oponentes; conjurar mágicas de outros donos grátis; donos perdem vida |
| Locke, Treasure Hunter | Ter | cada jogador moe; permissão de conjurar de entre as cartas moídas de todos |
| Muddle, the Ever-Changing | Pri | vira cópia até o fim do turno com myriad (fichas atacando outros oponentes) |
| Oft-Nabbed Goat | Bli | só oponentes podem ativar; quem ativa ganha o controle |
| Promise of Loyalty | Sil | cada jogador escolhe uma criatura; marcador de juramento cria restrição de ataque contínua |
| Quintorius, Loremaster | Lor | exílio vinculado; conjurar grátis; substitui ida ao cemitério por fundo do grimório |
| Rejoin the Fight | Ter | cada oponente escolhe, em ordem de turno, uma carta ainda não escolhida |
| Renegade Bull | Pri | copiar carta no exílio e conjurar a cópia |
| Rousing Refrain | Pri | suspender; mana que não esvazia entre etapas; exila a si mesma com marcadores de tempo |
| Serra Paragon | Lor | permissão uma vez por turno de jogar terreno ou conjurar do cemitério; concede habilidade ao permanente |
| Slaughter the Strong | Abz | cada jogador escolhe criaturas com poder total até 4 |
| Spinerock Tyrant | Bli | copiar mágica de alvo único; original e cópia ganham wither |
| Spirit of Resilience | Lor | vira cópia de uma das cartas que saíram do cemitério |
| Summon: Esper Valigarmanda | Ter | Saga criatura; conjurar do exílio vinculado gastando mana como se fosse de qualquer tipo |
| Surge to Victory | Pri | a cada dano de combate no turno, copiar a carta exilada e conjurar a cópia |
| Thunderclap Drake | Pri | gatilho atrasado na próxima mágica; número de cópias pelas conjurações do comandante |
| Tragic Arrogance | Lor, Ter | você escolhe, para cada jogador, um permanente de cada tipo a manter |
| Tree of Perdition | Bli | trocar total de vida do oponente com a resistência da criatura (701.12) |
| Tree of Redemption | Abz | trocar seu total de vida com a resistência da criatura (701.12) |
| Veyran, Voice of Duality | Pri | faz habilidades engatilhadas dispararem uma vez a mais |
| Victor, Valgavoth's Seneschal | Sil | conta quantas vezes a habilidade resolveu no turno; põe criatura de qualquer cemitério sob seu controle |
| Weathered Sentinels | Abz | pode atacar jogadores que o atacaram no último turno deles (histórico de ataques) |

## Mecanismos de regra raros e cartas que dependem deles

| Mecanismo | CR | Cartas |
| --- | --- | --- |
| Efeitos de cópia de permanente (camada 1) e fichas cópia | 613.2a | 18: Ashling's Command; Brudiclad, Telchor Engineer; Cursed Mirror; Determined Iteration; Espers to Magicite; Gogo, Mysterious Mime; Hofri Ghostforge; Inspired Skypainter // Maestro's Gift; Leitmotif Composer; Lorehold Archivist // Restore Relic; Muddle, the Ever-Changing; Replication Technique; Rionya, Fire Dancer; Rite of Replication; Spirit of Resilience; Twilight Diviner; Twinflame; Angel of Indemnity |
| Cópia de mágica e conjurar cópia | 707.10, 707.12 | 11: Changing Loyalty; Creative Technique; Ominous Harvest; Plumb the Forbidden; Renegade Bull; Replication Technique; Sevinne's Reclamation; Spinerock Tyrant; Surge to Victory; Thunderclap Drake; Veyran, Voice of Duality |
| Preparação (prepare spell) | 722 | 9: Dirgur Focusmage // Braingeyser; Eccentric Pestfinder // Turn Stones; Eiganjo Dynastorian // Replenish; Grave Researcher // Reanimate; Inspired Skypainter // Maestro's Gift; Kirol, History Buff // Pack a Punch; Lorehold Archivist // Restore Relic; Sanar, Unfinished Genius // Wild Idea; Stensian Sanguinist // Exsanguinate |
| Carta de duas faces que transforma | 712, 701.27 | 2: Ashling, Rekindled // Ashling, Rimebound; Joshua, Phoenix's Dominant // Phoenix, Warden of Fire |
| Saga (inclusive Saga criatura) | 714 | 2: Summon: Esper Valigarmanda; Joshua, Phoenix's Dominant // Phoenix, Warden of Fire |
| Classe | 716 | 1: Advanced Reconstruction |
| Virada para baixo / manifestar | 708, 701.40 | 2: Reality Shift; Abstract Performance |
| Fase (phasing) | 702.26 | 1: Guardian of Faith |
| Monarca | 725 | 1: Grave Venerations |
| Bênção da cidade (ascend) | 702.131 | 1: Tendershoot Dryad |
| Goad e exigências de ataque | 701.15, 508.1d | 9: Coercive Impetus; Ghoulish Impetus; Killian, Decisive Mentor; Martial Impetus; Parasitic Impetus; Redemption Arc; Gogo, Mysterious Mime; Angel of Indemnity; Furygale Flocking |
| Custos para atacar e restrições de ataque por jogador | 508.1g-h | 5: Ghostly Prison; Eriette of the Charmed Apple; Promise of Loyalty; Kulrath Knight; Weathered Sentinels |
| Dano de combate pela resistência / atacar com defensor | 510.1a | 6: Felothar the Steadfast; Assault Formation; Baldin, Century Herdmaster; Walking Bulwark; Wakestone Gargoyle; Weathered Sentinels |
| Fase de combate adicional | 500.8 | 1: Aurelia, the Warleader |
| Ward com custo que não é mana | 702.21 | 1: Auntie Ool, Cursewretch |
| Murchar (wither) e marcadores -1/-1 em massa | 702.80, 704.5q | 7: Everlasting Torment; Kulrath Knight; Massacre Girl, Known Killer; Midnight Banshee; Necroskitter; Spinerock Tyrant; Village Pillagers |
| Trocar total de vida | 701.12 | 2: Tree of Perdition; Tree of Redemption |
| Mudança de controle | 613.1b | 11: Oft-Nabbed Goat; Changing Loyalty; Animate Dead; Necroskitter; The Reaper, King No More; Reanimate; Grave Researcher // Reanimate; Rise of the Dark Realms; Aberrant Return; Rejoin the Fight; Victor, Valgavoth's Seneschal |
| Mudança de tipo/perda de habilidades (camadas 4, 6, 7b) | 613.1d, 613.1f, 613.4b | 8: Darksteel Mutation; Vraska, Betrayal's Sting; The Warring Triad; Restless Spire; Angelic Destiny; Demonic Embrace; Excava, the Risen Past; Arcane Lighthouse |
| Conjurar sem pagar o custo de mana | 118.9 | 10: Abstract Performance; Chimil, the Inner Sun; Creative Technique; Dance with Calamity; Herald of Amity; Kefka, Dancing Mad; Quintorius, Loremaster; Renegade Bull; Rousing Refrain; Surge to Victory |
| Jogar ou conjurar do exílio/cemitério (permissões) | 601.3 | 15: Advanced Reconstruction; Ark of Hunger; Banon, the Returners' Leader; Burning Curiosity; Conspiracy Theorist; Containment Construct; Dawnhand Dissident; Demonic Embrace; Expressive Iteration; Kefka, Dancing Mad; Laelia, the Blade Reforged; Locke, Treasure Hunter; Raffine's Guidance; Serra Paragon; Summon: Esper Valigarmanda |
| Mana com restrição, mana que não esvazia, gatilho de mana gasta | 106.6, 106.4 | 6: Abstract Paintmage; Ashling, Rekindled // Ashling, Rimebound; Path of Ancestry; Study Hall; Rousing Refrain; Summon: Esper Valigarmanda |
| Quantidade/cores de mana gasta | 601.2h | 3: Manaform Hellkite; Molten-Core Maestro; Painful Truths |
| Mana híbrida, mono-híbrida e phyrexiana | 107.4e-f, 702.150 | 12: Abstract Paintmage; Balefire Liege; Creakwood Liege; Everlasting Torment; Kulrath Knight; The Reaper, King No More; Vraska, Betrayal's Sting; Cascade Bluffs; Fetid Heath; Graven Cairns; Rugged Prairie; Twilight Mire |
| Prevenção de dano | 615 | 2: Inkshield; Everlasting Torment |
| Aleatoriedade além de embaralhar | — | 2: Advanced Reconstruction; Kefka, Dancing Mad |
| Histórico de eventos do turno (vida ganha, cartas saídas, 2ª mágica etc.) | — | 26: Betor, Ancestor's Voice; Defiling Daemogoth; Indulging Patrician; Mortality Spear; Moseo, Vein's New Dean; Eccentric Pestfinder // Turn Stones; Witch of the Moors; Blossoming Bogbeast; Gau, Feral Youth; Relic Retriever; Primary Research; Faerie Mastermind; Mangara, the Diplomat; Monologue Tax; Skirsdag High Priest; Gorma, the Gullet; Lasting Tarfire; Ominous Harvest; Perforating Artist; Rootha, Mastering the Moment; Rionya, Fire Dancer; Hall of Oracles; Sanar, Unfinished Genius // Wild Idea; Banon, the Returners' Leader; Weathered Sentinels; Victor, Valgavoth's Seneschal |
| Contagem de conjurações do comandante | 903.8 | 3: Thunderclap Drake; Vanguard of the Restless; Study Hall |
| Identidade de cor do comandante em habilidades | 903.4 | 5: Arcane Signet; Command Tower; Commander's Sphere; Path of Ancestry; War Room |
| Palavras-chave raras (uma carta ou duas) | 702 | 30: Bitterthorn, Nissa's Animus; Eidolon of Countless Battles; Rousing Refrain; Angel of Indemnity; Priest of Fell Rites; Sentinel's Eyes; Woe Strider; Dig Through Time; Treasure Cruise; Rite of Replication; Changing Loyalty; Creative Technique; Replication Technique; Ominous Harvest; Mycoloth; Ribtruss Roaster; Muddle, the Ever-Changing; Eldrazi Conscription; Sidar Kondo of Jamuraa; Nether Traitor; Behind the Scenes; Ignoble Hierarch; Karmic Guide; Guardian Scalelord; Jadar, Ghoulcaller of Nephalia; Twinflame; Tomik, Wielder of Law; Pearl-Ear, Imperial Advisor; Chimil, the Inner Sun; Excava, the Risen Past |

## Por deck

| Deck | Únicas | Genérico | Especial | Rulings |
| --- | ---: | ---: | ---: | ---: |
| Abzan Armor | 85 | 77 | 3 | 126 |
| Blight Curse | 85 | 77 | 5 | 183 |
| Lorehold Spirit | 85 | 76 | 7 | 205 |
| Prismari Artistry | 87 | 75 | 10 | 334 |
| Silverquill Influence | 86 | 79 | 5 | 218 |
| Terra | 93 | 81 | 9 | 184 |
| Witherbloom Pestilence | 86 | 84 | 0 | 213 |
