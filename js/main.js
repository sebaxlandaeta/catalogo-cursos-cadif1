'use strict';

function getDatos(url) {
    return fetch(url)
        .then((response) => {
            if (!response.ok) {
                const error = new Error(`Error HTTP: ${response.status}`);
                error.status = response.status;
                throw error;
            }
            return response.json();
        })
        .catch((error) => {
            console.error(`[Error de Red/Servidor]: ${error.message}`);
            throw error;
        });
}

function getAreas() {
    getDatos('https://api.cadif1.com/areadeestudio')
        .then((data) => {
            if (!data || !data.areas) return;
            const areas = data.areas;
            renderizarAreas(areas);
        })
        .catch((error) => {
            const navAreas = document.getElementById('areas-estudio');
            if (navAreas) {
                navAreas.innerHTML = `
                    <div class="p-3 text-center text-xs text-rose-500 bg-rose-500/10 rounded-xl">
                        No se pudieron cargar las áreas. ${error.message || 'Error de conexión.'}
                    </div>
                `;
            }
        });
}

function getCursos(id) {
    volverAlCatalogo();
    mostrarSpinner();
    getDatos(`https://api.cadif1.com/curso/de_un_area/${id}`)
        .then((data) => {
            if (!data || !data.cursos) return;
            const arrayCursos = data.cursos;
            renderizarCursos(arrayCursos);
        })
        .catch((error) => {
            mostrarErrorEnResultados(error);
        });
}

function getDetalleCurso(id) {
    const catalogoCursos = document.getElementById('catalogo');
    if (catalogoCursos) {
        catalogoCursos.classList.add('hidden');
    }
    
    mostrarSpinnerDetalle();
    getDatos(`https://api.cadif1.com/curso/${id}`)
        .then((data) => {
            ocultarSpinnerDetalle();
            if (!data || !data.curso) return;
            const cursoDetalles = data.curso;
            renderizarDetalles(cursoDetalles);
        })
        .catch((error) => {
            ocultarSpinnerDetalle();
            mostrarErrorEnDetalle(error);
        });
}

function renderizarAreas(areas) {
    const areasDisponibles = document.getElementById('areas-disponibles');
    const navAreas = document.getElementById('areas-estudio');
    const areasFiltradas = areas.filter((area) => area.nromaterias > 0);

    if (areasDisponibles) {
        areasDisponibles.innerText = `${areasFiltradas.length} Disponibles`;
    }

    let content = '';
    areasFiltradas.forEach((area) => {
        content += `
            <a onclick="getCursos(${area.id}); return false;" href="#" class="flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 focus:bg-slate-100 dark:focus:bg-slate-800/60 dark:hover:bg-slate-800/60 focus:text-indigo-600 hover:text-indigo-600 dark:focus:text-indigo-400 dark:hover:text-indigo-400 font-medium text-sm transition group">
                <div class="flex items-center gap-3">
                    <span>${area.nombre}</span>
                </div>
                <span class="text-xs bg-slate-100 dark:bg-indigo-500/10 text-slate-600 dark:text-indigo-400 group-hover:bg-indigo-50 dark:group-focus:text-indigo-400 group-focus:text-indigo-600 text-indigo-600 dark:group-hover:bg-indigo-500/10 dark:group-hover:text-indigo-400 px-2 py-0.5 rounded-full transition">${area.nromaterias}</span>
            </a>       
        `;
    });

    if (navAreas) {
        navAreas.innerHTML = content;
    }
}

function renderizarCursos(cursos) {
    const resultados = document.getElementById('resultados-cursos');

    if (cursos.length === 0) {
        if (resultados) {
            resultados.innerHTML = `
                <div class="col-span-full text-center py-12 text-slate-500 text-xs">
                    No hay cursos disponibles para esta área.
                </div>
            `;
        }
        return;
    }

    let content = '';
    cursos.forEach((curso) => {
        let nivel = curso.niveles > 1 ? 'Niveles' : 'Nivel';
        content += `
            <div onclick="getDetalleCurso(${curso.id})" class="p-4 rounded-xl bg-gray-100 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-slate-700 shadow-sm dark:shadow-none transition flex flex-col justify-between group cursor-pointer">
                <div class="mt-2 mb-1">
                    <h4 class="font-semibold text-[16px] text-indigo-600 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">${curso.nombre}</h4>
                    <p class="text-xs text-slate-600 dark:text-slate-400 my-2 line-clamp-2">${curso.objetivoresumido}</p>
                </div>
                <div class="flex flex-col border-t border-slate-200 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400 text-center pt-3 gap-1">
                    <p>Tiene ${curso.niveles} ${nivel}</p>
                    <p>${curso.participantes} personas han realizado este curso</p>
                </div>
            </div>
        `;
    });

    if (resultados) {
        resultados.innerHTML = content;
    }
}

