// Interpretive acting directions, not a change to the approved character rig.
export const emotionChoices=[['character','Характер'],['thinking','Думает'],['surprised','Неожиданно'],['victory','Победа'],['loss','Неудача']];
export const expressions={
 wizard:{
  character:{title:'Любопытство',hint:'Уже заметил что-то странное. Одна бровь чуть выше, на лице — осторожная улыбка.',brows:'M73 85q7-3 15-1M110 87q7-1 14 2',mouth:'M94 142q6 4 13-1',look:[1,0],eyeScale:1},
  thinking:{title:'Есть подозрение…',hint:'Смотрит в сторону, приподнимает бровь и обдумывает догадку.',brows:'M73 84q7-4 15-2M110 88l14 1',mouth:'M95 143q5-2 10 0',look:[-5,-4],eyeScale:.9},
  surprised:{title:'Вот это поворот!',hint:'Взгляд застыл, брови поднялись, рот приоткрыт от удивления.',brows:'M73 83q7-5 15-2M109 82q8-4 15 1',mouth:'M97 138q3-3 6 0v6q-3 4-6 0Z',look:[0,-1],eyeScale:1.06,open:true},
  victory:{title:'Получилось!',hint:'Смеётся, зажмуривается и вскидывает палочку — радость без всякой сдержанности.',brows:'M73 85q7-4 15-1M110 84q7-3 14 1',mouth:'M91 138Q100 153 109 138Z',look:[0,0],eyeScale:1,closed:true,open:true},
  loss:{title:'Ну как же так…',hint:'Взгляд опускается; разочарован, но ещё собирается поспорить.',brows:'M73 89l15-5M110 84l14 5',mouth:'M94 145q6-5 12-1',look:[-1,4],eyeScale:.94},
 },
 dune:{
  character:{title:'Спокойная уверенность',hint:'Прямой взгляд, чуть опущенные веки и сдержанное выражение лица.',brows:'M74 87l15 4M109 91l16-4',mouth:'M94 142q6-1 12-1',look:[0,0],eyeScale:.82},
  thinking:{title:'Просчитывает исход',hint:'Взгляд уходит в сторону. Напряжение видно в бровях и почти неподвижном рте.',brows:'M74 88l15 4M109 92l16-5',mouth:'M94 143h12',look:[-5,0],eyeScale:.73},
  surprised:{title:'Неожиданный исход',hint:'Одна бровь поднимается. Удивление есть, но он быстро берёт себя в руки.',brows:'M74 84q7-3 15-1M109 90l16-3',mouth:'M96 141h9v2h-9Z',look:[2,-1],eyeScale:.96,open:true},
  victory:{title:'Так и было задумано',hint:'Едва заметная улыбка и короткий жест кулаком. Победа принята спокойно.',brows:'M74 87q7-1 15 1M109 88q8-2 16-1',mouth:'M94 142q7 3 13-2',look:[0,0],eyeScale:.9},
  loss:{title:'Холодная решимость',hint:'Хмурится, стискивает губы и смотрит прямо. Ни паники, ни показной злости.',brows:'M74 88l15 5M109 93l16-5',mouth:'M93 144h14',look:[0,1],eyeScale:.68},
 }
};
