// Os textos do Como jogar, em português e em inglês. O tipo de `pt` é o molde: faltou uma chave no inglês, o
// typecheck reclama (e testes/tutorial.test.ts confere as listas). Entre [[colchetes duplos]] ficam os termos do
// jogo, que a página destaca. O resto do jogo é só em português.

import type { IdCena } from './filme.ts';

export type Idioma = 'pt' | 'en';

/** as partes da carta que têm um ponto clicável */
export type ParteCarta = 'nome' | 'custo' | 'tipo' | 'colecao' | 'texto' | 'poder';

export interface Passo { cena: IdCena; titulo: string; texto: string }
export interface Capitulo { titulo: string; resumo: string; passos: Passo[] }

type ChaveMarca = 'semTerreno' | 'fundo' | 'voceComeca' | 'custoElfo' | 'umPorTurno' | 'manaG' | 'enjoo' | 'alvo' | 'exilada' | 'desvirar' | 'compra' | 'jaBaixou' | 'vez' | 'cores' | 'jogadores' | 'morre' | 'taxa' | 'rastreio';

export interface Textos {
  botao: string;
  fechar: string;
  idioma: string;
  abertura: { sobre: string; titulo: string; texto: string; rolar: string };
  carta: { titulo: string; resumo: string; partes: Record<ParteCarta, { nome: string; texto: string }> };
  capitulos: Capitulo[];
  palco: { rotulo: string; voce: string; oponente: string; grimorio: string; cemiterio: string; comando: string; fases: [string, string, string, string, string]; marcas: Record<ChaveMarca, string> };
  fim: { titulo: string; texto: string; botao: string; voltar: string };
}

