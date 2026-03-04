
import { WordList, Word, VoiceSettings } from './types';

const STORAGE_KEY = 'echofy_offline_v1';
const VOICE_SETTINGS_KEY = 'echofy_voice_settings';
const STARS_KEY = 'echofy_stars_v1';
const MIGRATION_KEY = 'echofy_migration_v7'; // Nueva clave para forzar actualización

export const THEMES = [
  { id: 0, name: 'Bosque Esmeralda', gradient: 'from-emerald-400 to-teal-500', bg: 'bg-emerald-50' },
  { id: 1, name: 'Cielo Estelar', gradient: 'from-indigo-400 to-purple-500', bg: 'bg-indigo-50' },
  { id: 2, name: 'Valle de Rosas', gradient: 'from-pink-200 to-rose-300', bg: 'bg-rose-50' },
  { id: 3, name: 'Océano Profundo', gradient: 'from-blue-800 to-indigo-950', bg: 'bg-blue-50' },
  { id: 4, name: 'Dunas de Oro', gradient: 'from-amber-400 to-yellow-500', bg: 'bg-amber-50' },
  { id: 5, name: 'Volcán de Fuego', gradient: 'from-red-500 to-rose-700', bg: 'bg-red-50' },
  { id: 6, name: 'Amanecer Naranja', gradient: 'from-orange-400 to-amber-500', bg: 'bg-orange-50' },
  { id: 7, name: 'Azul Cristalino', gradient: 'from-sky-100 to-blue-200', bg: 'bg-sky-50' },
  { id: 8, name: 'Nieve Pura', gradient: 'from-slate-50 to-white', bg: 'bg-slate-50' },
  { id: 9, name: 'Piedra Oscura', gradient: 'from-slate-700 to-slate-900', bg: 'bg-slate-900' }
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
  {"word":"ANOTHER","meaning":"**Otro.** Uno más o diferente.","synonyms":"adicional / distinto / diferente"},
  {"word":"MEMORY","meaning":"**Memoria.** Capacidad de recordar información.","synonyms":"recuerdo / retención / mente"},
  {"word":"ABOVE","meaning":"**Arriba.** En una posición más alta que algo.","synonyms":"encima / sobre / alto"},
  {"word":"ADD","meaning":"**Sumar.** Unir o sumar algo a otra cosa.","synonyms":"aumentar / unir / incluir"},
  {"word":"ADJUST","meaning":"**Ajustar.** Cambiar algo ligeramente para mejorar su funcionamiento.","synonyms":"adaptar / modificar / arreglar"},
  {"word":"AGAIN","meaning":"**Otra vez.** Otra vez o una vez más.","synonyms":"repetir / de nuevo / nuevamente"},
  {"word":"AGAINST","meaning":"**Contra.** En oposición o contacto con algo.","synonyms":"opuesto / versus / contrario"},
  {"word":"ALARM","meaning":"**Alarma.** Señal o sonido que advierte peligro o alerta.","synonyms":"alerta / advertencia / señal"},
  {"word":"ALMOST","meaning":"**Casi.** Casi, pero no completamente.","synonyms":"cerca / aproximadamente / por poco"},
  {"word":"ALONE","meaning":"**Solo.** Sin compañía de otras personas.","synonyms":"solitario / aislado / único"},
  {"word":"ALWAYS","meaning":"**Siempre.** En todo momento o en cada ocasión.","synonyms":"constantemente / eternamente / perpetuamente"},
  {"word":"AMONG","meaning":"**Entre.** En medio de varias personas o cosas.","synonyms":"en medio / rodeado / entre"},
  {"word":"ANIMAL","meaning":"**Animal.** Ser vivo que puede moverse y sentir.","synonyms":"criatura / bestia / organismo"},
  {"word":"APART","meaning":"**Aparte.** Separado o a cierta distancia.","synonyms":"separado / lejos / aislado"},
  {"word":"APPLE","meaning":"**Manzana.** Fruta redonda y dulce que crece en árboles.","synonyms":"fruta / pomo / alimento"},
  {"word":"ARTIST","meaning":"**Artista.** Persona que crea arte como música, pintura o dibujos.","synonyms":"creador / pintor / diseñador"},
  {"word":"ASK","meaning":"**Preguntar.** Hacer una pregunta o pedir algo.","synonyms":"cuestionar / solicitar / inquirir"},
  {"word":"ATTACH","meaning":"**Adjuntar.** Unir una cosa a otra.","synonyms":"conectar / unir / fijar"},
  {"word":"BALL","meaning":"**Pelota.** Objeto redondo usado para jugar.","synonyms":"esfera / balón / juguete"},
  {"word":"BASKET","meaning":"**Canasta.** Recipiente usado para transportar o guardar cosas.","synonyms":"contenedor / cesto / recipiente"},
  {"word":"BATCH","meaning":"**Lote.** Grupo de elementos hechos o tratados juntos.","synonyms":"grupo / conjunto / colección"},
  {"word":"BECAUSE","meaning":"**Porque.** Palabra usada para explicar una razón.","synonyms":"ya que / puesto que / debido a"},
  {"word":"BED","meaning":"**Cama.** Mueble donde las personas duermen o descansan.","synonyms":"catre / colchón / litera"},
  {"word":"BEHAVE","meaning":"**Comportarse.** Actuar de cierta manera.","synonyms":"actuar / conducirse / portarse"},
  {"word":"BELONG","meaning":"**Pertenecer.** Ser parte de algo o de alguien.","synonyms":"encajar / relacionarse / asociarse"},
  {"word":"BEND","meaning":"**Doblar.** Doblar algo sin romperlo.","synonyms":"curvar / flexionar / torcer"},
  {"word":"BLINK","meaning":"**Parpadear.** Cerrar y abrir los ojos rápidamente.","synonyms":"guiñar / titilar / pestañear"},
  {"word":"BLUSH","meaning":"**Sonrojarse.** Ponerse rojo por vergüenza o emoción.","synonyms":"enrojecer / ruborizarse / colorearse"},
  {"word":"BOLT","meaning":"**Perno / Correr.** Moverse muy rápido o una pieza metálica para asegurar algo.","synonyms":"correr / asegurar / pasador"},
  {"word":"BOOK","meaning":"**Libro.** Conjunto de páginas escritas o impresas.","synonyms":"volumen / texto / publicación"},
  {"word":"CAR","meaning":"**Carro.** Vehículo con motor usado para transportarse.","synonyms":"auto / vehículo / automóvil"},
  {"word":"CATERPILLAR","meaning":"**Oruga.** Larva de mariposa que luego se transforma.","synonyms":"larva / gusano / insecto"},
  {"word":"CAUTION","meaning":"**Precaución.** Cuidado para evitar peligro.","synonyms":"cuidado / advertencia / alerta"},
  {"word":"CAVE","meaning":"**Cueva.** Espacio natural dentro de una montaña o roca.","synonyms":"caverna / gruta / hueco"},
  {"word":"CELEBRATE","meaning":"**Celebrar.** Realizar algo especial para recordar o festejar.","synonyms":"honrar / festejar / regocijarse"},
  {"word":"CHAIR","meaning":"**Silla.** Asiento para una persona.","synonyms":"asiento / taburete / banca"},
  {"word":"CHAMPION","meaning":"**Campeón.** Persona que gana una competencia.","synonyms":"ganador / héroe / vencedor"},
  {"word":"CHAT","meaning":"**Charlar.** Conversar de manera informal.","synonyms":"hablar / conversar / discutir"},
  {"word":"CHIMNEY","meaning":"**Chimenea.** Conducto por donde sale el humo de una casa.","synonyms":"conducto / ventilación / tubo"},
  {"word":"CLOUD","meaning":"**Nube.** Masa blanca o gris visible en el cielo.","synonyms":"neblina / vapor / bruma"},
  {"word":"COIN","meaning":"**Moneda.** Pieza metálica usada como dinero.","synonyms":"dinero / ficha / efectivo"},
  {"word":"COMPASS","meaning":"**Brújula.** Instrumento que indica dirección.","synonyms":"navegador / guía / indicador"},
  {"word":"COMPLAIN","meaning":"**Quejarse.** Expresar molestia o inconformidad.","synonyms":"protestar / refunfuñar / objetar"},
  {"word":"CONSTRUCT","meaning":"**Construir.** Construir o crear algo.","synonyms":"edificar / crear / ensamblar"},
  {"word":"CONTINENT","meaning":"**Continente.** Gran masa de tierra del planeta.","synonyms":"masa terrestre / región / territorio"},
  {"word":"COOK","meaning":"**Cocinar.** Preparar alimentos usando calor.","synonyms":"preparar / hornear / hervir"},
  {"word":"COSTUME","meaning":"**Disfraz.** Ropa especial usada para representar algo.","synonyms":"atuendo / traje / vestimenta"},
  {"word":"COUNT","meaning":"**Contar.** Decir números en orden.","synonyms":"calcular / numerar / sumar"},
  {"word":"COZY","meaning":"**Acogedor.** Cómodo y agradable.","synonyms":"cómodo / cálido / confortable"},
  {"word":"CRASH","meaning":"**Chocar.** Golpear fuertemente o chocar.","synonyms":"colisionar / estrellarse / impactar"},
  {"word":"CURVED","meaning":"**Curvo.** Que tiene forma doblada o redondeada.","synonyms":"doblando / arqueado / redondeado"},
  {"word":"CYCLE","meaning":"**Ciclo.** Serie de eventos que se repiten.","synonyms":"bucle / secuencia / rotación"},
  {"word":"DAILY","meaning":"**Diario.** Que ocurre todos los días.","synonyms":"cotidiano / regular / rutinario"},
  {"word":"DAIRY","meaning":"**Lácteo.** Relacionado con productos hechos de leche.","synonyms":"leche / cremería / lácteo"},
  {"word":"DARK","meaning":"**Oscuro.** Con poca o ninguna luz.","synonyms":"tenue / sombrío / lúgubre"},
  {"word":"DART","meaning":"**Dardo / Correr.** Moverse rápida y repentinamente.","synonyms":"correr / precipitarse / lanzar"},
  {"word":"DECORATE","meaning":"**Decorar.** Adornar algo para hacerlo más atractivo.","synonyms":"ornamentar / diseñar / embellecer"},
  {"word":"DESERVE","meaning":"**Merecer.** Ser digno de recibir algo.","synonyms":"ganar / ameritar / justificar"},
  {"word":"DISHES","meaning":"**Platos.** Platos y utensilios usados para comer.","synonyms":"vajilla / cubiertos / utensilios"},
  {"word":"DIVIDE","meaning":"**Dividir.** Separar en partes.","synonyms":"separar / partir / fraccionar"},
  {"word":"DOOR","meaning":"**Puerta.** Entrada que permite pasar a un lugar.","synonyms":"entrada / portón / acceso"},
  {"word":"DROWSY","meaning":"**Soñoliento.** Con sueño o cansancio.","synonyms":"adormilado / cansado / lento"},
  {"word":"EARTH","meaning":"**Tierra.** El planeta donde vivimos.","synonyms":"mundo / globo / planeta"},
  {"word":"ENORMOUS","meaning":"**Enorme.** Muy grande en tamaño.","synonyms":"gigante / gigantesco / masivo"},
  {"word":"EQUAL","meaning":"**Igual.** Que tiene el mismo valor o cantidad.","synonyms":"mismo / equilibrado / equivalente"},
  {"word":"EXCLAIM","meaning":"**Exclamar.** Decir algo con emoción o sorpresa.","synonyms":"gritar / clamar / declarar"},
  {"word":"EYE","meaning":"**Ojo.** Órgano usado para ver.","synonyms":"visión / vista / óptica"},
  {"word":"FANCY","meaning":"**Lujoso.** Elegante o llamativo.","synonyms":"elegante / decorativo / estiloso"},
  {"word":"FAST","meaning":"**Rápido.** Que se mueve rápidamente.","synonyms":"veloz / raudo / ágil"},
  {"word":"FASTEN","meaning":"**Sujetar.** Asegurar o sujetar algo firmemente.","synonyms":"asegurar / atar / cerrar"},
  {"word":"FATHER","meaning":"**Padre.** Hombre que tiene hijos.","synonyms":"papá / progenitor / papi"},
  {"word":"FISH","meaning":"**Pez.** Animal que vive en el agua y respira por branquias.","synonyms":"marisco / animal marino / acuático"},
  {"word":"FLAT","meaning":"**Plano.** Plano y sin elevaciones.","synonyms":"nivelado / liso / parejo"},
  {"word":"FLEE","meaning":"**Huir.** Huir rápidamente de un lugar.","synonyms":"escapar / correr / evadir"},
  {"word":"FLOOR","meaning":"**Piso.** Superficie inferior de una habitación.","synonyms":"suelo / superficie / base"},
  {"word":"FLOWER","meaning":"**Flor.** Parte colorida de una planta.","synonyms":"florecer / brote / pétalo"},
  {"word":"FOG","meaning":"**Niebla.** Nube baja que reduce la visibilidad.","synonyms":"neblina / bruma / vapor"},
  {"word":"FOOTPRINT","meaning":"**Huella.** Marca que deja un pie al pisar.","synonyms":"rastro / marca / impronta"},
  {"word":"FOREST","meaning":"**Bosque.** Gran área llena de árboles.","synonyms":"selva / jungla / arboleda"},
  {"word":"FROG","meaning":"**Rana.** Animal pequeño que salta y vive cerca del agua.","synonyms":"anfibio / sapo / saltador"},
  {"word":"GATE","meaning":"**Portón.** Puerta que cierra un espacio exterior.","synonyms":"entrada / barrera / puerta"},
  {"word":"GATHER","meaning":"**Reunir.** Juntar cosas o personas.","synonyms":"coleccionar / ensamblar / traer"},
  {"word":"GIANT","meaning":"**Gigante.** Muy grande o enorme.","synonyms":"enorme / masivo / colosal"},
  {"word":"GIRL","meaning":"**Niña.** Persona joven de sexo femenino.","synonyms":"infante / hija / fémina"},
  {"word":"GLAD","meaning":"**Contento.** Feliz o contento.","synonyms":"feliz / complacido / alegre"},
  {"word":"GLOBE","meaning":"**Globo.** Modelo esférico de la Tierra.","synonyms":"tierra / esfera / mundo"},
  {"word":"GLUE","meaning":"**Pegamento.** Sustancia usada para pegar cosas.","synonyms":"adhesivo / pasta / cemento"},
  {"word":"GLUM","meaning":"**Melancólico.** Triste o desanimado.","synonyms":"triste / sombrío / abatido"},
  {"word":"GOLD","meaning":"**Oro.** Metal precioso de color amarillo.","synonyms":"metal / tesoro / lingote"},
  {"word":"GRAB","meaning":"**Agarrar.** Tomar algo rápidamente.","synonyms":"arrebatar / apoderarse / asir"},
  {"word":"GRATEFUL","meaning":"**Agradecido.** Sentir agradecimiento.","synonyms":"agradecido / apreciativo / complacido"},
  {"word":"GRIN","meaning":"**Sonreír.** Sonreír ampliamente.","synonyms":"sonrisa / radiante / mueca"},
  {"word":"GRIP","meaning":"**Agarre.** Sujetar firmemente.","synonyms":"sostener / asir / embrague"},
  {"word":"GROAN","meaning":"**Gemir.** Emitir un sonido por dolor o molestia.","synonyms":"quejido / queja / murmullo"},
  {"word":"HAPPY","meaning":"**Feliz.** Sentirse alegre o contento.","synonyms":"alegre / animado / contento"},
  {"word":"HAT","meaning":"**Sombrero.** Prenda que se usa en la cabeza.","synonyms":"gorra / casco / tocado"},
  {"word":"HATCH","meaning":"**Eclosionar.** Salir del huevo o abrir algo.","synonyms":"emerger / abrir / romper"},
  {"word":"HEAP","meaning":"**Montón.** Montón de cosas acumuladas.","synonyms":"pila / apilar / masa"},
  {"word":"HEART","meaning":"**Corazón.** Órgano que bombea la sangre y símbolo de emociones.","synonyms":"núcleo / centro / espíritu"},
  {"word":"HIDE","meaning":"**Esconder.** Ocultar algo o ponerse fuera de vista.","synonyms":"ocultar / cubrir / enmascarar"},
  {"word":"HOBBY","meaning":"**Pasatiempo.** Actividad que se realiza por gusto.","synonyms":"afición / interés / actividad"},
  {"word":"HONEST","meaning":"**Honesto.** Que dice la verdad.","synonyms":"sincero / veraz / justo"},
  {"word":"HONEY","meaning":"**Miel.** Sustancia dulce producida por las abejas.","synonyms":"néctar / jarabe / dulce"},
  {"word":"HOUR","meaning":"**Hora.** Periodo de tiempo equivalente a 60 minutos.","synonyms":"tiempo / periodo / momento"},
  {"word":"HOWL","meaning":"**Aullar.** Emitir un sonido largo y fuerte como un lobo.","synonyms":"gritar / alarido / gemir"},
  {"word":"INSECT","meaning":"**Insecto.** Animal pequeño con seis patas y cuerpo dividido.","synonyms":"bicho / artrópodo / criatura"},
  {"word":"KIND","meaning":"**Amable.** Amable y considerado con otros.","synonyms":"gentil / bondadoso / cariñoso"},
  {"word":"KITTEN","meaning":"**Gatito.** Gato pequeño o bebé.","synonyms":"gato / felino / cría"},
  {"word":"KNOB","meaning":"**Perilla.** Pieza redonda usada para abrir o ajustar algo.","synonyms":"mango / dial / interruptor"},
  {"word":"LAKE","meaning":"**Lago.** Gran cantidad de agua rodeada de tierra.","synonyms":"estanque / cuerpo de agua / embalse"},
  {"word":"LAUGH","meaning":"**Reír.** Reír o expresar alegría con sonido.","synonyms":"reírse / carcajear / sonreír"},
  {"word":"LIVELY","meaning":"**Animado.** Lleno de energía o movimiento.","synonyms":"activo / energético / vívido"},
  {"word":"LOOSEN","meaning":"**Aflojar.** Aflojar algo que estaba apretado.","synonyms":"relajar / soltar / desatar"},
  {"word":"MAMMAL","meaning":"**Mamífero.** Animal que alimenta a sus crías con leche.","synonyms":"animal / criatura / vertebrado"},
  {"word":"MAP","meaning":"**Mapa.** Dibujo que representa un lugar o territorio.","synonyms":"carta / plano / diagrama"},
  {"word":"MASK","meaning":"**Máscara.** Objeto que cubre el rostro.","synonyms":"cubierta / disfraz / escudo"},
  {"word":"MILK","meaning":"**Leche.** Líquido nutritivo producido por mamíferos.","synonyms":"lácteo / bebida / líquido"},
  {"word":"MISTY","meaning":"**Nebuloso.** Con ligera neblina o vapor en el aire.","synonyms":"brumoso / nublado / vaporoso"},
  {"word":"MODERN","meaning":"**Moderno.** Relacionado con tiempos actuales.","synonyms":"actual / contemporáneo / reciente"},
  {"word":"MONTH","meaning":"**Mes.** Periodo de tiempo de aproximadamente 30 días.","synonyms":"periodo / ciclo / lapso"},
  {"word":"MOUNTAIN","meaning":"**Montaña.** Elevación natural alta del terreno.","synonyms":"pico / colina / cumbre"},
  {"word":"MOUSE","meaning":"**Ratón.** Pequeño roedor o dispositivo de computadora.","synonyms":"roedor / animal / puntero"},
  {"word":"NARROW","meaning":"**Estrecho.** Angosto o con poco ancho.","synonyms":"delgado / apretado / fino"},
  {"word":"OBEY","meaning":"**Obedecer.** Seguir órdenes o reglas.","synonyms":"seguir / cumplir / respetar"},
  {"word":"OCEAN","meaning":"**Océano.** Gran extensión de agua salada.","synonyms":"mar / agua / marino"},
  {"word":"PAIN","meaning":"**Dolor.** Sensación física o emocional desagradable.","synonyms":"daño / malestar / sufrimiento"},
  {"word":"PARK","meaning":"**Parque.** Área abierta destinada al descanso o recreación.","synonyms":"jardín / patio / zona verde"},
  {"word":"PEST","meaning":"**Plaga.** Animal o insecto que causa daño o molestia.","synonyms":"bicho / molestia / parásito"},
  {"word":"PLANET","meaning":"**Planeta.** Cuerpo celeste que orbita una estrella.","synonyms":"mundo / esfera / cuerpo celeste"},
  {"word":"POLISH","meaning":"**Pulir.** Limpiar o dar brillo a algo.","synonyms":"brillar / lustrar / refinar"},
  {"word":"POOR","meaning":"**Pobre.** Que tiene pocos recursos o baja calidad.","synonyms":"necesitado / bajo / débil"},
  {"word":"PRESENT","meaning":"**Regalo / Presente.** Algo que se da como regalo o el momento actual.","synonyms":"obsequio / ahora / actual"},
  {"word":"PRETEND","meaning":"**Fingir.** Actuar como si algo fuera real.","synonyms":"imaginar / simular / aparentar"},
  {"word":"PROMISE","meaning":"**Promesa.** Compromiso de hacer algo.","synonyms":"juramento / voto / asegurar"},
  {"word":"PUNCTUATION","meaning":"**Puntuación.** Signos usados para organizar la escritura.","synonyms":"marcas / símbolos / gramática"},
  {"word":"RAIN","meaning":"**Lluvia.** Agua que cae de las nubes.","synonyms":"aguacero / chaparrón / llovizna"},
  {"word":"RAINBOW","meaning":"**Arcoíris.** Arco de colores que aparece tras la lluvia.","synonyms":"espectro / arco / colores"},
  {"word":"READ","meaning":"**Leer.** Interpretar palabras escritas.","synonyms":"estudiar / escanear / revisar"},
  {"word":"REMOVE","meaning":"**Remover.** Quitar algo de un lugar.","synonyms":"quitar / borrar / extraer"},
  {"word":"REPEAT","meaning":"**Repetir.** Hacer algo nuevamente.","synonyms":"rehacer / replicar / duplicar"},
  {"word":"RESCUE","meaning":"**Rescate.** Salvar de peligro.","synonyms":"salvar / recuperar / proteger"},
  {"word":"RESTART","meaning":"**Reiniciar.** Comenzar otra vez.","synonyms":"restablecer / reanudar / empezar de nuevo"},
  {"word":"RETURN","meaning":"**Regresar.** Volver a un lugar o devolver algo.","synonyms":"volver / restaurar / devolver"},
  {"word":"RIPE","meaning":"**Maduro.** Listo para comer o maduro.","synonyms":"sazonado / listo / crecido"},
  {"word":"RISE","meaning":"**Subir.** Moverse hacia arriba.","synonyms":"levantar / aumentar / ascender"},
  {"word":"ROAR","meaning":"**Rugir.** Emitir un sonido fuerte como un león.","synonyms":"bramar / gruñir / gritar"},
  {"word":"ROCKET","meaning":"**Cohete.** Vehículo que viaja al espacio.","synonyms":"misil / nave espacial / lanzador"},
  {"word":"RUST","meaning":"**Óxido.** Capa rojiza que aparece en el metal.","synonyms":"corrosión / oxidación / deterioro"},
  {"word":"SAFETY","meaning":"**Seguridad.** Estado de estar libre de peligro.","synonyms":"protección / cuidado / resguardo"},
  {"word":"SAY","meaning":"**Decir.** Expresar algo con palabras.","synonyms":"hablar / contar / declarar"},
  {"word":"SCOLD","meaning":"**Regañar.** Regañar o corregir con enojo.","synonyms":"reprender / criticar / sermonear"},
  {"word":"SCRATCH","meaning":"**Rasguñar.** Raspar una superficie con algo puntiagudo.","synonyms":"raspar / frotar / marcar"},
  {"word":"SEED","meaning":"**Semilla.** Parte de una planta que puede crecer y formar una nueva.","synonyms":"grano / pepita / hueso"},
  {"word":"SELFISH","meaning":"**Egoísta.** Que piensa solo en sí mismo.","synonyms":"egocéntrico / interesado / codicioso"},
  {"word":"SERIOUS","meaning":"**Serio.** Importante o que requiere atención.","synonyms":"grave / importante / solemne"},
  {"word":"SHELL","meaning":"**Caparazón / Concha.** Cubierta dura que protege a algunos animales.","synonyms":"cubierta / estuche / armadura"},
  {"word":"SHELTER","meaning":"**Refugio.** Lugar que protege del clima o peligro.","synonyms":"asilo / guarida / protección"},
  {"word":"SILENT","meaning":"**Silencioso.** Sin hacer sonido.","synonyms":"quieto / mudo / calmo"},
  {"word":"SIMPLE","meaning":"**Simple.** Fácil de entender o hacer.","synonyms":"fácil / sencillo / básico"},
  {"word":"SKY","meaning":"**Cielo.** Espacio visible sobre la Tierra.","synonyms":"firmamento / aire / alturas"},
  {"word":"SLY","meaning":"**Astuto.** Astuto o que actúa con discreción.","synonyms":"mañoso / taimado / sigiloso"},
  {"word":"SNEAKY","meaning":"**Furtivo.** Que actúa en secreto o sin ser visto.","synonyms":"sigiloso / secreto / tramposo"},
  {"word":"SOB","meaning":"**Sollozar.** Llorar con sonidos cortos y fuertes.","synonyms":"llorar / gemir / gimotear"},
  {"word":"SPIRAL","meaning":"**Espiral.** Forma que gira alrededor de un punto.","synonyms":"bobina / giro / hélice"},
  {"word":"SPRINKLE","meaning":"**Espolvorear.** Esparcir pequeñas gotas o partículas.","synonyms":"dispersar / rociar / esparcir"},
  {"word":"STARTLE","meaning":"**Sobresaltar.** Sorprender repentinamente.","synonyms":"asustar / sorprender / alarmar"},
  {"word":"STEEP","meaning":"**Empinado.** Muy inclinado o empinado.","synonyms":"abrupto / escarpado / inclinado"},
  {"word":"STORMY","meaning":"**Tormentoso.** Con tormenta o clima fuerte.","synonyms":"lluvioso / ventoso / tempestuoso"},
  {"word":"SUBTRACT","meaning":"**Restar.** Quitar una cantidad de otra.","synonyms":"deducir / quitar / menos"},
  {"word":"SUN","meaning":"**Sol.** Estrella que ilumina y calienta la Tierra.","synonyms":"estrella / luz solar / astro"},
  {"word":"SWITCH","meaning":"**Interruptor / Cambiar.** Dispositivo para encender o apagar algo.","synonyms":"alternar / control / botón"},
  {"word":"THICK","meaning":"**Grueso.** Con gran anchura o densidad.","synonyms":"denso / sólido / pesado"},
  {"word":"THUNDER","meaning":"**Trueno.** Sonido fuerte producido por un rayo.","synonyms":"estruendo / retumbo / rugido"},
  {"word":"TICKET","meaning":"**Boleto.** Documento que permite entrada o viaje.","synonyms":"pase / vale / permiso"},
  {"word":"TIMID","meaning":"**Tímido.** Con miedo o poca confianza.","synonyms":"penoso / temeroso / nervioso"},
  {"word":"TRAVEL","meaning":"**Viajar.** Ir de un lugar a otro.","synonyms":"viaje / moverse / travesía"},
  {"word":"TRUST","meaning":"**Confiar.** Creer o confiar en alguien o algo.","synonyms":"creer / depender / fe"},
  {"word":"UPSET","meaning":"**Molesto.** Sentirse molesto o triste.","synonyms":"perturbado / triste / preocupado"},
  {"word":"WATER","meaning":"**Agua.** Líquido esencial para la vida.","synonyms":"líquido / H2O / aqua"},
  {"word":"WEED","meaning":"**Maleza.** Planta que crece donde no se desea.","synonyms":"hierba mala / planta silvestre / plaga"},
  {"word":"WHIRL","meaning":"**Girar.** Girar rápidamente en círculo.","synonyms":"rotar / dar vueltas / remolinar"},
  {"word":"WHISTLE","meaning":"**Silbar.** Emitir un sonido soplando aire.","synonyms":"pitar / señal / flauta"},
  {"word":"WICKED","meaning":"**Malvado.** Malo o con malas intenciones.","synonyms":"maligno / malo / cruel"},
  {"word":"YANK","meaning":"**Tirón.** Jalar algo con fuerza repentina.","synonyms":"jalar / sacudida / tirar"},
  {"word":"ACCIDENT","meaning":"**Accidente.** Evento inesperado que causa daño o problema.","synonyms":"percance / incidente / choque"},
  {"word":"ACHIEVE","meaning":"**Lograr.** Lograr algo con esfuerzo.","synonyms":"cumplir / alcanzar / obtener"},
  {"word":"ADMIRE","meaning":"**Admirar.** Sentir respeto o gusto por alguien o algo.","synonyms":"respetar / apreciar / elogiar"},
  {"word":"AGREE","meaning":"**Acordar.** Tener la misma opinión que otra persona.","synonyms":"aceptar / coincidir / aprobar"},
  {"word":"AIRPLANE","meaning":"**Avión.** Vehículo que vuela por el aire.","synonyms":"aeroplano / aeronave / jet"},
  {"word":"ALLIGATOR","meaning":"**Caimán.** Reptil grande parecido al cocodrilo.","synonyms":"reptil / cocodrilo / animal"},
  {"word":"ARRIVE","meaning":"**Llegar.** Llegar a un lugar.","synonyms":"alcanzar / venir / aparecer"},
  {"word":"ASTRONOMY","meaning":"**Astronomía.** Ciencia que estudia los cuerpos celestes.","synonyms":"ciencia espacial / cosmología / observación estelar"},
  {"word":"ATLAS","meaning":"**Atlas.** Libro de mapas.","synonyms":"libro de mapas / colección / guía"},
  {"word":"ATTENTION","meaning":"**Atención.** Concentración o cuidado hacia algo.","synonyms":"enfoque / nota / conciencia"},
  {"word":"AWARD","meaning":"**Premio.** Premio dado por un logro.","synonyms":"galardón / trofeo / honor"},
  {"word":"AWARE","meaning":"**Consciente.** Consciente de algo.","synonyms":"alerta / informado / atento"},
  {"word":"BALANCE","meaning":"**Balance.** Estado de estabilidad entre partes.","synonyms":"equilibrio / estabilidad / control"},
  {"word":"BANNER","meaning":"**Pancarta.** Bandera o cartel con mensaje.","synonyms":"bandera / letrero / póster"},
  {"word":"BARE","meaning":"**Desnudo.** Sin cubrir o sin adornos.","synonyms":"descubierto / simple / vacío"},
  {"word":"BASE","meaning":"**Base.** Parte inferior o fundamento.","synonyms":"fundamento / fondo / núcleo"},
  {"word":"BEACH","meaning":"**Playa.** Zona de arena junto al mar.","synonyms":"costa / orilla / litoral"},
  {"word":"BESIDES","meaning":"**Además.** Además de algo.","synonyms":"también / asimismo / aparte de"},
  {"word":"BIND","meaning":"**Atar.** Atar o unir firmemente.","synonyms":"amarrar / sujetar / enlazar"},
  {"word":"BLANKET","meaning":"**Manta.** Cobija usada para abrigarse.","synonyms":"cobija / edredón / cobertor"},
  {"word":"BLAST","meaning":"**Explosión.** Explosión fuerte o ráfaga de aire.","synonyms":"estallido / ráfaga / detonación"},
  {"word":"BLIZZARD","meaning":"**Ventisca.** Tormenta fuerte de nieve.","synonyms":"nevada / tormenta de nieve / temporal"},
  {"word":"BOARD","meaning":"**Tabla / Junta.** Tabla plana o grupo que dirige algo.","synonyms":"panel / tablón / comité"},
  {"word":"BOTH","meaning":"**Ambos.** Los dos al mismo tiempo.","synonyms":"los dos / par / dúo"},
  {"word":"BOUNCE","meaning":"**Rebotar.** Rebotar después de tocar una superficie.","synonyms":"saltar / rebote / brincar"},
  {"word":"BRAIN","meaning":"**Cerebro.** Órgano que controla el pensamiento y el cuerpo.","synonyms":"mente / intelecto / cabeza"},
  {"word":"BRANCH","meaning":"**Rama.** Parte que sale del tronco de un árbol.","synonyms":"ramificación / brote / división"},
  {"word":"BRAVE","meaning":"**Valiente.** Que enfrenta el miedo con valentía.","synonyms":"audaz / valeroso / intrépido"},
  {"word":"BRIDGE","meaning":"**Puente.** Estructura que conecta dos lugares sobre un espacio.","synonyms":"paso elevado / cruce / conexión"},
  {"word":"BRIGHT","meaning":"**Brillante.** Con mucha luz o inteligencia.","synonyms":"luminoso / inteligente / radiante"},
  {"word":"BUCKET","meaning":"**Cubeta.** Recipiente usado para transportar líquidos.","synonyms":"balde / cubo / recipiente"},
  {"word":"BUY","meaning":"**Comprar.** Adquirir algo pagando dinero.","synonyms":"adquirir / obtener / mercar"},
  {"word":"CAGE","meaning":"**Jaula.** Estructura cerrada para animales.","synonyms":"recinto / corral / encierro"},
  {"word":"CALENDAR","meaning":"**Calendario.** Sistema para organizar días y meses.","synonyms":"agenda / planificador / horario"},
  {"word":"CALF","meaning":"**Becerro.** Cría de vaca u otro animal grande.","synonyms":"ternero / cría / novillo"},
  {"word":"CALM","meaning":"**Calma.** Tranquilo y sin agitación.","synonyms":"pacífico / quieto / sereno"},
  {"word":"CANDLE","meaning":"**Vela.** Objeto de cera que produce luz al encenderse.","synonyms":"candelero / lámpara / llama"},
  {"word":"CARPET","meaning":"**Alfombra.** Tela gruesa que cubre el suelo.","synonyms":"tapete / moqueta / cubierta"},
  {"word":"CENTER","meaning":"**Centro.** Parte media de algo.","synonyms":"medio / núcleo / eje"},
  {"word":"CHARACTER","meaning":"**Personaje.** Persona de una historia o personalidad de alguien.","synonyms":"figura / rol / personalidad"},
  {"word":"CHEW","meaning":"**Masticar.** Masticar comida con los dientes.","synonyms":"morder / roer / triturar"},
  {"word":"CLAW","meaning":"**Garra.** Uña afilada de un animal.","synonyms":"uña / zarpa / gancho"},
  {"word":"CLEAR","meaning":"**Claro.** Fácil de ver o entender.","synonyms":"obvio / transparente / evidente"},
  {"word":"CLEVER","meaning":"**Ingenioso.** Inteligente y rápido para pensar.","synonyms":"listo / brillante / sabio"},
  {"word":"CLIFF","meaning":"**Acantilado.** Roca alta y empinada.","synonyms":"precipicio / despeñadero / risco"},
  {"word":"CLOCK","meaning":"**Reloj.** Objeto que muestra la hora.","synonyms":"cronómetro / reloj de pared / temporizador"},
  {"word":"CLUB","meaning":"**Club.** Grupo de personas con interés común.","synonyms":"grupo / asociación / equipo"},
  {"word":"COLLECT","meaning":"**Coleccionar.** Reunir cosas en un mismo lugar.","synonyms":"reunir / juntar / acumular"},
  {"word":"COMPASSION","meaning":"**Compasión.** Sentimiento de preocupación por el sufrimiento de otros.","synonyms":"empatía / bondad / simpatía"},
  {"word":"CONNECT","meaning":"**Conectar.** Unir o enlazar cosas entre sí.","synonyms":"vincular / unir / adjuntar"},
  {"word":"CORE","meaning":"**Núcleo.** Parte central o más importante de algo.","synonyms":"centro / corazón / esencia"},
  {"word":"CORNER","meaning":"**Esquina.** Lugar donde se unen dos lados o paredes.","synonyms":"borde / ángulo / rincón"},
  {"word":"COUPLE","meaning":"**Pareja.** Dos personas o cosas juntas.","synonyms":"par / dúo / compañeros"},
  {"word":"CURIOUS","meaning":"**Curioso.** Con deseo de aprender o saber más.","synonyms":"inquisitivo / interesado / ansioso"},
  {"word":"DANGEROUS","meaning":"**Peligroso.** Que puede causar daño.","synonyms":"riesgoso / nocivo / inseguro"},
  {"word":"DASH","meaning":"**Carrera.** Moverse rápidamente.","synonyms":"correr / precipitarse / sprint"},
  {"word":"DAWN","meaning":"**Amanecer.** Momento en que empieza el día.","synonyms":"alba / madrugada / mañana"},
  {"word":"DEEP","meaning":"**Profundo.** Que tiene gran profundidad.","synonyms":"hondo / bajo / intenso"},
  {"word":"DESERT","meaning":"**Desierto.** Lugar seco con poca vegetación.","synonyms":"páramo / dunas / árido"},
  {"word":"DESIGN","meaning":"**Diseño.** Planear o crear algo antes de hacerlo.","synonyms":"plan / crear / desarrollar"},
  {"word":"DIFFERENT","meaning":"**Diferente.** No igual a otra cosa.","synonyms":"distinto / desigual / separado"},
  {"word":"DIGRAPH","meaning":"**Dígrafo.** Dos letras que producen un solo sonido.","synonyms":"par de letras / unidad de sonido / fonema"},
  {"word":"DISCARD","meaning":"**Descartar.** Desechar algo que no se necesita.","synonyms":"tirar / desechar / rechazar"},
  {"word":"DISTURB","meaning":"**Perturbar.** Interrumpir la tranquilidad.","synonyms":"molestar / interrumpir / inquietar"},
  {"word":"DIVE","meaning":"**Bucear / Zambullirse.** Lanzarse hacia abajo, especialmente al agua.","synonyms":"sumergirse / saltar / caer"},
  {"word":"DOME","meaning":"**Domo.** Techo con forma redondeada.","synonyms":"cúpula / bóveda / arco"},
  {"word":"DOUBT","meaning":"**Duda.** Falta de certeza o confianza.","synonyms":"incertidumbre / pregunta / vacilación"},
  {"word":"DOZEN","meaning":"**Docena.** Grupo de doce unidades.","synonyms":"doce / conjunto / grupo"},
  {"word":"EARTHQUAKE","meaning":"**Terremoto.** Movimiento fuerte del suelo.","synonyms":"temblor / sismo / movimiento sísmico"},
  {"word":"ENEMY","meaning":"**Enemigo.** Persona que se opone o desea daño.","synonyms":"oponente / adversario / rival"},
  {"word":"ENOUGH","meaning":"**Suficiente.** Cantidad necesaria o suficiente.","synonyms":"bastante / adecuado / amplio"},
  {"word":"EXACTLY","meaning":"**Exactamente.** De manera precisa o correcta.","synonyms":"precisamente / certeramente / perfectamente"},
  {"word":"EXCESS","meaning":"**Exceso.** Cantidad mayor de la necesaria.","synonyms":"extra / sobrante / desbordamiento"},
  {"word":"EXPERIMENT","meaning":"**Experimento.** Prueba para descubrir algo nuevo.","synonyms":"prueba / ensayo / estudio"},
  {"word":"FABLE","meaning":"**Fábula.** Historia corta con enseñanza.","synonyms":"cuento / relato / parábola"},
  {"word":"FACTORY","meaning":"**Fábrica.** Lugar donde se fabrican productos.","synonyms":"planta / taller / industria"},
  {"word":"FAIR","meaning":"**Justo / Feria.** Justo o equilibrado.","synonyms":"equitativo / honesto / razonable"},
  {"word":"FAMILY","meaning":"**Familia.** Grupo de personas unidas por parentesco.","synonyms":"parientes / hogar / linaje"},
  {"word":"FAMOUS","meaning":"**Famoso.** Conocido por muchas personas.","synonyms":"conocido / popular / célebre"},
  {"word":"FEAST","meaning":"**Banquete.** Comida grande y especial.","synonyms":"festín / comida / celebración"},
  {"word":"FICTION","meaning":"**Ficción.** Historia imaginaria.","synonyms":"historia / fantasía / novela"},
  {"word":"FIELD","meaning":"**Campo.** Área abierta de tierra.","synonyms":"prado / tierra / llanura"},
  {"word":"FINALLY","meaning":"**Finalmente.** Después de mucho tiempo o esfuerzo.","synonyms":"eventualmente / por fin / últimamente"},
  {"word":"FIREFIGHTER","meaning":"**Bombero.** Persona que apaga incendios.","synonyms":"rescatista / apagafuegos / protector"},
  {"word":"FLAP","meaning":"**Aletear.** Mover algo hacia arriba y abajo rápidamente.","synonyms":"ondear / batir / oscilar"},
  {"word":"FLOAT","meaning":"**Flotar.** Mantenerse sobre el agua o aire.","synonyms":"deriva / suspenderse / deslizarse"},
  {"word":"FLOOD","meaning":"**Inundación.** Gran cantidad de agua que cubre la tierra.","synonyms":"desbordamiento / anegación / crecida"},
  {"word":"FOLD","meaning":"**Doblar.** Doblar algo sobre sí mismo.","synonyms":"plegar / arrugar / envolver"},
  {"word":"FOUR","meaning":"**Cuatro.** Número después del tres.","synonyms":"4 / cuarteto / cuádruple"},
  {"word":"FRESH","meaning":"**Fresco.** Nuevo o recién hecho.","synonyms":"nuevo / limpio / reciente"},
  {"word":"FRIEND","meaning":"**Amigo.** Persona con quien existe afecto y confianza.","synonyms":"compañero / camarada / aliado"},
  {"word":"FRIGHTEN","meaning":"**Asustar.** Causar miedo.","synonyms":"espantar / alarmar / aterrorizar"},
  {"word":"FUEL","meaning":"**Combustible.** Material usado para producir energía.","synonyms":"fuente de energía / gas / potencia"},
  {"word":"GAP","meaning":"**Brecha.** Espacio vacío entre cosas.","synonyms":"espacio / abertura / ruptura"},
  {"word":"GAZE","meaning":"**Mirada.** Mirar fijamente.","synonyms":"fijar la vista / observar / mirar"},
  {"word":"GIFT","meaning":"**Regalo.** Objeto que se da a alguien como muestra de cariño.","synonyms":"presente / ofrenda / recompensa"},
  {"word":"GIVE","meaning":"**Dar.** Entregar algo a otra persona.","synonyms":"entregar / proveer / ofrecer"},
  {"word":"GRAVITY","meaning":"**Gravedad.** Fuerza que atrae los objetos hacia la Tierra.","synonyms":"atracción / fuerza / peso"},
  {"word":"GREEDY","meaning":"**Codicioso.** Que desea más de lo necesario.","synonyms":"egoísta / avaro / ambicioso"},
  {"word":"GUIDE","meaning":"**Guía.** Persona o cosa que muestra el camino.","synonyms":"líder / dirigir / asistir"},
  {"word":"HARM","meaning":"**Daño.** Daño físico o emocional.","synonyms":"perjuicio / lesión / herida"},
  {"word":"HERD","meaning":"**Manada.** Grupo de animales juntos.","synonyms":"rebaño / grupo / jauría"},
  {"word":"IDEA","meaning":"**Idea.** Pensamiento o concepto en la mente.","synonyms":"pensamiento / concepto / noción"},
  {"word":"INSTRUMENT","meaning":"**Instrumento.** Herramienta usada para realizar una tarea o música.","synonyms":"herramienta / dispositivo / equipo"},
  {"word":"INTENT","meaning":"**Intención.** Propósito o intención de hacer algo.","synonyms":"objetivo / propósito / meta"},
  {"word":"INVENT","meaning":"**Inventar.** Crear algo nuevo.","synonyms":"crear / diseñar / desarrollar"},
  {"word":"ISLAND","meaning":"**Isla.** Tierra rodeada completamente por agua.","synonyms":"islote / masa terrestre / atolón"},
  {"word":"LEADER","meaning":"**Líder.** Persona que guía a un grupo.","synonyms":"jefe / guía / capitán"},
  {"word":"LEAP","meaning":"**Salto.** Saltar con fuerza.","synonyms":"brinco / saltar / rebote"},
  {"word":"LIGHTNING","meaning":"**Rayo.** Descarga eléctrica brillante durante tormentas.","synonyms":"relámpago / destello / chispa"},
  {"word":"LITTLE","meaning":"**Pequeño.** De tamaño pequeño.","synonyms":"chico / diminuto / mini"},
  {"word":"LIZARD","meaning":"**Lagarto.** Reptil pequeño de cuerpo alargado.","synonyms":"reptil / gecko / animal"},
  {"word":"LOCAL","meaning":"**Local.** Relacionado con un lugar cercano.","synonyms":"cercano / regional / nativo"},
  {"word":"MARKET","meaning":"**Mercado.** Lugar donde se compran y venden productos.","synonyms":"tienda / bazar / comercio"},
  {"word":"MEAT","meaning":"**Carne.** Carne usada como alimento.","synonyms":"pulpa / proteína / comida"},
  {"word":"MEMBERS","meaning":"**Miembros.** Personas que forman parte de un grupo.","synonyms":"participantes / grupo / asociados"},
  {"word":"MOTOR","meaning":"**Motor.** Máquina que produce movimiento.","synonyms":"máquina / propulsor / unidad"},
  {"word":"MOVE","meaning":"**Mover.** Cambiar de posición o lugar.","synonyms":"desplazar / ir / viajar"},
  {"word":"NIBBLED","meaning":"**Mordisquear.** Comer algo en pequeños mordiscos.","synonyms":"picar / roer / probar"},
  {"word":"NOTICE","meaning":"**Notar.** Darse cuenta de algo.","synonyms":"observar / ver / detectar"},
  {"word":"NOUN","meaning":"**Sustantivo.** Palabra que nombra personas, lugares o cosas.","synonyms":"nombre / término / etiqueta"},
  {"word":"PALE","meaning":"**Pálido.** De color claro o sin intensidad.","synonyms":"claro / tenue / descolorido"},
  {"word":"PARADE","meaning":"**Desfile.** Desfile público de personas o vehículos.","synonyms":"marcha / procesión / exhibición"},
  {"word":"PAST","meaning":"**Pasado.** Tiempo que ya ocurrió.","synonyms":"antes / historia / previo"},
  {"word":"PEAK","meaning":"**Pico / Cima.** Punto más alto.","synonyms":"cima / cumbre / cresta"},
  {"word":"PEOPLE","meaning":"**Gente.** Grupo de personas.","synonyms":"personas / multitud / población"},
  {"word":"PLACE","meaning":"**Lugar.** Ubicación o sitio.","synonyms":"ubicación / sitio / área"},
  {"word":"PLAIN","meaning":"**Simple / Llanura.** Simple o sin decoración.","synonyms":"sencillo / claro / básico"},
  {"word":"PLOT","meaning":"**Trama.** Secuencia de eventos de una historia.","synonyms":"argumento / plan / esquema"},
  {"word":"POLITICS","meaning":"**Política.** Actividad relacionada con gobernar un país.","synonyms":"gobierno / política / administración"},
  {"word":"POLLUTION","meaning":"**Contaminación.** Contaminación del ambiente.","synonyms":"polución / residuos / toxinas"},
  {"word":"PREDICTION","meaning":"**Predicción.** Idea sobre lo que sucederá en el futuro.","synonyms":"pronóstico / suposición / proyección"},
  {"word":"PROCEDURE","meaning":"**Procedimiento.** Serie de pasos para hacer algo.","synonyms":"proceso / método / rutina"},
  {"word":"PROOF","meaning":"**Prueba.** Evidencia que demuestra algo.","synonyms":"evidencia / confirmación / verificación"},
  {"word":"QUESTION","meaning":"**Pregunta.** Frase usada para pedir información.","synonyms":"consulta / interrogante / duda"},
  {"word":"QUICKLY","meaning":"**Rápidamente.** De manera rápida.","synonyms":"rápido / velozmente / prontamente"},
  {"word":"REPLICA","meaning":"**Réplica.** Copia exacta de algo.","synonyms":"copia / duplicado / modelo"},
  {"word":"RESEARCH","meaning":"**Investigación.** Estudio para descubrir información nueva.","synonyms":"estudio / indagación / análisis"},
  {"word":"RESPOND","meaning":"**Responder.** Contestar o reaccionar.","synonyms":"contestar / replicar / reaccionar"},
  {"word":"ROUGH","meaning":"**Áspero.** Áspero o no suave.","synonyms":"rugoso / tosco / desigual"},
  {"word":"RUMOR","meaning":"**Rumor.** Información que circula sin confirmación oficial.","synonyms":"chisme / habladuría / murmullo"},
  {"word":"SAFE","meaning":"**Seguro.** Libre de peligro o daño.","synonyms":"protegido / resguardado / inofensivo"},
  {"word":"SCHOLAR","meaning":"**Erudito.** Persona dedicada al estudio.","synonyms":"estudiante / académico / aprendiz"},
  {"word":"SCIENTIST","meaning":"**Científico.** Persona que estudia la ciencia.","synonyms":"investigador / experto / analista"},
  {"word":"SEAL","meaning":"**Foca / Sello.** Animal marino o marca para cerrar algo.","synonyms":"estampilla / cierre / animal marino"},
  {"word":"SEARCH","meaning":"**Buscar.** Intentar encontrar algo.","synonyms":"buscar / mirar / explorar"},
  {"word":"SETTING","meaning":"**Escenario.** Lugar o ambiente donde ocurre algo.","synonyms":"ambiente / escena / ubicación"},
  {"word":"SETTLE","meaning":"**Establecerse / Resolver.** Establecerse o resolver algo.","synonyms":"resolver / decidir / establecer"},
  {"word":"SHARE","meaning":"**Compartir.** Dar parte de algo a otros.","synonyms":"dividir / dar / distribuir"},
  {"word":"SHIVER","meaning":"**Temblar.** Temblar por frío o miedo.","synonyms":"estremecerse / sacudirse / tiritar"},
  {"word":"SHY","meaning":"**Tímido.** Tímido o reservado.","synonyms":"penoso / vergonzoso / callado"},
  {"word":"SKILL","meaning":"**Habilidad.** Capacidad para hacer algo bien.","synonyms":"capacidad / talento / destreza"},
  {"word":"SMOOTH","meaning":"**Suave.** Suave o sin irregularidades.","synonyms":"liso / terso / pulido"},
  {"word":"SOIL","meaning":"**Suelo.** Tierra donde crecen las plantas.","synonyms":"tierra / terreno / suciedad"},
  {"word":"STACK","meaning":"**Pila.** Montón ordenado de objetos.","synonyms":"montón / apilamiento / torre"},
  {"word":"STEADY","meaning":"**Estable.** Firme y constante.","synonyms":"firme / constante / seguro"},
  {"word":"STRAND","meaning":"**Hebra / Varar.** Hilo delgado o quedar atrapado.","synonyms":"hilo / fibra / cuerda"},
  {"word":"STRATEGY","meaning":"**Estrategia.** Plan para lograr un objetivo.","synonyms":"plan / método / enfoque"},
  {"word":"STREAM","meaning":"**Arroyo.** Corriente pequeña de agua.","synonyms":"riachuelo / flujo / corriente"},
  {"word":"TEAM","meaning":"**Equipo.** Grupo que trabaja junto.","synonyms":"grupo / tripulación / escuadrón"},
  {"word":"THANKFUL","meaning":"**Agradecido.** Sentir agradecimiento.","synonyms":"agradecido / apreciativo / complacido"},
  {"word":"THROUGH","meaning":"**A través de.** De un lado hacia el otro.","synonyms":"por / vía / mediante"},
  {"word":"TINY","meaning":"**Diminuto.** Muy pequeño.","synonyms":"pequeño / minúsculo / chico"},
  {"word":"TOOL","meaning":"**Herramienta.** Objeto usado para realizar un trabajo.","synonyms":"instrumento / dispositivo / implemento"},
  {"word":"TOWARD","meaning":"**Hacia.** En dirección a algo.","synonyms":"a / hacia adentro / acercándose"},
  {"word":"TOWER","meaning":"**Torre.** Construcción alta y estrecha.","synonyms":"estructura / aguja / edificio"},
  {"word":"TOWN","meaning":"**Pueblo.** Lugar donde viven muchas personas.","synonyms":"ciudad / villa / comunidad"},
  {"word":"TREMBLE","meaning":"**Temblar.** Temblar ligeramente.","synonyms":"sacudirse / estremecerse / tiritar"},
  {"word":"VILLAGE","meaning":"**Aldea.** Poblado pequeño.","synonyms":"pueblo / asentamiento / comunidad"},
  {"word":"VISUALIZE","meaning":"**Visualizar.** Imaginar algo en la mente.","synonyms":"imaginar / representar / prever"},
  {"word":"VOCABULARY","meaning":"**Vocabulario.** Conjunto de palabras conocidas por una persona.","synonyms":"léxico / palabras / lenguaje"},
  {"word":"WARN","meaning":"**Advertir.** Avisar sobre un peligro.","synonyms":"alertar / notificar / prevenir"},
  {"word":"WEAK","meaning":"**Débil.** Sin fuerza o resistencia.","synonyms":"frágil / endeble / suave"},
  {"word":"WEALTHY","meaning":"**Rico.** Que posee mucho dinero o recursos.","synonyms":"adinerado / próspero / acomodado"},
  {"word":"WHISPER","meaning":"**Susurrar.** Hablar muy suavemente.","synonyms":"murmurar / hablar bajo / cuchichear"},
  {"word":"WHOM","meaning":"**A quien.** Pronombre usado para referirse al objeto de una acción.","synonyms":"esa persona / cual persona / pronombre objeto"},
  {"word":"WISE","meaning":"**Sabio.** Que tiene buen juicio y experiencia.","synonyms":"inteligente / prudente / reflexivo"},
  {"word":"WOMAN","meaning":"**Mujer.** Persona adulta de sexo femenino.","synonyms":"dama / fémina / adulta"},
  {"word":"WONDER","meaning":"**Maravilla.** Sentimiento de asombro o curiosidad.","synonyms":"asombro / curiosidad / admiración"},
  {"word":"WORRY","meaning":"**Preocuparse.** Sentir preocupación.","synonyms":"inquietud / ansiedad / temor"},
  {"word":"YARD","meaning":"**Patio.** Espacio exterior junto a una casa.","synonyms":"jardín / césped / cancha"},
  {"word":"ZIGZAG","meaning":"**Zigzag.** Moverse en líneas alternadas hacia lados opuestos.","synonyms":"serpentear / curvar / alternar"},
  {"word":"ABOUT","meaning":"**Acerca de.** Acerca de o sobre algo.","synonyms":"sobre / referente a / relacionado con"},
  {"word":"TODAY","meaning":"**Hoy.** El día de hoy o el presente.","synonyms":"ahora / día actual / presente"}
];

