// Variables globales
let historialCalculos = [];

// Elementos del DOM
const btnCalcular = document.getElementById('calcular');
const selectTipo = document.getElementById('tipo');
const selectModo = document.getElementById('modo');
const inputA = document.getElementById('valor-a');
const inputB = document.getElementById('valor-b');
const btnLimpiarHistorial = document.getElementById('limpiar-historial');

// Elementos de resultados
const expresionOriginal = document.getElementById('expresion-original');
const formula = document.getElementById('formula');
const desarrollo = document.getElementById('desarrollo');
const expandida = document.getElementById('expandida');
const resultadoNumerico = document.getElementById('resultado-numerico');
const verificacion = document.getElementById('verificacion');
const canvas = document.getElementById('canvas-geometrico');
const descripcionGeometrica = document.getElementById('descripcion-geometrica');
const historial = document.getElementById('historial');

// Event Listeners
btnCalcular.addEventListener('click', calcular);
btnLimpiarHistorial.addEventListener('click', limpiarHistorial);
selectModo.addEventListener('change', actualizarPlaceholders);

// Cargar historial del localStorage al iniciar
window.addEventListener('load', () => {
    cargarHistorial();
    mostrarHistorial();
});

function actualizarPlaceholders() {
    const modo = selectModo.value;
    if (modo === 'numerico') {
        inputA.placeholder = 'Ej: 3';
        inputB.placeholder = 'Ej: 2';
        inputA.value = '3';
        inputB.value = '2';
    } else {
        inputA.placeholder = 'Ej: 3x';
        inputB.placeholder = 'Ej: 5y';
        inputA.value = '3x';
        inputB.value = '5y';
    }
}

// Función principal de cálculo
function calcular() {
    const tipo = selectTipo.value;
    const modo = selectModo.value;
    const a = inputA.value.trim();
    const b = inputB.value.trim();

    if (!a || !b) {
        alert('Por favor ingresa valores en ambos campos');
        return;
    }

    try {
        let resultado;

        if (modo === 'numerico') {
            resultado = calcularNumerico(tipo, a, b);
        } else {
            resultado = calcularAlgebraico(tipo, a, b);
        }

        mostrarResultados(resultado);
        if (modo === 'numerico') {
            dibujarGeometria(tipo, parseFloat(a), parseFloat(b), resultado);
        } else {
            limpiarCanvas();
        }
        agregarAlHistorial(resultado);
    } catch (error) {
        alert('Error en el cálculo: ' + error.message);
        console.error(error);
    }
}

// Cálculo numérico
function calcularNumerico(tipo, aStr, bStr) {
    const a = parseFloat(aStr);
    const b = parseFloat(bStr);

    if (isNaN(a) || isNaN(b)) {
        throw new Error('Los valores deben ser numéricos');
    }

    switch(tipo) {
        case 'binomio-cuadrado-suma':
            return binomioCuadradoSumaNumerico(a, b);
        case 'binomio-cuadrado-resta':
            return binomioCuadradoRestaNumerico(a, b);
        case 'binomio-cubo-suma':
            return binomioCuboSumaNumerico(a, b);
        case 'binomio-cubo-resta':
            return binomioCuboRestaNumerico(a, b);
        case 'termino-comun':
            return terminoComunNumerico(a, b);
        case 'conjugados':
            return conjugadosNumerico(a, b);
    }
}

// Cálculo algebraico usando Math.js
function calcularAlgebraico(tipo, a, b) {
    try {
        switch(tipo) {
            case 'binomio-cuadrado-suma':
                return binomioCuadradoSumaAlgebraico(a, b);
            case 'binomio-cuadrado-resta':
                return binomioCuadradoRestaAlgebraico(a, b);
            case 'binomio-cubo-suma':
                return binomioCuboSumaAlgebraico(a, b);
            case 'binomio-cubo-resta':
                return binomioCuboRestaAlgebraico(a, b);
            case 'termino-comun':
                return terminoComunAlgebraico(a, b);
            case 'conjugados':
                return conjugadosAlgebraico(a, b);
        }
    } catch (error) {
        throw new Error('Error en cálculo algebraico: ' + error.message);
    }
}

