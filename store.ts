
import { WordList, Word, VoiceSettings } from './types';

const STORAGE_KEY = 'echofy_offline_v1';
const VOICE_SETTINGS_KEY = 'echofy_voice_settings';

export const THEMES = [
  { id: 0, name: 'Bosque Esmeralda', gradient: 'from-emerald-400 to-teal-500', bg: 'bg-emerald-50' },
  { id: 1, name: 'Cielo Estelar', gradient: 'from-indigo-400 to-purple-500', bg: 'bg-indigo-50' },
  { id: 2, name: 'Valle de Rosas', gradient: 'from-rose-400 to-orange-400', bg: 'bg-rose-50' },
  { id: 3, name: 'Mar de Coral', gradient: 'from-cyan-400 to-blue-500', bg: 'bg-cyan-50' },
  { id: 4, name: 'Dunas de Oro', gradient: 'from-amber-400 to-yellow-500', bg: 'bg-amber-50' },
  { id: 5, name: 'Noche Mágica', gradient: 'from-violet-400 to-fuchsia-500', bg: 'bg-violet-50' }
];

// Estética especial para la Isla de Práctica
export const PRACTICE_THEME = {
  gradient: 'from-indigo-950 via-purple-900 to-slate-950',
  bg: 'bg-indigo-950',
  text: 'text-indigo-100'
};

interface DictionaryEntry {
  meaning: string;
  synonyms: string;
}

