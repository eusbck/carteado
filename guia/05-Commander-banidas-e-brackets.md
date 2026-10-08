# Commander: legalidade, banidas e brackets

Consultado em **03/10/2026** na [lista oficial da Wizards](https://magic.wizards.com/en/banned-restricted-list) e na [página oficial do formato](https://magic.wizards.com/en/formats/commander). Esta é uma fotografia da consulta, não uma promessa de que a lista permanecerá igual.

## Banidas nominalmente no formato

Ancestral Recall; Balance; Black Lotus; Chaos Orb; Channel; Dockside Extortionist; Emrakul, the Aeons Torn; Erayo, Soratami Ascendant; Falling Star; Fastbond; Flash; Golos, Tireless Pilgrim; Griselbrand; Hullbreacher; Iona, Shield of Emeria; Karakas; Jeweled Lotus; Leovold, Emissary of Trest; Library of Alexandria; Limited Resources; Mana Crypt; Mox Emerald; Mox Jet; Mox Pearl; Mox Ruby; Mox Sapphire; Nadu, Winged Wisdom; Paradox Engine; Primeval Titan; Prophet of Kruphix; Recurring Nightmare; Rofellos, Llanowar Emissary; Shahrazad; Sundering Titan; Sylvan Primordial; Time Vault; Time Walk; Tinker; Tolarian Academy; Trade Secrets; Upheaval; Yawgmoth’s Bargain.

Além dessa lista nominal, a página oficial inclui **cartas de tipo Conspiracy**, **cartas que se referem a jogar por ante** e **cartas ofensivas banidas em todos os formatos**, com links para seus conjuntos/listas. A legalidade também exclui cartas não autorizadas para construção normal, como playtest/acorn, salvo acordo de casa. Uma impressão alternativa com nome intercambiável não contorna um banimento.

**Lutri, the Spellchaser** está banida **somente como companion**. Ela pode ser usada no deck ou como comandante se forem respeitadas as demais condições. **Biorhythm** está desbanida. Essas mudanças entraram em vigor em 09/02/2026. Não reutilize uma lista antiga que ainda diga que as duas estão totalmente banidas. [Anúncio oficial](https://magic.wizards.com/en/news/announcements/commander-banned-and-restricted-february-9-2026).

Commander não usa a lista de banidas de Modern, Standard, Brawl ou Duel Commander. Commander não possui uma regra geral de “banida só como comandante” para as cartas listadas acima: a restrição específica atual destacada é a de Lutri como companion. O arquivo `dados/banidas-commander.json` preserva nomes e categorias para futura validação automatizada; conferir a banlist é apenas uma parte de validar um deck.

## Brackets: conversar sobre a partida

Brackets são uma ferramenta **opcional** de alinhamento, não uma regra que altera prioridade, pilha, vida ou dano. A página oficial consultada ainda apresenta o sistema em beta. O objetivo é combinar intenção, velocidade e estilo da experiência. [Fonte oficial](https://magic.wizards.com/en/formats/commander).

| Bracket | Intenção geral | Game Changers na proposta padrão |
| --- | --- | --- |
| 1 — Exhibition | Mostrar um tema/proposta de deck; pode incluir adaptações combinadas | Zero, ressalvados acordos temáticos da mesa |
| 2 — Core | Experiência social e planos graduais, com decks menos otimizados | Zero |
| 3 — Upgraded | Sinergia e qualidade maiores; interações e grandes turnos | Até três |
| 4 — Optimized | Decks fortes, rápidos e consistentes, sem exigir metagame cEDH | Sem limite da lista |
| 5 — cEDH | Otimização para o ambiente competitivo de Commander | Sem limite da lista |

A quantidade de Game Changers não determina sozinha o bracket: combos de duas cartas, encadeamento de turnos extras, negação ampla de terrenos, velocidade e intenção também importam. **Game Changer não significa carta banida.** A lista muda e deve ser consultada na página do formato; não foi copiada integralmente para esta base.

A atualização de outubro de 2025 apresenta expectativas de permitir pelo menos 9, 8, 6 e 4 turnos nos brackets 1, 2, 3 e 4, respectivamente; o 5 pode terminar em qualquer turno. São expectativas de construção/experiência, não uma regra de que “é proibido vencer antes de tal turno” aplicada automaticamente pelo motor do jogo. Um combo cedo não vira apropriado para o bracket só porque o piloto promete segurá-lo na mão. Restrições antigas vagas de quantidade de tutores foram removidas naquela atualização. [Definições oficiais](https://magic.wizards.com/en/news/announcements/commander-brackets-beta-update-october-21-2025).

Em fevereiro de 2026, a Wizards manteve a identidade de cor híbrida, adicionou Farewell e Biorhythm à lista de Game Changers e esclareceu a situação de Lutri. Para a partida futura, a página viva do formato é o ponto de conferência da lista. [Atualização oficial](https://magic.wizards.com/en/news/announcements/commander-brackets-beta-update-february-9-2026).

## Conversa de dois minutos antes do jogo

1. Quais são os comandantes e qual é o plano dos decks? Há dois comandantes ou companion?
2. Qual bracket/velocidade vocês esperam? Há combos fáceis, turnos extras em sequência ou negação de terrenos?
3. Há cartas banidas, proxies, cartas de teste ou adaptações? Todos concordam explicitamente?
4. Como serão os atalhos de combate e de passar o turno?
5. Como o grupo prefere corrigir um erro percebido tarde e lidar com concessão?
6. Quem vai registrar vida, veneno e os danos separados por comandante?

Evite presumir que um precon tem automaticamente um bracket fixo: diferentes precons têm experiências diferentes. Anulações e remoções são ações normais quando legais; restrições sociais adicionais precisam ser combinadas.