const pt: Textos = {
  botao: 'Como jogar',
  fechar: 'Fechar (Esc)',
  idioma: 'Idioma',
  abertura: {
    sobre: 'Como jogar',
    titulo: 'Aprenda Magic em cinco capítulos',
    texto: 'Cada jogador é um mago. Você tira mana dos seus terrenos, conjura criaturas e mágicas e ataca até a vida dos outros acabar. Role a página: a mesa ao lado joga uma partida enquanto você lê.',
    rolar: 'Role para começar',
  },
  carta: {
    titulo: 'Como ler uma carta',
    resumo: 'Toda carta tem o mesmo desenho. Toque nos pontos.',
    partes: {
      nome: { nome: 'Nome', texto: 'É por ele que as regras chamam a carta. No Commander, tirando os terrenos básicos, o deck só pode ter uma cópia de cada nome.' },
      custo: { nome: 'Custo de mana', texto: 'O que você paga para conjurar. Esta custa {3}{W}{W}: duas manas brancas e mais três de qualquer cor. O número é a parte genérica.' },
      tipo: { nome: 'Linha de tipo', texto: 'O que a carta é: terreno, criatura, artefato, encantamento, planeswalker, mágica instantânea ou feitiço. Depois do travessão vêm os subtipos, como Anjo.' },
      colecao: { nome: 'Símbolo da coleção', texto: 'De qual coleção a carta veio. A cor dá a raridade: preto é comum, prata incomum, ouro rara e laranja mítica.' },
      texto: { nome: 'Caixa de texto', texto: 'As habilidades da carta. O que vem em itálico entre parênteses é só um lembrete de como a palavra-chave funciona.' },
      poder: { nome: 'Poder e resistência', texto: 'Só as criaturas têm. O primeiro número é o dano que ela causa em combate; o segundo, quanto dano no mesmo turno a destrói. O dano some no fim do turno.' },
    },
  },
  capitulos: [
    {
      titulo: 'Preparação',
      resumo: 'Antes do primeiro turno.',
      passos: [
        { cena: 'comprar', titulo: 'Embaralhe e compre sete', texto: 'Seu deck é o seu [[grimório]]. Cada jogador embaralha o dele e compra sete cartas: essa é a sua [[mão]], e só você a vê.' },
        { cena: 'mulligan', titulo: 'Mão ruim? Mulligan', texto: 'Sem nenhum terreno não dá para jogar. No [[mulligan]] a mão inteira volta para o grimório, você embaralha e compra sete de novo. Depois põe no fundo do grimório uma carta para cada mulligan que fez. (A sala pode usar outras regras de mulligan.)' },
        { cena: 'vida', titulo: 'Vida e quem começa', texto: 'Cada jogador começa com 40 de [[vida]], e quem chega a zero perde. A mesa marca a vida de todo mundo e sorteia quem joga primeiro.' },
      ],
    },
    {
      titulo: 'Conjurar mágicas',
      resumo: 'Mana entra, mágica sai.',
      passos: [
        { cena: 'custo', titulo: 'Toda mágica tem um custo', texto: 'O custo fica no canto de cima. Cada símbolo colorido pede uma [[mana]] daquela cor; um número pede aquela quantidade de mana de qualquer cor. Este elfo custa uma mana verde.' },
        { cena: 'terrenos', titulo: 'Terrenos dão a mana', texto: 'Uma vez por turno você baixa um [[terreno]] da mão, de graça. Para pagar, [[vire]] o terreno de lado: ele dá uma mana e só desvira no seu próximo turno. Pago o custo, o elfo entra.' },
        { cena: 'permanentes', titulo: 'Permanentes ficam na mesa', texto: 'Criaturas, artefatos e encantamentos são [[permanentes]]: ficam no campo de batalha. Criatura que acabou de chegar tem [[enjoo de invocação]] e só ataca no seu próximo turno.' },
        { cena: 'instantaneas', titulo: 'Instantâneas e feitiços', texto: 'Estas mágicas fazem o efeito uma vez e vão para o [[cemitério]]. Aqui, uma mágica branca exila a criatura do oponente. [[Feitiços]] só no seu turno; [[instantâneas]] a qualquer momento.' },
      ],
    },
    {
      titulo: 'O turno',
      resumo: 'Cinco fases, sempre na mesma ordem.',
      passos: [
        { cena: 'inicio', titulo: 'Fase inicial', texto: 'Três coisas em sequência: [[desvire]] tudo o que é seu, passe pela [[manutenção]] e [[compre]] uma carta.' },
        { cena: 'principal1', titulo: 'Primeira fase principal', texto: 'Hora de baixar o terreno do turno e conjurar o que quiser. Com três terrenos virados, o anjo entra.' },
        { cena: 'combate', titulo: 'Combate', texto: 'Suas criaturas sem enjoo podem [[atacar]]. O elfo ataca, ninguém bloqueia, e o oponente perde 1 de vida. O próximo capítulo mostra o combate de perto.' },
        { cena: 'principal2', titulo: 'Segunda fase principal', texto: 'Igual à primeira, depois do combate. Mas o terreno do turno já foi: a outra floresta fica na mão até o próximo turno.' },
        { cena: 'final', titulo: 'Fase final', texto: 'O dano nas criaturas some, os efeitos "até o fim do turno" acabam e, com mais de sete cartas na mão, você descarta até sete. A vez passa.' },
      ],
    },
    {
      titulo: 'Combate',
      resumo: 'Atacar, bloquear, causar dano.',
      passos: [
        { cena: 'atacantes', titulo: 'Declare os atacantes', texto: 'No seu turno seguinte tudo desvira. Escolha quais criaturas atacam e quem cada uma ataca: elas viram ao atacar.' },
        { cena: 'bloqueadores', titulo: 'O defensor bloqueia', texto: 'Quem é atacado escolhe criaturas desviradas para [[bloquear]]. A fera bloqueia o elfo; o anjo passa livre. Bloquear nunca é obrigatório.' },
        { cena: 'dano', titulo: 'O dano acontece', texto: 'Tudo ao mesmo tempo. O elfo dá 1 na fera e leva 3: com dano igual ou maior que a [[resistência]], vai para o cemitério. O anjo tira 3 de vida do oponente.' },
      ],
    },
    {
      titulo: 'Commander',
      resumo: 'O formato desta mesa.',
      passos: [
        { cena: 'comandante', titulo: 'Seu comandante', texto: 'Uma criatura lendária lidera o deck. Ela começa na [[zona de comando]], à vista de todos, e você pode conjurá-la de lá sempre que puder pagar.' },
        { cena: 'identidade', titulo: 'Identidade de cor', texto: 'O deck tem 100 cartas contando o comandante, uma cópia de cada (fora os terrenos básicos). Todas cabem nas cores do comandante: verde e branco aqui, então nada de azul.' },
        { cena: 'quarenta', titulo: 'De dois a seis jogadores', texto: 'Todos começam com 40 de vida, o dobro do Magic comum. É todo mundo contra todo mundo, e vence quem sobrar.' },
        { cena: 'taxa', titulo: 'A taxa de comandante', texto: 'Se o comandante morrer ou for exilado, você pode mandá-lo de volta para a zona de comando. Dá para conjurá-lo de novo, mas cada vez custa duas manas a mais: a [[taxa de comandante]].' },
        { cena: 'danoComandante', titulo: 'Dano de comandante', texto: 'Um segundo jeito de perder: levar 21 de [[dano de comandante]], o dano de combate de um mesmo comandante somado na partida inteira. A mesa conta para você.' },
      ],
    },
  ],
  palco: {
    rotulo: 'Uma partida de exemplo',
    voce: 'Você',
    oponente: 'Oponente',
    grimorio: 'Grimório',
    cemiterio: 'Cemitério',
    comando: 'Comando',
    fases: ['Inicial', 'Principal 1', 'Combate', 'Principal 2', 'Final'],
    marcas: {
      semTerreno: 'Nenhum terreno', fundo: 'Esta vai para o fundo', voceComeca: 'Você começa', custoElfo: 'Custo: 1 verde', umPorTurno: '1 terreno por turno',
      manaG: '+1 verde', enjoo: 'zZ', alvo: 'Alvo', exilada: 'Exilada', desvirar: 'Desvira tudo', compra: '+1 carta', jaBaixou: 'Já baixou terreno neste turno',
      vez: 'Vez do próximo', cores: 'Verde e branco', jogadores: '2 a 6 jogadores · 40 de vida', morre: 'Morreu', taxa: '+2 de taxa', rastreio: 'Comandante: 3 / 21',
    },
  },
  fim: {
    titulo: 'Pronto para jogar',
    texto: 'O resto se aprende jogando. Na mesa, o que você pode usar brilha (com os auxílios ligados) e passar o mouse numa carta mostra ela grande.',
    botao: 'Fechar e jogar',
    voltar: 'Ver de novo',
  },
};

