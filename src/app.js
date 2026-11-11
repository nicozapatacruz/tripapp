import "@fontsource-variable/onest";
import "./styles.css";
import {
  buildBackup, encryptBackup, decryptBackup, parseBackupText, importPlan, itineraryKV,
  cryptoAvailable, WrongPasswordError,
} from "./backup.js";
import { coordsOf, distKm, walkMin, distText, minText as walkText, placeDays, planOrder, planNumbers } from "./mapdata.js";
import {
  extractMapsUrl, normName, slotCities, needsCityChoice, cityChoices, cityMismatch,
  resolvePlace, freeName, placeSuggestions,
} from "./places.js";

(function(){
"use strict";
var $=function(s,r){return (r||document).querySelector(s)};
var esc=function(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})};

/* ================= Iconos ================= */
var ICON={
 chev:'<path d="M9 6l6 6-6 6"/>',back:'<path d="M15 6l-6 6 6 6"/>',arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',plus:'<path d="M12 5v14M5 12h14"/>',
 cal:'<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
 calplus:'<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4M12 12.5v5M9.5 15h5"/>',
 copy:'<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h8"/>',
 pin:'<path d="M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
 route:'<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',
 sliders:'<path d="M4 7h9M17 7h3M4 12h3M11 12h9M4 17h11M19 17h1"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="17" r="2"/>',
 bed:'<path d="M3 18V7M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5"/><circle cx="7" cy="11" r="1.6"/>',
 flag:'<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
 clip:'<path d="M20 11l-8.5 8.5a5 5 0 0 1-7-7L13 4a3.5 3.5 0 0 1 5 5l-8.6 8.6a2 2 0 0 1-2.8-2.8L14 8"/>',
 file:'<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/>',
 locate:'<circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3"/><circle cx="12" cy="12" r="7"/>',
 fit:'<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
 star:'<path d="M12 3.8l2.5 5.1 5.6.8-4 3.9.9 5.6L12 16.6l-5 2.6.9-5.6-4-3.9 5.6-.8z"/>',
 way:'<circle cx="5.5" cy="18.5" r="2"/><path d="M7.5 18.5H16a3 3 0 0 0 0-6H8a3 3 0 0 1 0-6h4.5"/><path d="M18 10.5s3-2.6 3-5a3 3 0 0 0-6 0c0 2.4 3 5 3 5z"/>',
 print:'<path d="M7 9V3.5h10V9"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 14h10v6.5H7z"/>',
 hotel:'<path d="M3 18V7M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5"/><circle cx="7" cy="11" r="1.6"/>',
 check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',
 clock:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
 xmark:'<path d="M7 7l10 10M17 7L7 17"/>',
 bus:'<rect x="4" y="3" width="16" height="14" rx="3"/><path d="M4 11h16M7 21v-4M17 21v-4"/><circle cx="8" cy="14" r=".8"/><circle cx="16" cy="14" r=".8"/>',
 tren:'<rect x="5" y="3" width="14" height="14" rx="3"/><path d="M5 11h14M9 21l2-4M15 21l-2-4"/><circle cx="9" cy="14" r=".8"/><circle cx="15" cy="14" r=".8"/>',
 vuelo:'<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.2.4c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.4-.2c.4-.3.6-.7.5-1.2z"/>',
 entrada:'<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/><path d="M13 5v2M13 11v2M13 17v2"/>',
 coche:'<path d="M5 16v-5l2-5h10l2 5v5M3 16h18M7 16v3M17 16v3"/><circle cx="8" cy="13" r=".8"/><circle cx="16" cy="13" r=".8"/>',
 seguro:'<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
 comida:'<path d="M7 3v8M4 3v5a3 3 0 0 0 6 0V3M7 11v10M17 3c-2 2-3 5-3 8h3v10"/>',
 grip:'<path d="M5 9h14M5 15h14"/>',
 list:'<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/>',
 filter:'<path d="M4 5h16l-6.2 7.4V19l-3.6-1.8v-4.8z"/>',
 pencil:'<path d="M4 20l1-4L16.5 4.5a2 2 0 0 1 3 3L8 19z"/><path d="M14 7l3 3"/>'
};
function svg(n,s){s=s||20;return '<svg class="i" width="'+s+'" height="'+s+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+ICON[n]+'</svg>'}

/* ================= Datos del viaje ================= */
var CITIES={
madrid:{name:"Madrid",c1:"#B8322C",c2:"#E0583F",temp:"2–11 °C",
 intro:"Capital de España. A finales de diciembre la ciudad está iluminada y llena de mercadillos, belenes y planes de Navidad que duran hasta el Día de Reyes.",
 see:[["Plaza Mayor y Puerta del Sol","El centro histórico se recorre a pie. En la Plaza Mayor hay mercadillo navideño."],
  ["Gran Vía y calle Preciados","Luces de Navidad, escaparates y, en Preciados, el espectáculo de Cortylandia."],
  ["Museo del Prado","Pintura clásica española. Mejor con entrada reservada por franja horaria."],
  ["Museo Reina Sofía","Arte del siglo XX, con el Guernica de Picasso."],
  ["Parque del Retiro","Paseo tranquilo y Palacio de Cristal."],
  ["Palacio Real y Templo de Debod","El Templo de Debod es buen sitio para ver el atardecer."]],
 tips:["Lleva capas: por la mañana y por la noche hace frío.","La cena española es tarde. Muchas cocinas abren hacia las 20:30 o 21:00.","En estas fechas conviene reservar restaurantes populares y museos con antelación.","Las luces y los mercadillos suelen mantenerse hasta el 6 de enero."],
 dishes:["Cocido madrileño","Bocadillo de calamares","Chocolate con churros","Tortilla de patatas","Callos a la madrileña","Cochinillo","Turrones y polvorones"],
 eat:[["Chocolatería San Ginés","Chocolate con churros, un clásico de la ciudad."],
  ["Mercado de San Miguel","Puestos de tapas y vermut. Es turístico, pero cómodo para picar."],
  ["Cava Baja (La Latina)","Calle de tabernas para ir de tapas de bar en bar."],
  ["El Brillante","Bocadillo de calamares cerca de Atocha."],
  ["Casa Lucio","Huevos rotos, cocina madrileña tradicional. Reserva."]]},
pamplona:{name:"Pamplona",c1:"#2F6B3F",c2:"#58A05A",temp:"1–9 °C",
 intro:"Capital de Navarra, pequeña y cómoda para caminar. En invierno hace frío y puede haber lluvia o niebla, pero los bares del casco antiguo están llenos de pintxos.",
 see:[["Plaza del Castillo","Centro de la ciudad, con su quiosco. Aquí empieza casi cualquier ruta."],
  ["Calle Estafeta","Recorrido del encierro y calle de bares de pintxos."],
  ["Cuesta de Santo Domingo","Una de las calles más típicas del casco antiguo."],
  ["Catedral de Pamplona","Fachada neoclásica y claustro gótico."],
  ["Murallas y Ciudadela","Paseo por las murallas y el parque de la Ciudadela."],
  ["Parque de la Taconera","Jardín junto a las murallas, bueno para caminar."],
  ["Mercado de Santo Domingo","Mercado de abastos donde compran los vecinos."]],
 tips:["Los pintxos tienen dos momentos fuertes: el aperitivo de mediodía y la tarde-noche.","Calles de bares: Estafeta, San Nicolás, Comedias y Mercaderes.","Nochevieja: reserva la cena y confirma el horario de los sitios que quieras visitar el 1 de enero.","Lleva abrigo e impermeable."],
 dishes:["Huevos con chistorra","Magras con tomate","Foie a la plancha","Piquillos rellenos de bacalao","Pintxos de bechamel","Cordero al chilindrón","Pacharán","Vino de Navarra (garnacha)"],
 eat:[["Bar Gaucho","Parada clásica de la ruta de pintxos."],
  ["Baserriberri","Cocina navarra creativa en formato pintxo."],
  ["El Mercáo","Pintxos y platos creativos."],
  ["Infernu Taberna","Taberna de pintxos en la calle San Agustín."],
  ["Café Iruña","Café histórico en la Plaza del Castillo."]]},
sevilla:{name:"Sevilla",c1:"#B35A0B",c2:"#E08A1B",temp:"6–16 °C",
 intro:"En invierno Sevilla es suave y soleada, buena época para caminar. Anochece pronto, así que deja los interiores para la tarde.",
 see:[["Catedral y Giralda","La catedral gótica más grande del mundo."],
  ["Real Alcázar","Palacio con jardines. Reserva la entrada online."],
  ["Plaza de España y Parque de María Luisa","Paseo clásico, mejor de día."],
  ["Barrio de Santa Cruz","Callejuelas del antiguo barrio judío."],
  ["Triana y Mercado de Triana","Barrio de cerámica y flamenco, con ambiente local."],
  ["Setas de Sevilla","Estructura de madera sobre el Mercado de la Encarnación, con mirador."],
  ["Espectáculo de flamenco","Los tablaos suelen llevar cena. Conviene reservar."]],
 tips:["Es difícil cenar antes de las 21:30.","Las tapas se piden para compartir: varios platos en lugar de uno por persona.","1 de enero: muchos sitios abren tarde o cierran. Comprueba horarios.","Muchos sitios para turistas en el centro son mediocres. Busca tabernas con clientela local."],
 dishes:["Salmorejo","Pringá","Espinacas con garbanzos","Pescaíto frito","Croquetas","Solomillo al whisky"],
 eat:[["El Rinconcillo","Taberna abierta desde 1670."],
  ["Bodega Santa Cruz Las Columnas","Tapas en Santa Cruz. Prueba la tortilla."],
  ["Bodega Dos de Mayo","Plaza tranquila, buen pescado y berenjenas fritas."],
  ["Eslava","Tapas creativas en San Lorenzo."],
  ["Mercado de Triana","Comida informal y ambiente de barrio."],
  ["Los Coloniales","Tapeo económico con cierta calidad."]]},
cordoba:{name:"Córdoba",c1:"#7D6A14",c2:"#B39A2A",temp:"4–15 °C",
 intro:"Parada de un día, así que hay que elegir. Se puede ver lo esencial a pie en pocas horas: Mezquita, Judería y Alcázar.",
 see:[["Mezquita-Catedral","Con el Patio de los Naranjos. Empieza por aquí y reserva la entrada."],
  ["Barrio de la Judería","Calles estrechas y encaladas, para pasear sin prisa."],
  ["Alcázar de los Reyes Cristianos","Jardines con estanques y torres."],
  ["Puente Romano y Torre de la Calahorra","Buenas vistas de la Mezquita desde el río."],
  ["Sinagoga","Una de las pocas sinagogas medievales que se conservan en España."],
  ["Palacio de Viana","Casa palacio con patios."]],
 tips:["Con maletas, comprueba si hay consigna en la estación antes de entrar en la Judería.","Calcula la salida a Granada con margen. Es un día con tres ciudades.","Empieza temprano: la Mezquita y la Judería ocupan la mañana.","Hay churros con chocolate para desayunar en el centro."],
 dishes:["Salmorejo cordobés","Rabo de toro","Flamenquín","Berenjenas con miel","Churros con chocolate"],
 eat:[["Churros Bar Marta","Desayuno de churros con chocolate."],
  ["Taberna Salinas","Taberna clásica de la ciudad."],
  ["Bodegas Campos","Bodega tradicional, mejor con reserva."],
  ["El Churrasco","Carne a la brasa y cocina cordobesa."],
  ["Casa Pepe de la Judería","Cocina cordobesa junto a la Judería."]]},
granada:{name:"Granada",c1:"#9E1F4B",c2:"#D14A73",temp:"1–12 °C",
 intro:"Granada está a unos 700 metros de altitud, por eso las noches de enero son frías y Sierra Nevada suele verse con nieve. Es la ciudad de la Alhambra y de la tapa que viene con la bebida.",
 see:[["Alhambra y Generalife","Los Palacios Nazaríes tienen aforo limitado por franja horaria. Reserva con mucha antelación."],
  ["Albaicín y Mirador de San Nicolás","Barrio morisco con vistas a la Alhambra."],
  ["Sacromonte","Casas cueva y flamenco."],
  ["Carrera del Darro y Paseo de los Tristes","Paseo junto al río, bajo la Alhambra."],
  ["Catedral y Capilla Real","En pleno centro, cerca de la Plaza Nueva."],
  ["Realejo y Campo del Príncipe","Barrio de tapas y plazas con ambiente."]],
 tips:["Alhambra: en 2026 la entrada general costaba 22,27 € y los Palacios Nazaríes admiten 300 personas cada 30 minutos. Confirma el precio de 2027.","Con cada bebida suele venir una tapa gratis. Los precios de la bebida son algo más altos que en Sevilla o Málaga.","Las tapas cerca de la Alhambra son más turísticas. Mejor en Plaza Nueva, el centro y el Albaicín.","Abrígate bien por la noche y sube al mirador con tiempo antes del atardecer."],
 dishes:["Tapas con la bebida","Remojón granadino","Habas con jamón","Berenjenas con miel","Tortilla del Sacromonte","Piononos de Santa Fe"],
 eat:[["Los Diamantes","Fritura de pescado y barra llena."],
  ["Bodegas Castañeda","Bodega con embutidos y vinos, en el centro."],
  ["La Tana","Taberna de vinos y tapas."],
  ["La Fontana","Carrera del Darro 19. Tapas con vistas a la Alhambra."],
  ["Rabo de Nube","Paseo de los Tristes 1. Tapas y raciones junto al río."]]},
malaga:{name:"Málaga",c1:"#1560A8",c2:"#3A97DB",temp:"9–17 °C",
 intro:"Mar, sol y una ciudad compacta. En enero se puede caminar con comodidad, aunque el agua está fría. El 5 de enero es la gran Cabalgata de Reyes.",
 see:[["Alcazaba y Castillo de Gibralfaro","Fortaleza árabe con vistas al puerto."],
  ["Catedral de Málaga","Llamada La Manquita porque le falta una torre."],
  ["Museo Picasso","Picasso nació en Málaga."],
  ["Calle Larios y Plaza de la Constitución","Corazón comercial del centro histórico."],
  ["Muelle Uno y Paseo del Parque","Paseo junto al puerto."],
  ["Mercado de Atarazanas","Mercado central, con barras para picar."],
  ["Pedregalejo y El Palo","Paseo marítimo con chiringuitos de espetos."]],
 tips:["Cabalgata de Reyes: en 2026 los Reyes llegaban al Ayuntamiento a las 17:30 y la cabalgata salía a las 18:00 por el centro. Confirma el horario de 2027.","Zona del recorrido: Avenida de Cervantes, Paseo del Parque y Alameda Principal. El tráfico se corta unas horas antes, mejor ir en transporte público.","Del 3 al 5 de enero hay cabalgatas de barrio.","El 6 de enero es festivo: muchos comercios cierran o reducen horario."],
 dishes:["Espeto de sardinas","Pescaíto frito","Ajoblanco","Boquerones","Porra antequerana","Roscón de Reyes con chocolate caliente"],
 eat:[["El Pimpi","Bodega histórica en el centro."],
  ["Casa Lola","Tapas y vinos en la calle Granada."],
  ["El Caleño","Espetos en Pedregalejo."],
  ["Los Cuñaos","Espetos y pescado."],
  ["Mercado de Atarazanas","Para picar de pie entre puestos."]]},
tenerife:{name:"Tenerife",c1:"#0E7C7B",c2:"#2FB3A8",temp:"15–21 °C",
 intro:"Clima suave en invierno. El sur es más seco y soleado, el norte más fresco y nublado, y en el Teide hace frío y puede haber nieve.",
 see:[["Parque Nacional del Teide","Con teleférico. Reserva con antelación y lleva abrigo."],
  ["Santa Cruz de Tenerife","Auditorio y Mercado de Nuestra Señora de África."],
  ["San Cristóbal de La Laguna","Casco histórico, patrimonio de la UNESCO."],
  ["Puerto de la Cruz","Lago Martiánez y Loro Parque."],
  ["Parque Rural de Anaga","Bosque de laurisilva y miradores."],
  ["Masca y Los Gigantes","Acantilados y carreteras de montaña."],
  ["Avistamiento de ballenas y delfines","Salidas desde el sur de la isla."],
  ["Playa de Las Teresitas","Arena importada y paseo desde Santa Cruz."]],
 tips:["Un coche de alquiler facilita mucho recorrer la isla.","Las papas arrugadas suelen estar mejor en el norte: La Laguna, La Matanza y Puerto de la Cruz. En el norte cuestan de 4 a 6 € la ración y en el sur hasta 9 €.","Los guachinches son casas de comida típica propias de Tenerife, con menú corto y vino de la casa.","Lleva capas: la temperatura cambia mucho entre la costa y el Teide."],
 dishes:["Papas arrugadas con mojo rojo y verde","Carne de fiesta","Queso asado con mojo","Ropa vieja","Escaldón de gofio","Potaje de berros","Pescado fresco (vieja, sama, cherne)","Barraquito"],
 eat:[["Restaurante Basilio","Papas arrugadas con dos mojos de la casa."],
  ["Casa Pautonia","Cocina canaria y papas."],
  ["Restaurante Alanda","Papas arrugadas y cocina de la isla."],
  ["El Patio (Santa Cruz)","Cocina canaria tradicional."],
  ["Cruz del Carmen","Puchero canario."],
  ["Mercado de Nuestra Señora de África","Producto local y bares dentro del mercado."]]},
medellin:{name:"Medellín",c1:"#334155",c2:"#64748B",temp:"",origin:true}
};

var TRIP=[
 {d:"2026-12-27",stops:["medellin","madrid"],sleep:"madrid",start:true,base:"medellin",legs:[{f:"medellin",t:"madrid",m:"vuelo",w:""}]},
 {d:"2026-12-28",stops:["madrid"],sleep:"madrid",ev:["Hoy es el Día de los Santos Inocentes: en España se hacen bromas, como el April Fools en otros países."]},
 {d:"2026-12-29",stops:["madrid"],sleep:"madrid"},
 {d:"2026-12-30",stops:["madrid"],sleep:"madrid"},
 {d:"2026-12-31",stops:["madrid","pamplona"],sleep:"pamplona",legs:[{f:"madrid",t:"pamplona",m:"traslado",w:""}],ev:["Nochevieja. Se toman doce uvas con las campanadas de medianoche. Reserva la cena y comprueba qué abre el 1 de enero."]},
 {d:"2027-01-01",stops:["pamplona","sevilla"],sleep:"sevilla",legs:[{f:"pamplona",t:"sevilla",m:"traslado",w:""}],ev:["Año Nuevo es festivo. Muchos comercios y atracciones cierran o abren más tarde."]},
 {d:"2027-01-02",stops:["sevilla"],sleep:"sevilla"},
 {d:"2027-01-03",stops:["sevilla","cordoba","granada"],sleep:"granada",base:"cordoba",legs:[{f:"sevilla",t:"cordoba",m:"traslado",w:"Salida temprano"},{f:"cordoba",t:"granada",m:"traslado",w:"Salida por la noche"}],ev:["Día con tres ciudades. Ten los billetes a mano y lleva una mochila ligera."]},
 {d:"2027-01-04",stops:["granada","malaga"],sleep:"malaga",base:"granada",legs:[{f:"granada",t:"malaga",m:"traslado",w:"Salida por la noche"}],ev:["Día de la Alhambra, si hay entradas. Entran por franja horaria y se agotan con semanas de antelación."]},
 {d:"2027-01-05",stops:["malaga"],sleep:"malaga",ev:["Víspera de Reyes. Por la tarde es la Cabalgata de Reyes en el centro de Málaga."]},
 {d:"2027-01-06",stops:["malaga","tenerife"],sleep:"tenerife",legs:[{f:"malaga",t:"tenerife",m:"vuelo",w:"Salida por la tarde"}],ev:["Día de Reyes, festivo. Muchos comercios cierran. Por la mañana, roscón de Reyes y chocolate caliente."]},
 {d:"2027-01-07",stops:["tenerife"],sleep:"tenerife"},
 {d:"2027-01-08",stops:["tenerife"],sleep:"tenerife"},
 {d:"2027-01-09",stops:["tenerife"],sleep:"tenerife"},
 {d:"2027-01-10",stops:["tenerife","pamplona"],sleep:"pamplona",legs:[{f:"tenerife",t:"pamplona",m:"vuelo",w:""}]},
 {d:"2027-01-11",stops:["pamplona"],sleep:"pamplona"},
 {d:"2027-01-12",stops:["pamplona"],sleep:"pamplona"},
 {d:"2027-01-13",stops:["pamplona"],sleep:"pamplona"},
 {d:"2027-01-14",stops:["pamplona"],sleep:"pamplona"},
 {d:"2027-01-15",stops:["pamplona","madrid"],sleep:"madrid",base:"pamplona",legs:[{f:"pamplona",t:"madrid",m:"traslado",w:""}]},
 {d:"2027-01-16",stops:["madrid"],sleep:"madrid"},
 {d:"2027-01-17",stops:["madrid","medellin"],sleep:null,last:true,base:"madrid",legs:[{f:"madrid",t:"medellin",m:"vuelo",w:""}],ev:["Último día del viaje. Por la noche o a la hora que salga el vuelo, regreso a Medellín."]}
];

var TYPES={
 hotel:{l:"Hotel",t:"#5B4FC7"},tren:{l:"Tren",t:"#C2410C"},vuelo:{l:"Vuelo",t:"#0E7490"},
 bus:{l:"Bus",t:"#2563EB"},coche:{l:"Coche",t:"#4D7C0F"},entrada:{l:"Entrada",t:"#B4236B"},
 seguro:{l:"Seguro",t:"#475569"},comida:{l:"Comida",t:"#B45309"},otro:{l:"Otro",t:"#64748B"}
};
var TYPE_ICON={hotel:"hotel",tren:"tren",vuelo:"vuelo",bus:"bus",coche:"coche",entrada:"entrada",seguro:"seguro",comida:"comida",otro:"file"};
var STATUS=["Sin marcar","Quiero ir","Reservado","Ya fui"];
function statSel(k){var s=kv[k]||0;return '<select class="stat statsel s'+s+'" data-k="'+k+'" aria-label="Estado">'+STATUS.map(function(t,i){return '<option value="'+i+'"'+(i===s?" selected":"")+'>'+t+'</option>'}).join("")+'</select>'}
var TRIPT={vuelo:1,tren:1,bus:1,coche:1};