export const dictionary: Record<string, DictionaryEntry> = rawData.reduce((acc, item) => {
  acc[item.word.toLowerCase()] = {
    meaning: item.meaning,
    synonyms: item.synonyms
  };
  return acc;
}, {} as Record<string, DictionaryEntry>);

/**
 * Búsqueda Inteligente en Cascada (Smart Cascade Lookup)
 * Intenta encontrar una definición incluso si la palabra no es exacta.
 */
const findSmartEntry = (word: string): DictionaryEntry | undefined => {
  const clean = word.toLowerCase().trim();

  // 1. Búsqueda Exacta
  if (dictionary[clean]) return dictionary[clean];

  // 2. Intento Singular Simple (quitar 's')
  // Ej: dogs -> dog, cats -> cat
  if (clean.endsWith('s')) {
    const singular = clean.slice(0, -1);
    if (dictionary[singular]) return dictionary[singular];
  }

  // 3. Intento Singular Complejo (quitar 'es')
  // Ej: boxes -> box (aunque 's' captura muchos, 'es' es gramaticalmente distinto a veces)
  if (clean.endsWith('es')) {
    const singularES = clean.slice(0, -2);
    if (dictionary[singularES]) return dictionary[singularES];
  }

  return undefined;
};

export const getMeaning = (word: string): string => {
  const entry = findSmartEntry(word);
  return entry?.meaning || "¡Palabra fantástica!";
};

