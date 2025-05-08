// 4U Bot - Discord.js
// Dependencies: discord.js, dotenv, sqlite3
// Mantém o bot online no Render
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('O bot está online!');
});

app.listen(PORT, () => {
  console.log(`Servidor a correr na porta ${PORT}`);
});

require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField, MessageFlags } = require('discord.js');

const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages, 
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ] 
});

const PREFIX = '!';
const EXAM_CATEGORY_ID = '1369800788255309855'; // Substitui com o ID da categoria
const STAFF_ROLE_ID = '1364034491974156438'; // Substituir pelo ID do cargo de staff
const VERIFIED_ROLE_ID = '1345063198491021384'; // Substitui com o ID correto
const EXPIRATION_TIME = 28800000; // 8 horas
const REMOVE_ROLE_ID = '1369797372304949349'; // Substitui com o ID correto

// Connect to SQLite Database
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./questions.db', (err) => {
  if (err) console.error(err.message);
  console.log('Connected to the SQLite database.');
});

// Função para embaralhar um array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Troca os elementos
  }
  return array;
}

// Create table for questions if not exists
db.run(`CREATE TABLE IF NOT EXISTS questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question TEXT NOT NULL,
  option1 TEXT NOT NULL,
  option2 TEXT NOT NULL,
  option3 TEXT NOT NULL,
  option4 TEXT NOT NULL,
  correct INTEGER NOT NULL
)`);

client.once('ready', () => {
  console.log(`${client.user.tag} is online and ready!`);
});

// Comando para enviar a mensagem inicial
client.on('messageCreate', async (message) => {
  if (message.content.startsWith(`${PREFIX}sendexam`)) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

    const embed = new EmbedBuilder()
      .setColor('#d5ba98')
      .setTitle('Questionário')
      .setDescription('Ao clicares no botão abaixo, vais criar uma sala para realizares o teu questionário!\n'+ 
      'Nessa sala escreve o comando **!começar** e responde a todas as questões, tens 2 minutos para responder a cada questão.\n'+
      'Este teste serve para confirmar que compreendeste as nossas regras. Ao passares, receberás automaticamente o cargo de Verificado, que te dará acesso total ao servidor, incluindo canais úteis para te orientares e interagires com a comunidade.\n'+                                                                                                                  
      'Se não conseguires passar no questionário à primeira, não te preocupes, poderás sempre tentar novamente!');

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('start_exam')
          .setLabel('Iniciar Questionário')
          .setStyle(ButtonStyle.Primary)
      );

    await message.channel.send({ embeds: [embed], components: [row] });
  }

  if (
    message.channel.parentId === EXAM_CATEGORY_ID && 
    message.content.toLowerCase() === `${PREFIX}começar`
  ) {
    const member = message.member;
    const role = message.guild.roles.cache.get(VERIFIED_ROLE_ID);
    if (member.roles.cache.has(role.id)) {
      return message.reply('Já és um membro verificado. Não podes repetir o exame.');
    }
    startExam(message);
  }
});

// Interação com o botão
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;

  if (interaction.customId === 'start_exam') {
    const guild = interaction.guild;
    const member = interaction.member;

    const role = guild.roles.cache.get(VERIFIED_ROLE_ID);
    if (member.roles.cache.has(role.id)) {
      return interaction.reply({ content: 'Já és um membro verificado. Não podes repetir o exame.', flags: MessageFlags.Ephemeral });
    }

    // Criação da sala privada
    const channel = await guild.channels.create({
      name: `exame-${member.user.username}`,
      parent: EXAM_CATEGORY_ID,
      permissionOverwrites: [
        {
          id: guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel]
        },
        {
          id: member.id,
          allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
        },
        {
          id: STAFF_ROLE_ID,
          allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
        }
      ]
    });

    await interaction.reply({ content: `A sala privada foi criada: ${channel}`, flags: MessageFlags.Ephemeral });
  }
});

async function startExam(message) {
  const user = message.author;
  let correctAnswers = 0;
  let incorrectAnswers = [];

  db.all('SELECT * FROM questions', (err, rows) => {
    if (err) {
      console.error(err.message);
      return;
    }

    // Embaralha as perguntas e seleciona as 8 primeiras
    const shuffledQuestions = rows.sort(() => 0.5 - Math.random()).slice(0, 8);

    let index = 0;
    askQuestion(shuffledQuestions, index, correctAnswers, incorrectAnswers, user, message);
  });
}


