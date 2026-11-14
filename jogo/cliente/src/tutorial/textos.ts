// Os textos do Como jogar, em português e em inglês. O tipo de `pt` é o molde: faltou uma chave no inglês, o
// typecheck reclama (e testes/tutorial.test.ts confere as listas). O resto do jogo é só em português.

import type { IdCena } from './cenas.ts';

export type Idioma = 'pt' | 'en';

/** as partes da carta que têm um ponto clicável */
export type ParteCarta = 'nome' | 'custo' | 'tipo' | 'colecao' | 'texto' | 'poder';

export interface Passo { cena: IdCena; titulo: string; texto: string }
export interface Capitulo { titulo: string; resumo: string; passos: Passo[] }

export interface Textos {
  botao: string;
  fechar: string;
  idioma: string;
  abertura: { sobre: string; titulo: string; texto: string; rolar: string };
  carta: { titulo: string; resumo: string; dica: string; partes: Record<ParteCarta, { nome: string; texto: string }> };
  capitulos: Capitulo[];
  palco: { rotulo: string; voce: string; oponente: string; mao: string; grimorio: string; cemiterio: string; comando: string; fases: [string, string, string, string, string]; enjoo: string; exilio: string };
  fim: { titulo: string; texto: string; botao: string };
}

const pt: Textos = {
  botao: 'Como jogar',
  fechar: 'Fechar (Esc)',
  idioma: 'Idioma',
  abertura: {
    sobre: 'Como jogar',
    titulo: 'Magic em cinco capítulos',
    texto: 'Magic é um jogo de cartas em que cada jogador é um mago: você junta mana dos seus terrenos, conjura criaturas e mágicas e ataca até a vida dos outros acabar. Aqui vai o essencial para sentar à mesa, do primeiro embaralhar ao dano de comandante.',
    rolar: 'É só rolar para baixo',
  },
  carta: {
    titulo: 'Como ler uma carta',
    resumo: 'Toda carta segue o mesmo desenho. Clique nos pontos para ver o que cada parte diz.',
    dica: 'Clique em um ponto',
    partes: {
      nome: { nome: 'Nome', texto: 'É por ele que as regras conhecem a carta. No Commander, tirando os terrenos básicos, o deck só pode ter uma cópia de cada nome.' },
      custo: { nome: 'Custo de mana', texto: 'Quanto você paga para conjurar. Esta custa {3}{W}{W}: duas manas brancas e mais três de qualquer cor. O número é a parte genérica.' },
      tipo: { nome: 'Tipo', texto: 'Diz o que a carta é: terreno, criatura, artefato, encantamento, planeswalker, mágica instantânea ou feitiço. Depois do travessão vêm os subtipos, como Anjo.' },
      colecao: { nome: 'Símbolo da coleção', texto: 'Mostra de qual coleção a carta veio. A cor dele indica a raridade: preto para comum, prata para incomum, ouro para rara e laranja para mítica.' },
      texto: { nome: 'Caixa de texto', texto: 'As habilidades da carta. O que está entre parênteses e em itálico é só um lembrete de como uma palavra-chave funciona.' },
      poder: { nome: 'Poder e resistência', texto: 'Só as criaturas têm. O primeiro número é o dano que ela causa em combate; o segundo, quanto dano no mesmo turno é preciso para destruí-la. O dano some no fim do turno.' },
    },
  },
  capitulos: [
    {
      titulo: 'Preparação',
      resumo: 'Antes do primeiro turno.',
      passos: [
        { cena: 'comprar', titulo: 'Embaralhe e compre sete', texto: 'Seu deck vira o seu grimório: a pilha de onde você compra. Cada jogador embaralha o seu e compra sete cartas. Essa é a sua mão, e só você a vê.' },
        { cena: 'mulligan', titulo: 'Mão ruim? Mulligan', texto: 'Uma mão sem terrenos, ou só com eles, quase não joga. Antes da partida começar você pode trocar cartas por outras do grimório. Como a troca funciona depende da regra escolhida na sala.' },
        { cena: 'vida', titulo: 'Vida e quem começa', texto: 'Cada jogador tem um total de vida, e quem chega a zero perde. A mesa marca a vida por você e sorteia quem joga primeiro. Numa partida de dois, quem começa não compra carta no primeiro turno.' },
      ],
    },
    {
      titulo: 'Conjurar mágicas',
      resumo: 'Mana entra, mágica sai.',
      passos: [
        { cena: 'custo', titulo: 'Toda mágica tem um custo', texto: 'O custo fica no canto de cima da carta. Um símbolo colorido pede mana daquela cor; um número pede aquela quantidade de mana de qualquer cor. Este elfo custa uma única mana verde.' },
        { cena: 'terrenos', titulo: 'Terrenos dão mana', texto: 'Você pode baixar um terreno por turno, de graça. Para pagar uma mágica, vire terrenos: cada um virado dá uma mana, e ele só desvira no seu próximo turno.' },
        { cena: 'permanentes', titulo: 'Permanentes ficam na mesa', texto: 'Criaturas, artefatos e encantamentos entram no campo de batalha e ficam lá. Uma criatura que acabou de chegar está com enjoo de invocação: só pode atacar ou virar a partir do seu próximo turno.' },
        { cena: 'instantaneas', titulo: 'Instantâneas e feitiços', texto: 'Essas mágicas fazem o efeito uma vez e vão para o cemitério, a sua pilha de descarte. Feitiços só no seu turno; instantâneas a qualquer momento, até no turno dos outros.' },
      ],
    },
    {
      titulo: 'O turno',
      resumo: 'Cinco fases, sempre na mesma ordem.',
      passos: [
        { cena: 'inicio', titulo: 'Fase inicial', texto: 'Três coisas, uma atrás da outra: desvire tudo o que é seu, passe pela manutenção (algumas cartas agem aqui) e compre uma carta.' },
        { cena: 'principal1', titulo: 'Primeira fase principal', texto: 'É aqui que você baixa o terreno do turno e conjura criaturas, feitiços e o resto. Vale pensar no que guardar para depois do combate.' },
        { cena: 'combate', titulo: 'Combate', texto: 'Suas criaturas atacam os outros jogadores. Atacar é opcional, e criatura que ataca fica virada. O capítulo seguinte mostra o combate por dentro.' },
        { cena: 'principal2', titulo: 'Segunda fase principal', texto: 'Igual à primeira, só que depois do combate. Se ainda não baixou o terreno do turno, ainda dá. Boa hora para conjurar o que você não quis mostrar antes de atacar.' },
        { cena: 'final', titulo: 'Fase final', texto: 'O dano nas criaturas some, os efeitos "até o fim do turno" acabam e, se você tiver mais de sete cartas na mão, descarta até ficar com sete. A vez passa para o próximo.' },
      ],
    },
    {
      titulo: 'Combate',
      resumo: 'Atacar, bloquear, causar dano.',
      passos: [
        { cena: 'atacantes', titulo: 'Declare os atacantes', texto: 'Escolha quais criaturas desviradas atacam e quem cada uma ataca. Elas viram ao atacar, então não vão poder bloquear no turno dos outros.' },
        { cena: 'bloqueadores', titulo: 'O defensor bloqueia', texto: 'Quem está sendo atacado escolhe criaturas desviradas para bloquear. Cada bloqueadora para uma atacante; mais de uma pode bloquear a mesma. Bloquear nunca é obrigatório.' },
        { cena: 'dano', titulo: 'O dano acontece', texto: 'Tudo ao mesmo tempo. A atacante bloqueada troca dano com quem a bloqueou; a que passou livre tira vida do jogador. Criatura que leva dano igual ou maior que a resistência vai para o cemitério.' },
      ],
    },
    {
      titulo: 'Commander',
      resumo: 'O formato desta mesa.',
      passos: [
        { cena: 'comandante', titulo: 'Seu comandante', texto: 'Uma criatura lendária lidera o deck. Ela não vai embaralhada: começa na zona de comando, à vista de todos, e você pode conjurá-la de lá sempre que puder pagar.' },
        { cena: 'identidade', titulo: 'Identidade de cor e cem cartas', texto: 'O deck tem exatamente 100 cartas contando o comandante, e só uma cópia de cada, fora os terrenos básicos. Todas têm que caber nas cores do comandante: se ele é verde e branco, nada de azul, preto ou vermelho.' },
        { cena: 'quarenta', titulo: 'Quarenta de vida, vários jogadores', texto: 'Cada um começa com 40 de vida, o dobro do Magic comum. A mesa junta de dois a seis jogadores, todos contra todos, e vence quem sobrar por último.' },
        { cena: 'taxa', titulo: 'A taxa de comandante', texto: 'Se o comandante morrer ou for exilado, você pode mandá-lo de volta para a zona de comando. Dá para conjurá-lo de novo, mas cada volta custa duas manas a mais que a anterior.' },
        { cena: 'danoComandante', titulo: 'Dano de comandante', texto: 'Há um segundo jeito de perder: levar 21 de dano de combate do mesmo comandante ao longo da partida, não importa quanta vida você tenha. A mesa conta isso separado, comandante por comandante.' },
      ],
    },
  ],
  palco: {
    rotulo: 'Mesa de exemplo',
    voce: 'Você',
    oponente: 'Oponente',
    mao: 'Mão',
    grimorio: 'Grimório',
    cemiterio: 'Cemitério',
    comando: 'Comando',
    fases: ['Inicial', 'Principal 1', 'Combate', 'Principal 2', 'Final'],
    enjoo: 'enjoo',
    exilio: 'exilada',
  },
  fim: {
    titulo: 'Pronto para jogar',
    texto: 'O resto se aprende jogando. Na mesa, as cartas que você pode usar brilham se os auxílios estiverem ligados, e passar o mouse sobre qualquer carta mostra ela em tamanho grande.',
    botao: 'Fechar e jogar',
  },
};

