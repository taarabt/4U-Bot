// setup.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./questions.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question TEXT NOT NULL,
    option1 TEXT NOT NULL,
    option2 TEXT NOT NULL,
    option3 TEXT NOT NULL,
    option4 TEXT NOT NULL,
    correct INTEGER NOT NULL
  )`);

  const stmt = db.prepare(`INSERT INTO questions (question, option1, option2, option3, option4, correct) VALUES (?, ?, ?, ?, ?, ?)`);

  stmt.run("Qual é a capital de Portugal?", "Lisboa", "Porto", "Coimbra", "Braga", 1);
  stmt.run("2 + 2 é igual a?", "3", "4", "5", "6", 2);
  stmt.run("Qual a cor do céu em um dia claro?", "Verde", "Azul", "Vermelho", "Amarelo", 2);
  stmt.run("Quem foi o primeiro presidente de Portugal?", "Teófilo Braga", "Mário Soares", "Costa Gomes", "Américo Tomás", 1);
  stmt.run("Qual é o maior oceano do mundo?", "Atlântico", "Pacífico", "Índico", "Ártico", 2);
  stmt.run("Quem pintou a Mona Lisa?", "Van Gogh", "Picasso", "Da Vinci", "Monet", 3);
  stmt.run("Qual é o maior animal terrestre?", "Elefante", "Girafa", "Búfalo", "Rinoceronte", 1);
  stmt.run("Quantos continentes existem?", "5", "6", "7", "8", 3);
  stmt.run("Qual o nome do satélite natural da Terra?", "Marte", "Vênus", "Lua", "Júpiter", 3);
  stmt.run("O que é a fotossíntese?", "Processo de respiração das plantas", "Transformação de energia solar em energia química", "Processo de digestão das plantas", "Crescimento das plantas", 2);
  stmt.run("Quem escreveu 'Dom Quixote'?", "Jorge Amado", "Machado de Assis", "Miguel de Cervantes", "José Saramago", 3);
  stmt.run("Qual é o maior planeta do sistema solar?", "Terra", "Júpiter", "Saturno", "Urano", 2);
  stmt.run("Em que ano o homem foi à Lua pela primeira vez?", "1959", "1963", "1969", "1972", 3);
  stmt.run("Qual é a moeda oficial do Japão?", "Yuan", "Won", "Iene", "Baht", 3);
  stmt.run("Qual é o nome da primeira mulher a ganhar um prêmio Nobel?", "Marie Curie", "Rosalind Franklin", "Ada Lovelace", "Dorothy Crowfoot", 1);
  stmt.run("Em que cidade fica a Torre Eiffel?", "Paris", "Londres", "Roma", "Madri", 1);
  stmt.run("Quem foi o responsável pela teoria da relatividade?", "Isaac Newton", "Nikola Tesla", "Albert Einstein", "Stephen Hawking", 3);
  stmt.run("Qual é a cor do sangue de um caranguejo?", "Verde", "Azul", "Vermelho", "Amarelo", 2);
  stmt.run("Em que país nasceu a pizza?", "França", "Portugal", "Itália", "Espanha", 3);
  stmt.run("Qual é o símbolo químico do ouro?", "Au", "Ag", "Pb", "Fe", 1);
  stmt.run("O que é a teoria da evolução?", "A origem do universo", "Mudança das espécies ao longo do tempo", "Causas das doenças", "Criação da vida", 2);
  stmt.run("Qual é a montanha mais alta do mundo?", "Monte Fuji", "Monte Everest", "Monte Kilimanjaro", "Monte Aconcágua", 2);
  stmt.run("Quantos jogadores tem uma equipe de futebol?", "9", "10", "11", "12", 3);
  stmt.run("Qual é o país mais populoso do mundo?", "Índia", "Estados Unidos", "China", "Rússia", 3);
  stmt.run("O que é a teoria do Big Bang?", "A criação do sol", "A origem da vida na Terra", "A formação do universo", "A formação da lua", 3);
  stmt.run("Qual é o maior deserto do mundo?", "Sahara", "Atacama", "Gobi", "Antártida", 4);
  stmt.run("Quantos segundos tem um minuto?", "30", "60", "90", "120", 2);
  stmt.run("Qual é o nome do maior rio do mundo?", "Amazonas", "Nilo", "Yangtzé", "Mississippi", 1);
  stmt.run("Quem foi o líder da Revolução Francesa?", "Napoleão Bonaparte", "Maximilien Robespierre", "Luis XVI", "Jean-Paul Marat", 2);
  stmt.run("O que é a gravidade?", "A força que mantém os planetas em órbita", "A força que atrai objetos para o centro da Terra", "A energia da luz solar", "A pressão atmosférica", 2);
  stmt.run("Qual é o metal mais abundante na crosta terrestre?", "Ferro", "Alumínio", "Cálcio", "Magnesita", 2);
  stmt.run("Quem foi o autor de 'A Odisséia'?", "Homer", "Virgílio", "Ovídio", "Sêneca", 1);
  stmt.run("Qual é a menor unidade de medida do tempo?", "Segundo", "Milissegundo", "Microsegundo", "Nanosegundo", 4);
  stmt.run("Qual é o nome da maior floresta tropical do mundo?", "Floresta Amazônica", "Floresta do Congo", "Floresta de Borneo", "Floresta de Taiga", 1);
  stmt.run("Quantos estados tem o Brasil?", "24", "26", "27", "28", 2);
  stmt.run("Qual é o nome da teoria que defende que os dinossauros foram extintos por um impacto de meteorito?", "Teoria da evolução", "Teoria do impacto", "Teoria do cataclismo", "Teoria da extinção", 2);
  stmt.run("Em que ano terminou a Segunda Guerra Mundial?", "1945", "1944", "1950", "1939", 1);
  stmt.run("Quem foi o criador da teoria do psicanálise?", "Carl Jung", "Sigmund Freud", "Wilhelm Reich", "Melanie Klein", 2);
  stmt.run("Qual é a maior cidade do mundo?", "Tóquio", "Nova York", "São Paulo", "Pequim", 1);
  

  stmt.finalize();
});

db.close();