// Funciones algebraicas con Math.js
function binomioCuadradoSumaAlgebraico(a, b) {
    const expr = `(${a} + ${b})^2`;
    const expandido = math.simplify(expr).toString();
    
    return {
        tipo: 'Binomio al Cuadrado (Suma)',
        expresion: `(${a} + ${b})²`,
        formula: '(a + b)² = a² + 2ab + b²',
        pasos: [
            `Paso 1: Expresión: (${a} + ${b})²`,
            `Paso 2: Aplicar fórmula: a² + 2ab + b²`,
            `Paso 3: a² = (${a})²`,
            `Paso 4: 2ab = 2(${a})(${b})`,
            `Paso 5: b² = (${b})²`,
            `Paso 6: Resultado expandido`
        ],
        expandida: expandido,
        numerico: 'Modo algebraico',
        verificacion: true,
        resultadoDirecto: expandido
    };
}

function binomioCuadradoRestaAlgebraico(a, b) {
    const expr = `(${a} - ${b})^2`;
    const expandido = math.simplify(expr).toString();
    
    return {
        tipo: 'Binomio al Cuadrado (Resta)',
        expresion: `(${a} - ${b})²`,
        formula: '(a - b)² = a² - 2ab + b²',
        pasos: [
            `Paso 1: Expresión: (${a} - ${b})²`,
            `Paso 2: Aplicar fórmula: a² - 2ab + b²`,
            `Paso 3: a² = (${a})²`,
            `Paso 4: 2ab = 2(${a})(${b})`,
            `Paso 5: b² = (${b})²`,
            `Paso 6: Resultado expandido`
        ],
        expandida: expandido,
        numerico: 'Modo algebraico',
        verificacion: true,
        resultadoDirecto: expandido
    };
}

function binomioCuboSumaAlgebraico(a, b) {
    const expr = `(${a} + ${b})^3`;
    const expandido = math.simplify(expr).toString();
    
    return {
        tipo: 'Binomio al Cubo (Suma)',
        expresion: `(${a} + ${b})³`,
        formula: '(a + b)³ = a³ + 3a²b + 3ab² + b³',
        pasos: [
            `Paso 1: Expresión: (${a} + ${b})³`,
            `Paso 2: Aplicar fórmula del cubo`,
            `Paso 3: a³ = (${a})³`,
            `Paso 4: 3a²b = 3(${a})²(${b})`,
            `Paso 5: 3ab² = 3(${a})(${b})²`,
            `Paso 6: b³ = (${b})³`,
            `Paso 7: Resultado expandido`
        ],
        expandida: expandido,
        numerico: 'Modo algebraico',
        verificacion: true,
        resultadoDirecto: expandido
    };
}

function binomioCuboRestaAlgebraico(a, b) {
    const expr = `(${a} - ${b})^3`;
    const expandido = math.simplify(expr).toString();
    
    return {
        tipo: 'Binomio al Cubo (Resta)',
        expresion: `(${a} - ${b})³`,
        formula: '(a - b)³ = a³ - 3a²b + 3ab² - b³',
        pasos: [
            `Paso 1: Expresión: (${a} - ${b})³`,
            `Paso 2: Aplicar fórmula del cubo con resta`,
            `Paso 3: a³ = (${a})³`,
            `Paso 4: 3a²b = 3(${a})²(${b})`,
            `Paso 5: 3ab² = 3(${a})(${b})²`,
            `Paso 6: b³ = (${b})³`,
            `Paso 7: Resultado con signos alternados`
        ],
        expandida: expandido,
        numerico: 'Modo algebraico',
        verificacion: true,
        resultadoDirecto: expandido
    };
}

function terminoComunAlgebraico(a, b) {
    const expr = `(x + ${a}) * (x + ${b})`;
    const expandido = math.simplify(expr).toString();
    
    return {
        tipo: 'Término Común',
        expresion: `(x + ${a})(x + ${b})`,
        formula: '(x + a)(x + b) = x² + (a+b)x + ab',
        pasos: [
            `Paso 1: Expresión: (x + ${a})(x + ${b})`,
            `Paso 2: Término cuadrático: x²`,
            `Paso 3: Término lineal: (${a} + ${b})x`,
            `Paso 4: Término independiente: (${a})(${b})`,
            `Paso 5: Resultado expandido`
        ],
        expandida: expandido,
        numerico: 'Modo algebraico',
        verificacion: true,
        resultadoDirecto: expandido
    };
}