const en: Textos = {
  botao: 'How to play',
  fechar: 'Close (Esc)',
  idioma: 'Language',
  abertura: {
    sobre: 'How to play',
    titulo: 'Magic in five chapters',
    texto: 'Magic is a card game where every player is a wizard: you draw mana from your lands, cast creatures and spells, and attack until the others run out of life. Here is what you need to sit at the table, from the first shuffle to commander damage.',
    rolar: 'Just scroll down',
  },
  carta: {
    titulo: 'How to read a card',
    resumo: 'Every card follows the same layout. Click the dots to see what each part tells you.',
    dica: 'Click a dot',
    partes: {
      nome: { nome: 'Name', texto: 'This is how the rules know the card. In Commander, apart from basic lands, your deck can hold only one copy of each name.' },
      custo: { nome: 'Mana cost', texto: 'What you pay to cast it. This one costs {3}{W}{W}: two white mana plus three of any color. The number is the generic part.' },
      tipo: { nome: 'Type', texto: 'Says what the card is: land, creature, artifact, enchantment, planeswalker, instant or sorcery. After the dash come the subtypes, such as Angel.' },
      colecao: { nome: 'Set symbol', texto: 'Shows which set the card came from. Its color gives the rarity: black for common, silver for uncommon, gold for rare and orange for mythic.' },
      texto: { nome: 'Text box', texto: 'The card\'s abilities. Anything in italics inside parentheses is just a reminder of how a keyword works.' },
      poder: { nome: 'Power and toughness', texto: 'Only creatures have these. The first number is the damage it deals in combat; the second is how much damage in one turn destroys it. Damage wears off at end of turn.' },
    },
  },
  capitulos: [
    {
      titulo: 'Setup',
      resumo: 'Before the first turn.',
      passos: [
        { cena: 'comprar', titulo: 'Shuffle and draw seven', texto: 'Your deck becomes your library: the pile you draw from. Each player shuffles theirs and draws seven cards. That is your hand, and only you see it.' },
        { cena: 'mulligan', titulo: 'Bad hand? Mulligan', texto: 'A hand with no lands, or nothing but lands, barely plays. Before the game starts you may trade cards for others from your library. How the trade works depends on the rule picked for the room.' },
        { cena: 'vida', titulo: 'Life and who goes first', texto: 'Each player has a life total, and whoever hits zero loses. The table tracks life for you and picks at random who goes first. In a two-player game, the player who starts skips their first draw.' },
      ],
    },
    {
      titulo: 'Casting spells',
      resumo: 'Mana in, spells out.',
      passos: [
        { cena: 'custo', titulo: 'Every spell has a cost', texto: 'The cost sits in the top corner of the card. A colored symbol asks for mana of that color; a number asks for that much mana of any color. This elf costs a single green mana.' },
        { cena: 'terrenos', titulo: 'Lands make mana', texto: 'You may play one land per turn, for free. To pay for a spell, tap lands: each tapped land gives one mana, and it only untaps on your next turn.' },
        { cena: 'permanentes', titulo: 'Permanents stay in play', texto: 'Creatures, artifacts and enchantments enter the battlefield and stay there. A creature that just arrived has summoning sickness: it can only attack or tap starting on your next turn.' },
        { cena: 'instantaneas', titulo: 'Instants and sorceries', texto: 'These spells do their effect once and go to the graveyard, your discard pile. Sorceries only on your turn; instants at any time, even on other players\' turns.' },
      ],
    },
    {
      titulo: 'Your turn',
      resumo: 'Five phases, always in the same order.',
      passos: [
        { cena: 'inicio', titulo: 'Beginning phase', texto: 'Three things, one after the other: untap everything you control, go through upkeep (some cards act here) and draw a card.' },
        { cena: 'principal1', titulo: 'First main phase', texto: 'This is where you play your land for the turn and cast creatures, sorceries and the rest. Think about what to hold until after combat.' },
        { cena: 'combate', titulo: 'Combat', texto: 'Your creatures attack the other players. Attacking is optional, and a creature that attacks becomes tapped. The next chapter shows combat from the inside.' },
        { cena: 'principal2', titulo: 'Second main phase', texto: 'Same as the first, only after combat. If you have not played your land yet, you still can. A good time to cast what you did not want to show before attacking.' },
        { cena: 'final', titulo: 'Ending phase', texto: 'Damage on creatures wears off, "until end of turn" effects end and, if you hold more than seven cards, you discard down to seven. Then the next player takes their turn.' },
      ],
    },
    {
      titulo: 'Combat',
      resumo: 'Attack, block, deal damage.',
      passos: [
        { cena: 'atacantes', titulo: 'Declare attackers', texto: 'Choose which untapped creatures attack and who each one attacks. They tap as they attack, so they will not be able to block on the other players\' turns.' },
        { cena: 'bloqueadores', titulo: 'The defender blocks', texto: 'The player being attacked chooses untapped creatures to block. Each blocker stops one attacker; several can block the same one. Blocking is never mandatory.' },
        { cena: 'dano', titulo: 'Damage is dealt', texto: 'All at once. A blocked attacker trades damage with its blocker; one that got through takes life from the player. A creature dealt damage equal to or greater than its toughness goes to the graveyard.' },
      ],
    },
    {
      titulo: 'Commander',
      resumo: 'The format this table plays.',
      passos: [
        { cena: 'comandante', titulo: 'Your commander', texto: 'A legendary creature leads the deck. It is not shuffled in: it starts in the command zone, in plain sight, and you may cast it from there whenever you can pay.' },
        { cena: 'identidade', titulo: 'Color identity and one hundred cards', texto: 'The deck has exactly 100 cards counting the commander, and only one copy of each, apart from basic lands. Every card must fit the commander\'s colors: if it is green and white, no blue, black or red.' },
        { cena: 'quarenta', titulo: 'Forty life, several players', texto: 'Everyone starts at 40 life, twice the usual. The table seats two to six players, everyone against everyone, and the last one standing wins.' },
        { cena: 'taxa', titulo: 'Commander tax', texto: 'If your commander dies or is exiled, you may send it back to the command zone. You can cast it again, but each return costs two more mana than the one before.' },
        { cena: 'danoComandante', titulo: 'Commander damage', texto: 'There is a second way to lose: taking 21 combat damage from the same commander over the course of the game, no matter how much life you have. The table counts it separately, commander by commander.' },
      ],
    },
  ],
  palco: {
    rotulo: 'Example table',
    voce: 'You',
    oponente: 'Opponent',
    mao: 'Hand',
    grimorio: 'Library',
    cemiterio: 'Graveyard',
    comando: 'Command',
    fases: ['Beginning', 'Main 1', 'Combat', 'Main 2', 'Ending'],
    enjoo: 'sick',
    exilio: 'exiled',
  },
  fim: {
    titulo: 'Ready to play',
    texto: 'The rest you learn by playing. At the table, the cards you can use glow when the assists are on, and hovering over any card shows it at full size.',
    botao: 'Close and play',
  },
};

export const TEXTOS: Record<Idioma, Textos> = { pt, en };