const rawData = [
  {"word":"add","meaning":"poner algo más","synonyms":"agregar / sumar / añadir"},
  {"word":"adjust","meaning":"cambiar un poco para que funcione","synonyms":"ajustar / arreglar / adaptar"},
  {"word":"alarm","meaning":"sonido que avisa peligro","synonyms":"alerta / aviso / alarma"},
  {"word":"alone","meaning":"sin nadie cerca","synonyms":"solo / sin compañía / aislado"},
  {"word":"animal","meaning":"ser vivo que se mueve","synonyms":"animal / criatura / ser vivo"},
  {"word":"animals","meaning":"muchos animales juntos","synonyms":"animales / fauna / seres vivos"},
  {"word":"apart","meaning":"lejos uno del otro","synonyms":"separado / distante / aparte"},
  {"word":"artist","meaning":"persona que hace arte","synonyms":"artista / creador / pintor"},
  {"word":"ask","meaning":"decir algo para saber","synonyms":"preguntar / pedir / consultar"},
  {"word":"attach","meaning":"pegar una cosa a otra","synonyms":"unir / sujetar / pegar"},
  {"word":"away","meaning":"no está aquí","synonyms":"lejos / fuera / distante"},
  {"word":"bag","meaning":"bolsa para guardar cosas","synonyms":"bolsa / bolso / saco"},
  {"word":"basket","meaning":"canasta","synonyms":"canasta / cesta / canasto"},
  {"word":"batch","meaning":"grupo de cosas juntas","synonyms":"lote / tanda / grupo"},
  {"word":"beach","meaning":"lugar con arena y mar","synonyms":"playa / costa / orilla"},
  {"word":"because","meaning":"razón de algo","synonyms":"porque / ya que / dado que"},
  {"word":"behave","meaning":"cómo te portas","synonyms":"comportarse / portarse / actuar"},
  {"word":"belong","meaning":"ser parte de algo","synonyms":"pertenecer / ser de / formar parte"},
  {"word":"bend","meaning":"doblar algo","synonyms":"doblar / curvar / torcer"},
  {"word":"better","meaning":"más bueno","synonyms":"mejor / superior / más bueno"},
  {"word":"black","meaning":"color oscuro","synonyms":"negro / oscuro / azabache"},
  {"word":"blink","meaning":"cerrar y abrir los ojos","synonyms":"parpadear / pestañear / guiñar"},
  {"word":"blush","meaning":"ponerse rojo por pena","synonyms":"sonrojarse / ruborizarse / ponerse rojo"},
  {"word":"bolt","meaning":"correr muy rápido","synonyms":"huir / correr / escapar"},
  {"word":"bone","meaning":"parte dura del cuerpo","synonyms":"hueso / osamenta / estructura"},
  {"word":"boom","meaning":"sonido muy fuerte","synonyms":"estallido / explosión / estruendo"},
  {"word":"bread","meaning":"comida hecha de harina","synonyms":"pan / hogaza / bollo"},
  {"word":"brown","meaning":"color café","synonyms":"café / marrón / pardo"},
  {"word":"busy","meaning":"con mucho que hacer","synonyms":"ocupado / atareado / activo"},
  {"word":"candle","meaning":"vela con fuego","synonyms":"vela / cirio / candelita"},
  {"word":"caterpillar","meaning":"gusano que será mariposa","synonyms":"oruga / larva / gusanito"},
  {"word":"caution","meaning":"tener cuidado","synonyms":"precaución / cuidado / atención"},
  {"word":"cave","meaning":"hueco en una montaña","synonyms":"cueva / gruta / caverna"},
  {"word":"celebrate","meaning":"hacer una fiesta","synonyms":"celebrar / festejar / conmemorar"},
  {"word":"champion","meaning":"el que gana","synonyms":"campeón / ganador / vencedor"},
  {"word":"chat","meaning":"hablar con alguien","synonyms":"conversar / charlar / platicar"},
  {"word":"cheese","meaning":"comida hecha con leche","synonyms":"queso / lácteo / cuajada"},
  {"word":"chimney","meaning":"tubo por donde sale humo","synonyms":"chimenea / ducto / tubo"},
  {"word":"class","meaning":"grupo de estudiantes","synonyms":"clase / curso / grupo"},
  {"word":"clinic","meaning":"lugar donde curan","synonyms":"clínica / consultorio / centro médico"},
  {"word":"community","meaning":"personas que viven juntas","synonyms":"comunidad / vecindario / barrio"},
  {"word":"compass","meaning":"dice dónde está el norte","synonyms":"brújula / compás / guía"},
  {"word":"complain","meaning":"decir que algo molesta","synonyms":"quejarse / protestar / reclamar"},
  {"word":"construct","meaning":"hacer algo nuevo","synonyms":"construir / armar / crear"},
  {"word":"costume","meaning":"ropa para disfrazarse","synonyms":"disfraz / traje / vestuario"},
  {"word":"country","meaning":"lugar con gente y leyes","synonyms":"país / nación / territorio"},
  {"word":"cozy","meaning":"cómodo y calientito","synonyms":"acogedor / cómodo / calientito"},
  {"word":"crack","meaning":"romper con ruido","synonyms":"quebrar / rajar / partir"},
  {"word":"crash","meaning":"chocar fuerte","synonyms":"chocar / estrellarse / impactar"},
  {"word":"curved","meaning":"no es recto","synonyms":"curvo / doblado / arqueado"},
  {"word":"daily","meaning":"pasa todos los días","synonyms":"diario / cotidiano / de cada día"},
  {"word":"dairy","meaning":"cosas hechas con leche","synonyms":"lácteos / productos de leche / lechería"},
  {"word":"damp","meaning":"un poco mojado","synonyms":"húmedo / mojadito / empapado"},
  {"word":"dark","meaning":"sin mucha luz","synonyms":"oscuro / sombrío / apagado"},
  {"word":"dart","meaning":"moverse rápido","synonyms":"correr / lanzarse / apresurarse"},
  {"word":"decorate","meaning":"poner cosas bonitas","synonyms":"decorar / adornar / embellecer"},
  {"word":"deserve","meaning":"ganarse algo","synonyms":"merecer / ganar / corresponder"},
  {"word":"dishes","meaning":"platos y vasos","synonyms":"vajilla / trastes / platos"},
  {"word":"divide","meaning":"separar en partes","synonyms":"dividir / partir / separar"},
  {"word":"drive","meaning":"manejar un vehículo","synonyms":"conducir / manejar / guiar"},
  {"word":"drowsy","meaning":"con mucho sueño","synonyms":"somnoliento / adormilado / cansado"},
  {"word":"each","meaning":"uno por uno","synonyms":"cada / cada uno / uno por uno"},
  {"word":"emotions","meaning":"lo que sentimos","synonyms":"emociones / sentimientos / afectos"},
  {"word":"enormous","meaning":"muy muy grande","synonyms":"enorme / gigante / colosal"},
  {"word":"equal","meaning":"igual a otro","synonyms":"igual / mismo / semejante"},
  {"word":"every","meaning":"todos sin faltar","synonyms":"cada / todo / cualquier"},
  {"word":"exclaim","meaning":"decir algo fuerte","synonyms":"exclamar / gritar / decir en voz alta"},
  {"word":"family","meaning":"personas que te cuidan","synonyms":"familia / hogar / parientes"},
  {"word":"fancy","meaning":"bonito o especial","synonyms":"elegante / bonito / lujoso"},
  {"word":"fasten","meaning":"amarrar o cerrar","synonyms":"abrochar / asegurar / sujetar"},
  {"word":"finally","meaning":"al terminar algo","synonyms":"finalmente / por fin / al final"},
  {"word":"fine","meaning":"está bien o es bonito","synonyms":"bien / bonito / agradable"},
  {"word":"fire","meaning":"llama que quema","synonyms":"fuego / llama / incendio"},
  {"word":"fish","meaning":"animal que vive en el agua","synonyms":"pez / pescado / animal acuático"},
  {"word":"flat","meaning":"sin curvas","synonyms":"plano / liso / parejo"},
  {"word":"flee","meaning":"irse corriendo","synonyms":"huir / escapar / correr"},
  {"word":"flower","meaning":"parte bonita de una planta","synonyms":"flor / brote / pétalo"},
  {"word":"fog","meaning":"nube baja en el aire","synonyms":"niebla / bruma / neblina"},
  {"word":"footprint","meaning":"marca del pie","synonyms":"huella / rastro / marca"},
  {"word":"forest","meaning":"muchos árboles juntos","synonyms":"bosque / selva / arboleda"},
  {"word":"friend","meaning":"persona que quieres","synonyms":"amigo / compañero / colega"},
  {"word":"future","meaning":"tiempo que viene","synonyms":"futuro / porvenir / mañana"},
  {"word":"gather","meaning":"juntar cosas","synonyms":"reunir / juntar / recoger"},
  {"word":"gel","meaning":"cosa espesa y suave","synonyms":"gel / gomina / crema"},
  {"word":"genius","meaning":"alguien muy listo","synonyms":"genio / muy inteligente / prodigio"},
  {"word":"giant","meaning":"muy grande","synonyms":"gigante / enorme / coloso"},
  {"word":"glad","meaning":"sentir felicidad","synonyms":"contento / feliz / alegre"},
  {"word":"glue","meaning":"pega cosas","synonyms":"pegamento / cola / adhesivo"},
  {"word":"glum","meaning":"sentirse triste","synonyms":"triste / apagado / decaído"},
  {"word":"grab","meaning":"tomar rápido","synonyms":"agarrar / tomar / atrapar"},
  {"word":"grateful","meaning":"dar gracias","synonyms":"agradecido / reconocido / contento"},
  {"word":"grew","meaning":"se hizo más grande","synonyms":"creció / aumentó / se desarrolló"},
  {"word":"grin","meaning":"sonrisa grande","synonyms":"sonreír / reír / mostrar sonrisa"},
  {"word":"grip","meaning":"agarrar fuerte","synonyms":"sujetar / aferrar / agarrar"},
  {"word":"groan","meaning":"sonido de dolor","synonyms":"gemir / quejarse / lamentarse"},
  {"word":"grow","meaning":"hacerse grande","synonyms":"crecer / desarrollarse / aumentar"},
  {"word":"hatch","meaning":"salir del huevo","synonyms":"eclosionar / nacer / salir"},
  {"word":"heap","meaning":"montón de cosas","synonyms":"montón / pila / acumulación"},
  {"word":"hide","meaning":"no dejar ver","synonyms":"esconder / ocultar / guardar"},
  {"word":"hobby","meaning":"algo que te gusta hacer","synonyms":"pasatiempo / afición / hobby"},
  {"word":"honest","meaning":"decir la verdad","synonyms":"honesto / sincero / verdadero"},
  {"word":"howl","meaning":"grito largo","synonyms":"aullar / ulular / gritar"},
  {"word":"hunch","meaning":"doblar la espalda","synonyms":"encorvarse / agacharse / doblarse"},
  {"word":"idea","meaning":"pensamiento nuevo","synonyms":"idea / ocurrencia / pensamiento"},
  {"word":"inch","meaning":"medida pequeña","synonyms":"pulgada / medida / una pulgada"},
  {"word":"jam","meaning":"fruta dulce para pan","synonyms":"mermelada / jalea / confitura"},
  {"word":"jelly","meaning":"dulce suave","synonyms":"gelatina / jalea / dulce"},
  {"word":"kind","meaning":"bueno con otros","synonyms":"amable / bondadoso / cariñoso"},
  {"word":"kindness","meaning":"acto de amor","synonyms":"bondad / amabilidad / generosidad"},
  {"word":"knife","meaning":"sirve para cortar","synonyms":"cuchillo / navaja / cortador"},
  {"word":"knob","meaning":"botón para girar","synonyms":"perilla / pomo / manija"},
  {"word":"leaf","meaning":"parte verde del árbol","synonyms":"hoja / foliolo / hojita"},
  {"word":"light","meaning":"luz o poco peso","synonyms":"luz / claridad / ligero"},
  {"word":"lively","meaning":"lleno de vida","synonyms":"animado / alegre / vivaz"},
  {"word":"look","meaning":"usar los ojos","synonyms":"mirar / ver / observar"},
  {"word":"loosen","meaning":"aflojar algo","synonyms":"aflojar / soltar / desajustar"},
  {"word":"mammal","meaning":"animal que toma leche","synonyms":"mamífero / animal de leche / vertebrado"},
  {"word":"mask","meaning":"tapa la cara","synonyms":"máscara / careta / cubierta"},
  {"word":"math","meaning":"números y cuentas","synonyms":"matemáticas / números / cálculos"},
  {"word":"meet","meaning":"ver a alguien","synonyms":"encontrar / conocer / reunirse"},
  {"word":"misty","meaning":"con neblina","synonyms":"nebuloso / brumoso / nublado"},
  {"word":"modern","meaning":"de ahora","synonyms":"moderno / actual / nuevo"},
  {"word":"moon","meaning":"luz de la noche","synonyms":"luna / satélite / nocturna"},
  {"word":"mountain","meaning":"tierra muy alta","synonyms":"montaña / cerro / cumbre"},
  {"word":"much","meaning":"en gran cantidad","synonyms":"mucho / bastante / montón"},
  {"word":"narrow","meaning":"no muy ancho","synonyms":"estrecho / angosto / pequeño"},
  {"word":"natural","meaning":"viene de la naturaleza","synonyms":"natural / real / verdadero"},
  {"word":"neat","meaning":"limpio y ordenado","synonyms":"ordenado / limpio / arreglado"},
  {"word":"need","meaning":"necesitar algo","synonyms":"necesitar / requerir / hacer falta"},
  {"word":"new","meaning":"algo que no existía","synonyms":"nuevo / recién / hecho"},
  {"word":"next","meaning":"lo que sigue","synonyms":"siguiente / próximo / después"},
  {"word":"nook","meaning":"rincón pequeño","synonyms":"rincón / esquina / huequito"},
  {"word":"noun","meaning":"palabra que nombra","synonyms":"sustantivo / nombre / palabra de nombre"},
  {"word":"obey","meaning":"hacer lo que te dicen","synonyms":"obedecer / hacer caso / seguir"},
  {"word":"orbit","meaning":"dar vueltas","synonyms":"orbitar / rodear / girar"},
  {"word":"pain","meaning":"lo que duele","synonyms":"dolor / molestia / pena"},
  {"word":"parade","meaning":"desfile alegre","synonyms":"desfile / marcha / pasacalle"},
  {"word":"part","meaning":"pedazo de algo","synonyms":"parte / pieza / trozo"},
  {"word":"period","meaning":"punto final","synonyms":"punto / período / final"},
  {"word":"pest","meaning":"animal molesto","synonyms":"plaga / bicho / molestia"},
  {"word":"plant","meaning":"ser que crece","synonyms":"planta / vegetal / árbol"},
  {"word":"plates","meaning":"platos para comer","synonyms":"platos / vajilla / loza"},
  {"word":"playground","meaning":"lugar para jugar","synonyms":"parque / patio de juegos / área de juegos"},
  {"word":"polish","meaning":"hacer brillar","synonyms":"pulir / limpiar / brillar"},
  {"word":"present","meaning":"regalo","synonyms":"regalo / obsequio / presente"},
  {"word":"pretend","meaning":"jugar a imaginar","synonyms":"fingir / imaginar / jugar a ser"},
  {"word":"prize","meaning":"premio","synonyms":"premio / galardón / trofeo"},
  {"word":"promise","meaning":"decir que harás algo","synonyms":"promesa / compromiso / palabra"},
  {"word":"punctuation","meaning":"signos al escribir","synonyms":"puntuación / signos / puntos y comas"},
  {"word":"rainbow","meaning":"colores en el cielo","synonyms":"arcoíris / arco de colores / iris"},
  {"word":"ray","meaning":"línea de luz","synonyms":"rayo / haz / chorro"},
  {"word":"read","meaning":"ver palabras","synonyms":"leer / revisar / descifrar"},
  {"word":"remove","meaning":"quitar algo","synonyms":"quitar / sacar / retirar"},
  {"word":"repeat","meaning":"decir otra vez","synonyms":"repetir / volver a decir / rehacer"},
  {"word":"rescue","meaning":"salvar","synonyms":"rescatar / salvar / ayudar"},
  {"word":"restart","meaning":"empezar de nuevo","synonyms":"reiniciar / recomenzar / empezar otra vez"},
  {"word":"return","meaning":"volver","synonyms":"regresar / volver / devolver"},
  {"word":"ribs","meaning":"huesos del pecho","synonyms":"costillas / huesos del pecho / ribetes"},
  {"word":"ripe","meaning":"listo para comer","synonyms":"maduro / listo / sazonado"},
  {"word":"rise","meaning":"subir","synonyms":"subir / elevarse / levantarse"},
  {"word":"roar","meaning":"grito fuerte","synonyms":"rugir / bramar / gritar fuerte"},
  {"word":"roots","meaning":"partes bajo tierra","synonyms":"raíces / base / raigones"},
  {"word":"ropes","meaning":"cuerdas","synonyms":"cuerdas / sogas / cabos"},
  {"word":"rose","meaning":"flor o subió","synonyms":"rosa / se elevó / subió"},
  {"word":"rust","meaning":"metal viejo","synonyms":"óxido / herrumbre / corrosión"},
  {"word":"safety","meaning":"estar a salvo","synonyms":"seguridad / protección / cuidado"},
  {"word":"say","meaning":"hablar","synonyms":"decir / hablar / expresar"},
  {"word":"scold","meaning":"regañar","synonyms":"regañar / reprender / retar"},
  {"word":"scratch","meaning":"raspar con uñas","synonyms":"rasguñar / rayar / arañar"},
  {"word":"seed","meaning":"empieza una planta","synonyms":"semilla / grano / pepita"},
  {"word":"selfish","meaning":"pensar solo en uno","synonyms":"egoísta / individualista / mezquino"},
  {"word":"sell","meaning":"dar por dinero","synonyms":"vender / negociar / ofrecer"},
  {"word":"serious","meaning":"no es juego","synonyms":"serio / formal / importante"},
  {"word":"shade","meaning":"sombra","synonyms":"sombra / sombreado / frescor"},
  {"word":"shell","meaning":"cubierta dura","synonyms":"concha / caparazón / cubierta"},
  {"word":"shelter","meaning":"lugar para cuidar","synonyms":"refugio / abrigo / protección"},
  {"word":"silent","meaning":"sin ruido","synonyms":"silencioso / callado / mudo"},
  {"word":"simple","meaning":"fácil de entender","synonyms":"sencillo / fácil / simple"},
  {"word":"skin","meaning":"parte de afuera del cuerpo","synonyms":"piel / cutis / capa"},
  {"word":"slide","meaning":"deslizarse","synonyms":"resbalar / deslizarse / escurrirse"},
  {"word":"sly","meaning":"astuto","synonyms":"astuto / listo / pícaro"},
  {"word":"sneaky","meaning":"hace cosas escondido","synonyms":"sigiloso / mañoso / tramposo"},
  {"word":"sob","meaning":"llorar fuerte","synonyms":"sollozar / lloriquear / gemir"},
  {"word":"solar","meaning":"viene del sol","synonyms":"solar / del sol / soleado"},
  {"word":"some","meaning":"un poco","synonyms":"algo / un poco / cierto"},
  {"word":"sound","meaning":"lo que oyes","synonyms":"sonido / ruido / tono"},
  {"word":"special","meaning":"diferente","synonyms":"especial / único / distinto"},
  {"word":"spiral","meaning":"forma que gira","synonyms":"espiral / remolino / vuelta"},
  {"word":"sprinkle","meaning":"echar gotitas","synonyms":"rociar / espolvorear / salpicar"},
  {"word":"sprung","meaning":"saltó","synonyms":"saltó / brincó / rebotó"},
  {"word":"startle","meaning":"asustar de repente","synonyms":"asustar / sorprender / espantar"},
  {"word":"steep","meaning":"muy inclinado","synonyms":"empinado / inclinado / pinado"},
  {"word":"stem","meaning":"parte de la flor","synonyms":"tallo / ramita / pedúnculo"},
  {"word":"stormy","meaning":"con mucha lluvia","synonyms":"tormentoso / lluvioso / tempestuoso"},
  {"word":"sun","meaning":"estrella que da luz","synonyms":"sol / estrella / astro"},
  {"word":"swim","meaning":"moverse en el agua","synonyms":"nadar / flotar / chapotear"},
  {"word":"switch","meaning":"cambiar o prender","synonyms":"interruptor / cambiar / conmutar"},
  {"word":"thick","meaning":"no es delgado","synonyms":"grueso / espeso / ancho"},
  {"word":"three","meaning":"número después del dos","synonyms":"tres / 3 / trío"},
  {"word":"thunder","meaning":"ruido del cielo","synonyms":"trueno / retumbo / estruendo"},
  {"word":"ticket","meaning":"papel para entrar","synonyms":"boleto / entrada / ticket"},
  {"word":"timid","meaning":"con miedo","synonyms":"tímido / vergonzoso / asustadizo"},
  {"word":"town","meaning":"ciudad pequeña","synonyms":"pueblo / ciudadita / villa"},
  {"word":"travel","meaning":"ir a otros lugares","synonyms":"viajar / recorrer / trasladarse"},
  {"word":"trip","meaning":"viaje corto","synonyms":"paseo / viaje / recorrido"},
  {"word":"trunk","meaning":"parte grande del árbol","synonyms":"tronco / tallo grueso / cuerpo del árbol"},
  {"word":"trust","meaning":"creer en alguien","synonyms":"confiar / creer / fiarse"},
  {"word":"upset","meaning":"sentirse mal","synonyms":"molesto / triste / enojado"},
  {"word":"wait","meaning":"quedarse quieto","synonyms":"esperar / aguardar / detenerse"},
  {"word":"want","meaning":"desear algo","synonyms":"querer / desear / ansiar"},
  {"word":"wave","meaning":"mover la mano","synonyms":"saludar / agitar / mecer"},
  {"word":"weed","meaning":"planta mala","synonyms":"maleza / yuyo / hierba mala"},
  {"word":"where","meaning":"pregunta de lugar","synonyms":"dónde / en qué lugar / por dónde"},
  {"word":"whirl","meaning":"girar rápido","synonyms":"girar / dar vueltas / rodar"},
  {"word":"wicked","meaning":"hace cosas malas","synonyms":"malo / travieso / malvado"},
  {"word":"yank","meaning":"jalar fuerte","synonyms":"jalar / tirar / halar"},
  {"word":"zoomed","meaning":"ir muy rápido","synonyms":"aceleró / corrió / voló"}
];