export const getSynonyms = (word: string): string => {
  const entry = findSmartEntry(word);
  return entry?.synonyms || "";
};

export const saveLists = (lists: WordList[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
};

export const loadStars = (): string[] => {
  const data = localStorage.getItem(STARS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveStars = (stars: string[]) => {
  localStorage.setItem(STARS_KEY, JSON.stringify(stars));
};

export const addStar = (listId: string) => {
  const stars = loadStars();
  if (!stars.includes(listId)) {
    saveStars([...stars, listId]);
  }
};

export const removeStar = (listId: string) => {
  const stars = loadStars();
  saveStars(stars.filter(id => id !== listId));
};

export const isListFullyCompleted = (listId: string): boolean => {
  const lists = loadLists();
  const list = lists.find(l => l.id === listId);
  if (!list) return false;
  // Una lista está completa si todas sus palabras están completadas Y tienen 0 errores
  return list.words.every(w => w.completed && (w.errors || 0) === 0);
};

export const loadVoiceSettings = (): VoiceSettings => {
  const data = localStorage.getItem(VOICE_SETTINGS_KEY);
  if (data) {
    const settings = JSON.parse(data);
    // Asegurar que hiddenVoices exista para compatibilidad
    if (!settings.hiddenVoices) settings.hiddenVoices = [];
    return settings;
  }
  return { voiceURI: null, rate: 0.8, pitch: 1.1, hiddenVoices: [] };
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
  removeStar(listId);
  return updatedLists;
};

export const loadLists = (): WordList[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  const migrationDone = localStorage.getItem(MIGRATION_KEY);
  
  const officialWordsList = rawData.slice(0, 182).map(r => r.word).join(' ');
  const challengeWordsList = "ACCIDENT ACHIEVE ADMIRE AGREE AIRPLANE ALLIGATOR ALONE ARRIVE ASTRONOMY ATLAS ATTENTION AWARD AWARE BALANCE BANNER BARE BASE BEACH BECAUSE BESIDES BIND BLANKET BLAST BLIZZARD BOARD BOTH BOUNCE BRAIN BRANCH BRAVE BRIDGE BRIGHT BUCKET BUY CAGE CALENDAR CALF CALM CANDLE CARPET CENTER CHARACTER CHEW CHIMNEY CLAW CLEAR CLEVER CLIFF CLOCK CLUB COLLECT COMPASSION CONNECT CORE CORNER COUPLE COZY CURIOUS DANGEROUS DASH DAWN DEEP DESERT DESIGN DIFFERENT DIGRAPH DISCARD DISTURB DIVE DOME DOUBT DOZEN EARTH EARTHQUAKE ENEMY ENOUGH EXACTLY EXCESS EXPERIMENT FABLE FACTORY FAIR FAMILY FAMOUS FEAST FICTION FIELD FINALLY FIREFIGHTER FLAP FLOAT FLOOD FOLD FOUR FRESH FRIEND FRIGHTEN FUEL GAP GAZE GIFT GIVE GRAVITY GREEDY GUIDE HARM HERD IDEA INSECT INSTRUMENT INTENT INVENT ISLAND LEADER LEAP LIGHTNING LITTLE LIZARD LOCAL MARKET MEAT MEMBERS MOTOR MOVE NARROW NIBBLED NOTICE NOUN OCEAN PALE PARADE PAST PEAK PEOPLE PLACE PLAIN PLANET PLOT POLITICS POLLUTION PREDICTION PRESENT PROCEDURE PROOF QUESTION QUICKLY REPLICA RESEARCH RESPOND ROUGH RUMOR SAFE SCHOLAR SCIENTIST SEAL SEARCH SEED SETTING SETTLE SHARE SHELTER SHIVER SHY SKILL SMOOTH SOIL STACK STEADY STRAND STRATEGY STREAM TEAM THANKFUL THROUGH TINY TOOL TOWARD TOWER TOWN TRAVEL TREMBLE VILLAGE VISUALIZE VOCABULARY WARN WEAK WEALTHY WHISPER WHOM WISE WOMAN WONDER WORRY YARD ZIGZAG";

  const p1Words = "ADD ASK BALL BASKET BATCH BED BEND BLINK BLUSH BOOK CAR CAVE CHAT COIN COOK COUNT CRASH DARK DART DISHES DOOR FAST FATHER FISH FLAT FLOOR FOG FROG GATE GIRL GLAD GOLD GRAB GRIN GRIP HAT HIDE HOBBY HONEY INSECT KITTEN LAKE MAP MASK MILK MONTH MOUSE PARK PEST PLANET RISE ROAR ROCKET SAY SEED SHELL SIMPLE SKY SUN THICK TICKET TRAVEL TRUST UPSET WATER WEED YARD ACCIDENT ADMIRE AGREE AIRPLANE ARRIVE ATLAS BALANCE BANNER BASE BEACH BLAST BOARD BRAIN BRANCH BRAVE BRIDGE BUCKET CAGE CALF CALM CANDLE CARPET CENTER CHEW CLAW CLEAR CLIFF CLOCK CLUB CORE COUPLE DASH DAWN DEEP DESERT DIVE DOME DOZEN ENEMY FABLE FACTORY FAIR FIELD FOLD FOUR FRESH FRIEND FUEL GAP GAZE GIFT GIVE GUIDE HARM HERD IDEA LEADER LEAP LITTLE LIZARD LOCAL MARKET MEAT MOTOR MOVE NOTICE OCEAN PAST PEAK PEOPLE PLACE PLAIN PLOT PROOF QUESTION QUICKLY REPLICA RESPOND SAFE SEARCH SHARE SHY SKILL SMOOTH SOIL STACK STEADY STREAM TEAM TINY TOOL TOWER TOWN TREMBLE VILLAGE WARN WEAK WISE WONDER WORRY ZIGZAG";
  const p2Words = "ALMOST ALONE ALWAYS AMONG ANIMAL APART APPLE ARTIST ATTACH BECAUSE BEHAVE BELONG CATERPILLAR CAUTION CELEBRATE CHAIR CHAMPION CHIMNEY CLOUD COMPASS COMPLAIN CONSTRUCT CONTINENT COSTUME CURVED CYCLE DAILY DAIRY DECORATE DESERVE DIVIDE DROWSY ENORMOUS EQUAL EXCLAIM EYE FANCY FASTEN FLEE FLOWER FOOTPRINT FOREST GATHER GIANT GLOBE GLUE GLUM GRATEFUL GROAN HAPPY HATCH HEAP HEART HOWL KIND LIVELY LOOSEN MAMMAL MISTY MODERN MOUNTAIN NARROW OBEY PAIN POLISH POOR PRETEND PROMISE PUNCTUATION RAIN RAINBOW REMOVE REPEAT RESCUE RESTART RETURN RIPE SAFETY SCOLD SCRATCH SELFISH SERIOUS SHELTER SILENT SLY SNEAKY SOB SPIRAL SPRINKLE STARTLE STEEP STORMY SUBTRACT SWITCH THUNDER TIMID TOWARD WHIRL WHISTLE WICKED YANK ACHIEVE ATTENTION AWARD AWARE BESIDES BIND BLANKET BLIZZARD BOTH BOUNCE BRIGHT BUY CALENDAR CHARACTER CLEVER COLLECT COMPASSION CONNECT CORNER COZY CURIOUS DANGEROUS DESIGN DIGRAPH DISCARD DISTURB DOUBT EARTHQUAKE EXACTLY EXCESS EXPERIMENT FAMOUS FEAST FICTION FINALLY FIREFIGHTER FLAP FLOAT FLOOD FRIGHTEN GRAVITY GREEDY INSTRUMENT INTENT INVENT LIGHTNING MEMBERS NIBBLED NOUN PALE PARADE POLITICS POLLUTION PREDICTION PROCEDURE RESEARCH RUMOR SCHOLAR SEAL SETTING SETTLE SHIVER STRAND STRATEGY THANKFUL VISUALIZE WEALTHY WHISPER WHOM";
  const p3Words = "AGAIN AGAINST ALARM ABOVE DIFFERENT FAMILY PRESENT TODAY";
  const p4Words = "EARTH HONEST HOUR KNOB LAUGH READ WOMAN ISLAND";
  const p5Words = "ENOUGH THROUGH SCIENTIST VOCABULARY";
  const confundiblesWords = "FISH FIELD SEED BED HAT MAP PLANET ANIMAL FAMILY HAPPY AMONG ABOVE THICK THUNDER THANKFUL THROUGH KNOB ISLAND HONEST HOUR LAUGH ENOUGH DIFFERENT PRESENT MEMBERS POLITICS RETURN TODAY FAST PAST RISE ALONE ALMOST ABOUT";

  const defaultList: WordList = {
    id: 'official-words-list',
    name: '🏆 Official Words 🏆',
    words: extractWords(officialWordsList),
    themeIndex: 8,
    settings: { rainEnabled: true },
    lastPlayed: Date.now()
  };

  const challengeList: WordList = {
    id: 'challenge-words-list',
    name: '🏁 Challenge Words 🏁',
    words: extractWords(challengeWordsList),
    themeIndex: 8,
    settings: { rainEnabled: true },
    lastPlayed: Date.now()
  };

  const p1List: WordList = {
    id: 'p1-transparente',
    name: '🟢 P1: Transparente',
    words: extractWords(p1Words),
    themeIndex: 0,
    settings: { rainEnabled: true },
    lastPlayed: Date.now()
  };

  const p2List: WordList = {
    id: 'p2-patrones',
    name: '🟡 P2: Patrones',
    words: extractWords(p2Words),
    themeIndex: 4,
    settings: { rainEnabled: true },
    lastPlayed: Date.now()
  };

  const p3List: WordList = {
    id: 'p3-enganosas',
    name: '🟠 P3: Engañosas',
    words: extractWords(p3Words),
    themeIndex: 6,
    settings: { rainEnabled: true },
    lastPlayed: Date.now()
  };

  const p4List: WordList = {
    id: 'p4-irregulares',
    name: '🔴 P4: Irregulares',
    words: extractWords(p4Words),
    themeIndex: 5,
    settings: { rainEnabled: true },
    lastPlayed: Date.now()
  };

  const p5List: WordList = {
    id: 'p5-impredecibles',
    name: '🟣 P5: Impredecibles',
    words: extractWords(p5Words),
    themeIndex: 1,
    settings: { rainEnabled: true },
    lastPlayed: Date.now()
  };

  const confundiblesList: WordList = {
    id: 'confundibles-list',
    name: '🔵 Confundibles',
    words: extractWords(confundiblesWords),
    themeIndex: 7,
    settings: { rainEnabled: true },
    lastPlayed: Date.now()
  };

  const allInitialLists = [defaultList, challengeList, p1List, p2List, p3List, p4List, p5List, confundiblesList];

  // MIGRACIÓN FORZADA: Si no se ha hecho la migración v4, o si no hay datos
  if (!migrationDone || !data) {
    saveLists(allInitialLists);
    localStorage.setItem(MIGRATION_KEY, 'true');
    return allInitialLists;
  }

  let lists: WordList[] = JSON.parse(data);
  
  // Asegurarnos de que el usuario tenga todas las listas nuevas
  const currentIds = lists.map(l => l.id);
  let needsUpdate = false;
  
  allInitialLists.forEach(initialList => {
    if (!currentIds.includes(initialList.id)) {
      lists.push(initialList);
      needsUpdate = true;
    } else {
      // Actualizar el tema de las listas existentes si es necesario (para ponerlas en blanco)
      const existing = lists.find(l => l.id === initialList.id);
      if (existing && (initialList.id === 'official-words-list' || initialList.id === 'challenge-words-list')) {
        if (existing.themeIndex !== 8) {
          existing.themeIndex = 8;
          needsUpdate = true;
        }
      }
    }
  });

  if (needsUpdate) {
    saveLists(lists);
  }

  return lists;
};

/**
 * Solicita al navegador que no borre los datos de la app automáticamente.
 * Esto es crucial para WebApps en móviles.
 */
export const initPersistence = async () => {
  if (navigator.storage && navigator.storage.persist) {
    const isPersisted = await navigator.storage.persisted();
    if (!isPersisted) {
      await navigator.storage.persist();
      console.log("Storage persistence requested");
    } else {
      console.log("Storage is already persistent");
    }
  }
};

/**
 * Comprueba si la aplicación está en estado de "fábrica" (sin progreso).
 * Útil para detectar si se borraron los datos y sugerir una restauración.
 */
export const isSystemClean = (): boolean => {
    const lists = loadLists();
    // Si solo hay 1 lista y es la de defecto
    if (lists.length === 1 && lists[0].id === 'official-words-list') {
        // Y si esa lista no tiene ninguna palabra completada
        const hasProgress = lists[0].words.some(w => w.completed || w.errors > 0);
        return !hasProgress;
    }
    return false;
};

// --- BACKUP & RESTORE SYSTEM ---

export const getBackupData = () => {
  return {
    version: 1,
    timestamp: Date.now(),
    lists: loadLists(),
    voiceSettings: loadVoiceSettings()
  };
};

export const restoreBackupData = (jsonString: string): boolean => {
  try {
    const data = JSON.parse(jsonString);
    if (!data.lists || !Array.isArray(data.lists)) {
      console.error("Invalid backup file: missing lists");
      return false;
    }
    
    // Restaurar Listas
    saveLists(data.lists);
    
    // Restaurar Configuración de Voz (opcional si existe en el backup)
    if (data.voiceSettings) {
      saveVoiceSettings(data.voiceSettings);
    }
    
    return true;
  } catch (e) {
    console.error("Failed to parse backup file", e);
    return false;
  }
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
