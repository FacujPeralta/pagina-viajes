document.addEventListener('DOMContentLoaded', () => {
    const botonContainer = document.querySelector('.boton-agregarfoto');
    const inputFoto = document.createElement('input');
    inputFoto.type = 'file';
    inputFoto.accept = 'image/*';
    inputFoto.multiple = false; // IMPORTANTE: Permite seleccionar varias fotos a la vez
    inputFoto.style.display = 'none';

    // Botón Agregar
    const botonAgregar = document.createElement('button');
    botonAgregar.textContent = 'Agregar Fotos';
    botonAgregar.id = 'btn-agregar';
    
    // Botón Borrar TODO (opcional, para limpiar la lista completa)
    const botonBorrarTodo = document.createElement('button');
    botonBorrarTodo.textContent = 'Borrar Todas las Fotos';
    botonBorrarTodo.id = 'btn-borrar-todo';
    botonBorrarTodo.style.display = 'none';
    botonBorrarTodo.style.backgroundColor = '#dc3545';
    botonBorrarTodo.style.color = 'white';
    botonBorrarTodo.style.border = 'none';
    botonBorrarTodo.style.padding = '5px 10px';
    botonBorrarTodo.style.borderRadius = '5px';
    botonBorrarTodo.style.marginTop = '10px';
    botonBorrarTodo.style.cursor = 'pointer';

    // Botón para eliminar una foto específica (se crea dinámicamente, pero lo referenciamos aquí)
    // Lógica del botón Agregar
    botonAgregar.addEventListener('click', () => {
        inputFoto.click();
    });

    // Lógica del botón Borrar Todo
    botonBorrarTodo.addEventListener('click', () => {
        if(confirm('¿Estás seguro de que quieres borrar todas las fotos?')) {
            localStorage.removeItem('listaFotosViajes');
            // Limpiar la vista visual
            const contenedorGaleria = document.getElementById('galeria-fotos');
            if (contenedorGaleria) {
                contenedorGaleria.innerHTML = '';
            }
            // Ocultar botón borrar todo y mostrar agregar
            botonBorrarTodo.style.display = 'none';
            botonAgregar.style.display = 'inline-block';
            inputFoto.value = '';
        }
    });

    // Agregar elementos al contenedor principal
    botonContainer.appendChild(botonAgregar);
    botonContainer.appendChild(inputFoto);
    botonContainer.appendChild(botonBorrarTodo);

    // 1. Manejar la subida de múltiples imágenes
    inputFoto.addEventListener('change', (event) => {
        const archivos = event.target.files; // Obtenemos todos los archivos seleccionados

        if (archivos.length > 0) {
            // Procesar cada archivo uno por uno
            Array.from(archivos).forEach((archivo, index) => {
                const lector = new FileReader();

                lector.onload = (e) => {
                    const imagenBase64 = e.target.result;
                    guardarImagenEnLista(imagenBase64);
                };

                lector.readAsDataURL(archivo);
            });
            
            // Limpiar el input para permitir subir los mismos archivos si se repite
            inputFoto.value = '';
        }
    });

    // Función para guardar una imagen en el array y actualizar localStorage
    function guardarImagenEnLista(imagenBase64) {
        let listaFotos = obtenerListaFotos();
        
        // Agregar la nueva imagen al final del array
        listaFotos.push(imagenBase64);
        
        // Guardar el array actualizado en localStorage
        try {
            localStorage.setItem('listaFotosViajes', JSON.stringify(listaFotos));
            console.log('Imagen guardada en la lista.');
        } catch (error) {
            alert('La imagen es muy grande. Intenta con una más pequeña.');
            return;
        }

        // Mostrar la imagen en la pantalla
        mostrarImagenEnPagina(imagenBase64);
    }

    // Función auxiliar para leer la lista actual de localStorage
    function obtenerListaFotos() {
        const datosGuardados = localStorage.getItem('listaFotosViajes');
        return datosGuardados ? JSON.parse(datosGuardados) : [];
    }

    // 2. Función para mostrar la imagen en la pantalla (Galería)
    function mostrarImagenEnPagina(fotoData) {
        // Crear un contenedor para la galería si no existe
        let contenedorGaleria = document.getElementById('galeria-fotos');
        if (!contenedorGaleria) {
            contenedorGaleria = document.createElement('div');
            contenedorGaleria.id = 'galeria-fotos';
            contenedorGaleria.style.display = 'flex';
            contenedorGaleria.style.flexWrap = 'wrap';
            contenedorGaleria.style.gap = '10px';
            contenedorGaleria.style.marginTop = '10px';
            contenedorGaleria.style.justifyContent = 'center';
            
            // Insertar la galería antes del botón de borrar todo
            botonContainer.insertBefore(contenedorGaleria, botonBorrarTodo);
        }

        // Crear el elemento img
        const img = document.createElement('img');
        img.src = fotoData;
        img.classList.add('foto-usuario');
        
        // Estilos de la imagen individual
        img.style.width = '100px'; // Tamaño fijo o usa 'auto'
        img.style.height = '100px';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '8px';
        img.style.border = '2px solid #ddd';
        img.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        img.style.cursor = 'pointer';

        // Añadir evento al hacer clic en la imagen para eliminarla individualmente
        img.addEventListener('click', () => {
            eliminarImagenIndividual(fotoData, img);
        });

        // Añadir tooltip al pasar el mouse
        img.title = "Haz clic para eliminar esta foto";

        contenedorGaleria.appendChild(img);

        // Mostrar botón de borrar todo si hay más de una foto
        const listaActual = obtenerListaFotos();
        if (listaActual.length > 1) {
            botonBorrarTodo.style.display = 'inline-block';
            botonAgregar.style.display = 'inline-block'; // Mantener visible para agregar más
        } else if (listaActual.length === 1) {
            botonBorrarTodo.style.display = 'none'; // No mostrar borrar todo si solo hay una
        }
    }

    // Función para eliminar una imagen específica de la lista y de la pantalla
    function eliminarImagenIndividual(fotoData, elementoImg) {
        let listaFotos = obtenerListaFotos();
        
        // Encontrar el índice de la imagen en la lista
        const indice = listaFotos.indexOf(fotoData);
        
        if (indice > -1) {
            // Eliminar del array
            listaFotos.splice(indice, 1);
            
            // Actualizar localStorage
            try {
                localStorage.setItem('listaFotosViajes', JSON.stringify(listaFotos));
            } catch (error) {
                console.error("Error al guardar", error);
                return;
            }

            // Eliminar visualmente
            elementoImg.remove();

            // Si la lista queda vacía
            if (listaFotos.length === 0) {
                const contenedorGaleria = document.getElementById('galeria-fotos');
                if (contenedorGaleria) {
                    contenedorGaleria.remove();
                }
                botonBorrarTodo.style.display = 'none';
            } else {
                // Si quedan fotos, mostrar botón borrar todo si hay más de una
                if (listaFotos.length > 1) {
                    botonBorrarTodo.style.display = 'inline-block';
                } else {
                    botonBorrarTodo.style.display = 'none';
                }
            }
            console.log('Foto eliminada individualmente.');
        }
    }

    // 3. Al cargar la página, verificar si hay fotos guardadas
    const listaFotosGuardada = obtenerListaFotos();
    if (listaFotosGuardada.length > 0) {
        listaFotosGuardada.forEach(foto => {
            mostrarImagenEnPagina(foto);
        });
        if (listaFotosGuardada.length > 1) {
            botonBorrarTodo.style.display = 'inline-block';
        }
    }
});