function askQuestion(questions, index, correctAnswers, incorrectAnswers, user, message) {
  if (index < questions.length) {
      console.log(`[A PREPARAR PERGUNTA] ID: ${questions[index].id}, índice: ${index}`); // Nova linha de log
  }

  if (index >= questions.length) {
      finalizeExam(correctAnswers, incorrectAnswers, user, message);
      return;
  }

  const question = questions[index];
  const embed = new EmbedBuilder()
      .setColor('#d5ba98')
      .setTitle(`Pergunta ${index + 1}/8`)
      .setDescription(question.question)
      .addFields(
          { name: '1️⃣', value: question.option1 },
          { name: '2️⃣', value: question.option2 },
          { name: '3️⃣', value: question.option3 },
          { name: '4️⃣', value: question.option4 }
      );

  message.channel.send({ embeds: [embed] }).then(() => {
      const filter = (response) => response.author.id === user.id;
      message.channel.awaitMessages({ filter, max: 1, time: 120000, errors: ['time'] })
          .then(collected => {
              const answer = parseInt(collected.first().content);
              if (answer === question.correct) {
                  correctAnswers++;
              } else {
                  incorrectAnswers.push({ question: question.question, answer: question[`option${question.correct}`] });
              }
              console.log(`[RESPOSTA RECEBIDA] Índice: ${index}, Resposta: ${answer}`); // Adiciona log
              askQuestion(questions, index + 1, correctAnswers, incorrectAnswers, user, message);
          })
          .catch(() => {
              if (message.channel) {
                  message.channel.send('Tempo esgotado! Responde mais rápido da próxima vez.');
              } else {
                  console.log(`Canal ${message.channelId} já foi deletado, não foi possível enviar mensagem de tempo esgotado.`);
              }
              console.log(`[TEMPO ESGOTADO] Índice: ${index}`); // Adiciona log
              askQuestion(questions, index + 1, correctAnswers, incorrectAnswers, user, message);
          });
  });
}

function finalizeExam(correctAnswers, incorrectAnswers, user, message) {
  const role = message.guild.roles.cache.get(VERIFIED_ROLE_ID);
  const member = message.guild.members.cache.get(user.id);
  const removeRole = message.guild.roles.cache.get(REMOVE_ROLE_ID);
  if (removeRole && member.roles.cache.has(removeRole.id)) {
    member.roles.remove(removeRole)
      .then(() => console.log(`Tag ${removeRole.name} removida de ${user.username}`))
      .catch(err => console.error('Erro ao remover a tag:', err));
  }
  

  if (correctAnswers >= 5) {
    member.roles.add(role);
    message.channel.send(`${user}, Parabéns! Passaste no exame e agora és um Civil.`);
  } else {
    let feedback = 'Erraste as seguintes perguntas:\n';
    incorrectAnswers.forEach((q, i) => {
      feedback += `${i + 1}. ${q.question} - Resposta Correta: ${q.answer}\n`;
    });
    message.channel.send(`${user}, falhaste no exame. Tenta novamente mais tarde.\n${feedback}`);
  }
}
async function finalizeExam(correctAnswers, incorrectAnswers, user, message) {
  const channel = message.channel;  // Pega o canal onde o comando foi executado

  if (correctAnswers >= 5) {
    const role = message.guild.roles.cache.get(VERIFIED_ROLE_ID);
    const member = message.guild.members.cache.get(user.id);
  
    member.roles.add(role)
      .then(() => console.log(`Cargo de verificado atribuído a ${user.username}`))
      .catch(err => console.error('Erro ao atribuir o cargo de verificado:', err));
  
    const removeRole = message.guild.roles.cache.get(REMOVE_ROLE_ID);
    if (removeRole && member.roles.cache.has(removeRole.id)) {
      member.roles.remove(removeRole)
        .then(() => console.log(`Cargo ${removeRole.name} removido de ${user.username}`))
        .catch(err => console.error('Erro ao remover o cargo:', err));
    }
  
    message.channel.send(`${user}, Parabéns! Passaste no exame e agora és um Civil.`);

    // Configura para excluir o canal após o tempo de expiração
    setTimeout(() => {
      channel.delete()
        .then(() => console.log(`Canal ${channel.name} excluído após o tempo configurado.`))
        .catch(err => console.error('Erro ao excluir o canal:', err));
    }, EXPIRATION_TIME); // Tempo de expiração (ajustável)
  } else {
    let feedback = 'Erraste as seguintes perguntas:\n';
    incorrectAnswers.forEach((q, i) => {
      feedback += `${i + 1}. ${q.question} - Resposta Correta: ${q.answer}\n`;
    });
    message.channel.send(`${user}, falhaste no exame. Tente novamente mais tarde.\n${feedback}`);

  }
}


client.login(process.env.TOKEN);
