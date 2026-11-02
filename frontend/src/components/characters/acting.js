// Hands and their sleeves always share one shoulder pivot. Coordinates are
// silhouettes first; motion adds character instead of hiding identical poses.
export const victoryPoses = {
  achi:       {left:[66,181], right:[136,180], head:-3, body:1, action:'confident', note:'Сдержанная усмешка, небольшой наклон головы и руки в боках. Без моргания.'},
  matrix:     {left:[52,184], right:[160,148], head:-2, body:0, action:'stop', note:'Останавливает всё вокруг открытой ладонью. Почти неподвижен.'},
  fight:      {left:[39,178], right:[164,178], head:-4, body:2, action:'spread', note:'Разводит руки и ухмыляется, словно всё это было его затеей.'},
  captain:    {left:[50,178], right:[151,111], head:0, body:0, action:'salute', note:'Подносит руку к виску; щит остаётся у другой руки.'},
  iron:       {left:[51,187], right:[165,158], head:-2, body:0, action:'repulsor', note:'Разворачивает ладонь с репульсором. Вторая рука остаётся на поясе.'},
  marty:      {left:[44,176], right:[162,142], head:-3, body:-2, action:'hop', note:'Вскидывает кулак и делает два коротких нетерпеливых подскока.'},
  hulk:       {left:[40,142], right:[160,142], head:0, body:0, action:'roar', note:'Поднимает оба огромных кулака, рычит и победно расправляет плечи.'},
  thor:       {left:[49,185], right:[158,160], head:-2, body:0, action:'hammer', note:'Поднимает Мьёльнир к плечу, крепко удерживая рукоять.'},
  widow:      {left:[66,180], right:[137,181], head:3, body:0, action:'confident', note:'Упирает руки в бока и чуть склоняет голову с довольной улыбкой.'},
  brother:    {left:[54,184], right:[155,107], head:-2, body:0, action:'headphone', note:'Поправляет наушник, слегка улыбается и кивает в такт музыке.'},
  terminator: {left:[53,186], right:[158,166], head:0, body:0, action:'thumb', note:'Поднимает большой палец. Лицо остаётся абсолютно серьёзным.'},
  pirate:     {left:[38,181], right:[165,167], head:-5, body:3, action:'pirate', note:'Разводит руки, щурится и делает чуть шаткий капитанский поклон.'},
  forrest:    {left:[54,185], right:[164,136], head:2, body:0, action:'wave', note:'Высоко и по-доброму машет рукой; коробка конфет остаётся в другой.'},
  wolf:       {left:[53,186], right:[109,177], head:1, body:0, action:'chest', note:'Постукивает кулаком по груди в знакомом ритме.'},
  bill:       {left:[64,182], right:[150,178], head:-3, body:-1, action:'blade', note:'Собранная стойка: рука у пояса, катана рядом, короткий решительный кивок.'},
  jason:      {left:[51,190], right:[149,190], head:8, body:0, action:'ominous', note:'Замирает с пугающим наклоном маски. Никаких приветственных взмахов.'},
  // Spider-Man is intentionally byte-for-byte compatible with the approved pose.
  spider:     {left:[54,184], right:[155,160], head:0, body:0, action:'web', note:'Вскидывает руку знакомым жестом выпуска паутины.'},
  thanos:     {left:[41,132], right:[145,185], head:2, body:0, action:'gauntlet', note:'Подносит Перчатку Бесконечности ближе к лицу и медленно поворачивает её.'},
  loki:       {left:[39,178], right:[160,171], head:-4, body:1, action:'royal', note:'Раскрывает руки в королевском жесте: победа, разумеется, принадлежит ему.'},
  jedi:       {left:[60,183], right:[155,163], head:-1, body:0, action:'jedi', note:'Держит зелёный меч наготове и спокойно кивает.'},
  vader:      {left:[40,154], right:[148,182], head:2, body:0, action:'force', note:'Поднимает левую ладонь жестом Силы; красный меч остаётся опущенным.'},
  batman:     {left:[50,180], right:[151,180], head:-2, body:0, action:'cape', note:'Слегка раскрывает плащ, затем замирает в уверенной стойке.'},
  joker:      {left:[85,181], right:[115,181], head:4, body:-1, action:'applause', note:'Медленно хлопает, растягивая нарочито вежливую улыбку.'},
  bateman:    {left:[65,182], right:[144,183], head:-4, body:1, action:'sigma', note:'Обычное лицо → прищур и поджатые губы → обычное лицо. Цикл повторяется, без моргания.'},
  chaplin:    {left:[53,172], right:[146,187], head:-3, body:-7, action:'bow', note:'Учтивый поклон с рукой у груди; трость остаётся опорой.'},
  sherlock:   {left:[65,179], right:[112,140], head:3, body:0, action:'inspect', note:'Поднимает лупу к глазу, словно проверяет очевидный результат.'},
  wick:       {left:[60,182], right:[134,185], head:3, body:0, action:'respect', note:'Поправляет манжет и отвечает коротким уважительным кивком.'},
  toretto:    {left:[54,184], right:[160,167], head:-2, body:0, action:'driver', note:'Поднимает ключ от машины; другая рука спокойно опущена. Спокойная довольная усмешка.'},
};

export const neutralPose = {left:[54,184],right:[146,184],head:0,body:0,action:'idle'};

export function characterPose(id, winning) {
  return winning ? victoryPoses[id] || neutralPose : neutralPose;
}