const en: Textos = {
  botao: 'How to play',
  fechar: 'Close (Esc)',
  idioma: 'Language',
  abertura: {
    sobre: 'How to play',
    titulo: 'Learn Magic in five chapters',
    texto: 'Every player is a wizard. You draw mana from your lands, cast creatures and spells, and attack until the others run out of life. Scroll down: the table beside the text plays a game while you read.',
    rolar: 'Scroll to begin',
  },
  carta: {
    titulo: 'How to read a card',
    resumo: 'Every card has the same layout. Tap the dots.',
    partes: {
      nome: { nome: 'Name', texto: 'This is how the rules refer to the card. In Commander, apart from basic lands, a deck holds only one copy of each name.' },
      custo: { nome: 'Mana cost', texto: 'What you pay to cast it. This one costs {3}{W}{W}: two white mana plus three of any color. The number is the generic part.' },
      tipo: { nome: 'Type line', texto: 'What the card is: land, creature, artifact, enchantment, planeswalker, instant or sorcery. After the dash come the subtypes, such as Angel.' },
      colecao: { nome: 'Set symbol', texto: 'Which set the card came from. Its color gives the rarity: black is common, silver uncommon, gold rare and orange mythic.' },
      texto: { nome: 'Text box', texto: 'The card\'s abilities. Anything in italics inside parentheses is just a reminder of how a keyword works.' },
      poder: { nome: 'Power and toughness', texto: 'Only creatures have these. The first number is the damage it deals in combat; the second is how much damage in one turn destroys it. Damage wears off at end of turn.' },
    },
  },
  capitulos: [
    {
      titulo: 'Setup',
      resumo: 'Before the first turn.',
      passos: [
        { cena: 'comprar', titulo: 'Shuffle and draw seven', texto: 'Your deck is your [[library]]. Each player shuffles theirs and draws seven cards: that is your [[hand]], and only you see it.' },
        { cena: 'mulligan', titulo: 'Bad hand? Mulligan', texto: 'With no lands you cannot play. When you [[mulligan]], your whole hand goes back into the library, you shuffle and draw seven again. Then you put one card on the bottom of your library for each mulligan you took. (The room may use other mulligan rules.)' },
        { cena: 'vida', titulo: 'Life and who goes first', texto: 'Each player starts at 40 [[life]], and whoever hits zero loses. The table tracks everyone\'s life and picks at random who goes first.' },
      ],
    },
    {
      titulo: 'Casting spells',
      resumo: 'Mana in, spells out.',
      passos: [
        { cena: 'custo', titulo: 'Every spell has a cost', texto: 'The cost sits in the top corner. Each colored symbol asks for one [[mana]] of that color; a number asks for that much mana of any color. This elf costs one green mana.' },
        { cena: 'terrenos', titulo: 'Lands make the mana', texto: 'Once per turn you play a [[land]] from your hand, for free. To pay, [[tap]] the land sideways: it gives one mana and only untaps on your next turn. Cost paid, the elf enters.' },
        { cena: 'permanentes', titulo: 'Permanents stay in play', texto: 'Creatures, artifacts and enchantments are [[permanents]]: they stay on the battlefield. A creature that just arrived has [[summoning sickness]] and only attacks on your next turn.' },
        { cena: 'instantaneas', titulo: 'Instants and sorceries', texto: 'These spells do their effect once and go to the [[graveyard]]. Here, a white spell exiles the opponent\'s creature. [[Sorceries]] only on your turn; [[instants]] at any time.' },
      ],
    },
    {
      titulo: 'Your turn',
      resumo: 'Five phases, always in the same order.',
      passos: [
        { cena: 'inicio', titulo: 'Beginning phase', texto: 'Three things in a row: [[untap]] everything you control, go through [[upkeep]] and [[draw]] a card.' },
        { cena: 'principal1', titulo: 'First main phase', texto: 'Time to play your land for the turn and cast whatever you like. With three lands tapped, the angel enters.' },
        { cena: 'combate', titulo: 'Combat', texto: 'Your creatures without summoning sickness may [[attack]]. The elf attacks, nobody blocks, and the opponent loses 1 life. The next chapter shows combat up close.' },
        { cena: 'principal2', titulo: 'Second main phase', texto: 'Same as the first, after combat. But this turn\'s land is already played: the other forest stays in hand until next turn.' },
        { cena: 'final', titulo: 'Ending phase', texto: 'Damage on creatures wears off, "until end of turn" effects end and, holding more than seven cards, you discard down to seven. The turn passes.' },
      ],
    },
    {
      titulo: 'Combat',
      resumo: 'Attack, block, deal damage.',
      passos: [
        { cena: 'atacantes', titulo: 'Declare attackers', texto: 'On your next turn everything untaps. Choose which creatures attack and who each one attacks: they tap as they attack.' },
        { cena: 'bloqueadores', titulo: 'The defender blocks', texto: 'The attacked player chooses untapped creatures to [[block]]. The beast blocks the elf; the angel gets through. Blocking is never mandatory.' },
        { cena: 'dano', titulo: 'Damage is dealt', texto: 'All at once. The elf deals 1 to the beast and takes 3: with damage equal to or greater than its [[toughness]], it goes to the graveyard. The angel takes 3 life from the opponent.' },
      ],
    },
    {
      titulo: 'Commander',
      resumo: 'The format this table plays.',
      passos: [
        { cena: 'comandante', titulo: 'Your commander', texto: 'A legendary creature leads the deck. It starts in the [[command zone]], in plain sight, and you may cast it from there whenever you can pay.' },
        { cena: 'identidade', titulo: 'Color identity', texto: 'The deck has 100 cards counting the commander, one copy of each (apart from basic lands). Every card fits the commander\'s colors: green and white here, so no blue.' },
        { cena: 'quarenta', titulo: 'Two to six players', texto: 'Everyone starts at 40 life, twice the usual. It is everyone against everyone, and the last one standing wins.' },
        { cena: 'taxa', titulo: 'Commander tax', texto: 'If your commander dies or is exiled, you may send it back to the command zone. You can cast it again, but each time costs two more mana: the [[commander tax]].' },
        { cena: 'danoComandante', titulo: 'Commander damage', texto: 'A second way to lose: taking 21 [[commander damage]], the combat damage from one single commander added up over the whole game. The table counts it for you.' },
      ],
    },
  ],
  palco: {
    rotulo: 'An example game',
    voce: 'You',
    oponente: 'Opponent',
    grimorio: 'Library',
    cemiterio: 'Graveyard',
    comando: 'Command',
    fases: ['Beginning', 'Main 1', 'Combat', 'Main 2', 'Ending'],
    marcas: {
      semTerreno: 'No lands', fundo: 'This one goes to the bottom', voceComeca: 'You go first', custoElfo: 'Cost: 1 green', umPorTurno: '1 land per turn',
      manaG: '+1 green', enjoo: 'zZ', alvo: 'Target', exilada: 'Exiled', desvirar: 'Untap everything', compra: '+1 card', jaBaixou: 'Land already played this turn',
      vez: 'Next player\'s turn', cores: 'Green and white', jogadores: '2 to 6 players · 40 life', morre: 'Died', taxa: '+2 tax', rastreio: 'Commander: 3 / 21',
    },
  },
  fim: {
    titulo: 'Ready to play',
    texto: 'The rest you learn by playing. At the table, what you can use glows (with the assists on) and hovering over a card shows it at full size.',
    botao: 'Close and play',
    voltar: 'Watch again',
  },
};

export const TEXTOS: Record<Idioma, Textos> = { pt, en };