function renderizarDetalles(detalles) {
    const main = document.getElementById('principal');
    const catalogoCursos = document.getElementById('catalogo');
    const detalleExistente = document.getElementById('detalles-curso');
    if (detalleExistente) {
        detalleExistente.remove();
    }

    if (catalogoCursos) {
        catalogoCursos.classList.add('hidden');
    }

    const nivelesHTML = detalles.niveles ? detalles.niveles.map((nivel) => {
        const listaObjetivos = nivel.objetivosespecificos 
            ? nivel.objetivosespecificos
                .split('\r\n')
                .filter(item => item.trim() !== '')
                .map(item => `<li>${item.replace(/^-\s*/, '')}</li>`)
                .join('')
            : '';

        const precioFormateado = nivel.precio 
            ? parseFloat(nivel.precio).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) 
            : '0,00';

        return `
            <div class="p-4 rounded-xl bg-slate-200/50 dark:bg-slate-800/40 border border-indigo-200/80 dark:border-slate-800 shadow-sm space-y-3">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div class="flex items-center gap-2">
                        <span class="px-2 py-0.5 rounded text-xs font-bold border border-indigo-500/20 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 dark:text-indigo-400">
                            ${nivel.nombre}
                        </span>
                        <h3 class="text-sm font-semibold text-slate-800 dark:text-slate-100">${nivel.objetivoprincipal || ''}</h3>
                    </div>
                    <div class="flex items-center gap-3 text-xs">
                        <span class="text-sm font-bold text-indigo-500 dark:text-indigo-400">${precioFormateado} BS</span>
                    </div>
                </div>
                ${listaObjetivos ? `
                    <div>
                        <h4 class="text-[11px] font-bold uppercase text-slate-400 mb-1">Objetivos Específicos</h4>
                        <ul class="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
                            ${listaObjetivos}
                        </ul>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('') : '';

    if (main) {
        main.insertAdjacentHTML('beforeend', `
            <section id="detalles-curso" class="w-full space-y-6">
                <button onclick="volverAlCatalogo()" class="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-200/60 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-sm cursor-pointer mb-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                    </svg>
                    Volver al catálogo
                </button>

                <div class="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-xl transition-all duration-300">
                    <div class="flex flex-wrap items-center justify-between gap-2 mb-4">
                        <div class="flex items-center gap-2">
                            <span class="px-3 py-1 text-xs font-semibold rounded-md bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20">
                                ${detalles.areaestudio || 'Área de estudio'}
                            </span>
                            <span class="px-2.5 py-1 text-xs font-medium rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 flex items-center gap-1.5">
                                <span class="w-2 h-2 rounded-full ${detalles.activa === "1" ? 'bg-emerald-500' : 'bg-rose-500'}"></span>
                                ${detalles.activa === "1" ? 'Activo' : 'Inactivo'}
                            </span>
                        </div>
                        <span class="text-xs font-mono font-semibold tracking-wider text-slate-500 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-md">
                            CÓDIGO: ${detalles.codigo}
                        </span>
                    </div>

                    <div class="mb-3">
                        <h1 class="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
                            ${detalles.nombre}
                        </h1>
                        ${detalles.titulo ? `
                            <p class="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-2">
                                Certificado: ${detalles.titulo}
                            </p>
                        ` : ''}
                    </div>

                    <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                        ${detalles.objetivogeneral || ''}
                    </p>

                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-200/60 dark:bg-slate-950/80 border border-indigo-200/80 dark:border-slate-800 mb-8">
                        <div class="flex flex-col justify-center items-center">
                            <span class="block text-[11px] font-medium text-slate-500 dark:text-slate-400">Niveles del curso</span>
                            <span class="text-xs font-semibold text-slate-500 dark:text-slate-300 mt-1 block truncate">
                                ${detalles.niveles ? (detalles.niveles.length > 1 ? `${detalles.niveles.length} Niveles` : `${detalles.niveles.length} Nivel`) : '0 Niveles'}
                            </span>
                        </div>

                        <div class="flex flex-col justify-center items-center">
                            <span class="block text-[11px] font-medium text-slate-500 dark:text-slate-400">Fecha de Creación</span>
                            <span class="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1 block">${detalles.fechacreacion || 'N/A'}</span>
                        </div>

                        <div class="flex flex-col justify-center items-center">
                            <span class="block text-[11px] font-medium text-slate-500 dark:text-slate-400">Evaluación</span>
                            <span class="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1 block">
                                ${detalles.tieneexamen === "1" && detalles.tienetarea === "1" ? 'Examen y Tarea' : detalles.tieneexamen === "1" ? 'Examen' : 'Evaluación Continua'}
                            </span>
                        </div>

                        <div class="flex flex-col justify-center items-center">
                            <span class="block text-[11px] font-medium text-slate-500 dark:text-slate-400">Última Actualización</span>
                            <span class="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1 block">${detalles.ultimaactualizacion ? detalles.ultimaactualizacion.split(' ')[0] : 'N/A'}</span>
                        </div>
                    </div>

                    <div>
                        <div class="flex items-center justify-between mb-4">
                            <h2 class="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                Niveles del Curso (${detalles.niveles ? detalles.niveles.length : 0})
                            </h2>
                        </div>

                        <div id="curso-niveles" class="space-y-4">
                            ${nivelesHTML}
                        </div>
                    </div>

                    <div class="mt-6 p-4 rounded-xl bg-slate-200/60 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/60 space-y-3">
                        ${detalles.infmateria ? `
                            <div>
                                <h2 class="text-xs font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400 mb-1">
                                    Sobre este curso
                                </h2>
                                <p class="text-xs sm:text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                    ${detalles.infmateria}
                                </p>
                            </div>
                        ` : ''}

                        ${detalles.haciaquienestaorientado ? `
                            <div class="pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                                <h2 class="text-xs font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400 mb-1">
                                    ¿A quién está orientado?
                                </h2>
                                <p class="text-xs sm:text-xs text-slate-500 dark:text-slate-400">
                                    ${detalles.haciaquienestaorientado}
                                </p>
                            </div>
                        ` : ''}

                        ${detalles.recuperacioninversion ? `
                            <div class="pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                                <h2 class="text-xs font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400 mb-1">
                                    Retorno de Inversión
                                </h2>
                                <p class="text-xs sm:text-xs text-slate-500 dark:text-slate-400">
                                    ${detalles.recuperacioninversion}
                                </p>
                            </div>
                        ` : ''}
                    </div>

                </div>
            </section>
        `);
    }
}

function mostrarSpinner() {
    const resultados = document.getElementById('resultados-cursos');
    if (resultados) {
        resultados.innerHTML = `
            <div class="col-span-full flex flex-col items-center justify-center py-16 gap-3 text-slate-500 dark:text-slate-400">
                <div class="w-9 h-9 border-4 border-indigo-500/20 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin"></div>
                <span class="text-xs font-medium tracking-wide">Cargando cursos...</span>
            </div>
        `;
    }
}

function mostrarSpinnerDetalle() {
    const main = document.getElementById('principal');
    const detalleExistente = document.getElementById('detalles-curso');
    if (detalleExistente) detalleExistente.remove();

    if (main) {
        main.insertAdjacentHTML('beforeend', `
            <div id="loading-detalle" class="w-full flex flex-col items-center justify-center py-20 gap-3 text-slate-500 dark:text-slate-400">
                <div class="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin"></div>
                <span class="text-sm font-medium tracking-wide">Cargando detalles del curso...</span>
            </div>
        `);
    }
}

function ocultarSpinnerDetalle() {
    const spinner = document.getElementById('loading-detalle');
    if (spinner) {
        spinner.remove();
    }
}

function mostrarErrorEnResultados(error) {
    const resultados = document.getElementById('resultados-cursos');
    if (resultados) {
        resultados.innerHTML = `
            <div class="col-span-full text-center py-12 px-4 rounded-xl border border-rose-200 dark:border-rose-900/30 bg-rose-50/50 dark:bg-rose-950/10 space-y-2">
                <p class="text-sm font-semibold text-rose-600 dark:text-rose-400">
                    Ocurrió un error al cargar los cursos.
                </p>
                <p class="text-xs text-slate-500 dark:text-slate-400">
                    ${error.status === 404 ? 'La ruta solicitada no existe (Error 404).' : 'Verifica tu conexión a internet o intenta nuevamente.'}
                </p>
            </div>
        `;
    }
}

function mostrarErrorEnDetalle(error) {
    const main = document.getElementById('principal');
    const detalleExistente = document.getElementById('detalles-curso');
    if (detalleExistente) detalleExistente.remove();

    if (main) {
        main.insertAdjacentHTML('beforeend', `
            <div id="detalles-curso" class="w-full text-center py-12 px-4 rounded-xl border border-rose-200 dark:border-rose-900/30 bg-rose-50/50 dark:bg-rose-950/10 space-y-4">
                <div>
                    <p class="text-sm font-semibold text-rose-600 dark:text-rose-400">
                        No se pudieron cargar los detalles de este curso.
                    </p>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        ${error.status === 404 ? 'El curso no existe o no está disponible.' : 'Intenta nuevamente en unos momentos.'}
                    </p>
                </div>
                <button onclick="volverAlCatalogo()" class="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-sm cursor-pointer">
                    Volver al catálogo
                </button>
            </div>
        `);
    }
}

function volverAlCatalogo() {
    const catalogoCursos = document.getElementById('catalogo');
    const detallesCurso = document.getElementById('detalles-curso');

    if (catalogoCursos) {
        catalogoCursos.classList.remove('hidden');
    }
    if (detallesCurso) {
        detallesCurso.remove();
    }
}

getAreas();