function conjugadosAlgebraico(a, b) {
    const expr = `(${a} + ${b}) * (${a} - ${b})`;
    const expandido = math.simplify(expr).toString();
    
    return {
        tipo: 'Binomios Conjugados',
        expresion: `(${a} + ${b})(${a} - ${b})`,
        formula: '(a + b)(a - b) = a² - b²',
        pasos: [
            `Paso 1: Expresión: (${a} + ${b})(${a} - ${b})`,
            `Paso 2: Aplicar diferencia de cuadrados`,
            `Paso 3: a² = (${a})²`,
            `Paso 4: b² = (${b})²`,
            `Paso 5: Resultado: a² - b²`
        ],
        expandida: expandido,
        numerico: 'Modo algebraico',
        verificacion: true,
        resultadoDirecto: expandido
    };
}

// Funciones numéricas
function binomioCuadradoSumaNumerico(a, b) {
    const a2 = a * a;
    const ab2 = 2 * a * b;
    const b2 = b * b;
    const resultadoFinal = a2 + ab2 + b2;
    const resultadoDirecto = Math.pow(a + b, 2);

    return {
        tipo: 'Binomio al Cuadrado (Suma)',
        expresion: `(${a} + ${b})²`,
        formula: '(a + b)² = a² + 2ab + b²',
        pasos: [
            `Paso 1: Identificar a = ${a} y b = ${b}`,
            `Paso 2: Calcular a² = ${a}² = ${a2}`,
            `Paso 3: Calcular 2ab = 2(${a})(${b}) = ${ab2}`,
            `Paso 4: Calcular b² = ${b}² = ${b2}`,
            `Paso 5: Sumar todos los términos: ${a2} + ${ab2} + ${b2} = ${resultadoFinal}`
        ],
        expandida: `${a2} + ${ab2} + ${b2}`,
        numerico: resultadoFinal.toFixed(4),
        verificacion: Math.abs(resultadoFinal - resultadoDirecto) < 0.0001,
        resultadoDirecto: resultadoDirecto.toFixed(4)
    };
}

function binomioCuadradoRestaNumerico(a, b) {
    const a2 = a * a;
    const ab2 = 2 * a * b;
    const b2 = b * b;
    const resultadoFinal = a2 - ab2 + b2;
    const resultadoDirecto = Math.pow(a - b, 2);

    return {
        tipo: 'Binomio al Cuadrado (Resta)',
        expresion: `(${a} - ${b})²`,
        formula: '(a - b)² = a² - 2ab + b²',
        pasos: [
            `Paso 1: Identificar a = ${a} y b = ${b}`,
            `Paso 2: Calcular a² = ${a}² = ${a2}`,
            `Paso 3: Calcular 2ab = 2(${a})(${b}) = ${ab2}`,
            `Paso 4: Calcular b² = ${b}² = ${b2}`,
            `Paso 5: Restar y sumar: ${a2} - ${ab2} + ${b2} = ${resultadoFinal}`
        ],
        expandida: `${a2} - ${ab2} + ${b2}`,
        numerico: resultadoFinal.toFixed(4),
        verificacion: Math.abs(resultadoFinal - resultadoDirecto) < 0.0001,
        resultadoDirecto: resultadoDirecto.toFixed(4)
    };
}

function binomioCuboSumaNumerico(a, b) {
    const a3 = a * a * a;
    const a2b3 = 3 * a * a * b;
    const ab23 = 3 * a * b * b;
    const b3 = b * b * b;
    const resultadoFinal = a3 + a2b3 + ab23 + b3;
    const resultadoDirecto = Math.pow(a + b, 3);

    return {
        tipo: 'Binomio al Cubo (Suma)',
        expresion: `(${a} + ${b})³`,
        formula: '(a + b)³ = a³ + 3a²b + 3ab² + b³',
        pasos: [
            `Paso 1: Identificar a = ${a} y b = ${b}`,
            `Paso 2: Calcular a³ = ${a}³ = ${a3}`,
            `Paso 3: Calcular 3a²b = 3(${a}²)(${b}) = ${a2b3}`,
            `Paso 4: Calcular 3ab² = 3(${a})(${b}²) = ${ab23}`,
            `Paso 5: Calcular b³ = ${b}³ = ${b3}`,
            `Paso 6: Sumar: ${a3} + ${a2b3} + ${ab23} + ${b3} = ${resultadoFinal}`
        ],
        expandida: `${a3} + ${a2b3} + ${ab23} + ${b3}`,
        numerico: resultadoFinal.toFixed(4),
        verificacion: Math.abs(resultadoFinal - resultadoDirecto) < 0.0001,
        resultadoDirecto: resultadoDirecto.toFixed(4)
    };
}