export const dictionary: Record<string, DictionaryEntry> = rawData.reduce((acc, item) => {
  acc[item.word.toLowerCase()] = {
    meaning: item.meaning,
    synonyms: item.synonyms
  };
  return acc;
}, {} as Record<string, DictionaryEntry>);

export const getMeaning = (word: string): string => {
  return dictionary[word.toLowerCase()]?.meaning || "¡Palabra fantástica!";
};

export const getSynonyms = (word: string): string => {
  return dictionary[word.toLowerCase()]?.synonyms || "";
};

export const saveLists = (lists: WordList[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
};

export const loadVoiceSettings = (): VoiceSettings => {
  const data = localStorage.getItem(VOICE_SETTINGS_KEY);
  if (data) return JSON.parse(data);
  return { voiceURI: null, rate: 0.8, pitch: 1.1 };
};

export const saveVoiceSettings = (settings: VoiceSettings) => {
  localStorage.setItem(VOICE_SETTINGS_KEY, JSON.stringify(settings));
};

export const extractWords = (text: string): Word[] => {
  const matches = text.match(/[a-zA-ZáéíóúÁÉÍÓÚñÑ]+/g) || [];
  return matches.map(w => ({
    original: w.toLowerCase(),
    id: Math.random().toString(36).substr(2, 9),
    errors: 0,
    successes: 0,
    completed: false
  }));
};

export const resetListProgress = (listId: string) => {
  const lists = loadLists();
  const updatedLists = lists.map(l => {
    if (l.id === listId) {
      return {
        ...l,
        words: l.words.map(w => ({ ...w, errors: 0, successes: 0, completed: false }))
      };
    }
    return l;
  });
  saveLists(updatedLists);
  return updatedLists;
};

export const loadLists = (): WordList[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) return JSON.parse(data);
  const defaultList: WordList = {
    id: 'spelling-bee-championship',
    name: 'Spelling Bee 🏆',
    words: extractWords(rawData.map(r => r.word).join(' ')),
    themeIndex: 0,
    settings: { rainEnabled: true },
    lastPlayed: Date.now()
  };
  const initialData = [defaultList];
  saveLists(initialData);
  return initialData;
};

