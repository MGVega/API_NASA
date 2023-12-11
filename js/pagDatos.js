
//------------- VER DATOS BUSCADOS -------------
if (window.location.pathname.endsWith('datos.html')) { // Llamar a la función solo si estamos en la página "datos.html"

    const INDEXDB_NAME = "NeoWsBD";
    const INDEXDB_VERSION = 1;
    const STORE_NAME = "NeoStore";

    async function request() {
        // Cogemos parámetros de la URL
        var urlParams = new URLSearchParams(window.location.search);
        var fechaDesde = 'fechaDesde';
        var fechaHasta = 'fechaHasta';
        fechaDesde = urlParams.get(fechaDesde);
        fechaHasta = urlParams.get(fechaHasta);

        var API = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${fechaDesde}&end_date=${fechaHasta}&api_key=DEMO_KEY`;

        var response = await fetch(API);

        var data = await response.text();
        var datos = JSON.parse(data);
        console.log(datos);

        var fechasElegidas = document.getElementById("fechasElegidas");
        fechasElegidas.innerHTML = `Entre las fechas:<br>
                                    <b class="text-primary">${fechaDesde}</b> y <b class="text-primary">${fechaHasta}</b><br>
                                    Se han registrado <b class="text-warning">${datos.element_count}</b> elementos en total:`;


        var nearEarthObjects = datos.near_earth_objects;
        var nearEarthObjects = Object.keys(nearEarthObjects).sort((a, b) => new Date(a) - new Date(b));

        // Itera sobre las fechas
        var acordeon = document.getElementById("acordeon");

        nearEarthObjects.forEach(fecha => {
            // Accede a la matriz de objetos para la fecha actual
            var objetos = datos.near_earth_objects[fecha];

            acordeon.innerHTML += ` <div class="card">
                                        <div class="card-header" id="${fecha}">
                                            <h2 class="mb-0">
                                                <button class="btn btn-link" type="button" data-toggle="collapse" data-target="#${fecha}_cont" aria-expanded="true" aria-controls="${fecha}_cont">
                                                    ${fecha}
                                                </button>
                                            </h2>
                                        </div>
                                        <div id="${fecha}_cont" class="collapse show" aria-labelledby="${fecha}" data-parent="#acordeon">
                                            <ol>` +
                objetos.map(objeto => ` <li class="objetoLista" onclick="mostrarDetalles(${objeto.id})">${objeto.name}</li>
                                                                    <div id="modalElemento_${objeto.id}" class="modalDatos d-flex justify-content-center align-items-center d-none" style="position: fixed;">
                                                                        <div>
                                                                            <div class="contenidoModal">
                                                                                <div>
                                                                                    <h1 class="text-center">Objeto: ${objeto.name}</h1>
                                                                                    <p>Identificador: ${objeto.id}</p>
                                                                                    <p>¿Es potencialmente peligroso? <strong ${objeto.is_potentially_hazardous_asteroid ? 'class="text-danger">Sí' : 'class="text-success">No'}</strong></p>
                                                                                    <p>Magnitud absoluta: <b>${objeto.absolute_magnitude_h}</b> (h)</p>
                                                                                    <p>Diámetro máximo estimado: <b>${objeto.estimated_diameter.meters.estimated_diameter_max}</b> (metros)</p>
                                                                                    <p>Diámetro mínimo estimado: <b>${objeto.estimated_diameter.meters.estimated_diameter_min}</b> (metros)</p>
                                                                                    <p>¿Está siendo observado por el sistema Sentry? <strong ${objeto.is_sentry_object ? 'class="text-warning">Sí' : 'class="text-success">No'}</strong>
                                                                                    <p><a href="${objeto.nasa_jpl_url}" target="_blank">Link de la NASA del objeto</a>
                                                                                </div>
                                                                                <div class="controles">
                                                                                    <button class="btn btn-success" onclick="guardarContenido(${objeto.id}, '${objeto.name}')">Guardar datos</button>
                                                                                    <button class="btn btn-secondary" onclick="cerrarContenido(${objeto.id})">Cerrar</button>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>`).join('') +
                                                                            `</ol>
                                                                        </div>
                                                                    </div>`;
        });
    }

    document.addEventListener("DOMContentLoaded", async function () {
        await request();


    });

    function mostrarDetalles(id) {
        var modalDatos = document.getElementById('modalElemento_' + id);

        modalDatos.classList.add('d-block');
        modalDatos.classList.remove('d-none');

    }

    function cerrarContenido(id) {
        var modalDatos = document.getElementById('modalElemento_' + id);

        modalDatos.classList.add('d-none');
        modalDatos.classList.remove('d-block');
    }

    // Función para abrir la base de datos
    function openDB() {
        // Promesa para manejar operaciones asíncronas
        return new Promise((resolve, reject) => {
            // Solicitud para abrir la base de datos
            let request = indexedDB.open(INDEXDB_NAME, INDEXDB_VERSION);

            // Evento que indica que la base de datos está lista.
            request.onsuccess = (event) => {
                // Referencia a la BD
                db = event.target.result;
                // Indica que la promesa se completó con éxito
                resolve();
            };

            // Evento que indica que apertura ha fallado.
            request.onerror = (event) => {
                // Indica que la promesa falló
                reject(event.target.error);
            };

            // Evento que se activa cuando la versión cambia o se crea por primera vez
            request.onupgradeneeded = (event) => {
                db = event.target.result;

                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    // Crea un almacen de objetos (tabla), campo id como clave primaria y autoincremental
                    let objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
                }
            };
        });
    }

    function guardarContenido(id, nombre) {
        // Conexión y apertura de la BD
        openDB()
            .then(() => {
                // Añadimos un objeto con el id, nombre y el campo Favorito
                let objeto = { "id": id, "nombre": nombre, "Favorito": false };
                agregarObjeto(objeto)
                    .then(() => {
                        // Si se ha añadido correctamente
                        console.log(`Se ha guardado el objeto con ID ${id} y nombre ${nombre} en la base de datos.`);
                        alert(`Se ha guardado el objeto con ID ${id} y nombre ${nombre} en la base de datos.`);
                    })
                    .catch((error) => {
                        console.error("Error al agregar objeto: " + error);
                        alert("Error al agregar objeto: " + error);
                    });
            })
            .catch((error) => {
                console.error("Error al abrir la base de datos: " + error);
                alert("Error al abrir la base de datos: " + error);
            });
    }
    

    // Función genérica para agregar un objeto a la BD
    function agregarObjeto(objeto) {
        if (!db) {
            throw new Error("La base de datos no está abierta.");
        }

        return new Promise((resolve, reject) => {
            let transaction = db.transaction([STORE_NAME], "readwrite");
            let objectStore = transaction.objectStore(STORE_NAME);
            let request = objectStore.add(objeto);
            request.onsuccess = (event) => {
                resolve();
            };

            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }


}