/* ---- Ubicaciones: enlaces de Google Maps, sugerencias y ciudad ---- */
function gmap(q){return "https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(q)}
function safeDec(s){try{return decodeURIComponent(s)}catch(e){return s}}
function nameFromUrl(u){
 var m=u.match(/\/maps\/place\/([^\/@?#]+)/)||u.match(/[?&](?:q|query)=([^&#]+)/);
 if(!m)return "";
 var s=safeDec(m[1].replace(/\+/g," ")).trim();
 return /^-?\d+(\.\d+)?,\s*-?\d+/.test(s)?"":s;
}
function coordsFromUrl(u){
 var s=safeDec(u),m=s.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)||s.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/)||s.match(/[?&](?:q|query|ll)=(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
 return m?[Number(m[1]),Number(m[2])]:null;
}
var CCOORD={madrid:[40.4168,-3.7038,40],pamplona:[42.8125,-1.6458,25],sevilla:[37.3891,-5.9845,35],cordoba:[37.8882,-4.7794,25],granada:[37.1773,-3.5986,30],malaga:[36.7213,-4.4214,35],tenerife:[28.29,-16.55,70],medellin:[6.2442,-75.5812,60]};
function km(a,b,c,d){var r=Math.PI/180,x=(c-a)*r,y=(d-b)*r,h=Math.sin(x/2)*Math.sin(x/2)+Math.cos(a*r)*Math.cos(c*r)*Math.sin(y/2)*Math.sin(y/2);return 12742*Math.asin(Math.sqrt(h))}
function cityByCoords(p){var best=null,bd=1e9;Object.keys(CCOORD).forEach(function(k){var c=CCOORD[k],dd=km(p[0],p[1],c[0],c[1]);if(dd<c[2]&&dd<bd){bd=dd;best=k}});return best}
var KEYS=[["medellin",/medellin|jose maria cordova|olaya herrera|rionegro/],["madrid",/madrid|atocha|chamartin|barajas/],["pamplona",/pamplona|iruna/],["sevilla",/sevilla|santa justa/],["cordoba",/cordoba/],["granada",/granada/],["malaga",/malaga|maria zambrano/],["tenerife",/tenerife|la laguna|reina sofia|los rodeos|costa adeje|los cristianos|puerto de la cruz|teide/]];
function detectCity(t,u){
 if(u){var p=coordsFromUrl(u);if(p){var c=cityByCoords(p);if(c)return c}}
 var n=norm((t||"")+" "+(u?nameFromUrl(u):""));
 for(var i=0;i<KEYS.length;i++)if(KEYS[i][1].test(n))return KEYS[i][0];
 return null;
}
/* Estaciones y aeropuertos que trae la app (solo sugerencias; no se guardan ni van en la copia).
   Enlaces de "Compartir" de Google Maps elegidos por Nicolas: abren la ficha exacta. */
var PLACES=[
 {n:"Madrid Atocha (Tren)",u:"https://www.google.com/maps/place/Estaci%C3%B3n+de+Madrid+Puerta+de+Atocha+-+Almudena+Grandes/@40.4069141,-3.6923449,17z/data=!3m1!5s0xd422625b3ebd039:0x89c3dfacdaf28ac5!4m6!3m5!1s0xd42262445cdd817:0x3947f9c28d65035b!8m2!3d40.4064905!4d-3.6909091!16zL20vMDFyYmxx"},
 {n:"Aeropuerto Madrid Barajas (MAD)",u:"https://www.google.com/maps/place/Aeropuerto+Adolfo+Su%C3%A1rez+Madrid-Barajas/@40.4795876,-3.599887,14z/data=!3m1!4b1!4m6!3m5!1s0xd4231d000000001:0x6e7725ea0f85ceef!8m2!3d40.4895147!4d-3.5642764!16zL20vMHBrcmo"},
 {n:"Estación de Pamplona (Tren)",u:"https://www.google.com/maps/place/Pamplona+-+Iru%C3%B1a/@42.8249839,-1.6640049,17z/data=!3m1!4b1!4m6!3m5!1s0xd509291870e07df:0xa154ba7ce5e93e22!8m2!3d42.82498!4d-1.66143!16s%2Fg%2F120t9g0s"},
 {n:"Aeropuerto de Pamplona (PNA)",u:"https://www.google.com/maps/place/Aeropuerto+de+Pamplona/@42.7709108,-1.6485773,17z/data=!3m1!4b1!4m6!3m5!1s0xd50917687e2e18d:0xc4cf0faa2c4304cb!8m2!3d42.7709069!4d-1.6460024!16s%2Fm%2F0285vs8"},
 {n:"Sevilla Santa Justa (Tren)",u:"https://www.google.com/maps/place/Estaci%C3%B3n+de+Sevilla-Santa+Justa/@37.3911381,-5.9802344,17z/data=!4m6!3m5!1s0xd126ea5eadbb441:0xb43691b52174bd9c!8m2!3d37.3911385!4d-5.9754708!16s%2Fg%2F12396ty2"},
 {n:"Córdoba Julio Anguita (Tren)",u:"https://www.google.com/maps/place/C%C3%B3rdoba+-+Julio+Anguita/@37.8880307,-4.7930227,17z/data=!4m6!3m5!1s0xd6cdf5dc668cf43:0x1f57f1bd6ec38beb!8m2!3d37.8876002!4d-4.7918133!16s%2Fg%2F11yyj16b08"},
 {n:"Estación de Granada (Tren)",u:"https://www.google.com/maps/place/Granada/@37.184038,-3.609154,17z/data=!3m1!4b1!4m6!3m5!1s0xd71fcee8787bf51:0x5b1309cc74400c31!8m2!3d37.184038!4d-3.609154!16s%2Fg%2F122d89hf"},
 {n:"Estación de autobuses de Granada",u:"https://www.google.com/maps/place/Granada+ALSA/@37.1955445,-3.613025,14.99z/data=!4m6!3m5!1s0xd71fd0279855c2f:0xd9e4fc21251b1386!8m2!3d37.1997172!4d-3.613667!16s%2Fg%2F11b6vbxbbc"},
 {n:"Estación de autobuses de Málaga",u:"https://www.google.com/maps/place/Alsa/@36.7132431,-4.4342625,18.7z/data=!3m1!5s0x8f5d22d12154761:0x69cc2b7d62325894!4m6!3m5!1s0xd72f79c540dcd6b:0x6592a4d2b5bb7ade!8m2!3d36.7126136!4d-4.4344971!16s%2Fg%2F1tdjsh95"},
 {n:"Aeropuerto de Málaga (AGP)",u:"https://www.google.com/maps/place/Aeropuerto+de+M%C3%A1laga+-+Costa+del+Sol/@36.6767487,-4.5169338,13z/data=!4m6!3m5!1s0xd72fa1876ba30a5:0x57b5ad2f47de3e9a!8m2!3d36.6767427!4d-4.4938696!16zL20vMDlseWNn"},
 {n:"Aeropuerto Tenerife Norte (TFN)",u:"https://www.google.com/maps/place/Aeropuerto+de+Tenerife+Norte-Ciudad+de+La+Laguna/@28.483812,-16.3453422,16z/data=!3m1!4b1!4m6!3m5!1s0xc41cdf4feec1d6f:0x1c5c91797353b078!8m2!3d28.4838073!4d-16.3427673!16zL20vMDV2M3hx"},
 {n:"Aeropuerto José María Córdova (MDE)",u:"https://www.google.com/maps/place/Aeropuerto+Internacional+Jos%C3%A9+Mar%C3%ADa+C%C3%B3rdova/@6.1714903,-75.4279447,16z/data=!3m1!4b1!4m6!3m5!1s0x8e469e78b840720f:0x9263a9a2a8b8e1b8!8m2!3d6.1714903!4d-75.4279447!16zL20vMDNuc2Nt"},
 {n:"Aeropuerto de Sevilla (SVQ)",u:"https://www.google.com/maps/place/Aeropuerto+de+Sevilla/@37.420274,-5.8933689,16z/data=!3m1!4b1!4m6!3m5!1s0xd12661c8d849bb9:0x1527e77a0fb273a!8m2!3d37.4202698!4d-5.890794!16zL20vMDlxcTJ4"}
];
/* Nombres anteriores (con enlace de búsqueda): los documentos que eligieron uno se muestran con
   el nombre y el enlace nuevos. Solo en memoria; lo guardado cambia si se vuelve a guardar el documento. */
var OLD_PLACES={"Aeropuerto de Sevilla San Pablo":12,"Madrid Puerta de Atocha":0,"Aeropuerto Adolfo Suárez Madrid-Barajas":1,"Estación de Pamplona-Iruña":2,"Aeropuerto de Pamplona":3,"Sevilla Santa Justa":4,"Córdoba Central (estación de tren)":5,"Estación de tren de Granada":6,"Estación de autobuses de Granada":7,"Estación de autobuses de Málaga":8,"Aeropuerto de Málaga-Costa del Sol":9,"Aeropuerto Tenerife Norte-Ciudad de La Laguna":10,"Aeropuerto José María Córdova (MDE), Rionegro":11};
function upgradeOldPlaces(list){list.forEach(function(d){[1,2].forEach(function(n){
 var t=d["loc"+n],k=t!=null&&OLD_PLACES.hasOwnProperty(t)?OLD_PLACES[t]:-1;
 if(k>=0&&d["loc"+n+"u"]===gmap(t)){d["loc"+n]=PLACES[k].n;d["loc"+n+"u"]=PLACES[k].u}
})})}
/* Lugares guardados (reglas en places.js). Cada ubicación pertenece a la(s) ciudad(es)
   de su día: hotel = donde se duerme; transporte = origen/destino del tramo; resto =
   ciudad detectada por el enlace o el nombre, la elegida por el usuario, o las del día. */
/* Valor del trayecto: "i-j" (un tramo) o "i-j-k" (del tramo j al k: un mismo billete con escalas) */
function parseLeg(v){if(v==null||v==="")return null;var p=String(v).split("-").map(Number),a=p[1]||0,b=p.length>2?p[2]:a;return {leg:p[0],seg:a,to:Math.max(a,b)}}
function docLegVal(d){if(d.leg==null)return "";var a=d.seg||0;return d.leg+"-"+a+(d.segTo>a?"-"+d.segTo:"")}
function rangeSegs(day,lp){if(!day||!day.legs||!lp||!day.legs[lp.leg])return [];var sg=legSegs(day,lp.leg),a=Math.min(lp.seg,sg.length-1),b=Math.min(lp.to,sg.length-1);return sg.slice(a,b+1)}
function segsText(ss){return ss.length?ss[0].f.n+" → "+ss[ss.length-1].t.n:""}
function viaText(ss){return ss.length>1?"vía "+ss.slice(0,-1).map(function(x){return x.t.n}).join(", "):""}
function ctxOf(dayId,type,slot,legVal,s){
 var day=dayById(dayId),lf=null,lt=null,fs=[],ts=[];
 if(day&&day.legs){
  if(legVal){var ss=rangeSegs(day,parseLeg(legVal));if(ss.length){lf=ss[0].f.id;lt=ss[ss.length-1].t.id}}
  day.legs.forEach(function(l,i){legSegs(day,i).forEach(function(g){
   if(g.f.id&&fs.indexOf(g.f.id)<0){fs.push(g.f.id)}
   if(g.t.id&&ts.indexOf(g.t.id)<0){ts.push(g.t.id)}
  })});
 }
 return {type:type,slot:slot,transport:!!TRIPT[type],stops:day?day.stops:null,sleep:day?day.sleep:null,legFrom:lf,legTo:lt,legFroms:fs,legTos:ts,detected:detectCity(s.t,s.u),chosen:s.c||null};
}
function placeIndex(){
 var out=[];
 docs.forEach(function(d){[1,2].forEach(function(n){
  if(n===2&&!TRIPT[d.type])return;
  var t=n===1?d.loc1:d.loc2;if(!t)return;
  var s={t:t,u:(n===1?d.loc1u:d.loc2u)||"",c:n===1?d.loc1c:d.loc2c};
  out.push({name:t,url:s.u,cities:slotCities(ctxOf(d.dayId,d.type,n,docLegVal(d),s)),docId:d.id});
 })});
 PLACES.forEach(function(p){var c=detectCity(p.n,p.u);out.push({name:p.n,url:p.u,cities:c?[c]:null,docId:"_places"})});
 return out;
}
function mapBtn(u){return '<a class="map" href="'+esc(u)+'" target="_blank" rel="noopener" aria-label="Abrir en Google Maps">'+svg("pin",18)+'</a>'}
function locRow(l,t,u){
 if(!t&&!u)return "";
 return '<div class="loc"><span><small>'+l+'</small>'+esc(t||"Ver en el mapa")+'</span>'+(u?mapBtn(u):"")+'</div>';
}
/* Nombre visible: si hay otro lugar con el mismo nombre y otro enlace, se añade la ciudad: "Casa (Madrid)" */
function locLabel(d,n,idx){
 var t=n===1?d.loc1:d.loc2,u=(n===1?d.loc1u:d.loc2u)||"";if(!t)return t;
 var key=normName(t),dup=idx.some(function(r){return r.docId!==d.id&&r.url&&r.url!==u&&normName(r.name)===key});
 if(!dup)return t;
 var cs=slotCities(ctxOf(d.dayId,d.type,n,docLegVal(d),{t:t,u:u,c:n===1?d.loc1c:d.loc2c}));
 return cs&&cs.length===1?t+" ("+nm(cs[0])+")":t;
}
function locsHTML(d){
 var t=TRIPT[d.type],idx=placeIndex(),l1=locLabel(d,1,idx);
 if(!t&&l1&&normName(l1)===normName(d.title||""))l1="";
 var a=[locRow(t?"Salida":"Ubicación",l1,d.loc1u)];
 if(t)a.push(locRow("Llegada",locLabel(d,2,idx),d.loc2u));
 a=a.filter(Boolean);
 return a.length?'<div class="locs">'+a.join("")+'</div>':"";
}
var LOCPH={hotel:"Dirección o nombre del hotel",entrada:"Dirección del lugar",comida:"Dirección del restaurante",seguro:"Dirección",otro:"Dirección o lugar"};
var TITLEPH={hotel:"Ej. Hotel Alfonso XIII",vuelo:"Ej. Iberia Medellín → Madrid",tren:"Ej. AVE Madrid → Pamplona",bus:"Ej. ALSA Granada → Málaga",coche:"Ej. Alquiler de coche en Málaga",entrada:"Ej. Entradas a la Alhambra",seguro:"Ej. Seguro de viaje",comida:"Ej. Cena en Casa Lucio",otro:"Ej. Tarjeta de transporte"};
/* Campo obligatorio: asterisco rojo (los opcionales no llevan marca) */
var REQ='<span class="req" aria-hidden="true">*</span>';
var LOCPH1={vuelo:"Ej. Aeropuerto de Medellín (MDE)",tren:"Ej. Madrid Puerta de Atocha",bus:"Ej. Estación de autobuses",coche:"Ej. Agencia de alquiler"};
var LOCPH2={vuelo:"Ej. Aeropuerto Madrid-Barajas",tren:"Ej. Sevilla Santa Justa",bus:"Ej. Estación de autobuses",coche:"Ej. Dirección de destino"};
/* Estado de cada campo de ubicación: t = nombre, u = enlace, src = "link" (pegado: manda)
   o "sug" (de un lugar guardado), c = ciudad elegida, noAuto = no volver a vincular solo
   (tras "Quitar enlace", hasta que cambie el nombre). */
function newLoc(t,u,c){return {t:t||"",u:u||"",src:u?"link":"",c:c||null,noAuto:false}}
var locS={1:newLoc(),2:newLoc()},legSel="",legManual=false,toSel="",locOpts={1:[],2:[]},sugLabels={1:{},2:{}};
var formDay="";
function curDay(){var e=$("#f-day");return e?e.value:formDay}
function curLeg(){var e=$("#f-leg");return e?e.value:legSel}
function ctxFor(n){return ctxOf(curDay(),selType,n,curLeg(),locS[n])}
function queryLoc(n,idx){
 var s=locS[n],ctx=ctxFor(n);
 return resolvePlace(idx||placeIndex(),{name:s.t,url:s.u,src:s.src,cities:slotCities(ctx),docId:editing?editing.id:null,noAuto:s.noAuto});
}
function citiesText(c){return c&&c.length?c.map(nm).join(" y "):"otra ciudad"}
function locStat(n){
 var s=locS[n],ctx=ctxFor(n),idx=placeIndex(),res=queryLoc(n,idx),h="";
 locOpts[n]=res.options;
 if(s.u)h='<span class="ok">'+svg("check",15)+'Vinculado a Google Maps</span><button type="button" class="mini" data-act="unlink" data-n="'+n+'">Quitar enlace</button>';
 else if(s.t)h='<span>Sin enlace al mapa. Pega el enlace de Google Maps en el campo o toca «Pegar enlace».</span><button type="button" class="mini" data-act="loc-paste" data-n="'+n+'">'+svg("clip",14)+'Pegar enlace</button><a class="mini" href="'+gmap(s.t)+'" target="_blank" rel="noopener">'+svg("pin",14)+'Buscar en Maps</a>';
 else h='<span>Elige una sugerencia o pega un enlace de Google Maps, antes o después de escribir el nombre.</span><button type="button" class="mini" data-act="loc-paste" data-n="'+n+'">'+svg("clip",14)+'Pegar enlace</button>';
 var nmq=esc(s.t.trim());
 if(res.kind==="conflict"){
  var where=citiesText(res.options.reduce(function(a,o){return a.concat(o.cities||[])},[]).filter(function(x,i,a){return a.indexOf(x)===i}));
  h+='<div class="locnote">Ya tienes «'+nmq+'» en '+esc(where)+' con otra ubicación. '+
   res.options.map(function(o,i){return '<button type="button" class="mini" data-act="loc-use" data-n="'+n+'" data-i="'+i+'">Usar '+(res.options.length>1?'la de '+esc(citiesText(o.cities)):'esa')+'</button>'}).join(" · ")+
   ' · <button type="button" class="mini" data-act="loc-rename" data-n="'+n+'">Llamar a esta «'+esc(freeName(idx,s.t,slotCities(ctx),editing?editing.id:null))+'»</button></div>';
 }else if(res.kind==="ambiguous"){
  h+='<div class="locnote">Hay «'+nmq+'» en '+esc(res.options.map(function(o){return citiesText(o.cities)}).join(" y en "))+'. ¿Cuál es? '+
   res.options.map(function(o,i){return '<button type="button" class="mini" data-act="loc-use" data-n="'+n+'" data-i="'+i+'">'+esc(citiesText(o.cities))+'</button>'}).join(" · ")+'</div>';
 }
 // con «¿Cuál es?» no se pregunta además «¿Dónde está?»: elegir una ya responde la ciudad
 if(res.kind!=="ambiguous"&&(s.t.trim()||s.u)&&!ctx.detected&&needsCityChoice(ctx)){
  h+='<div class="locnote"><span>¿Dónde está?</span> '+cityChoices(ctx).map(function(c){return '<button type="button" class="chip" data-act="loc-city" data-n="'+n+'" data-c="'+c+'" aria-pressed="'+(s.c===c)+'">'+esc(nm(c))+'</button>'}).join("")+'</div>';
 }
 if(s.u&&!coordsOf(s.u))h+='<div class="locnote warn">'+(isShortMaps(s.u)?"Este enlace es corto y no trae la ubicación exacta":"Este enlace no trae la ubicación exacta")+': abre bien en Google Maps, pero no saldrá en el mapa de la app. Para que salga, ábrelo en Safari, copia la dirección larga de la barra y pégala aquí.</div>';
 var mm=cityMismatch(ctx),dy=dayById(curDay());
 if(mm&&dy)h+='<div class="locnote warn">Esta ubicación parece estar en '+esc(nm(mm))+', pero ese día estás en '+esc(citiesText(dy.stops))+'. ¿El día es correcto?</div>';
 return h;
}
function refreshLocStat(n){var e=$("#ls-"+n);if(e)e.innerHTML=locStat(n);clearConflictErr()}
/* Mensajes de error del formulario; el de nombre repetido se borra solo al resolverlo */
function formErr(msg,kind,el){
 var e=$("#f-err");if(!e)return;e.textContent=msg||"";if(kind)e.dataset.k=kind;else delete e.dataset.k;
 sheetBody.querySelectorAll(".bad").forEach(function(x){x.classList.remove("bad")});
 // el error sale encima de Guardar; el formulario se desplaza hasta el campo y lo marca en rojo hasta corregirlo
 if(msg&&el){el.classList.add("bad");try{el.scrollIntoView({block:"center",behavior:"smooth"})}catch(_){}}
}
function clearConflictErr(){
 var e=$("#f-err");if(!e||e.dataset.k!=="conflict")return;
 var slots=TRIPT[selType]?[1,2]:[1],idx=placeIndex();
 if(!slots.some(function(n){return queryLoc(n,idx).kind==="conflict"}))formErr("");
}
function locDatalist(n){
 var sug=placeSuggestions(placeIndex(),slotCities(ctxFor(n)),editing?editing.id:null,nm);
 sugLabels[n]={};sug.forEach(function(x){sugLabels[n][x.label]=x});
 return '<datalist id="dl-loc'+n+'">'+sug.map(function(x){return '<option value="'+esc(x.label)+'"></option>'}).join("")+'</datalist>';
}
function locField(n,label,ph){
 return '<div class="field"><label for="f-loc'+n+'">'+label+'</label><input id="f-loc'+n+'" type="text" list="dl-loc'+n+'" data-loc="'+n+'" placeholder="'+esc(ph)+'" value="'+esc(locS[n].t)+'" autocomplete="off" autocorrect="off">'+locDatalist(n)+'<div class="locstat" id="ls-'+n+'">'+locStat(n)+'</div></div>';
}
function locFields(type){
 if(TRIPT[type])return locField(1,"Salida",LOCPH1[type])+locField(2,"Llegada",LOCPH2[type]);
 return locField(1,"Ubicación",LOCPH[type]||"Dirección o lugar");
}
function refreshLocFields(){var w=$("#f-loc");if(w)w.innerHTML=locFields(selType);clearConflictErr()}
/* Otro día o trayecto = otras ciudades: se recalculan ciudad elegida y vínculos automáticos */
function dayChanged(){[1,2].forEach(function(n){var s=locS[n];if(s.c&&cityChoices(ctxFor(n)).indexOf(s.c)<0)s.c=null;s.noAuto=false;autoLink(n)})}
/* Aplica "vincular solo" cuando hay una única coincidencia, salvo que el enlace sea pegado */
function autoLink(n){
 var s=locS[n];if(s.src==="link")return;
 var r=queryLoc(n);
 if(r.kind==="auto"){s.u=r.options[0].url;s.src="sug"}
 else{s.u="";s.src=""}
}
function norm(x){return String(x||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")}
function viaOf(dayId,i){var v=kv["via:"+dayId+":"+i];return Array.isArray(v)?v:[]}
function legSegs(day,i){
 var l=day.legs[i],pts=[{n:nm(l.f),id:l.f}].concat(viaOf(day.d,i).map(function(x){return {n:x,id:null}})).concat([{n:nm(l.t),id:l.t}]),o=[];
 for(var j=0;j<pts.length-1;j++)o.push({f:pts[j],t:pts[j+1],j:j,i:i});
 return o;
}
function segText(s){return s.f.n+" → "+s.t.n}
function segType(l,j){return l.m==="vuelo"&&j===0?"vuelo":"tren"}
/* Trayecto por defecto: si el día tiene un solo traslado, ese entero ("0-0", o "0-0-1" con una parada:
   un billete para todo, que es lo más común). Si hay varios traslados, "" (se elige). */
function onlyLeg(dayId){var day=dayById(dayId);if(!day||!day.legs||day.legs.length!==1)return "";var n=legSegs(day,0).length;return n===1?"0-0":"0-0-"+(n-1)}
function fixedLeg(dayId){var day=dayById(dayId);return !!(day&&day.legs&&day.legs.length===1&&legSegs(day,0).length===1)}
var viaOpen=false;
function legField(dayId,type,sel){
 var day=dayById(dayId);
 if(!day||!day.legs||!TRIPT[type])return "";
 // parada intermedia desde el formulario (solo si el día tiene un único traslado)
 var vv=day.legs.length===1?viaOf(day.d,0):[];
 var via=day.legs.length!==1?"":(vv.length?'<div class="viarow">Paradas: '+vv.map(function(x,k){return esc(x)+' <button type="button" class="mini" data-act="leg-via-del" data-k="'+k+'" aria-label="Quitar la parada '+esc(x)+'">Quitar</button>'}).join(" · ")+'</div>':"")+(viaOpen?
  '<div class="viarow"><input id="f-via" type="text" placeholder="Parada intermedia, ej. Bogotá" autocomplete="off" aria-label="Parada intermedia"><button type="button" class="mini" data-act="leg-via-add">Añadir</button><button type="button" class="mini" data-act="leg-via-cancel">Cancelar</button></div>':
  '<button type="button" class="mini" data-act="leg-via-open">'+svg("plus",14)+'Añadir parada</button>');
 if(fixedLeg(dayId)){
  var s0=legSegs(day,0)[0];
  return '<div class="field"><span class="fl">Trayecto</span><div class="legfix"><b>'+esc(segText(s0))+'</b>'+via+'</div><input type="hidden" id="f-leg" value="0-0"></div>';
 }
 var o='<option value="">Sin asignar</option>';
 day.legs.forEach(function(l,i){var ss=legSegs(day,i);
  // con paradas, primero el trayecto entero (un billete con escalas) y después cada tramo por separado
  if(ss.length>1){var vr=i+"-0-"+(ss.length-1);o+='<option value="'+vr+'"'+(String(sel)===vr?" selected":"")+'>'+esc(segsText(ss)+" · "+viaText(ss))+'</option>'}
  ss.forEach(function(s){var v=i+"-"+s.j;o+='<option value="'+v+'"'+(String(sel)===v?" selected":"")+'>'+esc(segText(s))+'</option>'})});
 return '<div class="field"><label for="f-leg">Trayecto</label><select id="f-leg">'+o+'</select>'+(via?'<div class="legfix">'+via+'</div>':"")+'</div>';
}
/* Añade la parada al traslado del día (queda en el itinerario, igual que desde la hoja de paradas) */
async function addViaFromForm(){
 var inp=$("#f-via"),nme=inp?inp.value.trim():"",day=dayById(curDay());
 if(!nme){formErr("Escribe el nombre de la parada.");return}
 if(!day||!day.legs||day.legs.length!==1)return;
 var c={d:day.d,i:0},v=viaOf(c.d,0).slice(),j=v.length;
 v.splice(j,0,nme);
 await shiftSegs(c,j+1,1);
 await setKV("via:"+c.d+":0",v);
 viaOpen=false;legSel=onlyLeg(c.d);legManual=!!legSel;formErr("");
 refreshLegField();autoLeg();[1,2].forEach(autoLink);refreshLocFields();refresh();
 toast("Parada añadida");
}
async function delViaFromForm(k){
 var day=dayById(curDay());if(!day||!day.legs||day.legs.length!==1)return;
 var c={d:day.d,i:0},v=viaOf(c.d,0).slice();if(k<0||k>=v.length)return;
 v.splice(k,1);
 await shiftSegs(c,k+1,-1);
 if(v.length)await setKV("via:"+c.d+":0",v);else await delKV("via:"+c.d+":0");
 legSel=onlyLeg(c.d);legManual=!!legSel;
 refreshLegField();autoLeg();[1,2].forEach(autoLink);refreshLocFields();refresh();
 toast("Parada quitada");
}
function ptMatch(p,cid,txt){if(p.id)return !!cid&&cid===p.id;return !!txt&&txt.indexOf(norm(p.n))>=0}
function autoLeg(){
 if(legManual)return;
 var dayEl=$("#f-day");if(!dayEl||!TRIPT[selType])return;
 var day=dayById(dayEl.value);if(!day||!day.legs)return;
 var c1=locS[1].c||detectCity(locS[1].t,locS[1].u),c2=locS[2].c||detectCity(locS[2].t,locS[2].u),t1=norm(locS[1].t),t2=norm(locS[2].t),best=null,bs=0,tie=false;
 day.legs.forEach(function(l,i){var ss=legSegs(day,i),cands=ss.map(function(sg){return {v:i+"-"+sg.j,f:sg.f,t:sg.t}});
  if(ss.length>1)cands.unshift({v:i+"-0-"+(ss.length-1),f:ss[0].f,t:ss[ss.length-1].t});   // el trayecto entero
  cands.forEach(function(cd){
  var sc=(ptMatch(cd.f,c1,t1)?1:0)+(ptMatch(cd.t,c2,t2)?1:0);
  if(sc>bs){bs=sc;best=cd.v;tie=false}else if(sc===bs&&sc>0)tie=true})});
 if(best&&!tie&&best!==legSel){legSel=best;var sel=$("#f-leg");if(sel)sel.value=legSel;refreshTransport()}
}
/* ---- Llegada al día siguiente y noches en tránsito ---- */
var ARRT={vuelo:1,tren:1,bus:1};
/* Horas en orden: si una es anterior a la anterior, ya es del día siguiente. Día (+0, +1…) de cada una. */
function chronoOffs(ts){var off=0,prev=null;return ts.map(function(t){var m=tmin(t);if(m==null)return null;if(prev!=null&&m<prev)off++;prev=m;return off})}
function hopTimes(d){var h=d.hops;if(!h||!h.length)return [d.t1||"",d.t2||""];var o=[];h.forEach(function(x){o.push(x.t1||"",x.t2||"")});return o}
/* Día de llegada de un billete: el guardado, pero nunca menos de lo que dicen las horas
   (los guardados antes de que existiera el +1 no lo tienen) */
function docArr(d){return ARRT[d.type]?Math.max(d.arr||0,autoArr(d)):0}
function autoArr(d){var o=chronoOffs(hopTimes(d)),a=o[0],b=o[o.length-1];return a!=null&&b!=null?b-a:0}
/* Escalas de un billete con varios tramos (null si faltan horas). night: cruza la medianoche en
   tierra y dura 8 h o más (se puede dormir en un hotel). off: noche (desde el día de salida). */
function layoversOf(d,ss){
 var h=d.hops;if(!h||h.length<2)return [];
 var offs=chronoOffs(hopTimes(d)),base=offs[0]||0,out=[];
 for(var k=0;k<h.length-1;k++){
  var a=tmin(h[k].t2),b=tmin(h[k+1].t1);
  if(a==null||b==null){out.push(null);continue}
  var m=b-a;if(m<0)m+=1440;
  out.push({city:ss[k]?ss[k].t.n:"",min:m,night:b<a&&m>=480,off:(offs[2*k+1]!=null?offs[2*k+1]:0)-base});
 }
 return out;
}
function minText(m){var h=Math.floor(m/60),r=m%60;return h?(h+" h"+(r?" "+r+" min":"")):r+" min"}
function dayPlus(dayId,n){var a=dayById(dayId);if(!a)return null;return new Date(a.dt.getFullYear(),a.dt.getMonth(),a.dt.getDate()+n)}
function fmtDt(dt){return WD3[dt.getDay()].toLowerCase()+" "+dt.getDate()+" "+MO3[dt.getMonth()]}
/* Recalcula sleep/plane/layover de cada día con los billetes guardados. La noche entre la salida y
   la llegada (+1, +2) es en el avión (no se pide hotel ni se deja poner); si es una escala nocturna
   larga, es "noche de escala": tampoco se pide hotel, pero sí se puede añadir uno. */
function applyTransit(){
 DAYS.forEach(function(d){d.sleep=d.sleep0;d.plane=false;d.layover=null});
 docs.forEach(function(d){
  var na=docArr(d);if(!(na>0))return;var a=dayById(d.dayId);if(!a)return;
  var lay={};layoversOf(d,docSegs(d)).forEach(function(l){if(l&&l.night)lay[l.off]=l.city});
  for(var k=0;k<na;k++){var n=DAYS[a.i+k];if(!n)break;n.sleep=null;if(lay[k]!=null&&!n.plane)n.layover=lay[k];else{n.plane=true;n.layover=null}}
 });
}
function nightLabel(d){return d.plane?"Noche en el avión":d.layover?"Noche de escala en "+d.layover:""}
/* Noches de hotel y pendientes */
function staysOf(){var out=[];DAYS.forEach(function(d){if(!d.sleep)return;var l=out[out.length-1];if(l&&l.city===d.sleep&&l.nights[l.nights.length-1].i===d.i-1)l.nights.push(d);else out.push({city:d.sleep,nights:[d]})});return out}
function stayOfDay(id){var st=staysOf();for(var k=0;k<st.length;k++)for(var n=0;n<st[k].nights.length;n++)if(st[k].nights[n].d===id)return st[k];return null}
function nightsCovered(){
 var m={};
 docs.forEach(function(d){if(d.type!=="hotel")return;var a=dayById(d.dayId);if(!a)return;var b=(d.nightTo&&dayById(d.nightTo))||a;for(var k=a.i;k<=b.i;k++)m[DAYS[k].d]=1});
 return m;
}
function pendHotels(){
 var cov=nightsCovered(),out=[];
 staysOf().forEach(function(s){var run=null;s.nights.concat([null]).forEach(function(d){
  if(d&&!cov[d.d]){if(!run)run={city:s.city,from:d,to:d,n:0};run.to=d;run.n++}
  else if(run){out.push(run);run=null}})});
 return out;
}
function pendTickets(){
 var out=[];
 DAYS.forEach(function(day){
  if(!day.legs)return;
  var own=docsOf(day.d).filter(function(d){return TRIPT[d.type]}),free=own.filter(function(d){return d.leg==null}).length;
  day.legs.forEach(function(l,i){
   var segs=legSegs(day,i);
   segs.forEach(function(sg){
    var has=own.some(function(d){if(d.leg!==i)return false;var a=Math.min(d.seg||0,segs.length-1),b=Math.min(d.segTo!=null?d.segTo:(d.seg||0),segs.length-1);return a<=sg.j&&sg.j<=b});
    if(has)return;
    if(free>0){free--;return}
    out.push({day:day,leg:i,seg:sg,type:segType(l,sg.j)});
   });
  });
 });
 return out;
}
function hotelEnd(dayId){
 var st=stayOfDay(dayId);if(!st)return null;
 var cov=nightsCovered(),last=null;
 for(var k=0;k<st.nights.length;k++){var n=st.nights[k];if(n.d<dayId)continue;if(n.d!==dayId&&cov[n.d])break;last=n.d}
 return last;
}
function toField(dayId,type,sel){
 if(type!=="hotel")return "";
 var st=stayOfDay(dayId);if(!st)return "";
 var nights=st.nights.filter(function(n){return n.d>=dayId});if(!nights.length)return "";
 var cur=sel||hotelEnd(dayId)||nights[nights.length-1].d;
 if(!nights.some(function(n){return n.d===cur}))cur=nights[nights.length-1].d;
 return '<div class="field"><label for="f-to">Última noche</label><select id="f-to">'+nights.map(function(n,k){return '<option value="'+n.d+'"'+(n.d===cur?" selected":"")+'>'+esc(cap(shortDay(n)))+' · '+(k+1)+(k?" noches":" noche")+'</option>'}).join("")+'</select></div>';
}
function nightsText(d){
 // 1 noche: "Noche del jue 31 dic". Varias: "Lun 28 dic → jue 31 dic · 3 noches" (entrada → día del check-out)
 var a=dayById(d.dayId);if(!a)return "";
 var b=(d.nightTo&&dayById(d.nightTo))||a;if(b.i<a.i)b=a;
 var n=b.i-a.i+1,out=DAYS[b.i+1];
 if(n===1)return "Noche del "+shortDay(a);
 return cap(shortDay(a))+" → "+(out?shortDay(out):shortDay(b))+" · "+n+" noches";
}
function legModes(day,idx){var s=[];docsOf(day.d).forEach(function(d){if(TRIPT[d.type]&&d.leg===idx&&s.indexOf(d.type)<0)s.push(d.type)});return s}
function dayModes(day){
 var s=[];
 (day.legs||[]).forEach(function(l,i){legModes(day,i).forEach(function(t){if(s.indexOf(t)<0)s.push(t)})});
 docsOf(day.d).forEach(function(d){if(TRIPT[d.type]&&d.leg==null&&s.indexOf(d.type)<0)s.push(d.type)});
 return s;
}
function modeText(ms){return ms.map(function(t){return TYPES[t].l}).join(" · ")}
function legTypes(day,i){var m=legModes(day,i).slice();if(!m.length&&day.legs.length===1){docsOf(day.d).forEach(function(d){if(TRIPT[d.type]&&d.leg==null&&m.indexOf(d.type)<0)m.push(d.type)})}return m}
function legLabel(day,i){var m=legTypes(day,i);return m.length?modeText(m):(day.legs[i].m==="vuelo"?"Vuelo":"Traslado")}
function legIcon(day,i){var m=legTypes(day,i);return m.length?TYPE_ICON[m[0]]:(day.legs[i].m==="vuelo"?"vuelo":"route")}
function dayLabel(day){var o=[];day.legs.forEach(function(l,i){legLabel(day,i).split(" · ").forEach(function(x){if(o.indexOf(x)<0)o.push(x)})});return o.join(" · ")}
var CURS=["EUR","COP","USD"];
function parsePrice(s){
 s=String(s||"").replace(/[^\d.,]/g,"");if(!s)return null;
 var lc=s.lastIndexOf(","),ld=s.lastIndexOf("."),dec=-1;
 if(lc>=0&&ld>=0)dec=Math.max(lc,ld);
 else if(lc>=0){dec=(s.length-lc-1<=2&&s.indexOf(",")===lc)?lc:-1}
 else if(ld>=0){dec=(s.length-ld-1<=2&&s.indexOf(".")===ld)?ld:-1}
 var n=dec>=0?s.slice(0,dec).replace(/[.,]/g,"")+"."+s.slice(dec+1):s.replace(/[.,]/g,"");
 var v=parseFloat(n);return isFinite(v)&&v>=0?Math.round(v*100)/100:undefined;
}
function fmtMoney(v,c){var z=c==="COP"?0:2;try{return new Intl.NumberFormat("es-ES",{style:"currency",currency:c,minimumFractionDigits:z,maximumFractionDigits:z}).format(v)}catch(e){return v+" "+c}}
function sumDocs(list){var m={};list.forEach(function(d){if(d.price!=null){var c=d.cur||"EUR";m[c]=(m[c]||0)+d.price}});return m}
function sumText(m){return CURS.filter(function(c){return m[c]!=null}).map(function(c){return fmtMoney(m[c],c)}).join(" + ")}
/* Varias monedas: una debajo de otra (sin "+"), siempre en el mismo orden */
function sumHTML(m){return '<span class="amts">'+CURS.filter(function(c){return m[c]!=null}).map(function(c){return '<span>'+esc(fmtMoney(m[c],c))+'</span>'}).join("")+'</span>'}
function priceHTML(d){return d.price!=null?'<div class="price">'+esc(fmtMoney(d.price,d.cur||"EUR"))+(paidOf(d)?'<small> · cobrado '+esc(fmtMoney(d.paid.v,d.paid.c))+'</small>':"")+'</div>':""}
/* Lo cobrado de verdad cuando se pagó en otra moneda (campo opcional d.paid={v,c}; las copias viejas siguen valiendo) */
function paidOf(d){return d.price!=null&&d.paid&&d.paid.v!=null&&CURS.indexOf(d.paid.c)>=0?d.paid:null}
function daySum(list){var m=sumDocs(list);return Object.keys(m).length?'<div class="sum"><span>Total del día</span><b>'+sumHTML(m)+'</b></div>':""}
function priceField(d){
 var cur=d?(d.cur||"EUR"):(kv.lastCur||"EUR");
 return '<div class="field"><label for="f-price">Precio</label><div class="pricerow"><input id="f-price" type="text" inputmode="decimal" placeholder="0,00" value="'+(d&&d.price!=null?String(d.price).replace(".",","):"")+'" autocomplete="off"><select id="f-cur" aria-label="Moneda">'+CURS.map(function(c){return '<option value="'+c+'"'+(c===cur?" selected":"")+'>'+c+'</option>'}).join("")+'</select></div></div>';
}
/* Barra de gastos: una línea con el total; al tocarla se despliega el desglose (se recuerda en
   este dispositivo). El ícono de imprimir abre el resumen para imprimir. */
function summaryHTML(shown){
 // la barra se muestra siempre (con 0 si no hay precios), para que la lista no salte al cambiar de filtro
 if(!shown.length)return "";
 var pr=shown.filter(function(d){return d.price!=null});
 var all=docFilter==="all",inner="";
 if(all&&pr.length){
  var by={};pr.forEach(function(d){(by[d.type]=by[d.type]||[]).push(d)});
  inner+='<ul class="sumrows">'+Object.keys(TYPES).filter(function(k){return by[k]}).map(function(k){return '<li style="--t:'+TYPES[k].t+'">'+svg(TYPE_ICON[k],18)+'<span>'+TYPES[k].l+' <small>'+by[k].length+'</small></span><b>'+sumHTML(sumDocs(by[k]))+'</b></li>'}).join("")+'</ul>';
 }
 // cuántos no tienen precio: en pequeño bajo el título (no escondido en el desplegable)
 var np=shown.length-pr.length,npT=np>0?'<small>'+np+' sin precio</small>':"";
 var open=!!kv.sumOpen&&!!inner;
 return '<section class="sumbox'+(open?" open":"")+(all?"":" noprt")+'"><div class="sbrow"><button type="button" class="sbtog"'+(inner?' data-act="sumtog" aria-expanded="'+open+'"':' disabled')+'>'+(inner?'<i class="sbcv">'+svg("chev",18)+'</i>':"")+'<span class="sbl">'+(all?"Gastado en el viaje":"Gastado en "+TYPES[docFilter].l.toLowerCase())+npT+'</span><b>'+(pr.length?sumHTML(sumDocs(pr)):esc(fmtMoney(0,"EUR")))+'</b></button>'+
  (all?'<button type="button" class="prt" data-act="spend" aria-label="Resumen de gastos para imprimir">'+svg("print",20)+'</button>':"")+'</div>'+
  (open?'<div class="sbin">'+inner+'</div>':"")+'</section>';
}
function refreshLegField(){var w=$("#f-legwrap"),dy=$("#f-day");if(w&&dy)w.innerHTML=legField(dy.value,selType,legSel);var t=$("#f-towrap");if(t&&dy)t.innerHTML=toField(dy.value,selType,toSel);var lb=$("#f-daylb");if(lb)lb.innerHTML=(selType==="hotel"?"Primera noche":"Día")+REQ;refreshTransport()}
/* Quitar el archivo (se aplica al guardar; Cancelar lo deshace) */
var fileDel=false;
function removeFormFile(){
 var inp=$("#f-file");if(inp)inp.value="";
 fileDel=!!(editing&&editing.blob);
 var n=$("#f-name");if(n)n.innerHTML="Elegir archivo<small>PDF del billete, la reserva o una captura</small>";   // como uno nuevo: el formulario es un borrador hasta Guardar
 var pv=$("#f-prev");if(pv)pv.innerHTML="";
 var bn=$("#f-bignote");if(bn)bn.hidden=true;
 var b=$("#f-filedel");if(b)b.hidden=true;
}
/* ---- Traslados en el formulario: compañía, número, horarios por tramo y llegada +1 ----
   fx guarda lo escrito para no perderlo al cambiar de tipo o de trayecto (esas partes se redibujan). */
var CO={vuelo:["Aerolínea","Ej. Iberia","N.º de vuelo","Ej. IB6800"],tren:["Compañía","Ej. Renfe","N.º de tren","Ej. 03123"],bus:["Compañía","Ej. ALSA","N.º de bus","Ej. 1405"],coche:["Compañía","Ej. Hertz"]};
var fx={co:"",no:"",t1:"",t2:"",hops:[],arr:0,arrManual:false,title:""};
function formRange(){return rangeSegs(dayById(curDay()),parseLeg(curLeg()))}
function isMulti(){return !!ARRT[selType]&&formRange().length>1}
function fxVal(id){var e=document.getElementById(id);return e?e.value:null}
function captureFx(){
 var v;
 if((v=fxVal("f-title"))!=null)fx.title=v;
 if((v=fxVal("f-co"))!=null)fx.co=v;
 if((v=fxVal("f-no"))!=null)fx.no=v;
 if((v=fxVal("f-t1"))!=null){fx.t1=v;if(fx.hops[0])fx.hops[0].t1=v}
 if((v=fxVal("f-t2"))!=null){fx.t2=v;if(fx.hops.length)fx.hops[fx.hops.length-1].t2=v}
 var k=0;
 for(;fxVal("f-h"+k+"-t1")!=null;k++)fx.hops[k]={no:fxVal("f-h"+k+"-no")||"",t1:fxVal("f-h"+k+"-t1")||"",t2:fxVal("f-h"+k+"-t2")||""};
 if(k){fx.hops.length=k;fx.t1=fx.hops[0].t1;fx.t2=fx.hops[k-1].t2}
}
/* Ajusta los horarios por tramo al trayecto elegido (uno por tramo) */
function syncFxShape(){
 if(!isMulti())return;
 var n=formRange().length,h=fx.hops.slice(0,n);
 while(h.length<n)h.push({no:"",t1:"",t2:""});
 if(!h[0].t1&&fx.t1)h[0].t1=fx.t1;
 if(!h[n-1].t2&&fx.t2)h[n-1].t2=fx.t2;
 if(!h[0].no&&fx.no)h[0].no=fx.no;
 fx.hops=h;
}
function fxDoc(){return {t1:fx.t1,t2:fx.t2,hops:isMulti()?fx.hops:null}}
function titleArea(){
 if(!TRIPT[selType])return '<div class="field"><label for="f-title">Título</label><input id="f-title" type="text" placeholder="'+esc(TITLEPH[selType]||"")+'" value="'+esc(fx.title||"")+'" autocomplete="off"></div>';
 var c=CO[selType],co='<input id="f-co" type="text" placeholder="'+esc(c[1])+'" value="'+esc(fx.co)+'" autocomplete="off">';
 if(!c[2]||isMulti())return '<div class="field"><label for="f-co">'+c[0]+'</label>'+co+'</div>';
 return '<div class="row2"><div class="field"><label for="f-co">'+c[0]+'</label>'+co+'</div><div class="field"><label for="f-no">'+c[2]+'</label><input id="f-no" type="text" class="code" placeholder="'+esc(c[3])+'" value="'+esc(fx.no)+'" autocomplete="off" autocapitalize="characters"></div></div>';
}
/* Mínimo de días de la llegada: si una hora es anterior a la anterior, ya es otro día (no puede ser menos) */
function minArr(){return autoArr(fxDoc())}
function arrLine(){
 var t,low=fx.arr<=minArr();
 if(!fx.arr)t='<span class="arrt muted">Llega el mismo día</span>';
 else{var dt=dayPlus(curDay(),fx.arr);t='<span class="arrt">Llega el '+(dt?esc(fmtDt(dt)):"día siguiente")+' · <b>+'+fx.arr+'</b></span>'}
 return '<div class="arrline" id="f-arr">'+t+'<span class="arrbtns"><button type="button" class="stp" data-act="arr-dn" aria-label="Llega un día antes"'+(low?' aria-disabled="true"':"")+'>−</button><button type="button" class="stp" data-act="arr-up" aria-label="Llega un día después"'+(fx.arr>=3?" disabled":"")+'>+</button></span></div>';
}
function timeArea(){
 if(!ARRT[selType])return '<div class="field"><span class="fl" id="f-tlab">'+timeLabel(selType)+'</span><div class="timerow">'+timeBox("f-t1",fx.t1,"Hora de inicio")+'<span>–</span>'+timeBox("f-t2",fx.t2,"Hora de fin")+'</div></div>';
 if(!isMulti())return '<div class="field"><span class="fl" id="f-tlab">Salida y llegada</span><div class="timerow">'+timeBox("f-t1",fx.t1,"Hora de salida")+'<span>–</span>'+timeBox("f-t2",fx.t2,"Hora de llegada")+'</div>'+arrLine()+'<p class="err" id="f-arrerr" role="alert"></p></div>';
 var ss=formRange(),c=CO[selType],h='<div class="field"><span class="fl" id="f-tlab">Tramos y horarios</span><div class="hops">';
 ss.forEach(function(sg,k){var x=fx.hops[k]||{};
  if(k>0)h+='<p class="layline" id="f-lay'+(k-1)+'"></p>';
  h+='<div class="hop"><div class="hophead"><b>'+esc(segText(sg))+'</b><input id="f-h'+k+'-no" type="text" class="code" placeholder="'+esc(c[2])+'" aria-label="'+esc(c[2]+", "+segText(sg))+'" value="'+esc(x.no||"")+'" autocomplete="off" autocapitalize="characters"></div>'+
   '<div class="timerow">'+timeBox("f-h"+k+"-t1",x.t1,"Salida de "+sg.f.n)+'<span>–</span>'+timeBox("f-h"+k+"-t2",x.t2,"Llegada a "+sg.t.n)+'</div></div>';
 });
 return h+'</div>'+arrLine()+'<p class="err" id="f-arrerr" role="alert"></p></div>';
}
/* Por qué no se puede bajar el día de llegada (con las horas reales) */
function arrMsg(){
 if(isMulti())return "Por las horas de los tramos, llega al menos +"+minArr()+". Si no es así, revisa las horas.";
 return "La llegada ("+fx.t2+") es antes que la salida ("+fx.t1+"), así que es al día siguiente. Si llega el mismo día, revisa las horas.";
}
function arrErr(m){var e=$("#f-arrerr");if(e)e.textContent=m||""}
/* Texto de cada escala: "Escala en Bogotá · 2 h 55 min" (se calcula al escribir las horas) */
function refreshLays(){
 if(!isMulti())return;
 var ss=formRange(),ls=layoversOf({hops:fx.hops},ss);
 for(var k=0;k<ss.length-1;k++){var e=$("#f-lay"+k);if(!e)continue;var l=ls[k];
  e.innerHTML=svg("clock",15)+'<span>Escala en '+esc(ss[k].t.n)+(l?' · <b>'+esc(minText(l.min))+'</b>'+(l.night?' · nocturna':''):'')+'</span>'}
}
function refreshArr(){var e=$("#f-arr");if(e)e.outerHTML=arrLine()}
/* Redibuja compañía/número y horarios según el tipo y el trayecto, conservando lo escrito */
function refreshTransport(){
 if(!$("#f-timewrap"))return;
 captureFx();syncFxShape();
 if(ARRT[selType])fx.arr=fx.arrManual?Math.max(fx.arr,minArr()):autoArr(fxDoc());
 var a=$("#f-tiwrap");if(a)a.innerHTML=titleArea();
 var b=$("#f-timewrap");if(b)b.innerHTML=timeArea();
 refreshLays();
}

/* ================= Fechas ================= */
var WD=["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];
var WD3=["DOM","LUN","MAR","MIÉ","JUE","VIE","SÁB"];
var MO=["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
var MO3=["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
function pd(s){var a=s.split("-").map(Number);return new Date(a[0],a[1]-1,a[2])}
var SIM_TODAY=null; /* TEMPORAL: borrar esta fecha (dejar null) para usar la fecha real */
function todayStr(){if(SIM_TODAY)return SIM_TODAY;var t=new Date();return t.getFullYear()+"-"+String(t.getMonth()+1).padStart(2,"0")+"-"+String(t.getDate()).padStart(2,"0")}
function utc(s){var a=s.split("-").map(Number);return Date.UTC(a[0],a[1]-1,a[2])}
function diff(a,b){return Math.round((utc(b)-utc(a))/864e5)}
function cap(s){return s.charAt(0).toUpperCase()+s.slice(1)}
function nm(id){return CITIES[id].name}
function hasInfo(id){return !CITIES[id].origin}

var DAYS=TRIP.map(function(x,i){var dt=pd(x.d);x.i=i;x.dt=dt;x.base=x.base||x.sleep||x.stops[x.stops.length-1];x.sleep0=x.sleep;return x});
function dayById(id){for(var i=0;i<DAYS.length;i++)if(DAYS[i].d===id)return DAYS[i];return null}
function colors(day){return [CITIES[day.stops[0]].c1,CITIES[day.stops[day.stops.length-1]].c2]}
function longDate(day){return WD[day.dt.getDay()]+", "+day.dt.getDate()+" de "+MO[day.dt.getMonth()]+" de "+day.dt.getFullYear()}
function shortDay(day){return WD3[day.dt.getDay()].toLowerCase()+" "+day.dt.getDate()+" "+MO3[day.dt.getMonth()]}
function routeHTML(day){return day.stops.map(function(s){return esc(nm(s))}).join(" "+svg("arrow",16)+" ")}
function routeText(day){return day.stops.map(nm).join(" → ")}

/* ================= Almacenamiento local ================= */
var db=null, docs=[], kv={}, urls={};
function openDB(){return new Promise(function(res){try{var r=indexedDB.open("journest",1);
 r.onupgradeneeded=function(){var d=r.result;d.createObjectStore("docs",{keyPath:"id"});d.createObjectStore("kv",{keyPath:"k"})};
 r.onsuccess=function(){res(r.result)};r.onerror=function(){res(null)};r.onblocked=function(){res(null)}}catch(e){res(null)}})}
function tx(store,mode,fn){return new Promise(function(res,rej){var t=db.transaction(store,mode);var s=t.objectStore(store);var r=fn(s);t.oncomplete=function(){res(r&&r.result)};t.onerror=function(){rej(t.error)};t.onabort=function(){rej(t.error)}})}
async function loadAll(){
 db=await openDB();
 if(!db)return;
 try{docs=(await tx("docs","readonly",function(s){return s.getAll()}))||[];upgradeOldPlaces(docs);
  var rows=(await tx("kv","readonly",function(s){return s.getAll()}))||[];rows.forEach(function(r){kv[r.k]=r.v})}catch(e){docs=[]}
}
async function saveDoc(d){
 var i=docs.findIndex(function(x){return x.id===d.id});if(i<0)docs.push(d);else docs[i]=d;
 if(db){try{await tx("docs","readwrite",function(s){return s.put(d)})}catch(e){toast("No se pudo guardar en el dispositivo")}}
}
async function removeDoc(id){
 docs=docs.filter(function(x){return x.id!==id});
 if(urls[id]){try{URL.revokeObjectURL(urls[id])}catch(e){}delete urls[id]}
 if(db){try{await tx("docs","readwrite",function(s){return s.delete(id)})}catch(e){}}
}
async function setKV(k,v){kv[k]=v;if(db){try{await tx("kv","readwrite",function(s){return s.put({k:k,v:v})})}catch(e){}}}
async function delKV(k){delete kv[k];if(db){try{await tx("kv","readwrite",function(s){return s.delete(k)})}catch(e){}}}
function objUrl(d){if(!d.blob)return "";if(!urls[d.id])urls[d.id]=URL.createObjectURL(d.blob);return urls[d.id]}
function uid(){return "d"+Date.now().toString(36)+Math.random().toString(36).slice(2,7)}
function fmtSize(n){if(!n)return "";if(n<1024)return n+" B";if(n<1048576)return Math.round(n/1024)+" KB";return (n/1048576).toFixed(1)+" MB"}
function docsOf(dayId){return docs.filter(function(d){return d.dayId===dayId}).sort(function(a,b){return a.created-b.created})}
function docsShown(day){
 var extra=docs.filter(function(d){if(d.type!=="hotel"||d.dayId===day.d||!d.nightTo)return false;var a=dayById(d.dayId),b=dayById(d.nightTo);return a&&b&&a.i<day.i&&day.i<=b.i}).sort(function(a,b){return a.created-b.created});
 return extra.concat(docsOf(day.d));
}

/* ================= Utilidades de interfaz ================= */
var toastT;
function toast(msg){var t=$("#toast");t.textContent=msg;t.hidden=false;clearTimeout(toastT);toastT=setTimeout(function(){t.hidden=true},2300)}
async function copyText(txt){
 try{await navigator.clipboard.writeText(txt);toast("Código copiado")}
 catch(e){var ta=document.createElement("textarea");ta.value=txt;ta.style.cssText="position:fixed;opacity:0;top:0";document.body.appendChild(ta);ta.select();var ok=false;try{ok=document.execCommand("copy")}catch(_){}ta.remove();toast(ok?"Código copiado":"Mantén pulsado el código para copiarlo")}
}
function mapUrl(name,city){return "https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(name+", "+nm(city))}

/* ================= Vistas ================= */
var tab="general", docFilter="all", docsTab="docs", scrollPos={}, homeScrolled=false;
function applyTheme(){document.documentElement.setAttribute("data-theme",kv.theme||"light")}
var V={home:$("#v-home"),day:$("#v-day"),docs:$("#v-docs"),cal:$("#v-cal"),map:$("#v-map")};

function stagesOf(){
 var out=[];DAYS.forEach(function(d){var l=out[out.length-1];if(l&&l.city===d.base){l.to=d}else out.push({city:d.base,from:d,to:d})});
 return out;
}
function rangeText(a,b){
 if(a===b)return a.dt.getDate()+" "+MO3[a.dt.getMonth()];
 if(a.dt.getMonth()===b.dt.getMonth())return a.dt.getDate()+"–"+b.dt.getDate()+" "+MO3[b.dt.getMonth()];
 return a.dt.getDate()+" "+MO3[a.dt.getMonth()]+"–"+b.dt.getDate()+" "+MO3[b.dt.getMonth()];
}

var PAT={madrid:"grid",pamplona:"stripe",sevilla:"star",cordoba:"star",granada:"star",malaga:"wave",tenerife:"contour",medellin:"dots"};
function mainIdx(d){if(d.stops.length<2)return 0;if(d.start)return d.stops.length-1;var k=d.stops.indexOf(d.base);return k<0?d.stops.length-1:k}
function stopsHTML(d){return d.stops.map(function(s,i){return '<span class="sp"><span class="pinn'+(i===mainIdx(d)?'':' mid')+'" style="--c:'+CITIES[s].c1+'">'+(i+1)+'</span>'+esc(nm(s))+'</span>'}).join(svg("chev",16))}
function titleHTML(d){return d.stops.map(function(s,i){return '<span class="rt">'+esc(nm(s))+(i<d.stops.length-1?svg("arrow",22):"")+'</span>'}).join(" ")}
function nightsOf(s){var n=0;DAYS.forEach(function(d){if(d.d>=s.from.d&&d.d<=s.to.d&&d.sleep===s.city)n++});return n}
function renderHome(){
 var t=todayStr(),first=DAYS[0],last=DAYS[DAYS.length-1],cur=dayById(t),cd="";
 if(diff(t,first.d)>0){var n=diff(t,first.d);cd='<div class="cd"><span>'+(n===1?"Falta":"Faltan")+'</span><b>'+n+'</b><span>'+(n===1?"día":"días")+'</span></div>'}
 else if(cur){cd='<a class="cd" href="#dia-'+cur.d+'" aria-label="Ir al día de hoy">'+(cur.i===0?'<span>¡Hoy empieza!</span>':'<span>Día</span><b>'+(cur.i+1)+'</b><span>de '+DAYS.length+'</span>')+'</a>'}
 else if(diff(t,last.d)<0){cd='<div class="cd"><span>Viaje terminado</span></div>'}
 var cities={};DAYS.forEach(function(d){d.stops.forEach(function(s){cities[s]=1})});
 var st=stagesOf(),cov=nightsCovered(),pTk={};pendTickets().forEach(function(p){pTk[p.day.d]=1});
 var chips=st.map(function(s,i){return '<button type="button" class="sc" style="--c:'+CITIES[s.city].c1+'" data-act="go" data-id="st-'+i+'"><i></i>'+esc(nm(s.city))+' <small>'+rangeText(s.from,s.to)+'</small></button>'}).join("");
 var body=st.map(function(s,i){
  var nn=nightsOf(s),c=CITIES[s.city];
  var sub=c.origin?"Punto de partida · "+rangeText(s.from,s.to):rangeText(s.from,s.to);
  var days=DAYS.filter(function(d){return d.d>=s.from.d&&d.d<=s.to.d}).map(function(d){
   var n=docsShown(d).length,meta=[],pdT=pTk[d.d]?'<i class="pdot" title="Falta billete"></i>':"";
   if(d.d===t)meta.push('<span class="pill hot">Hoy</span>');
   if(d.start)meta.push('<span class="pill">Inicio del viaje'+pdT+'</span>');
   else if(d.legs)meta.push('<span class="pill">'+svg(legIcon(d,0),14)+esc(dayLabel(d))+pdT+'</span>');
   if(d.sleep)meta.push('<span>'+svg("bed",15)+esc(nm(d.sleep))+(cov[d.d]?"":'<i class="pdot" title="Falta hotel"></i>')+'</span>');
   else if(nightLabel(d))meta.push('<span>'+svg("vuelo",15)+esc(nightLabel(d))+'</span>');
   else if(d.last)meta.push('<span>Último día</span>');
   if(n)meta.push('<span>'+svg("clip",15)+n+(n===1?" documento":" documentos")+'</span>');
   return '<a class="day'+(d.d===t?" today":"")+'" id="d-'+d.d+'" href="#dia-'+d.d+'" style="--c:'+c.c1+'"><div class="rail"><small>'+WD3[d.dt.getDay()]+'</small><b>'+d.dt.getDate()+'</b></div><div class="dcard"><div class="stops">'+stopsHTML(d)+'</div><div class="meta">'+meta.join("")+'</div></div></a>';
  }).join("");
  return '<section class="stage" id="st-'+i+'"><div class="banner" style="--c:'+c.c1+'"><h2>'+esc(c.name)+'</h2><p>'+sub+'</p></div><div class="days">'+days+'</div></section>';
 }).join("");
 V.home.innerHTML='<header class="in top"><div class="trow"><div><h1>Journest</h1><p class="sub">'+first.dt.getDate()+' '+MO3[first.dt.getMonth()]+' – '+last.dt.getDate()+' '+MO3[last.dt.getMonth()]+' · '+DAYS.length+' días</p></div>'+cd+'</div><div class="scs">'+chips+'</div></header><div class="in list">'+body+'</div>';
}

function listOf(id,kind){
 var v=kv["pl:"+id+":"+kind];
 if(Array.isArray(v))return v;
 return CITIES[id][kind].map(function(p,i){return {id:String(i),n:p[0],d:p[1],u:""}});
}
function itemKey(kind,cid,p){return (kind==="see"?"s:":"r:")+cid+":"+p.id}
function itemRow(cid,kind,p,idx){
 var href=p.u&&/^https?:\/\//i.test(p.u)?p.u:mapUrl(p.n,cid);
 return '<li class="pl pin"><span class="pinn" style="--c:'+CITIES[cid].c1+'">'+(idx+1)+'</span><div><b>'+esc(p.n)+'</b>'+(p.d?'<p>'+esc(p.d)+'</p>':"")+'<div class="pact">'+statSel(itemKey(kind,cid,p))+'<span class="pgap"></span><button type="button" class="agb2" data-act="ev-add" data-pk="'+esc(itemKey(kind,cid,p))+'" data-title="'+esc(p.n)+'" data-day="'+esc(curDayId||"")+'" aria-label="Añadir '+esc(p.n)+' al calendario">'+svg("calplus",18)+'</button><a class="map ico" href="'+esc(href)+'" target="_blank" rel="noopener" aria-label="Abrir '+esc(p.n)+' en el mapa">'+svg("pin",18)+'</a></div></div></li>';
}
function listHead(title,cid,kind){
 return '<div class="lh"><h3 class="lab">'+title+'</h3><button type="button" class="pen" data-act="list" data-city="'+cid+'" data-kind="'+kind+'" aria-label="Editar lista: '+title+'">'+svg("pencil",18)+'</button></div>';
}
function itemList(cid,kind){
 var l=listOf(cid,kind);
 return l.length?'<ul class="rows">'+l.map(function(p,i){return itemRow(cid,kind,p,i)}).join("")+'</ul>':'<p class="foot">Lista vacía. Toca el lápiz para añadir.</p>';
}
var colap={};
function cityWrap(id,dayId,multi,head,body){
 var c=CITIES[id],k=dayId+":"+id,f=multi&&colap[k];
 return '<section class="city'+(f?" fold":"")+'" style="--c1:'+c.c1+';--c2:'+c.c2+'">'+head+'<div class="cbody">'+body+'</div></section>';
}
function cityHead(id,dayId,multi,temp){
 var c=CITIES[id],k=dayId+":"+id,t=temp?'<span class="temp">'+c.temp+' típico</span>':"";
 if(!multi)return temp?'<div class="chead one">'+t+'</div>':"";
 return '<button type="button" class="chead cfold" data-act="cfold" data-k="'+k+'" aria-expanded="'+(!colap[k])+'"><i></i><span class="cn">'+esc(c.name)+'</span>'+t+'<span class="cv">'+svg("chev",18)+'</span></button>';
}
function cityGeneral(id,dayId,multi){
 var c=CITIES[id];
 return cityWrap(id,dayId,multi,cityHead(id,dayId,multi,true),'<p class="lead">'+esc(c.intro)+'</p>'+
 '<div>'+listHead("Qué ver",id,"see")+itemList(id,"see")+'</div>'+
 '<div><h3 class="lab">Consejos</h3><ul class="tips">'+c.tips.map(function(x){return '<li>'+esc(x)+'</li>'}).join("")+'</ul></div>');
}
function cityEat(id,dayId,multi){
 var c=CITIES[id];
 return cityWrap(id,dayId,multi,cityHead(id,dayId,multi,false),
 '<div><h3 class="lab">Para pedir</h3><div class="chips">'+c.dishes.map(function(x){return '<span class="chip">'+esc(x)+'</span>'}).join("")+'</div></div>'+
 '<div>'+listHead("Dónde",id,"eat")+itemList(id,"eat")+'</div>');
}
function legsHTML(day){
 if(!day.legs)return "";
 var h='<section><h3 class="lab">Ruta del día</h3><ol class="tl">';
 day.stops.forEach(function(s,i){
  h+='<li class="st"><span class="pinn" style="--c:'+CITIES[s].c1+'">'+(i+1)+'</span><div><b>'+esc(nm(s))+'</b>'+(day.legs[i]&&day.legs[i].w?'<small>'+esc(day.legs[i].w)+'</small>':"")+'</div></li>';
  if(day.legs[i]){var vv=viaOf(day.d,i);h+='<li class="lg"><span class="lgl"></span><span class="tag">'+svg(legIcon(day,i),16)+esc(legLabel(day,i))+'</span>'+(vv.length?'<span class="via">vía '+esc(vv.join(", "))+'</span>':"")+'<button type="button" class="mini" data-act="via" data-day="'+day.d+'" data-leg="'+i+'">'+(vv.length?"Editar paradas":"Añadir parada")+'</button></li>'}
 });
 return h+'</ol></section>';
}
/* Trayecto de un billete ("Málaga → Tenerife") y si el título ya lo dice */
function docSeg(d){if(!TRIPT[d.type])return "";return segsText(docSegs(d))}
function docSegs(d){return rangeSegs(dayById(d.dayId),parseLeg(docLegVal(d)))}
function arrSuffix(d){var n=docArr(d);return n>0?" +"+n:""}
/* Debajo del título: números ("AV9301 · IB6800") y escalas ("escala 2 h 55 min en Bogotá") */
function tripSub(d){
 if(!TRIPT[d.type])return [];
 var o=[],nos=d.hops?d.hops.map(function(h){return h.no}).filter(Boolean).join(" · "):(d.no||"");if(nos)o.push(nos);
 var ss=docSegs(d);
 if(ss.length>1){var ls=layoversOf(d,ss),t=[];for(var k=0;k<ss.length-1;k++){var l=ls[k];t.push(l?"escala "+minText(l.min)+" en "+ss[k].t.n:"vía "+ss[k].t.n)}o.push(t.join(" · "))}
 return o;
}
function titleHas(d,txt){return normName(d.title||"").indexOf(normName(txt))>=0}
/* Tarjeta compacta: tipo (ícono y color), título y una línea con lo esencial. Código, precio,
   nota, ubicaciones y archivo están en la ficha (un toque); 📎 avisa que hay archivo. */
function ticketLine(d){
 var o=[],st0=docSeg(d);
 if(st0&&!titleHas(d,st0))o.push(st0);
 if(d.type==="hotel"){var nt0=nightsText(d);if(nt0)o.push(nt0)}
 if(d.t1)o.push(d.t1+(d.t2?"–"+d.t2+arrSuffix(d):""));
 if(TRIPT[d.type]){
  var nos=d.hops?d.hops.map(function(h){return h.no}).filter(Boolean).join(" · "):(d.no||"");if(nos)o.push(nos);
  var ns=docSegs(d).length-1;if(ns>0)o.push(ns+(ns===1?" escala":" escalas"));
 }
 return o.join(" · ");
}
function ticketHTML(d){
 var T=TYPES[d.type]||TYPES.otro,line=ticketLine(d);
 return '<article class="ticket" data-act="view" data-id="'+d.id+'" style="--t:'+T.t+'"><div class="tstub" title="'+T.l+'">'+svg(TYPE_ICON[d.type]||"file",22)+'</div><div class="tbody"><button type="button" class="tmain" data-act="view" data-id="'+d.id+'" aria-label="'+esc(T.l+": "+(d.title||T.l))+'"><h4>'+esc(d.title||T.l)+'</h4>'+(line?'<p>'+esc(line)+'</p>':"")+'</button>'+
  '<span class="tend">'+(d.blob||d.fileName?'<span class="tclip" aria-label="Con archivo">'+svg("clip",15)+'</span>':"")+svg("chev",18)+'</span></div></article>';
}
function docsPanel(day){
 var list=docsShown(day),sug=[];
 pendHotels().forEach(function(r){if(r.from.i<=day.i&&day.i<=r.to.i)sug.push({t:"hotel",l:"Hotel en "+nm(r.city)+" · "+rangeText(r.from,r.to),title:"Hotel en "+nm(r.city),day:r.from.d,to:r.to.d})});
 pendTickets().forEach(function(p){if(p.day!==day)return;var t=(p.type==="vuelo"?"Vuelo ":"Billete ")+segText(p.seg);sug.push({t:p.type,l:t,title:t,day:day.d,leg:p.leg+"-"+p.seg.j})});
 var h='<div class="addrow"><button type="button" class="btn primary" data-act="add" data-day="'+day.d+'">'+svg("plus",20)+'Añadir documento</button>';
 if(sug.length)h+='<div class="sugg"><h3 class="lab" style="margin:0">Falta por añadir</h3><div class="chips">'+sug.map(function(x){return '<button type="button" class="chip" data-act="add" data-day="'+x.day+'" data-type="'+x.t+'" data-title="'+esc(x.title)+'"'+(x.leg!=null?' data-leg="'+x.leg+'"':"")+(x.to?' data-to="'+x.to+'"':"")+'>'+svg(TYPE_ICON[x.t],16)+esc(x.l)+'</button>'}).join("")+'</div></div>';
 h+='</div>';
 h+=daySum(docsOf(day.d));
 h+=list.length?'<div class="tickets">'+list.map(ticketHTML).join("")+'</div>':'<div class="empty"><b>Sin documentos para este día</b><span>Sube PDFs o fotos de reservas, billetes y entradas, o guarda solo el código.</span></div>';
 return h;
}
function renderDay(day){
 curDayId=day.d;
 var dayBack=dayFrom||"#inicio";
 var c=colors(day),n=docsShown(day).length,i=day.i,prev=DAYS[i-1],next=DAYS[i+1],isToday=day.d===todayStr();
 var tabList=day.start?[["docs","Documentos"]]:[["general","General"],["comer","Comer"],["docs","Documentos"]];
 if(day.start)tab="docs";
 var general=(day.ev||[]).map(function(e){return '<div class="note">'+svg("flag",20)+'<p>'+esc(e)+'</p></div>'}).join("")+legsHTML(day)+(function(l){return l.map(function(x){return cityGeneral(x,day.d,l.length>1)}).join("")})(day.stops.filter(hasInfo))+'<p class="foot">Sugerencias de partida. Confirma horarios, precios y reservas antes de ir.</p>';
 var eat=(function(l){return l.map(function(x){return cityEat(x,day.d,l.length>1)}).join("")})(day.stops.filter(hasInfo))+'<p class="foot">Toca el estado de cada sitio para marcarlo: quiero ir, reservado o ya fui. Confirma horarios y reserva en fechas señaladas.</p>';
 // el día de inicio solo tiene la pestaña Documentos: ahí va también la ruta (y sus paradas)
 var panels={general:general,comer:eat,docs:(day.start?legsHTML(day):"")+docsPanel(day)};
 V.day.style.setProperty("--c1",c[0]);V.day.style.setProperty("--c2",c[1]);
 var rbar=day.stops.map(function(s){return '<i style="background:'+CITIES[s].c1+'"></i>'}).join("");
 V.day.innerHTML='<div class="dbar"><div class="in"><a class="back" href="'+dayBack+'" aria-label="Volver">'+svg("back",20)+'</a><b class="dbt" aria-hidden="true">'+esc(day.stops.map(nm).join(" → "))+'</b><button type="button" class="dmapb" data-act="map-day" data-day="'+day.d+'" aria-label="Ver este día en el mapa">'+svg("route",20)+'</button><span class="dnum">'+(isToday?"Hoy · ":"")+'Día '+(i+1)+' de '+DAYS.length+'</span></div></div>'+
 '<header class="dh"><div class="in"><p class="dwd">'+esc(longDate(day))+'</p><h1>'+titleHTML(day)+'</h1><div class="rbar">'+rbar+'</div>'+(day.sleep?'<p class="sleep">'+svg("bed",17)+'Dormimos en '+esc(nm(day.sleep))+'</p>':nightLabel(day)?'<p class="sleep">'+svg("vuelo",17)+(day.start?"Inicio del viaje · ":day.last?"Fin del viaje · ":"")+esc(nightLabel(day))+'</p>':'<p class="sleep">'+(day.start?"Inicio del viaje":"Fin del viaje")+'</p>')+'</div></header>'+
 '<nav class="tabs" role="tablist" aria-label="Secciones del día"><div class="in"><div class="trk">'+tabList.map(function(t){return '<button type="button" role="tab" class="tab" data-act="tab" data-tab="'+t[0]+'" aria-selected="'+(tab===t[0])+'">'+t[1]+(t[0]==="docs"&&n?' <em>'+n+'</em>':"")+'</button>'}).join("")+'</div></div></nav>'+
 '<main class="in panel" role="tabpanel">'+panels[tab]+'</main>'+
 '<div class="in dnav">'+(prev?'<a href="#dia-'+prev.d+'"><small>← Anterior</small><b>'+esc(shortDay(prev))+' · '+esc(nm(prev.stops[prev.stops.length-1]))+'</b></a>':'<span style="flex:1"></span>')+(next?'<a class="next" href="#dia-'+next.d+'"><small>Siguiente →</small><b>'+esc(shortDay(next))+' · '+esc(nm(next.stops[0]))+'</b></a>':'<span style="flex:1"></span>')+'</div>';
 watchDayMini();
}
function segHTML(){
 var np=pendHotels().length+pendTickets().length;
 return '<div class="seg"><div class="trk" role="tablist">'+[["docs","Documentos"],["pend","Pendientes"]].map(function(t){return '<button type="button" role="tab" class="tab" data-act="dtab" data-v="'+t[0]+'" aria-selected="'+(docsTab===t[0])+'">'+t[1]+(t[0]==="pend"&&np?' <em>'+np+'</em>':"")+'</button>'}).join("")+'</div></div>';
}
function hotelRow(r){
 var T=TYPES.hotel;
 return '<div class="prow" style="--t:'+T.t+'"><button type="button" class="pmain" data-act="add" data-day="'+r.from.d+'" data-type="hotel" data-title="'+esc("Hotel en "+nm(r.city))+'" data-to="'+r.to.d+'"><span class="pico">'+svg(TYPE_ICON.hotel,22)+'</span><div><b>'+esc(nm(r.city))+'</b><small>'+esc(rangeText(r.from,r.to)+" · "+r.n+(r.n===1?" noche":" noches")+" · falta hotel")+'</small></div><span class="pgo">'+svg("plus",15)+'Añadir</span></button></div>';
}
function ticketRow(p){
 var T=TYPES[p.type],l=p.day.legs[p.leg],vv=viaOf(p.day.d,p.leg),tt=(p.type==="vuelo"?"Vuelo ":"Billete ")+segText(p.seg);
 return '<div class="prow" style="--t:'+T.t+'"><button type="button" class="pmain" data-act="add" data-day="'+p.day.d+'" data-type="'+p.type+'" data-title="'+esc(tt)+'" data-leg="'+p.leg+'-'+p.seg.j+'"><span class="pico">'+svg(TYPE_ICON[p.type],22)+'</span><div><b>'+esc(segText(p.seg))+'</b><small>'+esc(cap(shortDay(p.day))+(l.w?" · "+l.w:"")+" · falta "+(p.type==="vuelo"?"vuelo":"billete"))+'</small></div><span class="pgo">'+svg("plus",15)+'Añadir</span></button><div class="pextra"><button type="button" class="mini" data-act="via" data-day="'+p.day.d+'" data-leg="'+p.leg+'">'+svg("plus",14)+(vv.length?"Editar paradas":"Añadir parada")+'</button></div></div>';
}
function renderPend(){
 var ph=pendHotels(),pt=pendTickets(),nt=0,pn=0,nl=0;
 staysOf().forEach(function(x){nt+=x.nights.length});ph.forEach(function(r){pn+=r.n});
 DAYS.forEach(function(d){(d.legs||[]).forEach(function(l,i){nl+=legSegs(d,i).length})});
 function stat(l,done,tot){return '<div class="pst"><span>'+l+'</span><b>'+done+'<small> de '+tot+'</small></b><div class="pbar"><i style="width:'+(tot?Math.round(done/tot*100):0)+'%"></i></div></div>'}
 var body="";
 if(ph.length)body+='<section class="psec"><h3 class="lab">Hoteles<small>'+ph.length+'</small></h3><div class="plist">'+ph.map(hotelRow).join("")+'</div></section>';
 if(pt.length)body+='<section class="psec"><h3 class="lab">Traslados<small>'+pt.length+'</small></h3><div class="plist">'+pt.map(ticketRow).join("")+'</div></section>';
 if(!body)body='<div class="empty" style="margin-top:18px"><b>Todo listo</b><span>Hay un hotel para cada noche y un billete para cada traslado.</span></div>';
 V.docs.innerHTML='<div class="in"><div class="page-h"><h1>Documentos</h1></div>'+segHTML()+'<div class="pstats">'+stat("Noches con hotel",nt-pn,nt)+stat("Traslados con billete",nl-pt.length,nl)+'</div>'+body+'<div style="height:24px"></div></div>';
}
function renderDocsView(){
 if(docsTab==="pend"){renderPend();updateFab();return}
 var fl0=V.docs.querySelector(".filters"),fsl=fl0?fl0.scrollLeft:0;   // la fila de filtros no vuelve al inicio al redibujar
 var counts={};docs.forEach(function(d){counts[d.type]=(counts[d.type]||0)+1});
 var chips='<button type="button" class="chip" data-act="filter" data-f="all" aria-pressed="'+(docFilter==="all")+'">Todos '+docs.length+'</button>'+Object.keys(TYPES).filter(function(k){return counts[k]}).map(function(k){return '<button type="button" class="chip" data-act="filter" data-f="'+k+'" aria-pressed="'+(docFilter===k)+'">'+TYPES[k].l+' '+counts[k]+'</button>'}).join("");
 var shown=docs.filter(function(d){return docFilter==="all"||d.type===docFilter});
 var groups={};shown.forEach(function(d){(groups[d.dayId]=groups[d.dayId]||[]).push(d)});
 var order=DAYS.map(function(d){return d.d}).concat(["trip"]).filter(function(k){return groups[k]});
 var body=order.map(function(k){var day=dayById(k);var items=groups[k].sort(function(a,b){return a.created-b.created});
  return '<section><div class="group-h">'+(day?'<a href="#dia-'+k+'"><small>'+esc(cap(shortDay(day)))+'</small>'+esc(routeText(day))+'</a>':'<a href="#documentos">Todo el viaje</a>')+'<span>'+items.length+'</span></div><div class="tickets">'+items.map(ticketHTML).join("")+'</div></section>'});
 // durante el viaje, los días ya pasados se pliegan en una línea
 var td=todayStr(),inTrip=td>=DAYS[0].d&&td<=DAYS[DAYS.length-1].d,np0=0,past=0;
 if(inTrip)order.forEach(function(k){if(k!=="trip"&&k<td){past++;np0+=groups[k].length}});
 if(past&&!pastOpen)body=['<button type="button" class="pastbar" data-act="pastdocs" aria-expanded="false"><span>Días anteriores</span><small>'+np0+(np0===1?" documento":" documentos")+'</small>'+svg("chev",18)+'</button>'].concat(body.slice(past));
 else if(past)body=['<button type="button" class="pastbar open" data-act="pastdocs" aria-expanded="true"><span>Ocultar días anteriores</span>'+svg("chev",18)+'</button>'].concat(body);
 body=body.join("");
 V.docs.innerHTML='<div class="in"><div class="page-h"><h1>Documentos</h1></div>'+segHTML()+summaryHTML(shown)+'<div class="filters">'+chips+'</div><div class="dgroups">'+(body||'<div class="empty"><b>Todavía no hay documentos</b><span>Añade el primero y asígnalo a un día del viaje.</span></div>')+'</div><div class="fabspace"></div></div>';
 // misma posición de la fila de filtros, y el elegido siempre a la vista
 var fl=V.docs.querySelector(".filters");
 if(fl){fl.scrollLeft=fsl;var on=fl.querySelector('[aria-pressed="true"]');
  if(on){var l=on.offsetLeft-fl.offsetLeft,r=l+on.offsetWidth;if(l<fl.scrollLeft)fl.scrollLeft=l-16;else if(r>fl.scrollLeft+fl.clientWidth)fl.scrollLeft=r-fl.clientWidth+16}}
 updateFab();
}

/* ================= Hoja: añadir / editar documento ================= */
var sheet=$("#sheet"),sheetBody=$("#sheet-body"),sheetFoot=$("#sheet-foot"),sheetHead=$("#sheet-head"),selType="hotel",editing=null;
/* foot: botones fijos abajo (Editar, o Eliminar | Guardar), siempre a mano aunque el formulario sea largo */
function openSheet(html,foot){flushPaid();sheetBody.innerHTML=html;sheetFoot.innerHTML=foot||"";sheetFoot.hidden=!foot;sheetBody.scrollTop=0;
 // cabecera (título y Cerrar/Cancelar) fuera del área que se desplaza: así nada se ve pasar por encima o por detrás
 var hd=sheetBody.querySelector(".sh-head");sheetHead.innerHTML="";if(hd&&hd.parentNode===sheetBody)sheetHead.appendChild(hd);sheetHead.hidden=!sheetHead.firstChild;sheetHead.classList.remove("scrolled");sheet.hidden=false;document.documentElement.style.overflow="hidden";var dlg=sheet.querySelector(".sheet");if(dlg)try{dlg.focus({preventScroll:true})}catch(e){}}
function closeSheet(){flushPaid();revBack=false;if(docTitle0!==null){document.title=docTitle0;docTitle0=null}evEditing=null;expFile=null;impWrapper=null;impBackup=null;sheet.hidden=true;sheetBody.innerHTML="";sheetHead.innerHTML="";sheetFoot.innerHTML="";sheetFoot.hidden=true;document.documentElement.style.overflow="";editing=null}
function dayOptions(sel){return DAYS.map(function(d){return '<option value="'+d.d+'"'+(d.d===sel?" selected":"")+'>'+esc(cap(shortDay(d)))+' · '+esc(routeText(d))+'</option>'}).join("")+'<option value="trip"'+(sel==="trip"?" selected":"")+'>Todo el viaje (sin día)</option>'}
/* Campo de hora con una × para borrarla (el selector de hora del iPhone no tiene cómo dejarla vacía) */
function timeBox(id,v,l){return '<span class="tbox"><input id="'+id+'" type="time" value="'+esc(v||"")+'" aria-label="'+l+'"><button type="button" class="tclr" data-act="t-clr" data-for="'+id+'" aria-label="Quitar '+l.toLowerCase()+'"'+(v?"":" hidden")+'>'+svg("xmark",16)+'</button></span>'}
function syncTimeClr(el){var b=el.parentNode&&el.parentNode.querySelector(".tclr");if(b)b.hidden=!el.value}
function timeLabel(t){return t==="hotel"?"Check-in y check-out":TRIPT[t]?"Salida y llegada":"Hora de inicio y fin"}
function openDocSheet(o){
 var d=o.id?docs.filter(function(x){return x.id===o.id})[0]:null;editing=d||null;
 selType=d?d.type:(o.type||"hotel");
 locS={1:newLoc(d&&d.loc1,d&&d.loc1u,d&&d.loc1c),2:newLoc(d&&d.loc2,d&&d.loc2u,d&&d.loc2c)};
 legSel=d&&d.leg!=null?docLegVal(d):(o.leg!=null&&o.leg!==""?(String(o.leg).indexOf("-")<0?o.leg+"-0":String(o.leg)):"");legManual=!!(d||legSel!=="");
 var dayId=d?d.dayId:o.day;formDay=dayId;toSel=d?(d.nightTo||(d.type==="hotel"?d.dayId:"")):(o.to||"");
 viaOpen=false;
 // tipo por defecto: el pedido si ese día se puede; si no, el primero disponible (el 27 no hay hotel: es en el avión)
 if(!d&&!typeOk(selType,dayId))selType=Object.keys(TYPES).filter(function(k){return typeOk(k,dayId)})[0]||"otro";
 if(!legSel&&!d){legSel=onlyLeg(dayId);if(legSel)legManual=true}
 fx={co:d&&d.company||"",no:d&&d.no||"",t1:d&&d.t1||"",t2:d&&d.t2||"",hops:d&&d.hops?d.hops.map(function(h){return Object.assign({},h)}):[],arr:d?docArr(d):0,arrManual:false,title:d?(d.titleAuto?"":d.title||""):(o.title||"")};
 if(d&&ARRT[d.type])fx.arrManual=fx.arr!==autoArr(d);   // lo ajustó a mano (p. ej. +2): se respeta
 syncFxShape();
 var types=Object.keys(TYPES).map(function(k){return '<button type="button" class="ty" role="radio" data-act="type" data-type="'+k+'" aria-checked="'+(k===selType)+'" aria-disabled="'+!typeOk(k,dayId)+'" style="--t:'+TYPES[k].t+'">'+svg(TYPE_ICON[k],22)+TYPES[k].l+'</button>'}).join("")+'<p class="tynote" id="f-tynote"'+(typeOk(selType,dayId)?" hidden":"")+'>'+esc(typeNote(selType,dayId))+'</p><p class="dupnote" id="f-dupnote"'+(dupTicketText(selType,dayId)?"":" hidden")+'>'+esc(dupTicketText(selType,dayId))+'</p>';
 var prev="";fileDel=false;
 if(d&&d.blob)prev=fileBtn(d);   // también imágenes: la miniatura ocupaba demasiado
 openSheet('<div class="sh-head"><h2 id="sh-title">'+(d?"Editar documento":"Nuevo documento")+'</h2>'+(d?'<button type="button" class="x" data-act="view" data-id="'+d.id+'">Cancelar</button>':'<button type="button" class="x" data-act="close">Cancelar</button>')+'</div>'+
 '<div class="field"><span class="fl">Archivo (PDF o foto)</span><div class="dropwrap"><label class="drop" for="f-file">'+svg("clip",22)+'<span id="f-name">'+(d&&d.fileName?esc(d.fileName):"Elegir archivo")+'<small>'+(d&&d.fileName?"Toca para reemplazarlo":"PDF del billete, la reserva o una captura")+'</small></span></label><button type="button" class="tclr fdel" data-act="file-del" id="f-filedel" aria-label="Quitar archivo"'+(d&&d.blob?"":" hidden")+'>'+svg("xmark",18)+'</button></div><input id="f-file" type="file" accept="application/pdf,image/*" hidden><p class="tynote" id="f-bignote" hidden></p></div><div id="f-prev">'+prev+'</div>'+
 '<div class="field"><span class="fl">Tipo'+REQ+'</span><div class="types" role="radiogroup" aria-label="Tipo de documento">'+types+'</div></div>'+
 '<div id="f-tiwrap" style="display:contents">'+titleArea()+'</div>'+
 '<div class="field"><label for="f-day" id="f-daylb">'+(selType==="hotel"?"Primera noche":"Día")+REQ+'</label><select id="f-day">'+dayOptions(dayId)+'</select></div>'+
 '<div id="f-towrap" style="display:contents">'+toField(dayId,selType,toSel)+'</div>'+
 '<div id="f-legwrap" style="display:contents">'+legField(dayId,selType,legSel)+'</div>'+
 '<div class="field"><label for="f-code">Código de reserva</label><input id="f-code" class="code" type="text" placeholder="Localizador o número" value="'+esc(d?d.code:"")+'" autocomplete="off" autocapitalize="characters"></div>'+
 priceField(d)+
 '<div id="f-loc">'+locFields(selType)+'</div>'+
 '<div id="f-timewrap" style="display:contents">'+timeArea()+'</div>'+
 '<label class="swrow"><span><b>Ocultar del calendario</b><small>Sigue en Documentos y en el día. Útil si no hay check-in ni horario, como en casa de un amigo.</small></span><input id="f-calhide" type="checkbox" class="sw" role="switch"'+(d&&d.calHide?" checked":"")+'></label>'+
 '<div class="field"><label for="f-note">Nota</label><textarea id="f-note" placeholder="Hora, dirección, andén...">'+esc(d?d.note:"")+'</textarea></div>'+
 '',
 '<p class="err" id="f-err" role="alert"></p><div class="actions">'+(d?'<button type="button" class="btn danger" data-act="delete">Eliminar</button>':"")+'<button type="button" class="btn primary" style="--c1:var(--accent)" data-act="save">Guardar</button></div>');
}
/* Abrir el archivo: las imágenes en el visor propio; los PDF con el visor de iOS (pasa páginas y hace zoom bien) */
function isImg(d){return (d.mime||"").indexOf("image/")===0}
function fileBtn(d){
 var lab=svg("file",18)+'Abrir '+esc(d.fileName||"archivo");
 return isImg(d)?'<button type="button" class="btn" data-act="img-view" data-id="'+d.id+'">'+lab+'</button>':'<a class="btn" href="'+objUrl(d)+'" target="_blank" rel="noopener">'+lab+'</a>';
}
/* ---- Visor de imágenes: ajustada a la pantalla, pellizcar para zoom, arrastrar, doble toque ----
   Abrirla como enlace mostraba la URL y la imagen a tamaño real, sin poder alejar. */
var vw=null;
function openViewer(d){
 if(!d||!d.blob)return;closeViewer();
 var canShare=false;try{canShare=!!(navigator.canShare&&navigator.share&&navigator.canShare({files:[new File([d.blob],d.fileName||"imagen",{type:d.mime||"image/png"})]}))}catch(e){}
 var el=document.createElement("div");el.className="viewer";el.id="viewer";el.setAttribute("role","dialog");el.setAttribute("aria-label",d.fileName||"Imagen");
 el.innerHTML='<div class="vwbar"><button type="button" class="vwbtn" data-act="vw-close" aria-label="Cerrar">'+svg("xmark",22)+'</button>'+(canShare?'<button type="button" class="vwbtn txt" data-act="vw-share" data-id="'+d.id+'">Compartir</button>':"")+'</div><div class="vwstage"><img id="vw-img" src="'+objUrl(d)+'" alt="'+esc(d.fileName||"Imagen")+'" draggable="false"></div>';
 document.body.appendChild(el);
 vw={el:el,img:el.querySelector("img"),stage:el.querySelector(".vwstage"),s:1,x:0,y:0,ov:document.documentElement.style.overflow};
 document.documentElement.style.overflow="hidden";
 vwBind();
}
function closeViewer(){if(!vw)return;vw.el.remove();document.documentElement.style.overflow=vw.ov;vw=null}
function vwApply(anim){
 // tamaño sin zoom (offsetWidth no cambia con transform): la imagen no se puede arrastrar fuera de la pantalla
 var W=vw.stage.clientWidth,H=vw.stage.clientHeight,w=vw.img.offsetWidth,h=vw.img.offsetHeight,mx=Math.max(0,(w*vw.s-W)/2),my=Math.max(0,(h*vw.s-H)/2);
 vw.x=Math.max(-mx,Math.min(mx,vw.x));vw.y=Math.max(-my,Math.min(my,vw.y));
 vw.img.style.transition=anim?"transform .2s ease":"none";
 vw.img.style.transform="translate("+vw.x+"px,"+vw.y+"px) scale("+vw.s+")";
}
function vwBind(){
 var st=vw.stage,t0=null,lastTap=0;
 function dist(a,b){return Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY)}
 function mid(a,b){return {x:(a.clientX+b.clientX)/2,y:(a.clientY+b.clientY)/2}}
 st.addEventListener("touchstart",function(e){
  var t=e.touches;
  if(t.length===2)t0={d:dist(t[0],t[1]),m:mid(t[0],t[1]),s:vw.s,x:vw.x,y:vw.y};
  else if(t.length===1){
   var now=Date.now();
   if(now-lastTap<300){   // doble toque: ajustada ↔ 2,5×, centrado donde se tocó
    var r=st.getBoundingClientRect(),cx=t[0].clientX-r.left-r.width/2,cy=t[0].clientY-r.top-r.height/2;
    if(vw.s>1){vw.s=1;vw.x=0;vw.y=0}else{vw.s=2.5;vw.x=-cx*1.5;vw.y=-cy*1.5}
    vwApply(true);lastTap=0;t0=null;e.preventDefault();return;
   }
   lastTap=now;t0={p:{x:t[0].clientX,y:t[0].clientY},x:vw.x,y:vw.y};
  }
 },{passive:false});
 st.addEventListener("touchmove",function(e){
  e.preventDefault();var t=e.touches;if(!t0)return;
  if(t.length===2&&t0.d){var m=mid(t[0],t[1]);vw.s=Math.max(1,Math.min(5,t0.s*dist(t[0],t[1])/t0.d));vw.x=t0.x+(m.x-t0.m.x);vw.y=t0.y+(m.y-t0.m.y);vwApply(false)}
  else if(t.length===1&&t0.p&&vw.s>1){vw.x=t0.x+(t[0].clientX-t0.p.x);vw.y=t0.y+(t[0].clientY-t0.p.y);vwApply(false)}
 },{passive:false});
 st.addEventListener("touchend",function(e){if(!e.touches.length){t0=null;if(vw&&vw.s<1.05){vw.s=1;vw.x=0;vw.y=0;vwApply(true)}}else if(e.touches.length===1)t0={p:{x:e.touches[0].clientX,y:e.touches[0].clientY},x:vw.x,y:vw.y}});
 // en computador: rueda para zoom
 st.addEventListener("wheel",function(e){e.preventDefault();vw.s=Math.max(1,Math.min(5,vw.s*(e.deltaY<0?1.15:1/1.15)));if(vw.s===1){vw.x=0;vw.y=0}vwApply(false)},{passive:false});
}
function shareImage(id){
 var d=docs.filter(function(x){return x.id===id})[0];if(!d||!d.blob)return;
 navigator.share({files:[new File([d.blob],d.fileName||"imagen",{type:d.mime||"image/png"})]}).catch(function(){});
}
/* ================= Ficha de solo lectura (documento) ================= */
function vField(l,h){return '<div class="field"><span class="fl">'+l+'</span>'+h+'</div>'}
function vTimes(t,a,b){
 var L=t==="hotel"?["Check-in","Check-out"]:TRIPT[t]?["Salida","Llegada"]:["Inicio","Fin"],c=[];
 if(a)c.push('<div><small>'+L[0]+'</small><b>'+esc(a)+'</b></div>');
 if(b)c.push('<div><small>'+L[1]+'</small><b>'+esc(b)+'</b></div>');
 return c.length?'<div class="vtimes">'+c.join("")+'</div>':"";
}
function vLeg(l,t,name,u,tag,sub){
 if(!t&&!name&&!u&&!tag)return "";
 return '<div class="vleg"><div><small>'+l+(tag?' · '+esc(tag):"")+'</small>'+(t?'<b>'+esc(t)+'</b>':"")+(sub?'<small class="vsub">'+esc(sub)+'</small>':"")+(name?'<span>'+esc(name)+'</span>':"")+'</div>'+(u?mapBtn(u):"")+'</div>';
}
function vType(icon,col,label,sub){return '<div class="vtype" style="--t:'+col+'"><span class="agi">'+svg(icon,18)+'</span><div><b>'+esc(label)+'</b>'+(sub?'<small>'+esc(sub)+'</small>':"")+'</div></div>'}
function docWhen(d){
 var dy=dayById(d.dayId);if(!dy)return "Todo el viaje";
 if(d.type==="hotel")return nightsText(d);
 return cap(shortDay(dy))+" · "+routeText(dy);
}
function openDocView(id){
 var d=docs.filter(function(x){return x.id===id})[0];if(!d){closeSheet();return}
 editing=null;
 var T=TYPES[d.type]||TYPES.otro,dy=dayById(d.dayId),h=vType(TYPE_ICON[d.type]||"file",T.t,T.l,docWhen(d));
 var tr=!!TRIPT[d.type];
 if(tr){
  var ix=placeIndex(),ss=docSegs(d),hp=d.hops,arrDt=docArr(d)>0?dayPlus(d.dayId,docArr(d)):null;
  h+=vLeg("Salida",d.t1,locLabel(d,1,ix),d.loc1u,hp?hp[0].no:d.no);
  if(ss.length>1){var ls=layoversOf(d,ss);
   for(var k=0;k<ss.length-1;k++){var l=ls[k];
    h+='<p class="vlay">'+svg("clock",15)+'<span>Escala en '+esc(ss[k].t.n)+(l?' · <b>'+esc(minText(l.min))+'</b>':"")+'</span></p>';
    if(l&&l.night)h+='<p class="vhide">Escala nocturna de '+esc(minText(l.min))+' en '+esc(ss[k].t.n)+'. Si vais a un hotel, añádelo como documento de ese día.</p>';
   }}
  h+=vLeg("Llegada",d.t2?d.t2+arrSuffix(d):"",locLabel(d,2,ix),d.loc2u,hp&&hp.length>1?hp[hp.length-1].no:"",arrDt?fmtDt(arrDt):"");
 }
 else h+=vTimes(d.type,d.t1,d.t2);
 if(d.code)h+=vField("Código de reserva",'<div class="tcode big"><code>'+esc(d.code)+'</code><button type="button" class="cp" data-act="copy" data-code="'+esc(d.code)+'" aria-label="Copiar código">'+svg("copy",18)+'</button></div>');
 if(d.price!=null)h+=vField("Precio",priceHTML(d));
 if(!tr)h+=locsHTML(d);
 if(d.blob){var u=objUrl(d);h+=vField("Archivo",isImg(d)?'<button type="button" class="vthumb" data-act="img-view" data-id="'+d.id+'" aria-label="Ver '+esc(d.fileName||"imagen")+'"><img class="prev" src="'+u+'" alt=""></button>':fileBtn(d))}
 if(d.note)h+=vField("Nota",'<p class="vtxt">'+esc(d.note)+'</p>');
 if(d.calHide)h+='<p class="vhide">'+svg("cal",16)+'Oculto del calendario</p>';
 openSheet('<div class="sh-head"><h2 id="sh-title">'+esc(d.title||T.l)+'</h2><button type="button" class="x" data-act="close">Cerrar</button></div>'+h,
  '<div class="actions"><button type="button" class="btn primary" style="--c1:var(--accent)" data-act="edit" data-id="'+d.id+'">Editar</button></div>');
}
/* Vuelo, tren y bus solo en días con traslado (el coche de alquiler sirve cualquier día).
   Una excursión (p. ej. a Toledo) llegará cuando se pueda editar la ruta. */
var NOLEG="Este día no tiene traslados. Elige un día con trayecto o, para una excursión, usa Entrada u Otro.";
function typeOk(t,dayId){
 var dy=dayById(dayId);
 if(t==="hotel")return !(dy&&dy.plane);              // noche en el avión: no hay hotel que poner
 if(t!=="vuelo"&&t!=="tren"&&t!=="bus")return true;
 return !!(dy&&dy.legs);
}
function typeNote(t,dayId){
 var dy=dayById(dayId);
 if(t==="hotel"&&dy&&dy.plane)return "La noche del "+dy.dt.getDate()+" es en el avión: no hace falta hotel. Si es para otra noche, elige ese día.";
 return NOLEG;
}
/* clicked: tipo deshabilitado que se acaba de tocar (se explica por qué) */
function refreshTypes(clicked){
 var day=curDay();
 sheetBody.querySelectorAll(".ty").forEach(function(x){x.setAttribute("aria-disabled",String(!typeOk(x.dataset.type,day)))});
 var n=$("#f-tynote");if(n){n.hidden=!(clicked||!typeOk(selType,day));n.textContent=typeNote(clicked||selType,day)}
 var dn=$("#f-dupnote"),dt=n&&!n.hidden?"":dupTicketText(selType,day);if(dn){dn.textContent=dt;dn.hidden=!dt}
}
/* Aviso (no bloquea) si todos los tramos del día ya tienen billete: puede ser el de otra persona */
function dupTicketText(t,dayId){
 if(editing||(t!=="vuelo"&&t!=="tren"&&t!=="bus"))return "";
 var day=dayById(dayId);if(!day||!day.legs)return "";
 if(pendTickets().some(function(p){return p.day.d===dayId}))return "";
 var own=docsOf(dayId).filter(function(d){return TRIPT[d.type]});if(!own.length)return "";
 var segs=[];day.legs.forEach(function(l,i){segs=segs.concat(legSegs(day,i))});
 var what=segs.length===1?"Ya tienes "+(own[0].type==="bus"?"el bus":own[0].type==="tren"?"el tren":own[0].type==="coche"?"el traslado":"el vuelo")+" "+segText(segs[0])+".":"Ya hay billete para todos los trayectos de este día.";
 return what+" Si es otro billete del mismo viaje (por ejemplo, de otra persona), puedes añadirlo.";
}
/* Título si no se escribe ninguno: tipo + lugar o trayecto ("Comida · Casa Lucio",
   "Vuelo · Medellín → Madrid"); si no hay nada más, solo el tipo. */
function autoTitle(d,dy){
 var t=TYPES[d.type].l;
 // traslados: compañía (o el tipo) + trayecto: "Iberia · Medellín → Madrid", "Hertz · Málaga"
 if(TRIPT[d.type]){var r=docSeg(d)||(d.type==="coche"?d.loc1||"":"");var c=d.company||t;return r?c+" · "+r:c}
 return d.loc1?t+" · "+d.loc1:t;
}
async function saveFromSheet(){
 captureFx();
 var tEl=$("#f-title"),title=tEl?tEl.value.trim():"",code=$("#f-code").value.trim(),note=$("#f-note").value.trim(),day=$("#f-day").value,file=$("#f-file").files[0];
 if(!typeOk(selType,day)){formErr(typeNote(selType,day),"type",$('.ty[aria-checked="true"]'));return}
 var pr=parsePrice($("#f-price").value);
 if(pr===undefined){formErr("El precio no es válido. Usa solo números, por ejemplo 125,50.","",$("#f-price"));return}
 var cur=$("#f-cur").value;
 var d=editing?Object.assign({},editing):{id:uid(),created:Date.now()};
 var t1=fx.t1||"",t2=fx.t2||"";
 if(t1&&t2&&selType!=="hotel"&&!TRIPT[selType]&&t2<=t1){formErr("La hora de fin debe ser posterior a la de inicio.","",$("#f-t2"));return}
 if(ARRT[selType]&&fx.arr<minArr()){formErr(arrMsg(),"",$("#f-t2")||$("#f-h"+(fx.hops.length-1)+"-t2"));return}
 var tr=!!TRIPT[selType],dy=dayById(day),ls=$("#f-leg"),idx=placeIndex(),slots=tr?[1,2]:[1];
 // No puede haber dos lugares con el mismo nombre y distinto enlace en la misma ciudad
 for(var si=0;si<slots.length;si++){
  var qn=slots[si],rq=queryLoc(qn,idx);
  if(rq.kind==="conflict"){
   var wc=rq.options.reduce(function(a,o){return a.concat(o.cities||[])},[]).filter(function(x,i,a){return a.indexOf(x)===i});
   formErr("Ya existe «"+locS[qn].t.trim()+"» en "+citiesText(wc)+" con otra ubicación. Usa la existente o cambia el nombre.","conflict",$("#f-loc"+qn));return}
 }
 d.type=selType;d.dayId=day;d.code=code;d.note=note;d.price=pr;d.cur=cur;d.t1=t1;d.t2=t2;
 var ch=$("#f-calhide");if(ch&&ch.checked)d.calHide=true;else delete d.calHide;   // campo nuevo opcional: las copias viejas siguen valiendo
 if(pr!=null)setKV("lastCur",cur);
 d.loc1=locS[1].t.trim();d.loc1u=locS[1].u;d.loc2=tr?locS[2].t.trim():"";d.loc2u=tr?locS[2].u:"";
 // ciudad elegida a mano: solo se guarda si ese día hay varias ciudades posibles
 [1,2].forEach(function(n){var k="loc"+n+"c",c=locS[n].c;if((n===1||tr)&&c&&needsCityChoice(ctxFor(n))&&d["loc"+n])d[k]=c;else delete d[k]});
 var lp=parseLeg(ls&&ls.value);
 d.leg=(tr&&dy&&dy.legs&&lp)?lp.leg:null;
 d.seg=d.leg!=null?lp.seg:0;
 if(d.leg!=null&&lp.to>lp.seg)d.segTo=lp.to;else delete d.segTo;
 // vuelo/tren/bus con escalas: horario y número por tramo; la salida y la llegada del billete son las de los extremos
 if(ARRT[selType]&&d.segTo!=null){
  d.hops=fx.hops.slice(0,d.segTo-d.seg+1).map(function(h){return {no:(h.no||"").trim(),t1:h.t1||"",t2:h.t2||""}});
  d.t1=d.hops[0].t1;d.t2=d.hops[d.hops.length-1].t2;delete d.no;
 }else{delete d.hops;var nv=(CO[selType]&&CO[selType][2])?(fx.no||"").trim():"";if(nv)d.no=nv;else delete d.no}
 if(TRIPT[selType]&&(fx.co||"").trim())d.company=fx.co.trim();else delete d.company;
 if(ARRT[selType]&&fx.arr>0)d.arr=fx.arr;else delete d.arr;
 var te=$("#f-to");if(selType==="hotel"&&te&&te.value)d.nightTo=te.value;else delete d.nightTo;
 // título vacío = automático (también al editar); titleAuto hace que se regenere y que el campo se vea vacío
 if(TRIPT[selType]){
  // traslados: título automático. Uno viejo con título escrito a mano lo conserva hasta que se le pone la compañía.
  var keep=editing&&TRIPT[editing.type]&&!editing.titleAuto&&editing.title&&!d.company;
  if(!keep){d.title=autoTitle(d,dy);d.titleAuto=true}
 }
 else if(title){d.title=title;delete d.titleAuto}
 else if(file){d.title=file.name.replace(/\.[^.]+$/,"");delete d.titleAuto}
 else{d.title=autoTitle(d,dy);d.titleAuto=true}
 if(fileDel&&!file){if(urls[d.id]){try{URL.revokeObjectURL(urls[d.id])}catch(e){}delete urls[d.id]}delete d.blob;delete d.fileName;delete d.mime;delete d.size}
 if(file){if(urls[d.id]){try{URL.revokeObjectURL(urls[d.id])}catch(e){}delete urls[d.id]}d.blob=file;d.fileName=file.name;d.mime=file.type||"application/octet-stream";d.size=file.size}
 var wasEdit=!!editing;await saveDoc(d);refresh();
 if(wasEdit){if(!revReturn())openDocView(d.id)}else closeSheet();
 toast("Documento guardado");
}

/* ================= Hoja: paradas de un traslado ================= */
var viaCtx=null;
function openViaSheet(dayId,i){
 var day=dayById(dayId);if(!day||!day.legs||!day.legs[i])return;
 viaCtx={d:dayId,i:i};
 var l=day.legs[i],v=viaOf(dayId,i),segs=legSegs(day,i);
 openSheet('<div class="sh-head"><h2 id="sh-title">Paradas del traslado</h2><button type="button" class="x" data-act="close">Cerrar</button></div>'+
 '<p class="foot" style="font-size:14px"><b>'+esc(nm(l.f)+" → "+nm(l.t))+'</b>. Si tienes reservas separadas (por ejemplo, un vuelo hasta Bilbao y un tren hasta Pamplona), añade la parada intermedia. Cada tramo tendrá su propio pendiente.</p>'+
 (v.length?'<ul class="rows">'+v.map(function(x,k){return '<li class="pl"><div><b>'+esc(x)+'</b></div><button type="button" class="x" data-act="via-del" data-k="'+k+'">Quitar</button></li>'}).join("")+'</ul>':"")+
 '<div class="field"><label for="v-name">Nueva parada</label><input id="v-name" type="text" placeholder="Ej. Bilbao" autocomplete="off"></div>'+
 (segs.length>1?'<div class="field"><label for="v-after">Dónde va</label><select id="v-after">'+segs.map(function(sg){return '<option value="'+sg.j+'"'+(sg.j===segs.length-1?" selected":"")+'>Entre '+esc(sg.f.n+" y "+sg.t.n)+'</option>'}).join("")+'</select></div>':"")+
 '<p class="err" id="v-err" role="alert"></p><div class="actions"><button type="button" class="btn primary" style="--c1:var(--accent)" data-act="via-add">Añadir parada</button></div>');
}
/* Se añadió (delta 1) o quitó (delta -1) la parada del punto p del traslado c.
   Al añadir, el tramo p-1 se parte en dos; al quitar, los tramos p-1 y p se juntan.
   Un billete de un tramo que se parte queda con la primera mitad (como antes); uno que
   cubre varios tramos sigue cubriéndolos, y sus horarios por tramo se parten o juntan. */
async function shiftSegs(c,p,delta){
 var list=docs.filter(function(d){return d.dayId===c.d&&d.leg===c.i&&TRIPT[d.type]});
 for(var k=0;k<list.length;k++){
  var d=Object.assign({},list[k]),s0=d.seg||0,multi=d.segTo!=null,t0=multi?d.segTo:s0,s1=s0,t1=t0,h=d.hops?d.hops.map(function(x){return Object.assign({},x)}):null;
  if(delta>0){
   if(s0>=p)s1=s0+1;
   if(multi&&t0>=p-1){t1=t0+1;if(h&&s0<=p-1){var q=p-1-s0,o=h[q]||{};h.splice(q,1,{no:o.no||"",t1:o.t1||"",t2:""},{no:"",t1:"",t2:o.t2||""})}}
  }else{
   if(s0>=p)s1=s0-1;
   if(multi&&t0>=p){t1=t0-1;if(h&&s0<=p-1){var r=p-1-s0,a=h[r]||{},b=h[r+1]||{};h.splice(r,2,{no:a.no||b.no||"",t1:a.t1||"",t2:b.t2||""})}}
  }
  if(s1===s0&&t1===t0)continue;
  d.seg=s1;
  if(multi){if(t1>s1){d.segTo=t1;if(h)d.hops=h}else{delete d.segTo;if(h&&h[0]){if(h[0].no&&!d.no)d.no=h[0].no}delete d.hops}}
  await saveDoc(d);
 }
}
async function addVia(){
 var nme=$("#v-name").value.trim();
 if(!nme){$("#v-err").textContent="Escribe el nombre de la parada.";return}
 var c=viaCtx,v=viaOf(c.d,c.i).slice(),sa=$("#v-after"),j=sa?Number(sa.value):v.length;
 v.splice(j,0,nme);
 await shiftSegs(c,j+1,1);
 await setKV("via:"+c.d+":"+c.i,v);
 closeSheet();refresh();toast("Parada añadida");
}
async function delVia(k){
 var c=viaCtx,v=viaOf(c.d,c.i).slice();if(k<0||k>=v.length)return;
 v.splice(k,1);
 await shiftSegs(c,k+1,-1);
 if(v.length)await setKV("via:"+c.d+":"+c.i,v);else await delKV("via:"+c.d+":"+c.i);
 refresh();openViaSheet(c.d,c.i);toast("Parada quitada");
}

/* ================= Hoja: editar listas de lugares y restaurantes ================= */
var listCtx=null,itemEd=null;
function listTitle(kind){return kind==="see"?"Qué ver":"Dónde comer"}
function openListSheet(cid,kind,reorder){
 listCtx={cid:cid,kind:kind};itemEd=null;
 var l=listOf(cid,kind),custom=Array.isArray(kv["pl:"+cid+":"+kind]),ro=!!reorder&&l.length>1;
 var rows=l.map(function(p){
  var txt='<div><b>'+esc(p.n)+'</b>'+(p.d?'<p>'+esc(p.d)+'</p>':"")+'</div>';
  // modo Reordenar: se arrastra desde la agarradera (el resto de la fila sigue desplazando la lista)
  if(ro)return '<li class="pl ord" data-id="'+esc(p.id)+'">'+txt+'<span class="hdl" role="button" aria-label="Mover '+esc(p.n)+'">'+svg("grip",20)+'</span></li>';
  // normal: toda la fila abre la edición (el lápiz es solo una pista)
  return '<li class="pl tap" data-act="item-edit" data-id="'+esc(p.id)+'">'+txt+'<span class="pen" aria-hidden="true">'+svg("pencil",17)+'</span></li>';
 }).join("");
 openSheet('<div class="sh-head"><h2 id="sh-title">'+listTitle(kind)+' · '+esc(nm(cid))+'</h2>'+(ro?"":'<button type="button" class="x" data-act="close">Cerrar</button>')+'</div>'+
  (ro?'<p class="foot" style="margin:0">Arrastra desde ≡ para cambiar el orden. También se verá así en el día.</p>':"")+
  (l.length?'<ul class="rows" id="pl-rows">'+rows+'</ul>':'<p class="foot">Lista vacía.</p>')+
  (custom&&!ro?'<div><button type="button" class="mini" data-act="list-reset">Restaurar lista original</button></div>':""),
  ro?'<div class="actions"><button type="button" class="btn" data-act="ord-cancel">Cancelar</button><button type="button" class="btn primary" style="--c1:var(--accent)" data-act="ord-done">Listo</button></div>'
   :'<div class="actions">'+(l.length>1?'<button type="button" class="btn" data-act="ord-start">Reordenar</button>':"")+'<button type="button" class="btn primary" style="--c1:var(--accent)" data-act="item-add">'+svg("plus",20)+'Añadir</button></div>');
 if(ro)bindReorder($("#pl-rows"));
}
/* Arrastrar filas desde la agarradera (puntero: dedo o ratón). La fila sigue al dedo y las demás
   se reacomodan; cerca de los bordes, la hoja se desplaza sola. */
function bindReorder(ul,onDrop,inPage){
 if(!ul)return;var drag=null;
 // dónde se desplaza: la hoja, o la página (plan del día en el mapa)
 var sc={top:function(){return inPage?window.scrollY:sheetBody.scrollTop},by:function(d){if(inPage)window.scrollTo(0,window.scrollY+d);else sheetBody.scrollTop+=d},
  box:function(){if(!inPage)return sheetBody.getBoundingClientRect();var nb=$("#bnav");return {top:0,bottom:nb&&!nb.hidden?nb.getBoundingClientRect().top:window.innerHeight}}};
 function rowsExcept(el){return [].slice.call(ul.children).filter(function(r){return r!==el})}
 ul.addEventListener("pointerdown",function(e){
  var h=e.target.closest(".hdl");if(!h)return;e.preventDefault();
  var li=h.closest("li");drag={li:li,y0:e.clientY+sc.top(),off0:li.offsetTop,id:e.pointerId,next0:li.nextElementSibling};
  li.classList.add("drag");try{h.setPointerCapture(e.pointerId)}catch(_){}
 });
 ul.addEventListener("pointermove",function(e){
  if(!drag||e.pointerId!==drag.id)return;e.preventDefault();
  var y=e.clientY,li=drag.li;
  // cambiar de lugar cuando el dedo pasa la mitad de otra fila
  var others=rowsExcept(li),before=null;
  for(var k=0;k<others.length;k++){var r=others[k].getBoundingClientRect();if(y<r.top+r.height/2){before=others[k];break}}
  if(before!==li.nextElementSibling)ul.insertBefore(li,before);
  // la fila sigue al dedo (en coordenadas del contenido, por si la hoja se desplaza) desde su nuevo lugar
  li.style.transform="translateY("+((y+sc.top()-drag.y0)-(li.offsetTop-drag.off0))+"px)";
  var sb=sc.box();
  if(y<sb.top+50)sc.by(-8);else if(y>sb.bottom-50)sc.by(8);
 });
 function end(e){if(!drag||(e&&e.pointerId!==drag.id))return;var moved=drag.li.nextElementSibling!==drag.next0;drag.li.classList.remove("drag");drag.li.style.transform="";drag=null;if(moved&&onDrop)onDrop()}
 ul.addEventListener("pointerup",end);ul.addEventListener("pointercancel",end);
}
async function saveOrder(){
 var c=listCtx,ul=$("#pl-rows");if(!c||!ul)return;
 var l=listOf(c.cid,c.kind),by={};l.forEach(function(p){by[p.id]=p});
 var ids=[].slice.call(ul.children).map(function(li){return li.dataset.id});
 var nl=ids.map(function(id){return by[id]}).filter(Boolean);
 if(nl.length!==l.length){openListSheet(c.cid,c.kind);return}
 var same=nl.every(function(p,i){return p===l[i]});
 if(!same){await setKV("pl:"+c.cid+":"+c.kind,nl.map(function(p){return Object.assign({},p)}));refresh();toast("Orden guardado")}
 openListSheet(c.cid,c.kind);
}
function openItemForm(id){
 var c=listCtx,p=id==null?null:listOf(c.cid,c.kind).filter(function(x){return x.id===id})[0]||null;
 itemEd=p;
 // quitado del mapa con «No es aquí» (y sin enlace con coordenadas): nota + deshacer
 var gk=p?"pl|"+itemKey(c.kind,c.cid,p):"",gn=p&&!coordsOf(p.u)&&geoOf(gk),note=gn&&gn.no?'<div class="bnbox"><p class="adrw">Quitado del mapa («No es aquí»). Pega el enlace de Google Maps del sitio correcto. Si no lo tienes ahora, toca «Más tarde»: no saldrá en el mapa y quedará en Sin ubicar hasta que pegues el enlace.</p><button type="button" class="btn" data-act="geo-undo" data-gk="'+esc(gk)+'">Estaba bien, deshacer</button></div>':"";
 openSheet('<div class="sh-head"><h2 id="sh-title">'+(p?"Editar":"Añadir")+' · '+esc(listTitle(c.kind))+'</h2><button type="button" class="x" data-act="item-back">'+(note?"Más tarde":"Cancelar")+'</button></div>'+note+
 '<div class="field"><label for="i-n">Nombre'+REQ+'</label><input id="i-n" type="text" placeholder="'+(c.kind==="see"?"Ej. Museo del Prado":"Ej. Casa Lucio")+'" value="'+esc(p?p.n:"")+'" autocomplete="off"></div>'+
 '<div class="field"><label for="i-d">Descripción</label><textarea id="i-d" placeholder="Qué es, qué pedir, horarios...">'+esc(p?p.d:"")+'</textarea></div>'+
 '<div class="field"><label for="i-u">Enlace de Google Maps</label><input id="i-u" type="text" placeholder="Si lo dejas vacío, el mapa busca por nombre" value="'+esc(p?p.u:"")+'" autocomplete="off"></div>'+
 '',
 '<p class="err" id="i-err" role="alert"></p><div class="actions">'+(p?'<button type="button" class="btn danger" data-act="item-del">Eliminar</button>':"")+'<button type="button" class="btn primary" style="--c1:var(--accent)" data-act="item-save">Guardar</button></div>');
}
async function saveItem(){
 var c=listCtx,n=$("#i-n").value.trim(),d=$("#i-d").value.trim(),u=$("#i-u").value.trim();
 if(!n){$("#i-err").textContent="Escribe un nombre.";return}
 if(u&&!/^https?:\/\/\S+$/i.test(u)){$("#i-err").textContent="El enlace debe empezar por https://";return}
 var l=listOf(c.cid,c.kind).map(function(x){return {id:x.id,n:x.n,d:x.d,u:x.u||""}});
 if(itemEd){l.forEach(function(x){if(x.id===itemEd.id){x.n=n;x.d=d;x.u=u}})}
 else l.push({id:"u"+Date.now().toString(36),n:n,d:d,u:u});
 await setKV("pl:"+c.cid+":"+c.kind,l);refresh();if(!revReturn())openListSheet(c.cid,c.kind);toast("Guardado");
}
async function deleteItem(){
 var c=listCtx,l=listOf(c.cid,c.kind).filter(function(x){return x.id!==itemEd.id});
 await setKV("pl:"+c.cid+":"+c.kind,l);await delKV(itemKey(c.kind,c.cid,itemEd));refresh();if(!revReturn())openListSheet(c.cid,c.kind);toast("Eliminado");
}

/* ================= Mapa (pestaña Mapa | Lista) =================
   Diseño acordado en PENDIENTES.md → "Diseño del mapa". Puntos: ubicaciones de los documentos
   (unidas por nombre + enlace) y sitios de Qué ver / Comer de cada ciudad. Las coordenadas salen
   de los enlaces largos de Google Maps; el resto queda "Sin ubicar" hasta conectar Google.
   El mapa en sí (Google Maps) está pendiente de la clave: mientras, se ve un aviso y la Lista. */
var mapState={mode:"list",day:"all",cats:{hotel:1,trans:1,see:1,eat:1,other:1},st:{0:1,1:1,2:1},only:false},mapFrom=null;
var MCATS=[["hotel","Hoteles"],["trans","Traslados"],["see","Qué ver"],["eat","Comer"],["other","Otros documentos"]];
/* Filtros (hoja): Logística, Planes y Estado (el estado solo afecta a los sitios de Planes). */
var MGROUPS={log:["hotel","trans","other"],plan:["see","eat"]},MST_ALL=["0","1","2","3"],MST_DEF=["0","1","2"];
function mapCatsIs(l){var k=Object.keys(mapState.cats);return k.length===l.length&&l.every(function(c){return mapState.cats[c]})}
function mapStIs(l){var k=Object.keys(mapState.st);return k.length===l.length&&l.every(function(x){return mapState.st[x]})}
function mapFiltered(){return !mapCatsIs(MGROUPS.log.concat(MGROUPS.plan))||!mapStIs(MST_DEF)}
function openMapFilters(){
 var chip=function(c){var l=MCATS.filter(function(x){return x[0]===c})[0][1];return '<button type="button" class="chip" data-act="mcat" data-c="'+c+'" aria-pressed="'+!!mapState.cats[c]+'">'+l+'</button>'};
 var grp=function(g,t,on,dis){return '<button type="button" class="mgh" data-act="mgrp" data-g="'+g+'" aria-pressed="'+on+'"'+(dis?" disabled":"")+'><span class="mchk">'+(on?svg("check",16):"")+'</span><span class="lab">'+t+'</span></button>'};
 var gOn=function(g){return MGROUPS[g].every(function(c){return mapState.cats[c]})},noPlan=!MGROUPS.plan.some(function(c){return mapState.cats[c]});
 openSheet('<div class="sh-head"><h2 id="sh-title">Filtros</h2><button type="button" class="x" data-act="close">Listo</button></div>'+
  '<section class="mgs">'+grp("log","Logística",gOn("log"))+'<div class="chips">'+MGROUPS.log.map(chip).join("")+'</div></section>'+
  '<section class="mgs">'+grp("plan","Planes",gOn("plan"))+'<div class="chips">'+MGROUPS.plan.map(chip).join("")+'</div></section>'+
  // sin Qué ver ni Comer, el estado no hace nada: en gris
  '<section class="mgs'+(noPlan?" off":"")+'">'+grp("st","Estado de los planes",mapStIs(MST_ALL),noPlan)+'<div class="chips">'+MST_ALL.map(function(x){return '<button type="button" class="chip" data-act="mst" data-v="'+x+'" aria-pressed="'+!!mapState.st[x]+'"'+(noPlan?" disabled":"")+'>'+STATUS[+x]+'</button>'}).join("")+'</div></section>',
  mapFiltered()?'<div class="actions"><button type="button" class="btn" data-act="mreset">Quitar filtros</button></div>':"");
}
/* ‹ › del día: Todo el viaje → día 1 → … → último día */
function mapStep(dir){
 var ids=["all"].concat(DAYS.map(function(d){return d.d})),cur=mapState.day==="today"?inTripToday():mapState.day,i=ids.indexOf(cur);
 var j=Math.max(0,Math.min(ids.length-1,(i<0?0:i)+dir));mapState.day=ids[j];renderMap();
}
var MCOL={see:"#7C3AED",eat:TYPES.comida.t},MICO={see:"star",eat:"comida"};
function isOnline(){return typeof navigator==="undefined"||navigator.onLine!==false}
function inTripToday(){var t=todayStr();return dayById(t)?t:null}
function mapDayId(){return mapState.day==="all"?null:mapState.day==="today"?inTripToday():mapState.day}
function placeByKey(pk){var m=/^([sr]):([a-z]+):(.+)$/.exec(pk||"");if(!m||!CITIES[m[2]])return null;var kind=m[1]==="s"?"see":"eat",p=listOf(m[2],kind).filter(function(x){return x.id===m[3]})[0];return p?{cid:m[2],kind:kind,p:p}:null}
function mapPoints(){
 var by={},list=[];
 function add(key,base){if(!by[key]){base.id="mp"+list.length;base.gk=key;by[key]=base;list.push(base)}return by[key]}
 docs.forEach(function(d){[1,2].forEach(function(n){
  if(n===2&&!TRIPT[d.type])return;
  var t=d["loc"+n];if(!t)return;
  var u=d["loc"+n+"u"]||"",cities=slotCities(ctxOf(d.dayId,d.type,n,docLegVal(d),{t:t,u:u,c:d["loc"+n+"c"]}));
  var p=add("d|"+normName(t)+"|"+u,{kind:"doc",cat:d.type==="hotel"?"hotel":TRIPT[d.type]?"trans":"other",type:d.type,name:t,url:u,city:cities&&cities.length===1?cities[0]:null,cities:cities,ll:coordsOf(u),docIds:[],evIds:[],days:{},refs:[]});
  if(p.docIds.indexOf(d.id)<0)p.docIds.push(d.id);
  var a=dayById(d.dayId);if(!a)return;            // documento de todo el viaje: solo en "Todo el viaje"
  if(d.type==="hotel"){var b=(d.nightTo&&dayById(d.nightTo))||a;for(var k=a.i;k<=Math.max(a.i,b.i);k++)p.days[DAYS[k].d]=1;return}
  var dd=d.dayId,tt=d.t1;
  if(n===2){var ar=dayPlus(d.dayId,docArr(d));dd=ar?dsOf(ar):d.dayId;tt=d.t2}
  if(dayById(dd)){p.days[dd]=1;p.refs.push({day:dd,t:tt||"",k:"d:"+d.id+":"+n,doc:d.id})}
 })});
 Object.keys(CITIES).forEach(function(cid){
  if(!hasInfo(cid))return;
  var cityDays=DAYS.filter(function(x){return x.stops.indexOf(cid)>=0}).map(function(x){return x.d});
  ["see","eat"].forEach(function(kind){listOf(cid,kind).forEach(function(it){
   var pk=itemKey(kind,cid,it),evs=evList().filter(function(e){return e.pk===pk}),u=it.u&&/^https?:\/\//i.test(it.u)?it.u:"";
   var p=add("pl|"+pk,{kind:"place",cat:kind,pk:pk,name:it.n,url:u,city:cid,cities:[cid],ll:coordsOf(u),docIds:[],evIds:evs.map(function(e){return e.id}),days:{},refs:[]});
   placeDays(cityDays,evs.map(function(e){return e.day})).forEach(function(x){p.days[x]=1});
   evs.forEach(function(e){p.refs.push({day:e.day,t:e.t1||"",k:"e:"+e.id,ev:e.id})});
  })});
 });
 applyGeo(list);
 return list;
}
function mapVisible(list){
 var dd=mapDayId();
 return list.filter(function(p){
  if(!mapState.cats[p.cat])return false;
  if(mapState.day!=="all"&&(!dd||!p.days[dd]))return false;
  if(p.kind==="place")return !!mapState.st[kv[p.pk]||0];
  return true;   // los documentos no tienen estado
 });
}
/* Plan del día: lo que tiene ese día (traslados y documentos con ubicación, y sitios añadidos o
   con evento). Lo que tiene hora va por hora y no se mueve; lo que no, donde lo deje el usuario
   (kv.plan[día] guarda el orden; va en la copia del itinerario). */
function dayPlan(dd,all){
 var items=[];if(!dd)return items;
 all.forEach(function(p){p.refs.forEach(function(r){if(r.day===dd)items.push({k:r.k,t:r.t,pid:p.id,p:p,doc:r.doc,ev:r.ev})})});
 return planOrder(items,(kv.plan||{})[dd]);
}
/* Hoteles del plan de un día, sin número. Arriba, donde se durmió anoche (de ahí sale la línea al 1);
   abajo, el de esta noche si es otro (check-in). Si anoche fue en el avión o en una escala sin
   hotel, arriba no va hotel sino esa noche (night). */
function planHotels(dd,all){
 var out={top:[],bottom:[],night:""},dy=dayById(dd);if(!dy)return out;
 var prev=DAYS[dy.i-1],hs=all.filter(function(p){return p.cat==="hotel"});
 out.top=prev?hs.filter(function(p){return p.days[prev.d]}):[];
 out.bottom=hs.filter(function(p){return p.days[dd]&&out.top.indexOf(p)<0});
 if(!out.top.length&&prev)out.night=nightLabel(prev);
 return out;
}
/* Lo que se ve: con «Solo el plan» (y un día elegido), el plan completo y sus hoteles aunque haya
   filtros puestos; si no, lo que dejan los filtros */
function mapShown(all){
 var dd=mapDayId();if(!(dd&&mapState.only))return mapVisible(all);
 var ids={},h=planHotels(dd,all);
 dayPlan(dd,all).forEach(function(x){ids[x.pid]=1});h.top.concat(h.bottom).forEach(function(p){ids[p.id]=1});
 return all.filter(function(p){return ids[p.id]});
}
function planHotelRow(p,lab){
 return '<li class="pl mrow tap" data-act="mcard" data-id="'+p.id+'"><span class="adri" style="--t:'+mapColor(p)+'">'+svg("bed",18)+'</span><div class="adrt"><b>'+esc(p.name)+'</b><p>'+lab+'</p>'+(p.ll?"":'<p class="adrw">Sin ubicar</p>')+'</div>'+mapBtn(mapHref(p))+'</li>';
}
function mapNumbers(all){var dd=mapDayId();return dd?planNumbers(dayPlan(dd,all)):{}}
function planRow(x,num){
 var p=x.p,tm=tmin(x.t)!=null,sub=[tm?x.t:"Sin hora"];
 if(x.doc){var d=docs.filter(function(y){return y.id===x.doc})[0];if(d)sub.push(d.title||(TYPES[d.type]||TYPES.otro).l)}
 else sub.push(listTitle(p.cat));
 return '<li class="pl mrow tap'+(tm?"":" ord")+'" data-act="mcard" data-id="'+p.id+'" data-k="'+esc(x.k)+'"><span class="adri mnum'+(p.ll?"":" un")+'" style="--t:'+mapColor(p)+'">'+num+'</span><div class="adrt"><b>'+esc(p.name)+'</b><p>'+esc(sub.join(" · "))+'</p>'+(p.ll?"":'<p class="adrw">Sin ubicar</p>')+'</div>'+
  (tm?'<span class="ptm" aria-label="Con hora: va en su hora">'+svg("clock",17)+'</span>':'<span class="hdl" data-act="hdl" role="button" aria-label="Mover '+esc(p.name)+'">'+svg("grip",20)+'</span>')+'</li>';
}
async function savePlan(){
 var ul=$("#m-plan"),dd=mapDayId();if(!ul||!dd)return;
 var keys=[].slice.call(ul.children).map(function(li){return li.dataset.k}).filter(Boolean);
 var pl=Object.assign({},kv.plan||{});pl[dd]=keys;await setKV("plan",pl);renderMap();
}
/* Sitios de Qué ver / Comer de un día que están en su plan (con un evento ese día) */
function planEvs(pk,dd){return evList().filter(function(e){return e.pk===pk&&e.day===dd})}
async function planToggle(pk,dd){
 var lp=placeByKey(pk);if(!lp||!dayById(dd))return;
 var evs=planEvs(pk,dd),list=evList().slice(),dy=dayById(dd);
 if(evs.length){
  if(evs.some(function(e){return e.t1}))return;   // con hora: se cambia desde el calendario
  list=list.filter(function(e){return !(e.pk===pk&&e.day===dd)});await setKV("events",list);toast("Quitado del plan del "+shortDay(dy));
 }else{
  list.push({id:uid(),title:lp.p.n,day:dd,t1:"",t2:"",note:"",pk:pk});await setKV("events",list);toast("Añadido al plan del "+shortDay(dy));
 }
 if(view==="map")renderMap();
}
function openPlanPicker(){
 var dd=mapDayId(),dy=dayById(dd);if(!dy)return;
 var h="";
 dy.stops.filter(hasInfo).forEach(function(cid){["see","eat"].forEach(function(kind){
  var l=listOf(cid,kind);if(!l.length)return;
  h+='<section class="adrg"><h3 class="lab">'+esc(listTitle(kind))+(dy.stops.filter(hasInfo).length>1?" · "+esc(nm(cid)):"")+'</h3><ul class="rows">'+l.map(function(it){
   var pk=itemKey(kind,cid,it),evs=planEvs(pk,dd),tm=evs.filter(function(e){return e.t1})[0],on=evs.length>0;
   return '<li class="pl"><button type="button" class="ppick" data-act="plan-pick" data-pk="'+esc(pk)+'" aria-pressed="'+on+'"'+(tm?" disabled":"")+'><span class="mchk">'+(on?svg("check",16):"")+'</span><span><b>'+esc(it.n)+'</b>'+(tm?'<small>Con hora ('+esc(tm.t1)+'): se cambia en el calendario</small>':"")+'</span></button></li>'}).join("")+'</ul></section>';
 })});
 openSheet('<div class="sh-head"><h2 id="sh-title">Añadir al plan · '+esc(shortDay(dy))+'</h2><button type="button" class="x" data-act="close">Listo</button></div>'+
  '<p class="foot" style="margin:0">Se añade sin hora y lo ordenas arrastrando en el plan. Si le pones hora (en el calendario), va en su hora.</p>'+(h||'<p class="foot">Este día no tiene sitios de Qué ver ni Comer.</p>'));
}
function mapColor(p){return p.kind==="place"?MCOL[p.cat]:(TYPES[p.type]||TYPES.otro).t}
function mapIcon(p){return p.kind==="place"?MICO[p.cat]:(TYPE_ICON[p.type]||"file")}
/* Abrir en Maps: el enlace del usuario manda siempre (lo encontrado por nombre solo pone el punto) */
function mapHref(p){if(p.url)return p.url;if(p.pid)return gmap(p.name)+"&query_place_id="+encodeURIComponent(p.pid);return gmap(p.name+(p.city?", "+nm(p.city):""))}
/* Cómo llegar: con coordenadas de su enlace, la ruta a ese punto; con un enlace sin coordenadas
   (corto), el propio enlace (la ficha de Google tiene «Cómo llegar»); si no, por nombre */
function dirHref(p){
 if(p.url&&!p.geo&&p.ll)return "https://www.google.com/maps/dir/?api=1&destination="+encodeURIComponent(p.ll.join(","));
 if(p.url)return p.url;
 var dest=p.ll?p.ll.join(","):p.name+(p.city?", "+nm(p.city):"");
 return "https://www.google.com/maps/dir/?api=1&destination="+encodeURIComponent(dest)+(p.pid?"&destination_place_id="+encodeURIComponent(p.pid):"");
}
function isShortMaps(u){return /^https?:\/\/(maps\.app\.goo\.gl|goo\.gl\/maps)\//i.test(u||"")}
/* Hotel de la noche y estaciones del día (para las distancias de la tarjeta) */
function dayAnchors(dd,list){
 var out=[];if(!dd)return out;
 list.forEach(function(p){if(!p.ll||!p.days[dd]||p.kind!=="doc")return;
  if(p.cat==="hotel")out.push({p:p,l:"del hotel"});
  else if(p.cat==="trans"&&p.refs.some(function(r){return r.day===dd}))out.push({p:p,l:"de "+p.name});
 });
 return out.sort(function(a,b){return (a.p.cat==="hotel"?0:1)-(b.p.cat==="hotel"?0:1)}).slice(0,3);
}
function mapSub(p){
 if(p.kind==="doc")return p.docIds.map(function(id){var d=docs.filter(function(x){return x.id===id})[0];return d?(d.title||(TYPES[d.type]||TYPES.otro).l):""}).filter(Boolean).join(" · ");
 var s=kv[p.pk]||0,o=[listTitle(p.cat)];if(s)o.push(STATUS[s]);
 p.evIds.forEach(function(id){var e=evList().filter(function(x){return x.id===id})[0];var dy=e&&dayById(e.day);if(dy)o.push(cap(shortDay(dy))+(e.t1?" "+e.t1:""))});
 return o.join(" · ");
}
function unlocWhy(p){
 if(p.kind==="doc")return isShortMaps(p.url)?"el enlace es corto y no trae la ubicación exacta. Ábrelo en Safari, copia la dirección larga de la barra y pégala en el documento.":p.url?"el enlace no trae coordenadas. Pega el enlace largo de Google Maps en el documento.":"no tiene enlace de Google Maps. Pégalo en el documento.";
 var g=geoOf(p.gk);
 if(g&&g.no)return "lo quitaste del mapa («No es aquí»). Pega su enlace largo de Google Maps en la lista.";
 if(!GM_ON||gFail)return p.url?"el enlace no trae coordenadas.":"no tiene enlace de Google Maps.";
 if(!isOnline())return "se ubicará al volver la conexión.";
 return "Google no lo encontró por su nombre. Pega su enlace largo de Google Maps en la lista.";
}
var revBack=false;   // a dónde volver al guardar o cancelar la edición (Revisar ubicaciones o el mapa)
function revReturn(){if(!revBack)return false;var f=revBack;revBack=false;f();return true}
function revEdit(b){
 revBack=openReview;
 if(b.dataset.doc){openDocSheet({id:b.dataset.doc});return}
 var lp=placeByKey(b.dataset.pk);if(!lp){revBack=false;return}
 listCtx={cid:lp.cid,kind:lp.kind};openItemForm(lp.p.id);
}
function reviewRow(p,why,num){
 var act=p.kind==="doc"?'data-act="rev-edit" data-doc="'+esc(p.docIds[0])+'"':'data-act="rev-edit" data-pk="'+esc(p.pk)+'"';
 return '<li class="pl mrow tap" '+act+'><span class="adri'+(num?" mnum":"")+(num&&!p.ll?" un":"")+'" style="--t:'+mapColor(p)+'">'+(num?num:svg(mapIcon(p),18))+'</span><div class="adrt"><b>'+esc(p.name)+'</b><p>'+esc(why)+'</p></div><span class="pen" aria-hidden="true">'+svg("pencil",17)+'</span></li>';
}
function openReview(){
 var all=mapPoints(),vis=mapShown(all),dd=mapDayId(),dy=dayById(dd),nums=mapNumbers(all),inPlan=[],seen={};
 // lo del plan del día sin ubicar o ubicado por nombre va primero: es lo que más importa revisar
 dayPlan(dd,all).forEach(function(x){var p=x.p;if(seen[p.id])return;seen[p.id]=1;if(!p.ll||p.geo)inPlan.push(p)});
 var rest=function(p){return inPlan.indexOf(p)<0};
 var un=vis.filter(function(p){return !p.ll&&rest(p)}),bn=vis.filter(function(p){return p.geo&&rest(p)});
 var why=function(p){var g=geoOf(p.gk);return p.kind==="doc"?(isShortMaps(p.url)?"Enlace corto":p.url?"Enlace sin coordenadas":"Sin enlace"):((g&&g.no?"Quitado del mapa":"No encontrado por nombre")+" · "+listTitle(p.cat)+(p.city?" · "+nm(p.city):""))};
 openSheet('<div class="sh-head"><h2 id="sh-title">Revisar ubicaciones</h2><button type="button" class="x" data-act="close">Cerrar</button></div>'+
  (inPlan.length?'<section class="adrg"><h3 class="lab">En el plan del '+esc(shortDay(dy))+' <small>'+inPlan.length+'</small></h3><ul class="rows">'+inPlan.map(function(p){return reviewRow(p,p.ll?"Ubicado por su nombre: comprueba que esté bien":"Sin ubicar · "+why(p),nums[p.id])}).join("")+'</ul></section>':"")+
  (un.length?'<section class="adrg"><h3 class="lab">Sin ubicar <small>'+un.length+'</small></h3><p class="foot" style="margin:0 0 8px">Para que salgan en el mapa, pega su enlace largo de Google Maps. Si tienes uno corto: ábrelo en Safari y copia la dirección de la barra.</p><ul class="rows">'+un.map(function(p){return reviewRow(p,why(p))}).join("")+'</ul></section>':"")+
  (bn.length?'<section class="adrg"><h3 class="lab">Ubicados por su nombre <small>'+bn.length+'</small></h3><p class="foot" style="margin:0 0 8px">Google los buscó por nombre: comprueba en el mapa que estén bien (borde punteado). Si alguno no, tócalo en el mapa → «No es aquí».</p><ul class="rows">'+bn.map(function(p){return reviewRow(p,listTitle(p.cat)+(p.city?" · "+nm(p.city):""))}).join("")+'</ul></section>':"")+
  (inPlan.length||un.length||bn.length?"":'<p class="foot">Todo está ubicado con su enlace.</p>'));
}
function mapRow(p,num){
 return '<li class="pl mrow tap" data-act="mcard" data-id="'+p.id+'"><span class="adri'+(num?" mnum":"")+(num&&!p.ll?" un":"")+(p.geo?" bn":"")+'" style="--t:'+mapColor(p)+'">'+(num?num:svg(mapIcon(p),18))+'</span><div class="adrt"><b>'+esc(p.name)+'</b><p>'+esc(mapSub(p))+'</p>'+(p.ll?"":'<p class="adrw">Sin ubicar</p>')+'</div>'+mapBtn(mapHref(p))+'</li>';
}
function fixedPlacesHTML(used,order){
 var l=PLACES.filter(function(x){return !used.some(function(n){return normName(n)===normName(x.n)})})
  .map(function(x){return {n:x.n,u:x.u,c:detectCity(x.n,x.u)}})
  .sort(function(a,b){var ia=order.indexOf(a.c),ib=order.indexOf(b.c);return (ia<0?1e3:ia)-(ib<0?1e3:ib)});
 if(!l.length)return "";
 return '<details class="adrx"><summary>'+(l.length<PLACES.length?"Otras estaciones":"Estaciones")+' y aeropuertos de la app <small>'+l.length+'</small><span class="cv">'+svg("chev",18)+'</span></summary>'+
  '<p class="foot">Se sugieren al escribir una ubicación. No se guardan ni van en la copia.</p><ul class="rows">'+l.map(function(x){
   var ty=/aeropuerto/i.test(x.n)?"vuelo":/autobuses/i.test(x.n)?"bus":"tren";
   return '<li class="pl adr"><span class="adri" style="--t:'+TYPES[ty].t+'">'+svg(TYPE_ICON[ty],18)+'</span><div class="adrt"><b>'+esc(x.n)+'</b>'+(x.c?'<p>'+esc(nm(x.c))+'</p>':"")+'</div>'+mapBtn(x.u)+'</li>'}).join("")+'</ul></details>';
}
function renderMap(){
 var all=mapPoints(),vis=mapShown(all),nums=mapNumbers(all),order=[],groups={};
 DAYS.forEach(function(d){d.stops.forEach(function(s){if(order.indexOf(s)<0)order.push(s)})});
 var td=inTripToday();if(mapState.day==="today"&&!td)mapState.day="all";
 var dayOpts='<option value="all">Todo el viaje</option>'+(td?'<option value="today"'+(mapState.day==="today"?" selected":"")+'>Hoy</option>':"")+DAYS.map(function(d){return '<option value="'+d.d+'"'+(mapState.day===d.d?" selected":"")+'>'+esc(cap(shortDay(d)))+' · '+esc(routeText(d))+'</option>'}).join("");
 var dd=mapDayId(),dy=dayById(dd),plan=dayPlan(dd,all),hot=planHotels(dd,all),hotIds={};
 hot.top.concat(hot.bottom).forEach(function(p){hotIds[p.id]=1});
 var dlab=dy?'<b>'+(mapState.day==="today"?"Hoy · ":"")+esc(cap(shortDay(dy)))+'</b><small>'+esc(routeText(dy))+'</small>':'<b>Todo el viaje</b><small>'+DAYS[0].dt.getDate()+' '+MO3[DAYS[0].dt.getMonth()]+' – '+DAYS[DAYS.length-1].dt.getDate()+' '+MO3[DAYS[DAYS.length-1].dt.getMonth()]+'</small>';
 var atFirst=mapState.day==="all",atLast=dd===DAYS[DAYS.length-1].d;
 var unloc=vis.filter(function(p){return !p.ll}).length,segs=[],gaps={un:[],fil:[]};
 if(dd){
  // la línea sale del hotel de la mañana y sigue 1 → 2 → 3 (sin volver al hotel al final)
  var h0=hot.top[0],last=h0&&h0.ll&&vis.indexOf(h0)>=0?h0.ll:null,gap=false,done={};
  plan.forEach(function(x){
   if(done[x.pid])return;done[x.pid]=1;
   var shown=x.p.ll&&vis.indexOf(x.p)>=0;
   if(!shown){gap=true;(x.p.ll?gaps.fil:gaps.un).push(nums[x.pid]);return}
   if(last)segs.push({a:last,b:x.p.ll,gap:gap});
   last=x.p.ll;gap=false;
  });
 }
 // aviso encima del mapa: qué número del plan no sale y por qué (tocarlo lleva a arreglarlo)
 var nlist=function(l){return l.length===1?"El "+l[0]:"El "+l.slice(0,-1).join(", el ")+" y el "+l[l.length-1]};
 var gapNote="";
 if(mapState.mode==="map"&&dd){
  if(gaps.un.length)gapNote+='<button type="button" class="mgap un" data-act="mreview">'+svg("pin",16)+'<span>'+nlist(gaps.un)+(gaps.un.length>1?" no salen":" no sale")+' en el mapa: sin ubicar</span>'+svg("chev",16)+'</button>';
  if(gaps.fil.length)gapNote+='<button type="button" class="mgap" data-act="monly-on">'+svg("filter",16)+'<span>'+nlist(gaps.fil)+(gaps.fil.length>1?" están ocultos":" está oculto")+' por los filtros</span>'+svg("chev",16)+'</button>';
 }
 var body;
 if(mapState.mode==="map"){
  var off=!isOnline();
  if(GM_ON&&!off&&!gFail)body='<div class="mapbox"><div class="mapctl"><button type="button" class="mctl" data-act="m-me" aria-label="Mi ubicación">'+svg("locate",20)+'</button><button type="button" class="mctl" data-act="m-fit" aria-label="Encuadrar todo">'+svg("fit",20)+'</button></div></div>';
  else body='<div class="mapph">'+svg("route",34)+'<b>'+(off?"Sin internet: el mapa no se puede mostrar":gFail?"No se pudo cargar el mapa de Google":"Aquí irá el mapa")+'</b><span>'+(off?"La lista funciona igual sin conexión.":gFail?"Prueba más tarde. Mientras, la lista funciona igual.":"Falta conectar Google Maps. Mientras, usa la lista.")+'</span><button type="button" class="btn" data-act="mmode" data-v="list">Ver como lista</button></div>';
 }else{
  var ph="";
  if(dy){
   var seenN={};
   var hl=function(l,lab){return l.length?'<ul class="rows mhot">'+l.map(function(p){return planHotelRow(p,typeof lab==="function"?lab(p):lab)}).join("")+'</ul>':""};
   var nr=hot.night?'<ul class="rows mhot"><li class="pl mrow mnight"><span class="adri" style="--t:var(--muted)">'+svg(TYPE_ICON.vuelo,18)+'</span><div class="adrt"><b>'+esc(hot.night)+'</b></div></li></ul>':"";
   ph='<section class="adrg"><h3 class="lab">Plan del día</h3>'+nr+hl(hot.top,function(p){return p.days[dd]?"Hotel de la noche":"Hotel de anoche · check-out"})+(plan.length?'<ul class="rows" id="m-plan">'+plan.map(function(x){var n=nums[x.pid];var r=seenN[x.pid]?"":planRow(x,n);seenN[x.pid]=1;return r}).join("")+'</ul>'+(plan.some(function(x){return tmin(x.t)==null})?'<p class="foot">Lo que tiene hora va en su hora. Lo demás se ordena arrastrando desde ≡.</p>':""):'<p class="foot">Nada todavía. Añade sitios de Qué ver y Comer y ordénalos.</p>')+hl(hot.bottom,"Hotel de esta noche · check-in")+
    (dy.stops.some(hasInfo)?'<div><button type="button" class="mini" data-act="plan-add">'+svg("plus",14)+'Añadir sitio</button></div>':"")+'</section>';
  }
  vis.forEach(function(p){if(nums[p.id]||(dy&&hotIds[p.id]))return;var k=p.city&&order.indexOf(p.city)>=0?p.city:"_";(groups[k]=groups[k]||[]).push(p)});
  var co={hotel:0,trans:1,other:2,see:3,eat:4};
  var keys=order.filter(function(k){return groups[k]}).concat(groups._?["_"]:[]);
  body=keys.map(function(k){var g=groups[k].sort(function(a,b){var na=nums[a.id]||1e3,nb=nums[b.id]||1e3;return na-nb||co[a.cat]-co[b.cat]||a.name.localeCompare(b.name)});
   return '<section class="adrg"><h3 class="lab">'+(dy?"Más en ":"")+(k==="_"?"Sin ciudad definida":esc(nm(k)))+' <small>'+g.length+'</small></h3><ul class="rows">'+g.map(function(p){return mapRow(p,nums[p.id])}).join("")+'</ul></section>'}).join("")||(ph?"":'<p class="foot">Nada con estos filtros.</p>');
  body=ph+body;
  if(mapState.day==="all"&&mapState.cats.trans)body+=fixedPlacesHTML(all.filter(function(p){return p.kind==="doc"}).map(function(p){return p.name}),order);
 }
 var isMap=mapState.mode==="map";
 V.map.innerHTML='<div class="in"><div class="page-h mh">'+(mapFrom?'<a class="back" href="'+esc(mapFrom)+'" aria-label="Volver al día">'+svg("back",20)+'</a>':"")+'<h1>Mapa</h1>'+
  '<button type="button" class="mctl mhb" data-act="mmode" data-v="'+(isMap?"list":"map")+'" aria-label="'+(isMap?"Ver como lista":"Ver en el mapa")+'">'+svg(isMap?"list":"route",20)+'</button>'+
  '<button type="button" class="mctl mhb" data-act="mfilt" aria-label="Filtros'+(mapFiltered()?" (hay filtros puestos)":"")+'">'+svg("filter",20)+(mapFiltered()?'<i class="mdot"></i>':"")+'</button></div>'+
  '<div class="mday"><button type="button" class="mstep" data-act="mstep" data-d="-1" aria-label="Día anterior"'+(atFirst?" disabled":"")+'>'+svg("back",20)+'</button>'+
  '<label class="mdsel"><span class="mdl">'+dlab+'</span>'+svg("chev",16)+'<select id="m-day" aria-label="Día">'+dayOpts+'</select></label>'+
  '<button type="button" class="mstep" data-act="mstep" data-d="1" aria-label="Día siguiente"'+(atLast?" disabled":"")+'>'+svg("chev",20)+'</button></div>'+
  '<div class="mcrow"><p class="mcount">'+(dd&&mapState.only&&!plan.length?"Nada en el plan de este día":vis.length+(vis.length===1?" lugar":" lugares"))+(unloc?' · <button type="button" class="mrev" data-act="mreview">'+unloc+' sin ubicar</button>':vis.some(function(p){return p.geo})?' · <button type="button" class="mrev" data-act="mreview">Revisar ubicaciones</button>':"")+'</p>'+
  (dy?'<button type="button" class="mtog" role="switch" data-act="monly" aria-checked="'+!!mapState.only+'"><span>Solo el plan</span><i></i></button>':"")+'</div>'+gapNote+
  '<div class="dgroups">'+body+'</div>'+(isMap?"":'<div class="fabspace"></div>')+'</div>';
 mapFull();
 if(isMap&&V.map.querySelector(".mapbox"))mountMap(vis,nums,segs);
 if(!isMap&&$("#m-plan"))bindReorder($("#m-plan"),savePlan,true);
 geoRun(all);   // ubica por nombre lo que falte (con internet y con Google conectado)
}
function openMapCard(id){
 var all=mapPoints(),p=all.filter(function(x){return x.id===id})[0];if(!p)return;
 var dd=mapDayId()||inTripToday(),h=vType(mapIcon(p),mapColor(p),p.kind==="place"?listTitle(p.cat):(TYPES[p.type]||TYPES.otro).l,p.city?nm(p.city):"");
 if(p.ll){
  var an=dayAnchors(dd,all).filter(function(a){return a.p!==p});
  // a más de 3 km no se pone tiempo a pie (nadie va andando): solo la distancia en línea recta
  var anyW=an.some(function(a){return distKm(p.ll,a.p.ll)<=WALK_KM}),anyF=an.some(function(a){return distKm(p.ll,a.p.ll)>WALK_KM});
  if(an.length)h+='<ul class="mdist">'+an.map(function(a,i){var km=distKm(p.ll,a.p.ll),w=km<=WALK_KM;return '<li>'+svg(w?"clock":"pin",15)+'<span><b><span class="dk" data-i="'+i+'">'+distText(km)+'</span> '+esc(a.l)+'</b>'+(w?' · <span class="wk" data-i="'+i+'">≈ '+walkText(walkMin(km))+' a pie</span>':"")+'</span></li>'}).join("")+'</ul>'+
   '<p class="foot" style="margin:0">'+(anyW?'<span id="md-note">Estimado en línea recta'+(isOnline()?"":" (sin internet)")+'.</span>':"")+(anyF?(anyW?" ":"")+"A más de 3 km, solo la distancia aproximada.":"")+'</p>';
  if(p.geo)h+='<div class="bnbox"><p class="adrw">Ubicado buscando el nombre: puede no ser exacto.</p><button type="button" class="btn" data-act="geo-no" data-gk="'+esc(p.gk)+'" data-pk="'+esc(p.pk)+'" data-id="'+p.id+'">No es aquí</button></div>';
 }else{h+='<p class="adrw" style="align-self:flex-start">Sin ubicar: '+unlocWhy(p)+'</p>';
  var gq=p.kind==="place"&&geoOf(p.gk);
  if(gq&&gq.no)h+='<div><button type="button" class="btn" data-act="geo-undo" data-gk="'+esc(p.gk)+'">'+(gq.prev?"Volver a ponerlo donde estaba":"Volver a buscarlo por su nombre")+'</button></div>';
 }
 if(p.kind==="place")h+=vField("Estado",statSel(p.pk));
 var pdy=dayById(dd);
 if(p.kind==="place"&&pdy&&p.city&&pdy.stops.indexOf(p.city)>=0){
  var pev=planEvs(p.pk,dd),ptm=pev.filter(function(e){return e.t1})[0];
  h+=ptm?'<p class="foot" style="margin:0">En el plan del '+esc(shortDay(pdy))+' a las '+esc(ptm.t1)+' (la hora se cambia en el calendario).</p>'
   :'<div><button type="button" class="btn'+(pev.length?"":" primary")+'" style="--c1:var(--accent)" data-act="plan-one" data-pk="'+esc(p.pk)+'" data-day="'+dd+'">'+(pev.length?"Quitar del plan del "+esc(shortDay(pdy)):svg("plus",18)+"Añadir al plan del "+esc(shortDay(pdy)))+'</button></div>';
 }
 if(p.docIds.length)h+=vField(p.docIds.length>1?"Documentos":"Documento",'<ul class="adru">'+p.docIds.map(function(did){var d=docs.filter(function(x){return x.id===did})[0];if(!d)return "";var dy=dayById(d.dayId);return '<li><button type="button" class="mini" data-act="view" data-id="'+d.id+'">'+esc(d.title||(TYPES[d.type]||TYPES.otro).l)+(dy?' · '+esc(shortDay(dy)):"")+'</button></li>'}).join("")+'</ul>');
 if(p.evIds.length)h+=vField("En el calendario",'<ul class="adru">'+p.evIds.map(function(eid){var e=evList().filter(function(x){return x.id===eid})[0];var dy=e&&dayById(e.day);return e?'<li><button type="button" class="mini" data-act="ev-view" data-id="'+e.id+'">'+esc(dy?cap(shortDay(dy)):"")+(e.t1?' · '+esc(e.t1):"")+'</button></li>':""}).join("")+'</ul>');
 openSheet('<div class="sh-head"><h2 id="sh-title">'+esc(p.name)+'</h2><button type="button" class="x" data-act="close">Cerrar</button></div>'+h,
  '<div class="actions"><a class="btn" href="'+esc(mapHref(p))+'" target="_blank" rel="noopener">Abrir en Maps</a><a class="btn primary" style="--c1:var(--accent)" href="'+esc(dirHref(p))+'" target="_blank" rel="noopener">Cómo llegar</a></div>');
 // con internet, el tiempo a pie real de Google reemplaza al estimado
 if(GM_ON&&!gFail&&isOnline()&&p.ll){var an2=dayAnchors(dd,all).filter(function(a){return a.p!==p});
  an2.forEach(function(a,i){if(distKm(p.ll,a.p.ll)>WALK_KM)return;routesWalk(a.p.ll,p.ll).then(function(r){var w=sheetBody.querySelector('.wk[data-i="'+i+'"]');if(!w)return;w.textContent=walkText(r.min)+" a pie";
   var dk=sheetBody.querySelector('.dk[data-i="'+i+'"]');if(dk&&r.km)dk.textContent=distText(r.km);var nt=$("#md-note");if(nt)nt.textContent="Distancia y tiempo a pie según Google Maps."}).catch(function(){})})}
}
if(typeof window!=="undefined"){window.addEventListener("online",function(){if(view==="map")renderMap()});window.addEventListener("offline",function(){if(view==="map")renderMap()})}
/* ---- Google Maps: mapa, coordenadas por nombre y tiempo a pie ----
   La clave va en el código a propósito: el mapa se dibuja en el navegador. Está restringida en
   Google Cloud a nicozapatacruz.github.io/tripapp/* y localhost, y solo a Maps JavaScript,
   Geocoding y Routes (en prueba gratuita hasta ~8 feb 2027: no cobra; ver PENDIENTES.md). */
var GM_KEY="AIzaSyAE46uJ7JtkDkKJY9nN7OARfz0qlcKkXDc",GM_MAPID="83a25be103270202f5082791";
var GM_ON=!!GM_KEY&&!(typeof navigator!=="undefined"&&/jsdom/i.test(navigator.userAgent||""));   // en los tests no se carga Google
var gmP=null,gm=null,gmEl=null,gmMarkers=[],gmMe=null,gmLines=[],gFail=false,gmFitKey="",gmKeep=false;
if(GM_ON)mapState.mode="map";
window.gm_authFailure=function(){gFail=true;if(view==="map")renderMap()};   // clave rechazada por Google
function loadGM(){
 if(gmP)return gmP;
 gmP=new Promise(function(res,rej){
  window.__gmReady=function(){res()};
  var s=document.createElement("script");
  s.src="https://maps.googleapis.com/maps/api/js?key="+GM_KEY+"&v=weekly&language=es&region=ES&loading=async&callback=__gmReady";
  s.async=true;s.onerror=function(){gmP=null;rej(new Error("maps"))};
  document.head.appendChild(s);
 });
 return gmP;
}
/* Coordenadas buscadas por nombre: Google solo permite guardarlas 30 días (el place_id, sin
   límite), así que se renuevan pasado ese tiempo. Clave de dispositivo: no va en el itinerario. */
var GEO_DAYS=30,geoTried={},geoBusy=false;
function geoOf(k){var g=kv.geo&&kv.geo[k];return g||null}
function geoFresh(g){return !!g&&Date.now()-(g.t||0)<GEO_DAYS*864e5}
function applyGeo(list){list.forEach(function(p){if(p.ll||p.kind==="doc")return;var g=geoOf(p.gk);if(g&&g.no)return;if(geoFresh(g)&&g.ll){p.ll=g.ll;p.pid=g.pid||"";p.geo=true}})}
/* «No es aquí»: el sitio queda sin ubicar (y no se vuelve a buscar) hasta que se le pegue un enlace */
async function geoNo(gk,pk,id){
 // se guarda el punto que tenía (prev) para poder deshacerlo sin volver a buscarlo
 var geo=Object.assign({},kv.geo||{}),old=geo[gk];geo[gk]={no:1,t:Date.now()};if(old&&old.ll)geo[gk].prev=old;await setKV("geo",geo);
 if(view==="map")renderMap();
 var lp=placeByKey(pk);if(!lp){closeSheet();toast("Quitado del mapa");return}
 listCtx={cid:lp.cid,kind:lp.kind};openItemForm(lp.p.id);
 revBack=function(){openMapCard(id)};   // al guardar, deshacer o «Más tarde», de vuelta a la tarjeta
}
/* Deshacer «No es aquí»: vuelve al punto de antes; si no se guardó (quitado antes de esto), se busca otra vez */
async function geoUndo(gk){
 var geo=Object.assign({},kv.geo||{}),g=geo[gk];
 if(g&&g.prev)geo[gk]=g.prev;else delete geo[gk];
 delete geoTried[gk];await setKV("geo",geo);
 if(!revReturn())closeSheet();
 if(view==="map")renderMap();
 toast(g&&g.prev?"Vuelve a estar en el mapa":"Se buscará otra vez por su nombre");
}
function geoQuery(p){
 var city=p.city&&CITIES[p.city]?CITIES[p.city]:null;
 return p.name+(city?", "+city.name+(p.city==="medellin"?", Colombia":", España"):"");
}
function nearCity(p,ll){var c=p.city&&CCOORD[p.city];if(!c)return true;return distKm([c[0],c[1]],ll)<=c[2]*1.5}
async function geoRun(list){
 if(!GM_ON||gFail||geoBusy||!isOnline())return;
 var todo=list.filter(function(p){var g=geoOf(p.gk);return p.kind==="place"&&!p.ll&&!geoTried[p.gk]&&!(g&&g.no)&&!(geoFresh(g)&&g.bad)}).slice(0,40);
 if(!todo.length)return;
 geoBusy=true;
 try{
  await loadGM();
  var lib=await google.maps.importLibrary("geocoding"),geocoder=new lib.Geocoder(),geo=Object.assign({},kv.geo||{}),changed=0;
  for(var i=0;i<todo.length;i++){
   var p=todo[i],old=geo[p.gk];geoTried[p.gk]=1;
   var req=old&&old.pid?{placeId:old.pid}:{address:geoQuery(p)};
   try{
    var r=await geocoder.geocode(req),res=r&&r.results&&r.results[0];
    if(res){var ll=[res.geometry.location.lat(),res.geometry.location.lng()];
     // un resultado genérico (la ciudad, la región, el país) no sirve: con nombres propios como
     // «Casa» Google devuelve el centro de la ciudad, y el punto quedaría mal puesto
     var gen=(res.types||[]).some(function(t){return /^(locality|political|country|administrative_area_level_\d|postal_code|sublocality.*)$/.test(t)});
     geo[p.gk]=!gen&&nearCity(p,ll)?{ll:ll,pid:res.place_id||"",t:Date.now()}:{bad:1,t:Date.now()};changed++}
   }catch(e){ if(String(e&&e.code||e).indexOf("ZERO_RESULTS")>=0){geo[p.gk]={bad:1,t:Date.now()};changed++} }
   await new Promise(function(r){setTimeout(r,120)});   // sin prisa: no saturar el cupo
  }
  if(changed){await setKV("geo",geo);if(view==="map")renderMap()}
 }catch(e){}
 geoBusy=false;
}
function gmPin(p,num){
 var el=document.createElement("div");el.className="gpin"+(num?" num":"")+(p.geo?" byname":"");el.style.setProperty("--t",mapColor(p));
 el.innerHTML=num?String(num):svg(mapIcon(p),15);return el;
}
function mapFull(){document.body.classList.toggle("mapfull",view==="map"&&mapState.mode==="map")}
async function mountMap(vis,nums,segs){
 var box=V.map.querySelector(".mapbox");if(!box)return;
 // alto: hasta justo encima de la barra de abajo (así los botones y el logo de Google no quedan tapados)
 var nb=$("#bnav"),top=box.getBoundingClientRect().top+window.scrollY,navH=nb&&!nb.hidden?nb.offsetHeight:0;
 if(window.innerHeight)box.style.height=Math.max(320,Math.round(window.innerHeight-top-navH-12))+"px";
 if(!gmEl){gmEl=document.createElement("div");gmEl.className="gmap"}
 box.insertBefore(gmEl,box.firstChild);
 try{
  await loadGM();
  var maps=await google.maps.importLibrary("maps"),mk=await google.maps.importLibrary("marker");
  if(!gm)gm=new maps.Map(gmEl,{mapId:GM_MAPID,center:{lat:40.2,lng:-3.7},zoom:6,disableDefaultUI:true,zoomControl:false,clickableIcons:false,gestureHandling:"greedy"});
  gmMarkers.forEach(function(m){m.map=null});gmMarkers=[];
  vis.filter(function(p){return p.ll}).forEach(function(p){
   var m=new mk.AdvancedMarkerElement({map:gm,position:{lat:p.ll[0],lng:p.ll[1]},content:gmPin(p,nums[p.id]),title:p.name,zIndex:nums[p.id]?100-nums[p.id]:1,gmpClickable:true});
   m.addListener("click",function(){openMapCard(p.id)});gmMarkers.push(m);
  });
  // plan del día: línea punteada 1 → 2 → 3
  gmLines.forEach(function(l){l.setMap(null)});gmLines=[];
  (segs||[]).forEach(function(sg){gmLines.push(new maps.Polyline({map:gm,path:[sg.a,sg.b].map(function(ll){return {lat:ll[0],lng:ll[1]}}),strokeOpacity:0,zIndex:0,
   icons:[sg.gap?{icon:{path:google.maps.SymbolPath.CIRCLE,fillColor:"#D6246E",fillOpacity:1,strokeOpacity:0,scale:2.2},offset:"0",repeat:"9px"}
    :{icon:{path:"M 0,-1 0,1",strokeOpacity:.85,strokeColor:"#1D2433",strokeWeight:3,scale:3},offset:"0",repeat:"13px"}]}))});
  var fk=mapState.day+"|"+Object.keys(mapState.cats).join(",")+"|"+Object.keys(mapState.st).join(",")+"|"+mapState.only+"|"+gmMarkers.length;
  if(gmKeep){
   // al tocar «Solo el plan» el mapa se queda quieto; solo encuadra si no queda nada a la vista
   gmKeep=false;gmFitKey=fk;var bb=gm.getBounds();
   if(bb&&!vis.some(function(p){return p.ll&&bb.contains({lat:p.ll[0],lng:p.ll[1]})}))gmFit(vis);
  }else if(fk!==gmFitKey){gmFitKey=fk;gmFit(vis)}
 }catch(e){gFail=true;renderMap()}
}
/* Encuadrar: todo lo visible; en "Todo el viaje" sin Medellín (si no, España se ve diminuta) */
function gmFit(vis){
 if(!gm||typeof google==="undefined")return;
 var pts=vis.filter(function(p){return p.ll});
 if(mapState.day==="all"){var es=pts.filter(function(p){return p.city!=="medellin"});if(es.length)pts=es}
 if(!pts.length)return;
 if(pts.length===1){gm.setCenter({lat:pts[0].ll[0],lng:pts[0].ll[1]});gm.setZoom(15);return}
 var b=new google.maps.LatLngBounds();pts.forEach(function(p){b.extend({lat:p.ll[0],lng:p.ll[1]})});gm.fitBounds(b,48);
}
function gmLocate(){
 if(!navigator.geolocation){toast("Este teléfono no permite ver tu ubicación");return}
 navigator.geolocation.getCurrentPosition(async function(pos){
  if(!gm)return;var ll={lat:pos.coords.latitude,lng:pos.coords.longitude};
  var mk=await google.maps.importLibrary("marker");
  if(gmMe)gmMe.map=null;var el=document.createElement("div");el.className="gme";
  gmMe=new mk.AdvancedMarkerElement({map:gm,position:ll,content:el,title:"Estás aquí",zIndex:200});
  gm.panTo(ll);if(gm.getZoom()<14)gm.setZoom(15);
 },function(){toast("No se pudo obtener tu ubicación")},{enableHighAccuracy:true,timeout:10000});
}
/* Tiempo a pie real (Routes API); si falla o no hay internet, queda el estimado */
var walkCache={},WALK_KM=3;
function routesWalk(a,b){
 var k=a.join(",")+">"+b.join(",");if(walkCache[k])return Promise.resolve(walkCache[k]);
 return fetch("https://routes.googleapis.com/directions/v2:computeRoutes",{method:"POST",referrerPolicy:"no-referrer-when-downgrade",headers:{"Content-Type":"application/json","X-Goog-Api-Key":GM_KEY,"X-Goog-FieldMask":"routes.duration,routes.distanceMeters"},
  body:JSON.stringify({origin:{location:{latLng:{latitude:a[0],longitude:a[1]}}},destination:{location:{latLng:{latitude:b[0],longitude:b[1]}}},travelMode:"WALK"})})
  .then(function(r){return r.ok?r.json():Promise.reject(r.status)})
  .then(function(j){var r0=j&&j.routes&&j.routes[0],s=r0&&parseInt(r0.duration,10);if(!s)throw 0;walkCache[k]={min:Math.max(1,Math.round(s/60)),km:r0.distanceMeters?r0.distanceMeters/1000:0};return walkCache[k]});
}


/* ================= Resumen de gastos e impresión =================
   Todos los documentos con precio, en el orden del viaje. En cada uno se puede poner lo
   cobrado (si se pagó en otra moneda); se guarda en el documento al cambiarlo. */
var docTitle0=null;  // título original mientras se imprime (el PDF toma el nombre del título)
function spendDocs(){
 var ix={};DAYS.forEach(function(d,i){ix[d.d]=i});
 return docs.filter(function(d){return d.price!=null}).sort(function(a,b){
  var ia=a.dayId in ix?ix[a.dayId]:1e4,ib=b.dayId in ix?ix[b.dayId]:1e4;
  return ia-ib||String(a.t1||"99").localeCompare(String(b.t1||"99"))||(a.created||0)-(b.created||0)});
}
function spendWhen(d){var dy=dayById(d.dayId);return dy?cap(shortDay(dy)):"Todo el viaje"}
function lastPaidCur(){var c="";docs.forEach(function(d){var p=paidOf(d);if(p&&(!c||d.created>c.t))c={c:p.c,t:d.created||0}});return c?c.c:""}
function defPaidCur(d){var l=[lastPaidCur(),"USD","COP","EUR"],c=d.cur||"EUR";for(var i=0;i<l.length;i++)if(l[i]&&l[i]!==c)return l[i];return "USD"}
/* Totales: precio por moneda; cobrado = lo cobrado o, si no se puso, el precio */
function spendTotals(l){var pr={},pd={},np=0;l.forEach(function(d){var c=d.cur||"EUR",p=paidOf(d);pr[c]=(pr[c]||0)+d.price;
 if(p){pd[p.c]=(pd[p.c]||0)+p.v;np++}else pd[c]=(pd[c]||0)+d.price});return {pr:pr,pd:pd,np:np}}
function spendIncl(){return spendDocs().filter(function(d){return !d.noPrint})}
function spendTotHTML(){var l=spendIncl(),t=spendTotals(l),ex=spendDocs().length-l.length;if(!l.length)return '<div class="sptot"><p>No hay nada marcado para imprimir.</p></div>';
 return '<div class="sptot"><div><span>Total de precios</span><b>'+sumHTML(t.pr)+'</b></div><div><span>Total cobrado</span><b>'+sumHTML(t.pd)+'</b></div>'+
  '<p>'+(t.np?"En el total cobrado, lo que no tiene «Cobrado» se suma con su precio.":"Aún no hay cobros en otra moneda: el total cobrado es igual al de precios.")+'</p>'+(ex?'<p>'+ex+(ex===1?" gasto desmarcado no se incluye.":" gastos desmarcados no se incluyen.")+'</p>':"")+'</div>'}
function openSpend(){
 var l=spendDocs();
 var rows=l.map(function(d){var T=TYPES[d.type]||TYPES.otro,p=paidOf(d),pc=p?p.c:defPaidCur(d);
  return '<li class="pl sprow'+(d.noPrint?" off":"")+'"><div class="sptop"><input type="checkbox" class="spchk" data-spinc="'+d.id+'"'+(d.noPrint?"":" checked")+' aria-label="Incluir '+esc(d.title||T.l)+' en el resumen"><div><b>'+esc(d.title||T.l)+'</b><p>'+esc(spendWhen(d))+' · '+T.l+'</p></div><b class="spv">'+esc(fmtMoney(d.price,d.cur||"EUR"))+'</b></div>'+
   '<div class="sppaid"><label for="pd-'+d.id+'">Cobrado</label><div class="pricerow"><input id="pd-'+d.id+'" type="text" inputmode="decimal" data-paid="'+d.id+'" placeholder="Opcional" value="'+(p?String(p.v).replace(".",","):"")+'" autocomplete="off"><select data-paidc="'+d.id+'" aria-label="Moneda del cobro">'+CURS.map(function(c){return '<option value="'+c+'"'+(c===pc?" selected":"")+'>'+c+'</option>'}).join("")+'</select></div></div></li>'}).join("");
 openSheet('<div class="sh-head"><h2 id="sh-title">Resumen de gastos</h2><button type="button" class="x" data-act="close">Cerrar</button></div>'+
  (l.length?'<p class="foot" style="margin:0">Desmarca lo que no quieras incluir. Si pagaste en otra moneda, pon lo que te cobraron (lo que sale en el extracto de la tarjeta). Todo se guarda en cada documento.</p><ul class="rows">'+rows+'</ul><div id="sp-tot">'+spendTotHTML()+'</div>'
   :'<p class="foot">Todavía no hay documentos con precio.</p>'),
  l.length?'<div class="actions"><button type="button" class="btn primary" style="--c1:var(--accent)" data-act="spend-print">'+svg("print",20)+'Imprimir</button></div>':"");
}
async function savePaid(id){
 var d=docs.filter(function(x){return x.id===id})[0],inp=$("#pd-"+id),sel=document.querySelector('[data-paidc="'+id+'"]');if(!d||!inp||!sel)return;
 var v=parsePrice(inp.value);
 if(v===undefined){inp.classList.add("bad");return}
 inp.classList.remove("bad");
 var n=Object.assign({},d);
 if(v==null)delete n.paid;else n.paid={v:v,c:sel.value};
 if(JSON.stringify(n.paid||null)===JSON.stringify(d.paid||null))return;
 await saveDoc(n);
 var t=$("#sp-tot");if(t)t.innerHTML=spendTotHTML();
 if(view==="docs")renderDocsView();
}
/* Casilla "incluir": campo opcional noPrint en el documento (solo afecta al resumen para imprimir) */
async function saveIncl(cb){
 var d=docs.filter(function(x){return x.id===cb.dataset.spinc})[0];if(!d)return;
 var n=Object.assign({},d);if(cb.checked)delete n.noPrint;else n.noPrint=true;
 var li=cb.closest(".sprow");if(li)li.classList.toggle("off",!cb.checked);
 await saveDoc(n);
 var t=$("#sp-tot");if(t)t.innerHTML=spendTotHTML();
}
/* Guarda lo escrito en "Cobrado" aunque no se haya salido del campo (al cerrar la hoja con el
   teclado abierto, iOS no siempre avisa del cambio). savePaid lee los campos antes de esperar. */
function flushPaid(){[].slice.call(sheetBody.querySelectorAll("[data-paid]")).forEach(function(i){savePaid(i.dataset.paid)})}
async function printSpend(){
 // por si se toca Imprimir sin salir del último campo
 var ins=[].slice.call(document.querySelectorAll("[data-paid]"));
 for(var i=0;i<ins.length;i++)await savePaid(ins[i].dataset.paid);
 if(document.querySelector("[data-paid].bad")){toast("Revisa el monto marcado en rojo");return}
 var l=spendIncl();if(!l.length){toast("Marca al menos un gasto para imprimir");return}
 var t=spendTotals(l),first=DAYS[0],last=DAYS[DAYS.length-1],now=new Date();
 var rows=l.map(function(d){var T=TYPES[d.type]||TYPES.otro,p=paidOf(d);
  return '<tr><td>'+esc(spendWhen(d))+'</td><td>'+esc(d.title||T.l)+'<small>'+T.l+'</small></td><td class="n">'+esc(fmtMoney(d.price,d.cur||"EUR"))+'</td><td class="n">'+(p?esc(fmtMoney(p.v,p.c)):'<span class="eq">—</span>')+'</td></tr>'}).join("");
 var el=$("#print");if(!el){el=document.createElement("div");el.id="print";document.body.appendChild(el)}
 el.innerHTML='<h1>Gastos del viaje</h1><p class="psub">Journest · '+first.dt.getDate()+' '+MO3[first.dt.getMonth()]+' '+first.dt.getFullYear()+' – '+last.dt.getDate()+' '+MO3[last.dt.getMonth()]+' '+last.dt.getFullYear()+' · impreso el '+now.getDate()+' '+MO3[now.getMonth()]+' '+now.getFullYear()+'</p>'+
  '<table><thead><tr><th>Fecha</th><th>Concepto</th><th class="n">Precio</th><th class="n">Cobrado</th></tr></thead><tbody>'+rows+'</tbody>'+
  '<tfoot><tr><td colspan="2">Total</td><td class="n">'+esc(sumText(t.pr)).replace(/ \+ /g,"<br>")+'</td><td class="n">'+esc(sumText(t.pd)).replace(/ \+ /g,"<br>")+'</td></tr></tfoot></table>'+
  '<p class="pnote">Cobrado: lo que se cobró en otra moneda (extracto de la tarjeta). «—» = sin «Cobrado»: en el total cobrado se suma con su precio.</p>';
 if(docTitle0===null)docTitle0=document.title;
 document.title="Journest - Gastos del viaje";
 try{window.print()}catch(e){toast("Este navegador no permite imprimir")}
}
window.addEventListener("afterprint",function(){if(docTitle0!==null){document.title=docTitle0;docTitle0=null}});

/* ================= Ajustes y copia de seguridad ================= */
function openSettings(){
 openSheet('<div class="sh-head"><h2 id="sh-title">Ajustes</h2><button type="button" class="x" data-act="close">Cerrar</button></div>'+
 '<div class="kv"><div><h3 class="lab">Almacenamiento</h3><p id="s-store">Calculando...</p></div>'+(db?"":'<div class="note">'+svg("flag",20)+'<p>Este navegador no permite guardar datos. Lo que añadas se perderá al cerrar la página.</p></div>')+
 '<div><h3 class="lab">Apariencia</h3><div class="chips">'+[["light","Claro"],["dark","Oscuro"],["auto","Automático"]].map(function(t){return '<button type="button" class="chip" data-act="theme" data-v="'+t[0]+'" aria-pressed="'+((kv.theme||"light")===t[0])+'">'+t[1]+'</button>'}).join("")+'</div></div>'+
 '<div><h3 class="lab">Copia de seguridad</h3><p>Guarda un archivo con todos tus documentos y estados, protegido con contraseña si quieres. Hazlo antes de salir de viaje y cada vez que añadas algo importante.</p></div>'+
 '<div class="actions"><button type="button" class="btn" data-act="export">Exportar copia</button><label class="btn" for="s-import">Importar copia</label><input id="s-import" type="file" accept="application/json,.json" hidden></div>'+
 '<div class="actions"><button type="button" class="btn" data-act="persist">Proteger datos del borrado</button></div>'+
 '<p>Todo se guarda solo en este dispositivo. Instala la app en la pantalla de inicio del iPhone para que Safari no borre los datos por falta de uso.</p>'+
 '<p class="ver">'+esc(versionText())+'</p></div>');
 if(navigator.storage&&navigator.storage.estimate){navigator.storage.estimate().then(function(e){var el=$("#s-store");if(el)el.textContent="Usado: "+fmtSize(e.usage||0)+(e.quota?" de "+fmtSize(e.quota)+" disponibles":"")+". "+docs.length+(docs.length===1?" documento.":" documentos.")}).catch(function(){var el=$("#s-store");if(el)el.textContent=docs.length+" documentos."})}
 else{$("#s-store").textContent=docs.length+" documentos."}
}
/* "Versión a1b2c3d · 5 nov, 15:40": el código coincide con el último commit de GitHub
   si el teléfono ya tiene la versión publicada */
function versionText(){
 var v=typeof __APP_VERSION__!=="undefined"?__APP_VERSION__:"local",t=typeof __BUILD_TIME__!=="undefined"?new Date(__BUILD_TIME__):null,w="";
 if(t&&!isNaN(t))w=" · "+t.getDate()+" "+MO3[t.getMonth()]+", "+String(t.getHours()).padStart(2,"0")+":"+String(t.getMinutes()).padStart(2,"0");
 return "Versión "+v+w;
}
function blobToDataURL(b){return new Promise(function(res,rej){var r=new FileReader();r.onload=function(){res(r.result)};r.onerror=function(){rej(r.error)};r.readAsDataURL(b)})}
function dataURLtoBlob(u){var p=u.split(","),mime=(p[0].match(/:(.*?);/)||[])[1]||"application/octet-stream",bin=atob(p[1]),a=new Uint8Array(bin.length);for(var i=0;i<bin.length;i++)a[i]=bin.charCodeAt(i);return new Blob([a],{type:mime})}
/* ---- Exportar (formatos y cifrado en backup.js) ---- */
var expKind="full",expFile=null,impWrapper=null,impBackup=null;
var MIN_PASS=8;
/* Avisos de tamaño (no bloquean): con copias de cientos de MB, iOS puede cerrar la app por falta
   de memoria al exportar o importar. Para billetes y reservas normales no hace falta. */
var BIG_FILE=20*1024*1024,BIG_COPY=100*1024*1024;
function docsBytes(){return docs.reduce(function(a,d){return a+(d.size||0)},0)}
function expBigHTML(){var n=docsBytes();return expKind==="full"&&n>BIG_COPY?"<b>Tus documentos suman "+esc(fmtSize(n))+".</b> La copia puede tardar varios minutos y, en iPhone o iPad, fallar. Cierra las otras apps antes de exportar.":""}
function expDesc(){return expKind==="full"
 ?"Documentos con sus archivos, códigos y precios, más el itinerario (eventos, listas y estados)."
 :"Solo el itinerario: eventos, listas y estados. Sin documentos, archivos, códigos ni precios. Sirve para compartirlo."}
function openExportSheet(){
 expFile=null;
 openSheet('<div class="sh-head"><h2 id="sh-title">Exportar copia</h2><button type="button" class="x" data-act="close">Cerrar</button></div>'+
 '<div class="kv"><div class="chips">'+[["full","Copia completa"],["itinerary","Solo itinerario"]].map(function(t){return '<button type="button" class="chip" data-act="exp-kind" data-v="'+t[0]+'" aria-pressed="'+(expKind===t[0])+'">'+t[1]+'</button>'}).join("")+'</div>'+
 '<p id="e-desc">'+expDesc()+'</p><p class="warnline" id="e-big"'+(expBigHTML()?"":" hidden")+'>'+expBigHTML()+'</p>'+
 '<div class="field"><label for="e-pass" id="e-plab"></label><input id="e-pass" type="password" autocomplete="new-password"></div>'+
 '<div class="field"><label for="e-pass2" id="e-plab2"></label><input id="e-pass2" type="password" autocomplete="new-password"></div>'+
 '<p id="e-phint"></p><p class="err" id="x-err" role="alert"></p>'+
 '<div class="actions" id="e-make"><button type="button" class="btn primary" data-act="exp-make" id="e-btn">Preparar copia</button></div>'+
 '<div id="e-out"></div></div>');
 expUI();
}
/* Copia completa: contraseña obligatoria (lleva códigos, precios y PDFs).
   Solo itinerario: opcional, pero se deja claro que sin ella sale sin cifrar. */
function expUI(){
 var full=expKind==="full",p=$("#e-pass"),empty=!p||!p.value;
 var l=$("#e-plab");if(l)l.innerHTML="Contraseña"+(full?REQ:"");
 var l2=$("#e-plab2");if(l2)l2.innerHTML="Repite la contraseña"+(full?REQ:"");
 if(p)p.placeholder=full?"Mínimo "+MIN_PASS+" caracteres":"Opcional · mínimo "+MIN_PASS+" caracteres";
 var h=$("#e-phint");
 if(h){h.className=full||!empty?"":"warnline";h.innerHTML=full
  ?"La copia se cifra en este dispositivo antes de salir de él.<br>Si olvidas la contraseña, no se puede abrir: nadie puede recuperarla. Tendrás que exportarla de nuevo."
  :empty?"<b>Sin contraseña, la copia sale sin cifrar:</b> cualquiera que tenga el archivo puede leerla. Con contraseña se cifra, igual que la copia completa."
  :"La copia se cifra en este dispositivo antes de salir de él.<br>Si olvidas la contraseña, no se puede abrir: nadie puede recuperarla. Tendrás que exportarla de nuevo."}
 var b=$("#e-btn");if(b&&!b.disabled)b.textContent=!full&&empty?"Preparar copia sin cifrar":"Preparar copia";
 var e=$("#x-err");if(e)e.textContent="";
}
function expKindChanged(b){
 expKind=b.dataset.v;expFile=null;
 sheetBody.querySelectorAll("[data-act=exp-kind]").forEach(function(x){x.setAttribute("aria-pressed",x===b?"true":"false")});
 var d=$("#e-desc");if(d)d.textContent=expDesc();var bg=$("#e-big");if(bg){bg.innerHTML=expBigHTML();bg.hidden=!bg.innerHTML}expReset();expUI();
}
/* Si cambia el tipo o la contraseña, la copia preparada ya no vale: se vuelve a "Preparar copia" */
function expReset(){expFile=null;var o=$("#e-out");if(o)o.innerHTML="";var m=$("#e-make");if(m)m.hidden=false}
/* Botón ocupado: rueda + texto (con copias grandes, leer, cifrar o importar tarda) */
function busy(b,txt){if(!b)return;b.disabled=true;b.innerHTML='<span class="spin" aria-hidden="true"></span>'+esc(txt)}
function idle(b,txt){if(!b)return;b.disabled=false;b.textContent=txt}
/* Línea de progreso encima de los botones ("Importando documentos · 3 de 6"); el botón solo dice "Importando…" */
function progress(txt){var p=$("#x-prog");if(!p)return;p.hidden=!txt;if(txt)p.innerHTML='<span class="spin" aria-hidden="true"></span>'+esc(txt)}
async function serializeDocs(onStep){
 var out=[];
 for(var i=0;i<docs.length;i++){if(onStep)onStep(i+1,docs.length);var d=Object.assign({},docs[i]);if(d.blob){d.data=await blobToDataURL(d.blob)}delete d.blob;out.push(d)}
 return out;
}
async function makeExport(btn){
 var p1=$("#e-pass").value,p2=$("#e-pass2").value,xe=$("#x-err");
 function err(m){if(xe)xe.textContent=m;else toast(m)}
 if(expKind==="full"&&!p1){err("La copia completa lleva códigos, precios y archivos: ponle una contraseña.");return}
 if(p1&&p1.length<MIN_PASS){err("Usa al menos "+MIN_PASS+" caracteres.");return}
 if(p1!==p2){err("Las contraseñas no coinciden.");return}
 if(p1&&!cryptoAvailable()){err("Este navegador no permite cifrar.");return}
 var label=btn.textContent;busy(btn,"Preparando…");
 try{
  var kind=expKind;
  var backup=buildBackup(kind,kv,kind==="full"?await serializeDocs():[]);
  if(p1)busy(btn,"Cifrando…");
  var out=p1?await encryptBackup(backup,p1):backup;
  var name="journest-"+(kind==="full"?"copia":"itinerario")+(p1?"-cifrada":"")+"-"+todayStr()+".json";
  // Copia cifrada: el campo data (enorme) va último; se arma el archivo por partes para no
  // duplicarlo en memoria con otro JSON.stringify (con copias de cientos de MB, iOS cerraba la app).
  var parts;
  if(p1){var head=JSON.stringify(Object.assign({},out,{data:""}));parts=[head.slice(0,-2),out.data,'"}'];out=null}
  else parts=[JSON.stringify(out)];
  backup.docs=backup.docs.length;   // solo hace falta el número para el aviso; suelta los archivos
  expFile=new File(parts,name,{type:"application/json"});parts=null;
  var canShare=!!(navigator.canShare&&navigator.share&&navigator.canShare({files:[expFile]}));
  var o=$("#e-out");
  if(o)o.innerHTML='<div class="note ok">'+svg("check",20)+'<p><b>Copia lista</b> · '+fmtSize(expFile.size)+(p1?" · cifrada":" · sin cifrar")+(kind==="full"?" · "+backup.docs+(backup.docs===1?" documento":" documentos"):"")+'</p></div>'+
   '<div class="actions"><button type="button" class="btn'+(canShare?"":" primary")+'" data-act="exp-dl">Descargar</button>'+(canShare?'<button type="button" class="btn primary" data-act="exp-share">Compartir</button>':"")+'</div>';
  var mk=$("#e-make");if(mk)mk.hidden=true;
 }catch(e){toast("No se pudo generar la copia")}
 idle(btn,label);
}
function downloadFile(f){
 if(!f)return;
 var u=URL.createObjectURL(f),a=document.createElement("a");
 a.href=u;a.download=f.name;document.body.appendChild(a);a.click();a.remove();
 setTimeout(function(){URL.revokeObjectURL(u)},60000);
 toast("Copia descargada");
}
function shareExport(){
 if(!expFile)return;
 // Se llama directo desde el toque del botón (Safari exige un gesto del usuario para compartir).
 // Sin title ni text: iOS los guardaba como un archivo "texto" aparte junto a la copia.
 // Mientras iOS guarda o envía (con copias grandes tarda), el botón queda en "Compartiendo…".
 var b=$('[data-act="exp-share"]'),label=b?b.textContent:"Compartir";
 var p=navigator.share({files:[expFile]});busy(b,"Compartiendo…");
 p.then(function(){idle(b,label);toast("Listo")},function(e){idle(b,label);if(!e||e.name!=="AbortError")downloadFile(expFile)});
}

/* ---- Importar ---- */
async function importBackup(file){
 openSheet('<div class="sh-head"><h2 id="sh-title">Importar copia</h2><button type="button" class="x" data-act="close">Cerrar</button></div>'+
  '<div class="kv"><p class="busyline"><span class="spin" aria-hidden="true"></span>Leyendo la copia'+(file.size>BIG_COPY?" ("+fmtSize(file.size)+"). Puede tardar varios minutos; si la app se cierra, ciérrala del todo, cierra las otras apps y vuelve a intentarlo.":file.size>20e6?" ("+fmtSize(file.size)+"). Puede tardar un poco.":"…")+'</p></div>');
 var parsed;
 try{parsed=parseBackupText(await file.text())}catch(e){closeSheet();toast("El archivo no es una copia válida");return}
 if(parsed.encrypted)openPassSheet(parsed.wrapper);else openImportChoice(parsed.backup);
}
function openPassSheet(wrapper){
 impWrapper=wrapper;
 openSheet('<div class="sh-head"><h2 id="sh-title">Copia cifrada</h2><button type="button" class="x" data-act="close">Cerrar</button></div>'+
 '<div class="kv"><p>Escribe la contraseña con la que se creó esta copia'+(wrapper.kind==="itinerary"?" (solo itinerario)":"")+'.</p>'+
 '<div class="field"><label for="i-pass">Contraseña</label><input id="i-pass" type="password" autocomplete="current-password"></div>'+
 '<div class="actions"><button type="button" class="btn primary" data-act="imp-pass">Abrir copia</button></div></div>');
}
async function unlockImport(btn){
 if(!impWrapper)return;
 if(!cryptoAvailable()){toast("Este navegador no permite descifrar");return}
 var label=btn.textContent;busy(btn,"Descifrando…");
 try{var bk=await decryptBackup(impWrapper,$("#i-pass").value);impWrapper=null;openImportChoice(bk);return}
 catch(e){toast(e instanceof WrongPasswordError?"Contraseña incorrecta":"El archivo no es una copia válida")}
 idle(btn,label);
}
function openImportChoice(backup){
 impBackup=backup;
 var nd=backup.docs.length,hasItin=Object.keys(itineraryKV(backup.kv)).length>0;
 if(!nd&&!hasItin){impBackup=null;toast("La copia está vacía");return}
 var opts=[];
 if(nd&&hasItin)opts.push(["all","Importar todo"]);
 if(nd)opts.push(["docs",hasItin?"Solo documentos":"Importar documentos"]);
 if(hasItin)opts.push(["itinerary",nd?"Solo itinerario":"Importar itinerario"]);
 openSheet('<div class="sh-head"><h2 id="sh-title">Importar copia</h2><button type="button" class="x" data-act="close">Cerrar</button></div>'+
 '<div class="kv"><p>Esta copia tiene '+(nd?nd+(nd===1?" documento":" documentos"):"")+(nd&&hasItin?" y ":"")+(hasItin?"el itinerario (eventos, listas y estados)":"")+'.</p>'+
 (nd?'<p><b>Documentos:</b> se agregan a los que ya tienes. Si uno ya existe, se reemplaza por el de la copia.</p>':"")+
 (hasItin?'<p><b>Itinerario:</b> los eventos, listas y estados que estén en la copia reemplazan a los tuyos.</p>':"")+
 '<p class="busyline" id="x-prog" role="status" hidden></p><div class="actions">'+opts.map(function(o,i){return '<button type="button" class="btn'+(i===0?" primary":"")+'" data-act="imp-apply" data-v="'+o[0]+'">'+o[1]+'</button>'}).join("")+'</div></div>');
}
async function applyImport(mode,btn){
 if(!impBackup)return;
 var label=btn.textContent,all=sheetBody.querySelectorAll("[data-act=imp-apply]");
 all.forEach(function(x){x.disabled=true});busy(btn,"Importando…");
 try{
  var plan=importPlan(impBackup,mode);
  for(var i=0;i<plan.docs.length;i++){if(plan.docs.length>1)progress("Importando documentos · "+(i+1)+" de "+plan.docs.length);var d=Object.assign({},plan.docs[i]);plan.docs[i].data=null;upgradeOldPlaces([d]);if(d.data){d.blob=dataURLtoBlob(d.data);delete d.data}await saveDoc(d);d=null}
  var ks=Object.keys(plan.kv);for(var k=0;k<ks.length;k++)await setKV(ks[k],plan.kv[ks[k]]);
  impBackup=null;closeSheet();applyTheme();refresh();
  toast(plan.docs.length?"Importados "+plan.docs.length+(plan.docs.length===1?" documento":" documentos"):"Itinerario importado");
 }catch(e){all.forEach(function(x){x.disabled=false});progress("");idle(btn,label);toast("No se pudo importar la copia")}
}

/* ================= Navegación ================= */

/* ================= Calendario ================= */
/* Confirmar con un segundo toque (4 s), como al eliminar un documento */
var tapArm=null;
function confirmTap(b,msg,fn){
 if(tapArm&&tapArm.el===b){clearTimeout(tapArm.t);tapArm=null;fn();return}
 if(tapArm){clearTimeout(tapArm.t);tapArm.el.textContent=tapArm.txt;tapArm.el.classList.remove("armed")}
 tapArm={el:b,txt:b.textContent,t:setTimeout(function(){if(tapArm&&tapArm.el===b){b.textContent=tapArm.txt;b.classList.remove("armed");tapArm=null}},4000)};
 b.textContent=msg;b.classList.add("armed");
}
var calTab="dias",calSel=null,curDayId=null,calScrolled=false,evEditing=null,evPk=null;   // evPk: sitio del que sale el evento nuevo (📅+)
function evList(){return Array.isArray(kv.events)?kv.events:[]}
function tmin(t){if(!/^\d{1,2}:\d{2}$/.test(t||""))return null;var a=t.split(":");return +a[0]*60+ +a[1]}
function colOf(t){return TYPES[t]?TYPES[t].t:"var(--accent)"}
function agendaOf(day){
 var items=[];
 docs.forEach(function(d){
  if(d.calHide)return;                                 // "Ocultar del calendario"
  var T=TYPES[d.type]||TYPES.otro,sub=[];
  if(d.type==="hotel"){
   var a=dayById(d.dayId);if(!a)return;
   // check-in el primer día y check-out el día de salida, por separado. Sin hora van arriba del todo (top).
   var last=(d.nightTo&&dayById(d.nightTo))||a,out=DAYS[last.i+1],hn=d.titleAuto?(d.loc1||T.l):(d.title||T.l);
   if(d.dayId===day.d)items.push({k:"doc",id:d.id,t1:d.t1||"",t2:"",title:"Check-in · "+hn,sub:nm(a.sleep||a.base),type:"hotel",hin:true});
   if(out&&out.d===day.d)items.push({k:"doc",id:d.id,t1:d.t2||"",t2:"",title:"Check-out · "+hn,sub:nm(last.sleep||last.base),type:"hotel",hout:true});
   return;
  }
  if(d.dayId!==day.d)return;
  var st=docSeg(d);if(st&&!titleHas(d,st))sub.push(st);   // el tipo ya lo dice el ícono
  sub=sub.concat(tripSub(d));
  items.push({k:"doc",id:d.id,t1:d.t1||"",t2:d.t2||"",arr:docArr(d),title:d.title||T.l,sub:sub.join(" · "),type:d.type});
 });
 evList().forEach(function(e){if(e.day===day.d)items.push({k:"ev",id:e.id,t1:e.t1||"",t2:e.t2||"",title:e.title,sub:e.note||"",type:"evento"})});
 /* Hotel sin hora: el check-out va arriba del todo; el check-in también, salvo que ese día
    haya un check-out con hora (entonces va de primero en "Sin hora", porque se llega después). */
 var outTimed=items.some(function(x){return x.hout&&tmin(x.t1)!=null});
 items.forEach(function(x){if(tmin(x.t1)!=null)return;if(x.hout)x.top=true;else if(x.hin)x.top=!outTimed});
 var top=items.filter(function(x){return x.top}).sort(function(a,b){return (b.hout?1:0)-(a.hout?1:0)}),timed=items.filter(function(x){return !x.top&&tmin(x.t1)!=null}),un=items.filter(function(x){return !x.top&&tmin(x.t1)==null}).sort(function(a,b){return (b.hin?1:0)-(a.hin?1:0)});
 timed.sort(function(a,b){var d=tmin(a.t1)-tmin(b.t1);if(d)return d;var x=tmin(a.t2),y=tmin(b.t2);return (x==null?1e4:x)-(y==null?1e4:y)});
 function rng(x){var s=tmin(x.t1),e=tmin(x.t2);if(e!=null&&x.arr)e+=x.arr*1440;return {s:s,e:(e!=null&&e>s)?e:s}}
 for(var i=0;i<timed.length;i++)for(var j=i+1;j<timed.length;j++){
  var a=rng(timed[i]),b=rng(timed[j]),hit=false;
  if(a.e>a.s&&b.e>b.s)hit=a.s<b.e&&b.s<a.e;
  else if(a.e>a.s)hit=a.s<b.s&&b.s<a.e;
  else if(b.e>b.s)hit=b.s<a.s&&a.s<b.e;
  if(hit){timed[i].clash=true;timed[j].clash=true}
 }
 return {top:top,timed:timed,un:un,all:items};
}
function agItem(it){
 var has=tmin(it.t1)!=null,tm=has?'<b>'+esc(it.t1)+'</b>'+(it.t2?'<small>'+esc(it.t2+(it.arr?" +"+it.arr:""))+'</small>':""):"";   // sin hora: sin columna de hora
 return '<button type="button" class="ag'+(has?"":" nt")+(it.clash?" clash":"")+'" style="--t:'+colOf(it.type)+'" data-act="'+(it.k==="doc"?"view":"ev-view")+'" data-id="'+esc(it.id)+'">'+(has?'<span class="agt">'+tm+'</span>':"")+'<span class="agi">'+svg(it.type==="evento"?"cal":(TYPE_ICON[it.type]||"file"),16)+'</span><span class="agb"><b>'+esc(it.title)+'</b>'+(it.sub?'<small>'+esc(it.sub)+'</small>':"")+(it.clash?'<em class="cl">Se cruza con otra actividad</em>':"")+'</span></button>';
}
function dayAgenda(day){
 var a=agendaOf(day),h="";
 if(a.top.length)h+='<div class="aglist agtop">'+a.top.map(agItem).join("")+'</div>';
 if(a.timed.length)h+='<div class="aglist">'+a.timed.map(agItem).join("")+'</div>';
 if(a.un.length)h+=(a.timed.length?'<h4 class="aglab">Sin hora</h4>':"")+'<div class="aglist">'+a.un.map(agItem).join("")+'</div>';
 if(!a.all.length)h+='<p class="agempty">Nada planeado todavía.</p>';
 return h+'<div><button type="button" class="mini" data-act="ev-add" data-day="'+day.d+'">'+svg("plus",14)+'Añadir evento</button></div>';
}
function dsOf(dt){return dt.getFullYear()+"-"+String(dt.getMonth()+1).padStart(2,"0")+"-"+String(dt.getDate()).padStart(2,"0")}
function monthGrid(){
 var f=DAYS[0].dt,l=DAYS[DAYS.length-1].dt,s=new Date(f.getFullYear(),f.getMonth(),f.getDate()-((f.getDay()+6)%7)),e=new Date(l.getFullYear(),l.getMonth(),l.getDate()+((7-l.getDay())%7)),t=todayStr(),h="";
 ["L","M","X","J","V","S","D"].forEach(function(x){h+='<div class="wd">'+x+'</div>'});
 for(var dt=new Date(s),first=true;dt<=e;dt=new Date(dt.getFullYear(),dt.getMonth(),dt.getDate()+1)){
  var id=dsOf(dt),day=dayById(id),mo=(first||dt.getDate()===1)?'<span class="mo">'+MO3[dt.getMonth()]+'</span>':"";first=false;
  if(!day){h+='<div class="cc out"><span class="tp"><span class="n">'+dt.getDate()+'</span>'+mo+'</span></div>';continue}
  var its=agendaOf(day).all,dots=its.slice(0,4).map(function(x){return '<i style="background:'+colOf(x.type)+'"></i>'}).join("")+(its.length>4?'<span style="font-size:9.5px;color:var(--muted)">+'+(its.length-4)+'</span>':"");
  h+='<button type="button" class="cc'+(id===calSel?" sel":"")+(id===t?" td":"")+'" style="--c:'+CITIES[day.base].c1+'" data-act="csel" data-d="'+id+'" aria-label="'+esc(longDate(day))+', '+its.length+' elementos"><span class="tp"><span class="n">'+dt.getDate()+'</span>'+mo+'</span><span class="cy">'+esc(nm(day.base).slice(0,3).toUpperCase())+'</span><span class="ds">'+dots+'</span></button>';
 }
 return '<div class="mg">'+h+'</div>';
}
function renderCal(){
 if(!calSel||!dayById(calSel)){var t=todayStr();calSel=dayById(t)?t:DAYS[0].d}
 var body="";
 if(calTab==="mes"){
  var sd=dayById(calSel);
  body=monthGrid()+'<section class="selp"><div class="selh"><div><small>'+esc(cap(longDate(sd)))+'</small><b>'+esc(routeText(sd))+'</b></div><a href="#dia-'+sd.d+'">Ver día</a></div>'+dayAgenda(sd)+'</section>';
 }else{
  body='<div class="days" style="margin-top:8px">'+DAYS.map(function(d){
   var c=CITIES[d.base];
   return '<div class="day" id="c-'+d.d+'" style="--c:'+c.c1+'"><div class="rail"><small>'+WD3[d.dt.getDay()]+'</small><b>'+d.dt.getDate()+'</b><i class="mo">'+MO3[d.dt.getMonth()]+'</i></div><div class="dcard"><a class="cstops stops" href="#dia-'+d.d+'">'+stopsHTML(d)+'</a>'+dayAgenda(d)+'</div></div>';
  }).join("")+'</div>';
 }
 V.cal.innerHTML='<div class="in"><div class="page-h chd"><div><h1>Calendario</h1><p>Qué hay cada día, con horas.</p></div><button type="button" class="btn primary" data-act="ev-add" data-day="'+(calTab==="mes"?calSel:(dayById(todayStr())?todayStr():calSel))+'">'+svg("plus",18)+'Evento</button></div>'+
  '<div class="seg"><div class="trk" role="tablist">'+[["dias","Días"],["mes","Mes"]].map(function(t){return '<button type="button" role="tab" class="tab" data-act="ctab" data-v="'+t[0]+'" aria-selected="'+(calTab===t[0])+'">'+t[1]+'</button>'}).join("")+'</div></div>'+body+'<div style="height:24px"></div></div>';
}
function openEventSheet(o){
 var e=o.id?evList().filter(function(x){return x.id===o.id})[0]:null;evEditing=e||null;
 evPk=e?(e.pk||null):(o.pk&&placeByKey(o.pk)?o.pk:null);var lp=placeByKey(evPk);
 var day=e?e.day:(dayById(o.day)?o.day:(calSel&&dayById(calSel)?calSel:DAYS[0].d));
 openSheet('<div class="sh-head"><h2 id="sh-title">'+(e?"Editar evento":"Nuevo evento")+'</h2>'+(e?'<button type="button" class="x" data-act="ev-view" data-id="'+esc(e.id)+'">Cancelar</button>':'<button type="button" class="x" data-act="close">Cancelar</button>')+'</div>'+
 '<div class="field"><label for="e-title">Nombre'+REQ+'</label><input id="e-title" type="text" placeholder="Ej. Visita a Plaza de España" value="'+esc(e?e.title:(o.title||""))+'" autocomplete="off"></div>'+
 '<div class="field"><label for="e-day">Día'+REQ+'</label><select id="e-day">'+DAYS.map(function(d){return '<option value="'+d.d+'"'+(d.d===day?" selected":"")+'>'+esc(cap(shortDay(d)))+' · '+esc(routeText(d))+'</option>'}).join("")+'</select></div>'+
 '<div class="field"><span class="fl">Hora de inicio y fin</span><div class="timerow">'+timeBox("e-t1",e&&e.t1,"Hora de inicio")+'<span>–</span>'+timeBox("e-t2",e&&e.t2,"Hora de fin")+'</div></div>'+
 (lp?'<p class="note ok evpl">'+svg("pin",18)+'<span>Vinculado a «'+esc(lp.p.n)+'»: en el mapa sale solo el día de este evento.</span></p>':"")+
 '<div class="field"><label for="e-note">Nota o lugar</label><input id="e-note" type="text" placeholder="Ej. Entrada por la puerta principal" value="'+esc(e&&e.note||"")+'" autocomplete="off"></div>'+
 '',
 '<p class="err" id="e-err" role="alert"></p><div class="actions">'+(e?'<button type="button" class="btn danger" data-act="ev-del">Eliminar</button>':"")+'<button type="button" class="btn primary" style="--c1:var(--accent)" data-act="ev-save">Guardar</button></div>');
}
function openEventView(id){
 var e=evList().filter(function(x){return x.id===id})[0];if(!e){closeSheet();return}
 evEditing=null;
 var dy=dayById(e.day),h=vType("cal","var(--accent)","Evento",dy?cap(shortDay(dy))+" · "+routeText(dy):"");
 h+=vTimes("evento",e.t1,e.t2);
 var lp=placeByKey(e.pk);if(lp)h+=vField("Lugar",'<div class="loc"><span>'+esc(lp.p.n)+'</span>'+mapBtn(lp.p.u&&/^https?:\/\//i.test(lp.p.u)?lp.p.u:mapUrl(lp.p.n,lp.cid))+'</div>');
 if(e.note)h+='<div class="field"><span class="fl">Nota o lugar</span><p class="vtxt">'+esc(e.note)+'</p></div>';
 openSheet('<div class="sh-head"><h2 id="sh-title">'+esc(e.title)+'</h2><button type="button" class="x" data-act="close">Cerrar</button></div>'+h,
  '<div class="actions"><button type="button" class="btn primary" style="--c1:var(--accent)" data-act="ev-edit" data-id="'+esc(e.id)+'">Editar</button></div>');
}
async function saveEvent(){
 var title=$("#e-title").value.trim(),t1=$("#e-t1").value||"",t2=$("#e-t2").value||"";
 if(!title){$("#e-err").textContent="Escribe un nombre para el evento.";return}
 if(t2&&!t1){$("#e-err").textContent="Pon también la hora de inicio.";return}
 if(t1&&t2&&t2<=t1){$("#e-err").textContent="La hora de fin debe ser posterior a la de inicio.";return}
 var list=evList().slice(),ev=evEditing?Object.assign({},evEditing):{id:uid()};
 ev.title=title;ev.day=$("#e-day").value;ev.t1=t1;ev.t2=t2;ev.note=$("#e-note").value.trim();
 if(evPk)ev.pk=evPk;   // campo nuevo opcional: los eventos viejos siguen valiendo
 var k=-1;list.forEach(function(x,i){if(x.id===ev.id)k=i});if(k>=0)list[k]=ev;else list.push(ev);
 var wasEdit=!!evEditing;await setKV("events",list);calSel=ev.day;refresh();
 if(wasEdit)openEventView(ev.id);else closeSheet();
 toast("Evento guardado");
}
async function deleteEvent(){
 if(!evEditing)return;var id=evEditing.id;
 await setKV("events",evList().filter(function(x){return x.id!==id}));closeSheet();refresh();toast("Evento eliminado");
}

// el scroll de cada pestaña lo pone la app (scrollPos); que el navegador no lo recoloque por su cuenta
if(typeof history!=="undefined"&&"scrollRestoration" in history)history.scrollRestoration="manual";
var view="home",dayFrom=null;   // dayFrom: de dónde se llegó al día (el botón ‹ vuelve ahí)
function setBand(color){document.body.style.setProperty("--band",color)}
function route(){
 applyTransit();
 var h=location.hash.replace(/^#/,""),day=null,v="home";
 if(h.indexOf("dia-")===0){day=dayById(h.slice(4));if(day)v="day"}else if(h==="documentos")v="docs";else if(h==="calendario")v="cal";else if(h==="mapa")v="map";
 scrollPos[view]=window.scrollY;
 var changed=v!==view||(v==="day"&&V.day.dataset.id!==(day&&day.d));
 if(v==="day"&&view!=="day"&&!(view==="map"&&mapFrom))dayFrom={home:"#inicio",docs:"#documentos",cal:"#calendario",map:"#mapa"}[view]||"#inicio";   // al volver del mapa abierto desde el día, se conserva
 if(v==="map"&&view!=="day")mapFrom=null;   // entrar desde la barra de abajo: sin ‹
 view=v;
 ["home","day","docs","cal","map"].forEach(function(k){V[k].hidden=k!==v});
 $("#bnav").hidden=v==="day";
 $("#nav-home").setAttribute("aria-current",v==="home"?"page":"false");$("#nav-docs").setAttribute("aria-current",v==="docs"?"page":"false");$("#nav-cal").setAttribute("aria-current",v==="cal"?"page":"false");$("#nav-map").setAttribute("aria-current",v==="map"?"page":"false");
 if(v==="home"){renderHome();setBand("var(--bg)")}
 else if(v==="docs"){renderDocsView();setBand("var(--bg)")}
 else if(v==="cal"){renderCal();setBand("var(--bg)")}
 else if(v==="map"){renderMap();setBand("var(--bg)")}
 else{if(V.day.dataset.id!==day.d){tab="general"}V.day.dataset.id=day.d;renderDay(day);setBand("var(--bg)")}
 mapFull();
 if(changed){var y0=v==="day"?0:(scrollPos[v]||0);window.scrollTo(0,y0);if(v==="day")requestAnimationFrame(function(){if(view==="day"&&window.scrollY!==0)window.scrollTo(0,0)})}
 if(v==="cal"&&calTab==="dias"&&!calScrolled){calScrolled=true;var ce=document.getElementById("c-"+todayStr());if(ce)requestAnimationFrame(function(){ce.scrollIntoView({block:"start"});window.scrollBy(0,-12)})}
 if(v==="home"&&!homeScrolled){homeScrolled=true;var te=document.getElementById("d-"+todayStr());if(te)requestAnimationFrame(function(){te.scrollIntoView({block:"center"})})}
 updateFab();updateDayMini();
}
/* Día: la fila de arriba (‹ y "Día X de Y") queda fija desde el principio y el resto del encabezado pasa por
   debajo; cuando el título grande ya quedó escondido, sus ciudades aparecen en pequeño en esa fila. Así el ‹
   está siempre a mano y nada salta. Un IntersectionObserver avisa al cruzar (sin trabajo en cada scroll). */
var dayIO=null,pastOpen=false;
function setDayTitle(on){
 var b=V.day.querySelector(".dbar");if(!b||b.classList.contains("titled")===on)return;
 b.classList.toggle("titled",on);
 var t=b.querySelector(".dbt");if(t)t.setAttribute("aria-hidden",on?"false":"true");
}
function watchDayMini(){
 if(dayIO){dayIO.disconnect();dayIO=null}
 var bar=V.day.querySelector(".dbar"),h=V.day.querySelector(".dh h1");
 if(!bar||!h||typeof IntersectionObserver==="undefined")return;
 var lim=(parseFloat(getComputedStyle(bar).top)||0)+bar.offsetHeight;   // borde inferior de la fila fija
 dayIO=new IntersectionObserver(function(es){var e=es[es.length-1];setDayTitle(!e.isIntersecting&&e.boundingClientRect.top<lim)},{rootMargin:"-"+Math.round(lim)+"px 0px 0px 0px",threshold:0});
 dayIO.observe(h);
}
function updateDayMini(){if(view!=="day"&&dayIO){dayIO.disconnect();dayIO=null}}
/* Botón flotante "+" en Documentos (lista). Al final del scroll se estira a "Añadir documento". */
var fab=$("#fab");
function updateFab(){
 if(!fab)return;
 var show=view==="docs"&&docsTab!=="pend";
 fab.hidden=!show;if(!show)return;
 fab.dataset.day=dayById(todayStr())?todayStr():DAYS[0].d;
 var de=document.documentElement,atEnd=window.innerHeight+window.scrollY>=de.scrollHeight-48;
 fab.classList.toggle("wide",atEnd);
}
function refresh(){applyTransit();var y=window.scrollY;var h=location.hash.replace(/^#/,"");
 if(view==="day"){var d=dayById(h.slice(4));if(d)renderDay(d)}else if(view==="docs")renderDocsView();else if(view==="cal")renderCal();else if(view==="map")renderMap();else renderHome();
 window.scrollTo(0,y)}

document.addEventListener("click",function(e){
 var b=e.target.closest("[data-act]");
 if(!b){if(e.target===sheet)closeSheet();return}
 // un enlace dentro de un elemento con acción (p. ej. "Mapa" en una tarjeta) hace lo suyo, sin abrir la tarjeta
 var lk=e.target.closest("a");if(lk&&lk!==b&&b.contains(lk))return;
 var a=b.dataset.act;
 if(a==="tab"){tab=b.dataset.tab;refresh()}
 else if(a==="add"){openDocSheet({day:b.dataset.day,type:b.dataset.type,title:b.dataset.title,leg:b.dataset.leg,to:b.dataset.to})}
 else if(a==="ctab"){calTab=b.dataset.v;renderCal()}
 else if(a==="csel"){calSel=b.dataset.d;renderCal()}
 else if(a==="ev-add"){openEventSheet({day:b.dataset.day,title:b.dataset.title,pk:b.dataset.pk})}
 else if(a==="ev-view"){openEventView(b.dataset.id)}
 else if(a==="ev-edit"){openEventSheet({id:b.dataset.id})}
 else if(a==="ev-save"){saveEvent()}
 else if(a==="ev-del"){confirmTap(b,"Confirmar",deleteEvent)}
 else if(a==="dtab"){docsTab=b.dataset.v;renderDocsView()}
 else if(a==="via"){openViaSheet(b.dataset.day,Number(b.dataset.leg))}
 else if(a==="via-add"){addVia()}
 else if(a==="via-del"){confirmTap(b,"Confirmar",function(){delVia(Number(b.dataset.k))})}
 else if(a==="view"){if(!(b.closest("#sheet")&&$("#f-day")&&revReturn()))openDocView(b.dataset.id)}
 else if(a==="edit"){openDocSheet({id:b.dataset.id})}
 else if(a==="copy"){copyText(b.dataset.code)}
 else if(a==="close"){closeSheet()}
 else if(a==="img-view"){openViewer(docs.filter(function(x){return x.id===b.dataset.id})[0])}
 else if(a==="vw-close"){closeViewer()}
 else if(a==="vw-share"){shareImage(b.dataset.id)}
 else if(a==="file-del"){removeFormFile()}
 else if(a==="arr-up"||a==="arr-dn"){captureFx();
  if(a==="arr-dn"&&fx.arr<=minArr()){arrErr(fx.arr>0?arrMsg():"");return}   // atenuado: explica por qué
  fx.arr=Math.max(0,Math.min(3,fx.arr+(a==="arr-up"?1:-1)));fx.arrManual=true;arrErr("");refreshArr()}
 else if(a==="t-clr"){var ti=document.getElementById(b.dataset.for);if(ti){ti.value="";ti.dispatchEvent(new Event("input",{bubbles:true}));ti.dispatchEvent(new Event("change",{bubbles:true}))}}
 else if(a==="type"){
  if(b.getAttribute("aria-disabled")==="true"){refreshTypes(b.dataset.type);return}
  selType=b.dataset.type;sheetBody.querySelectorAll(".ty").forEach(function(x){x.setAttribute("aria-checked",x===b?"true":"false")});
  refreshTypes(null);formErr("");
  if(TRIPT[selType]&&!legSel){legSel=onlyLeg(curDay());legManual=!!legSel}
  refreshLegField();autoLeg();dayChanged();refreshLocFields()}
 else if(a==="leg-via-open"){viaOpen=true;refreshLegField();var fv=$("#f-via");if(fv)try{fv.focus()}catch(_){}}
 else if(a==="leg-via-cancel"){viaOpen=false;refreshLegField()}
 else if(a==="leg-via-add"){addViaFromForm()}
 else if(a==="leg-via-del"){confirmTap(b,"Confirmar",function(){delViaFromForm(Number(b.dataset.k))})}
 else if(a==="unlink"){var un=+b.dataset.n;locS[un].u="";locS[un].src="";locS[un].noAuto=true;refreshLocStat(un)}
 else if(a==="loc-use"){
  // usar un lugar existente: su nombre, su enlace y (si es una sola) su ciudad
  var lu=+b.dataset.n,op=locOpts[lu][+b.dataset.i];if(!op)return;
  var ls1=locS[lu];ls1.t=op.name;ls1.u=op.url;ls1.src="sug";ls1.noAuto=false;
  if(op.cities&&op.cities.length===1&&needsCityChoice(ctxFor(lu)))ls1.c=op.cities[0];
  var li=$("#f-loc"+lu);if(li)li.value=op.name;refreshLocStat(lu);autoLeg();
 }
 else if(a==="loc-rename"){
  var lr=+b.dataset.n,ls2=locS[lr];
  ls2.t=freeName(placeIndex(),ls2.t,slotCities(ctxFor(lr)),editing?editing.id:null);
  var lri=$("#f-loc"+lr);if(lri)lri.value=ls2.t;refreshLocStat(lr);
 }
 else if(a==="loc-city"){
  var lc=+b.dataset.n;locS[lc].c=locS[lc].c===b.dataset.c?null:b.dataset.c;
  // en traslados, la ciudad elegida puede decidir el trayecto (y con él la otra ciudad)
  var lg0=curLeg();autoLeg();
  if(curLeg()!==lg0){[1,2].forEach(autoLink);refreshLocFields()}else{autoLink(lc);refreshLocStat(lc)}
 }
 else if(a==="loc-paste"){
  var lp=+b.dataset.n;
  if(!navigator.clipboard||!navigator.clipboard.readText){toast("Pega el enlace en el campo, antes o después del nombre");return}
  navigator.clipboard.readText().then(function(txt){
   var ex=extractMapsUrl(txt);if(!ex.url){toast("No hay un enlace de Google Maps copiado");return}
   var s3=locS[lp];s3.u=ex.url;s3.src="link";s3.noAuto=false;
   if(!s3.t.trim()){s3.t=ex.rest||nameFromUrl(ex.url)||"";var pi=$("#f-loc"+lp);if(pi)pi.value=s3.t}
   refreshLocStat(lp);autoLeg();toast("Enlace vinculado");
  }).catch(function(){toast("Pega el enlace en el campo, antes o después del nombre")});
 }
 else if(a==="theme"){setKV("theme",b.dataset.v);applyTheme();sheetBody.querySelectorAll("[data-act=theme]").forEach(function(x){x.setAttribute("aria-pressed",x===b?"true":"false")})}
 else if(a==="cfold"){var ck=b.dataset.k;colap[ck]=!colap[ck];b.setAttribute("aria-expanded",String(!colap[ck]));b.parentNode.classList.toggle("fold",!!colap[ck])}
 else if(a==="go"){var ge=document.getElementById(b.dataset.id);if(ge)ge.scrollIntoView({behavior:"smooth",block:"start"})}
 else if(a==="list"){openListSheet(b.dataset.city,b.dataset.kind)}
 else if(a==="item-edit"){openItemForm(b.dataset.id)}
 else if(a==="item-add"){openItemForm(null)}
 else if(a==="ord-start"){openListSheet(listCtx.cid,listCtx.kind,true)}
 else if(a==="ord-cancel"){openListSheet(listCtx.cid,listCtx.kind)}
 else if(a==="ord-done"){saveOrder()}
 else if(a==="item-back"){if(!revReturn())openListSheet(listCtx.cid,listCtx.kind)}
 else if(a==="item-save"){saveItem()}
 else if(a==="item-del"){confirmTap(b,"Confirmar",deleteItem)}
 else if(a==="list-reset"){confirmTap(b,"Confirmar",function(){var rc=listCtx;delKV("pl:"+rc.cid+":"+rc.kind).then(function(){refresh();openListSheet(rc.cid,rc.kind);toast("Lista restaurada")})})}
 else if(a==="save"){saveFromSheet()}
 else if(a==="delete"){confirmTap(b,"Confirmar",function(){removeDoc(editing.id).then(function(){closeSheet();refresh();toast("Documento eliminado")})})}
 else if(a==="resto"){var s=((kv[b.dataset.k]||0)+1)%4;setKV(b.dataset.k,s).then(refresh)}
 else if(a==="filter"){docFilter=b.dataset.f;renderDocsView()}
 else if(a==="settings"){openSettings()}
 else if(a==="mmode"){mapState.mode=b.dataset.v;renderMap()}
 else if(a==="mfilt"){openMapFilters()}
 else if(a==="mgrp"){
  if(b.dataset.g==="st"){if(mapStIs(MST_ALL))mapState.st={};else{mapState.st={};MST_ALL.forEach(function(x){mapState.st[x]=1})}}
  else{var gl=MGROUPS[b.dataset.g],gon=gl.every(function(c){return mapState.cats[c]});gl.forEach(function(c){if(gon)delete mapState.cats[c];else mapState.cats[c]=1})}
  renderMap();openMapFilters()}
 else if(a==="mst"){var sv0=b.dataset.v;if(mapState.st[sv0])delete mapState.st[sv0];else mapState.st[sv0]=1;renderMap();openMapFilters()}
 else if(a==="mreset"){mapState.cats={hotel:1,trans:1,see:1,eat:1,other:1};mapState.st={0:1,1:1,2:1};renderMap();openMapFilters()}
 else if(a==="mstep"){mapStep(+b.dataset.d)}
 else if(a==="mreview"){openReview()}
 else if(a==="rev-edit"){revEdit(b)}
 else if(a==="geo-no"){geoNo(b.dataset.gk,b.dataset.pk,b.dataset.id)}
 else if(a==="geo-undo"){geoUndo(b.dataset.gk)}
 else if(a==="plan-add"){openPlanPicker()}
 else if(a==="plan-pick"){var pb=b;planToggle(pb.dataset.pk,mapDayId()).then(function(){var on=planEvs(pb.dataset.pk,mapDayId()).length>0;pb.setAttribute("aria-pressed",on);pb.querySelector(".mchk").innerHTML=on?svg("check",16):""})}
 else if(a==="plan-one"){planToggle(b.dataset.pk,b.dataset.day).then(closeSheet)}
 else if(a==="mcat"){var mc=b.dataset.c;if(mapState.cats[mc])delete mapState.cats[mc];else mapState.cats[mc]=1;renderMap();if(b.closest("#sheet"))openMapFilters()}
 else if(a==="mcard"){openMapCard(b.dataset.id)}
 else if(a==="m-me"){gmLocate()}
 else if(a==="m-fit"){gmFit(mapShown(mapPoints()))}
 else if(a==="monly"){mapState.only=!mapState.only;gmKeep=true;renderMap()}
 else if(a==="monly-on"){mapState.only=true;gmKeep=true;renderMap()}
 else if(a==="map-day"){mapState.day=b.dataset.day;mapFrom=location.hash||"#inicio";location.hash="#mapa"}
 else if(a==="spend"){openSpend()}
 else if(a==="sumtog"){setKV("sumOpen",!kv.sumOpen);renderDocsView()}
 else if(a==="pastdocs"){pastOpen=!pastOpen;renderDocsView()}
 else if(a==="spend-print"){printSpend()}
 else if(a==="export"){openExportSheet()}
 else if(a==="exp-kind"){expKindChanged(b)}
 else if(a==="exp-make"){makeExport(b)}
 else if(a==="exp-share"){shareExport()}
 else if(a==="exp-dl"){downloadFile(expFile)}
 else if(a==="imp-pass"){unlockImport(b)}
 else if(a==="imp-apply"){applyImport(b.dataset.v,b)}
 else if(a==="persist"){if(navigator.storage&&navigator.storage.persist){navigator.storage.persist().then(function(ok){toast(ok?"Datos protegidos":"El navegador no lo ha concedido")})}else toast("No disponible en este navegador")}
});
document.addEventListener("change",function(e){
 clearBad(e.target);
 if(e.target.id==="f-day"){var fe0=$("#f-err");if(fe0&&fe0.dataset.k==="type")formErr("")}
 if(e.target.type==="time")syncTimeClr(e.target);
 if(e.target.id==="m-day"){mapState.day=e.target.value;renderMap();return}
 if(e.target.dataset&&e.target.dataset.spinc){saveIncl(e.target);return}
 if(e.target.dataset&&(e.target.dataset.paid||e.target.dataset.paidc)){savePaid(e.target.dataset.paid||e.target.dataset.paidc);return}
 if(e.target.classList&&e.target.classList.contains("statsel")){var sv=+e.target.value;e.target.className="stat statsel s"+sv;setKV(e.target.dataset.k,sv);if(view==="map")renderMap();return}
 if(e.target.id==="f-file"){var f=e.target.files[0];if(f){var fd=$("#f-filedel");if(fd)fd.hidden=false;$("#f-name").innerHTML=esc(f.name)+"<small>"+fmtSize(f.size)+"</small>";var ft=$("#f-title");if(ft&&!ft.value)ft.value=f.name.replace(/\.[^.]+$/,"");
  var bn=$("#f-bignote");if(bn){bn.hidden=f.size<=BIG_FILE;bn.textContent=f.size>BIG_FILE?"Este archivo pesa "+fmtSize(f.size)+". Las copias de seguridad tardarán y pueden fallar en iPhone o iPad. Si puedes, usa un PDF más liviano o una captura.":""}}}
 else if(e.target.id==="f-day"){
  formDay=e.target.value;toSel="";viaOpen=false;
  legSel=onlyLeg(formDay);legManual=!!legSel;refreshLegField();autoLeg();
  dayChanged();refreshLocFields();refreshTypes(null);
 }
 else if(e.target.id==="f-to"){toSel=e.target.value}
 else if(e.target.id==="f-leg"){legSel=e.target.value;legManual=true;dayChanged();refreshLocFields();refreshTransport()}
 else if(e.target.id==="s-import"){var f2=e.target.files[0];if(f2)importBackup(f2)}
});
function clearBad(t){if(!t||!t.classList||!t.classList.contains("bad"))return;t.classList.remove("bad");var fe=$("#f-err");if(fe&&fe.dataset.k!=="conflict")formErr("")}
document.addEventListener("input",function(e){
 clearBad(e.target);
 if(e.target.type==="time"){syncTimeClr(e.target);
  // traslado: la llegada pasa sola a +1 si es antes que la salida, y se recalculan las escalas
  if(ARRT[selType]&&$("#f-timewrap")&&$("#f-timewrap").contains(e.target)){captureFx();if(!fx.arrManual)fx.arr=autoArr(fxDoc());else fx.arr=Math.max(fx.arr,minArr());arrErr("");refreshArr();refreshLays()}
  return}
 if(e.target.id==="e-pass"||e.target.id==="e-pass2"){if(expFile)expReset();expUI();return}
 var el=e.target,n=el.dataset&&el.dataset.loc;if(!n)return;n=+n;
 var s=locS[n],v=el.value,ex=extractMapsUrl(v),pick=sugLabels[n][v];
 if(ex.url){
  // enlace pegado (antes o después del nombre): manda. Se conserva el nombre escrito.
  var nn=ex.rest||s.t.trim()||nameFromUrl(ex.url)||"";
  s.u=ex.url;s.src="link";s.noAuto=false;s.t=nn;el.value=nn;
  el.placeholder=nn?"Nombre del lugar":"Escribe un nombre para este enlace";
  if(!nn){try{el.focus()}catch(_){}}
 }else if(pick&&pick.url&&(s.src!=="link"||pick.label!==pick.name)){
  // eligió una sugerencia de la lista ("Casa · Madrid" se elige aunque haya un enlace pegado)
  s.t=pick.name;s.u=pick.url;s.src="sug";s.noAuto=false;el.value=pick.name;
  if(pick.cities&&pick.cities.length===1&&needsCityChoice(ctxFor(n)))s.c=pick.cities[0];
 }else{
  if(normName(v)!==normName(s.t))s.noAuto=false; // cambió el nombre: puede volver a vincularse solo
  s.t=v;autoLink(n);                           // un enlace pegado nunca se pisa (ver autoLink)
 }
 autoLeg();
 refreshLocStat(n);
});
document.addEventListener("keydown",function(e){if(e.key!=="Escape")return;if(vw){closeViewer();return}if(!sheet.hidden)closeSheet()});
window.addEventListener("hashchange",route);
// Es una app: sin zoom con dos dedos. iOS ignora user-scalable=no del viewport, así que se frena el gesto.
["gesturestart","gesturechange"].forEach(function(t){document.addEventListener(t,function(e){e.preventDefault()},{passive:false})});

if(fab)fab.innerHTML=svg("plus",24)+'<span>Añadir documento</span>';
window.addEventListener("scroll",updateFab,{passive:true});
// hojas: la cabecera (título y Cerrar/Cancelar) queda fija; con una línea debajo cuando hay contenido detrás
sheetBody.addEventListener("scroll",function(){var on=sheetBody.scrollTop>4;if(sheetHead.classList.contains("scrolled")!==on)sheetHead.classList.toggle("scrolled",on)},{passive:true});
window.addEventListener("resize",updateFab);
/* Barra de abajo solo con íconos (el título de cada página dice dónde se está); el nombre va en aria-label */
[["#nav-home","way","Ruta"],["#nav-cal","cal","Calendario"],["#nav-map","route","Mapa"],["#nav-docs","file","Documentos"],["#nav-set","sliders","Ajustes"]].forEach(function(x){var el=$(x[0]);el.innerHTML=svg(x[1],26);el.setAttribute("aria-label",x[2]);el.setAttribute("title",x[2])});

loadAll().then(function(){
 applyTheme();
 try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist()}catch(e){}
 var t=todayStr();
 route();
});
})();
