// En el archivo almacen.js

const INDEXDB_NAME = "NeoWsBD";
const INDEXDB_VERSION = 1;
const STORE_NAME = "NeoStore";
let db;

// Función para abrir la base de datos
function openDB() {
    return new Promise((resolve, reject) => {
        let request = indexedDB.open(INDEXDB_NAME, INDEXDB_VERSION);

        request.onsuccess = (event) => {
            db = event.target.result;
            resolve();
        };

        request.onerror = (event) => {
            console.error("Error al abrir la base de datos: ", event.target.error);
            reject(event.target.error);
        };
    });
}


// Función para obtener todos los objetos guardados
function obtenerObjetosGuardados() {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject("La base de datos no está abierta.");
        }

        let transaction = db.transaction([STORE_NAME], "readonly");
        let objectStore = transaction.objectStore(STORE_NAME);
        let request = objectStore.getAll();

        request.onsuccess = (event) => {
            const objetos = event.target.result;
            console.log("Objetos obtenidos:", objetos); // Imprime los objetos
            resolve(objetos);
        };

        request.onerror = (event) => {
            console.error("Error al obtener objetos: ", event.target.error);
            reject(event.target.error);
        };
    });
}

// Función para mostrar los nombres en la página
function mostrarNombres() {
    var favoritosFin = false;

    openDB()
        .then(() => {
            return obtenerObjetosGuardados();
        })
        .then((objetos) => {
            const menuObjetos = document.getElementById("menu");
            menuObjetos.innerHTML = '';
            const listaObjetos = document.createElement("ul");

            if (objetos.length === 0) {
                menuObjetos.innerHTML = "<h2 class='text-center text-warning'>No hay objetos guardados</h2>";
            } else {
                // Ordenar objetos: Favoritos primero
                objetos.sort((a, b) => (b.Favorito - a.Favorito));

                objetos.forEach((objeto) => {
                    // Insertar el hr después de los objetos favoritos
                    if (!objeto.Favorito && !favoritosFin) {
                        listaObjetos.innerHTML += "<hr>";
                        favoritosFin = true;
                    }
                    if (!favoritosFin) {
                        listaObjetos.innerHTML += `<li class="objetoLista" onclick="verDetalles(${objeto.id})"><i class="bi bi-star text-warning"/><span class="text-white">${objeto.nombre}</span></li>`;
                    } else {
                        listaObjetos.innerHTML += `<li class="objetoLista" onclick="verDetalles(${objeto.id})">${objeto.nombre}</li>`;
                    }

                });

                // Insertar la lista justo después del <h2>
                menuObjetos.insertAdjacentHTML("beforeend", listaObjetos.outerHTML);
            }
        })
        .catch((error) => {
            console.error("Error: " + error);
        });
}

async function verDetalles(id) {

    var API = `https://api.nasa.gov/neo/rest/v1/neo/${id}?api_key=DEMO_KEY`; //Cogemos el objeto por el id
    var response = await fetch(API);
    var data = await response.text();
    var objeto = JSON.parse(data);
    console.log(objeto);

    const datosObjeto = document.querySelector(".datosObjeto");
    datosObjeto.classList.remove('invisible');
    datosObjeto.classList.add('visible');

    datosObjeto.innerHTML = `<div class="contenidoInfo text-center">
                                <div class="informacion">
                                    <h1>Objeto: ${objeto.name}</h1>
                                    <hr>
                                    <p>Identificador: ${objeto.id}</p>
                                    <p>¿Es potencialmente peligroso? <strong ${objeto.is_potentially_hazardous_asteroid ? 'class="text-danger">Sí' : 'class="text-success">No'}</strong></p>
                                    <p>Magnitud absoluta: <b>${objeto.absolute_magnitude_h}</b> (h)</p>
                                    <p>Diámetro máximo estimado: <b>${objeto.estimated_diameter.meters.estimated_diameter_max}</b> (metros)</p>
                                    <p>Diámetro mínimo estimado: <b>${objeto.estimated_diameter.meters.estimated_diameter_min}</b> (metros)</p>
                                    <p>¿Está siendo observado por el sistema Sentry? <strong ${objeto.is_sentry_object ? 'class="text-warning">Sí' : 'class="text-success">No'}</strong>
                                    <p><a href="${objeto.nasa_jpl_url}" target="_blank">Link de la NASA del objeto</a>
                                </div>
                                <hr>
                                <div class="controles">
                                    <button class="btn btn-success" onclick="favorito(${objeto.id})">Favorito <i class="bi bi-star text-warning"></i></button>
                                    <button class="btn btn-secondary" onclick="borrar(${objeto.id})">Borrar <i class="bi bi-x text-danger"></i></button>
                                </div>
                            </div>`;

}

function favorito(id) {
    openDB()
        .then(() => {
            return obtenerObjetosGuardados();
        })
        .then((objetos) => {
            const objeto = objetos.find((o) => o.id === id);

            if (objeto) {
                objeto.Favorito = !objeto.Favorito; // Cambiar el valor de "Favorito"

                // Actualizar el objeto en la base de datos
                return actualizarObjeto(objeto);
            }
        })
        .then(() => {
            // Después de actualizar, volver a mostrar los nombres
            mostrarNombres();
        })
        .catch((error) => {
            console.error("Error: " + error);
        });
}

// Función para actualizar un objeto en la BD
function actualizarObjeto(objeto) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject("La base de datos no está abierta.");
        }

        let transaction = db.transaction([STORE_NAME], "readwrite");
        let objectStore = transaction.objectStore(STORE_NAME);
        let request = objectStore.put(objeto);

        request.onsuccess = (event) => {
            console.log(`Objeto con ID ${objeto.id} actualizado correctamente.`);
            resolve();
        };

        request.onerror = (event) => {
            console.error("Error al actualizar objeto: ", event.target.error);
            reject(event.target.error);
        };
    });
}
function borrar(id) {
    openDB()
        .then(() => {
            // Obtener todos los objetos guardados
            return obtenerObjetosGuardados();
        })
        .then((objetos) => {
            const objeto = objetos.find((o) => o.id === id);

            if (objeto) {
                // Borrar el objeto de la base de datos
                return borrarObjeto(id);
            }
        })
        .then(() => {
            // Después de borrar, volver a mostrar los nombres
            mostrarNombres();
        })
        .catch((error) => {
            console.error("Error: " + error);
        });
}

// Función para borrar un objeto de la BD
function borrarObjeto(id) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject("La base de datos no está abierta.");
        }

        let transaction = db.transaction([STORE_NAME], "readwrite");
        let objectStore = transaction.objectStore(STORE_NAME);
        let request = objectStore.delete(id);

        const datosObjeto = document.querySelector(".datosObjeto");
        datosObjeto.classList.remove('visible');
        datosObjeto.classList.add('invisible');

        request.onsuccess = (event) => {
            console.log(`Objeto con ID ${id} borrado correctamente.`);
            alert(`Objeto con ID ${id} borrado correctamente.`);
            resolve();
        };

        request.onerror = (event) => {
            console.error("Error al borrar objeto: ", event.target.error);
            reject(event.target.error);
        };
    });
}

// Llama a la función para mostrar los nombres cuando la página se carga completamente
document.addEventListener("DOMContentLoaded", mostrarNombres);