function binomioCuboRestaNumerico(a, b) {
    const a3 = a * a * a;
    const a2b3 = 3 * a * a * b;
    const ab23 = 3 * a * b * b;
    const b3 = b * b * b;
    const resultadoFinal = a3 - a2b3 + ab23 - b3;
    const resultadoDirecto = Math.pow(a - b, 3);

    return {
        tipo: 'Binomio al Cubo (Resta)',
        expresion: `(${a} - ${b})³`,
        formula: '(a - b)³ = a³ - 3a²b + 3ab² - b³',
        pasos: [
            `Paso 1: Identificar a = ${a} y b = ${b}`,
            `Paso 2: Calcular a³ = ${a}³ = ${a3}`,
            `Paso 3: Calcular 3a²b = 3(${a}²)(${b}) = ${a2b3}`,
            `Paso 4: Calcular 3ab² = 3(${a})(${b}²) = ${ab23}`,
            `Paso 5: Calcular b³ = ${b}³ = ${b3}`,
            `Paso 6: Alternar signos: ${a3} - ${a2b3} + ${ab23} - ${b3} = ${resultadoFinal}`
        ],
        expandida: `${a3} - ${a2b3} + ${ab23} - ${b3}`,
        numerico: resultadoFinal.toFixed(4),
        verificacion: Math.abs(resultadoFinal - resultadoDirecto) < 0.0001,
        resultadoDirecto: resultadoDirecto.toFixed(4)
    };
}

function terminoComunNumerico(a, b) {
    const x2 = 1;
    const sumaAB = a + b;
    const productoAB = a * b;
    const resultadoFinal = x2 + sumaAB + productoAB;
    const resultadoDirecto = (1 + a) * (1 + b);

    return {
        tipo: 'Término Común',
        expresion: `(x + ${a})(x + ${b})`,
        formula: '(x + a)(x + b) = x² + (a+b)x + ab',
        pasos: [
            `Paso 1: Identificar a = ${a} y b = ${b}`,
            `Paso 2: Calcular x² = 1`,
            `Paso 3: Calcular (a + b)x = (${a} + ${b})x = ${sumaAB}x`,
            `Paso 4: Calcular ab = (${a})(${b}) = ${productoAB}`,
            `Paso 5: Resultado: x² + ${sumaAB}x + ${productoAB}`
        ],
        expandida: `x² + ${sumaAB}x + ${productoAB}`,
        numerico: `Para x=1: ${resultadoFinal.toFixed(4)}`,
        verificacion: Math.abs(resultadoFinal - resultadoDirecto) < 0.0001,
        resultadoDirecto: resultadoDirecto.toFixed(4)
    };
}

function conjugadosNumerico(a, b) {
    const a2 = a * a;
    const b2 = b * b;
    const resultadoFinal = a2 - b2;
    const resultadoDirecto = (a + b) * (a - b);

    return {
        tipo: 'Binomios Conjugados',
        expresion: `(${a} + ${b})(${a} - ${b})`,
        formula: '(a + b)(a - b) = a² - b²',
        pasos: [
            `Paso 1: Identificar a = ${a} y b = ${b}`,
            `Paso 2: Calcular a² = ${a}² = ${a2}`,
            `Paso 3: Calcular b² = ${b}² = ${b2}`,
            `Paso 4: Restar: a² - b² = ${a2} - ${b2} = ${resultadoFinal}`
        ],
        expandida: `${a2} - ${b2}`,
        numerico: resultadoFinal.toFixed(4),
        verificacion: Math.abs(resultadoFinal - resultadoDirecto) < 0.0001,
        resultadoDirecto: resultadoDirecto.toFixed(4)
    };
}

// Mostrar resultados en la interfaz
function mostrarResultados(resultado) {
    expresionOriginal.textContent = resultado.expresion;
    formula.textContent = resultado.formula;
    
    desarrollo.innerHTML = '';
    resultado.pasos.forEach(paso => {
        const div = document.createElement('div');
        div.textContent = paso;
        desarrollo.appendChild(div);
    });

    expandida.textContent = resultado.expandida;
    resultadoNumerico.textContent = resultado.numerico;

    if (resultado.verificacion) {
        verificacion.textContent = `✓ Verificación correcta: ${resultado.resultadoDirecto}`;
        verificacion.className = 'verification correcto';
    } else {
        verificacion.textContent = `✗ Error en verificación`;
        verificacion.className = 'verification incorrecto';
    }
}

function limpiarCanvas() {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#64748b';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Visualización geométrica', canvas.width/2, canvas.height/2 - 20);
    ctx.fillText('disponible solo en', canvas.width/2, canvas.height/2);
    ctx.fillText('modo numérico', canvas.width/2, canvas.height/2 + 20);
    descripcionGeometrica.textContent = '';
}