export const prepareSession = (list: WordList, mode: 'normal' | 'repaso'): Word[] => {
  const allWords = list.words;
  const shuffle = <T>(array: T[]): T[] => {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  };

  if (mode === 'repaso') {
    // Modo Práctica: Prioridad a las rojas (2+ errores), luego naranjas (1 error)
    const critical = shuffle(allWords.filter(w => (w.errors || 0) >= 2));
    const practicing = shuffle(allWords.filter(w => (w.errors || 0) === 1));
    
    const session: Word[] = [];
    const maxSize = 12; // Sesiones de práctica más cortas y enfocadas
    
    while (session.length < maxSize && (critical.length > 0 || practicing.length > 0)) {
      if (critical.length > 0) session.push(critical.pop()!);
      else if (practicing.length > 0) session.push(practicing.pop()!);
    }
    return session;
  }

  // Modo Normal: Solo palabras nuevas + esporádicamente naranjas (1 error)
  // ESTRICTAMENTE PROHIBIDAS las rojas (2+ errores)
  const unseen = shuffle(allWords.filter(w => !w.completed));
  const orange = shuffle(allWords.filter(w => (w.errors || 0) === 1));
  
  const session: Word[] = [];
  const maxSize = 15;
  let counter = 0;
  
  while (session.length < maxSize && (unseen.length > 0 || orange.length > 0)) {
    // 1 de cada 4 palabras es una naranja para intentar "limpiarla"
    if (counter % 4 === 3 && orange.length > 0) {
      session.push(orange.pop()!);
    } else if (unseen.length > 0) {
      session.push(unseen.pop()!);
    } else if (orange.length > 0) {
      session.push(orange.pop()!);
    } else {
      break;
    }
    counter++;
  }
  
  return session;
};