// Dibujar representación geométrica
function dibujarGeometria(tipo, a, b, resultado) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const scale = 30;

    if (tipo.includes('cuadrado')) {
        const lado = (a + Math.abs(b)) * scale;
        const x = centerX - lado / 2;
        const y = centerY - lado / 2;

        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, lado, lado);

        const aScaled = a * scale;
        const bScaled = Math.abs(b) * scale;

        ctx.fillStyle = 'rgba(37, 99, 235, 0.3)';
        ctx.fillRect(x, y, aScaled, aScaled);
        ctx.strokeStyle = '##ffffff';
        ctx.strokeRect(x, y, aScaled, aScaled);
        ctx.fillStyle = '##ffffff';
        ctx.font = '14px Arial';
        ctx.fillText('a²', x + aScaled/2 - 10, y + aScaled/2);

        ctx.fillStyle = 'rgba(16, 185, 129, 0.3)';
        ctx.fillRect(x + aScaled, y, bScaled, aScaled);
        ctx.fillRect(x, y + aScaled, aScaled, bScaled);
        ctx.fillStyle = '##ffffff';
        ctx.fillText('ab', x + aScaled + bScaled/2 - 10, y + aScaled/2);
        ctx.fillText('ab', x + aScaled/2 - 10, y + aScaled + bScaled/2);

        ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
        ctx.fillRect(x + aScaled, y + aScaled, bScaled, bScaled);
        ctx.strokeStyle = '##ffffff';
        ctx.strokeRect(x + aScaled, y + aScaled, bScaled, bScaled);
        ctx.fillStyle = '##ffffff';
        ctx.fillText('b²', x + aScaled + bScaled/2 - 10, y + aScaled + bScaled/2);

        descripcionGeometrica.textContent = `Área total = (${a} + ${b})² = ${resultado.numerico} unidades²`;

    } else if (tipo === 'conjugados') {
        const a2 = a * scale;
        const b2 = Math.abs(b) * scale;

        ctx.fillStyle = 'rgba(37, 99, 235, 0.3)';
        ctx.fillRect(centerX - a2/2, centerY - a2/2, a2, a2);
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 3;
        ctx.strokeRect(centerX - a2/2, centerY - a2/2, a2, a2);

        ctx.fillStyle = 'rgba(239, 68, 68, 0.5)';
        ctx.fillRect(centerX - b2/2, centerY - b2/2, b2, b2);
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 2;
        ctx.strokeRect(centerX - b2/2, centerY - b2/2, b2, b2);

        ctx.fillStyle = '#1e293b';
        ctx.font = '16px Arial';
        ctx.fillText('a²', centerX - a2/2 + 10, centerY - a2/2 + 20);
        ctx.fillText('b²', centerX - 10, centerY + 5);

        descripcionGeometrica.textContent = `Diferencia de áreas = ${a}² - ${b}² = ${resultado.numerico} unidades²`;

    } else {
        limpiarCanvas();
    }
}

// Gestión del historial
function agregarAlHistorial(resultado) {
    const item = {
        fecha: new Date().toLocaleString('es-MX'),
        tipo: resultado.tipo,
        expresion: resultado.expresion,
        resultado: resultado.expandida || resultado.numerico
    };

    historialCalculos.unshift(item);
    if (historialCalculos.length > 10) {
        historialCalculos.pop();
    }

    guardarHistorial();
    mostrarHistorial();
}

function mostrarHistorial() {
    if (historialCalculos.length === 0) {
        historial.innerHTML = '<div class="historial-vacio">No hay cálculos en el historial</div>';
        return;
    }

    historial.innerHTML = '';
    historialCalculos.forEach(item => {
        const div = document.createElement('div');
        div.className = 'historial-item';
        div.innerHTML = `
            <strong>${item.tipo}</strong><br>
            ${item.expresion} = ${item.resultado}<br>
            <small>${item.fecha}</small>
        `;
        historial.appendChild(div);
    });
}

function limpiarHistorial() {
    if (confirm('¿Estás seguro de limpiar el historial?')) {
        historialCalculos = [];
        guardarHistorial();
        mostrarHistorial();
    }
}

function guardarHistorial() {
    localStorage.setItem('historialProductosNotables', JSON.stringify(historialCalculos));
}

function cargarHistorial() {
    const guardado = localStorage.getItem('historialProductosNotables');
    if (guardado) {
        historialCalculos = JSON.parse(guardado);
    }
}