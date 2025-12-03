/* ==================== VARIABLES GLOBALES ==================== */
let points = [];
let currentRange = 10;

/* ==================== CONSTANTES MATEMÁTICAS ==================== */
const CONSTANTS = {
  // Constantes básicas
  'π': Math.PI,
  'pi': Math.PI,
  'e': Math.E,

  // Número áureo (phi)
  'φ': (1 + Math.sqrt(5)) / 2,
  'phi': (1 + Math.sqrt(5)) / 2,

  // Tau (2π)
  'τ': 2 * Math.PI,
  'tau': 2 * Math.PI,

  // Logaritmos naturales
  'ln2': Math.LN2,
  'ln10': Math.LN10,

  // Raíces cuadradas comunes
  '√2': Math.sqrt(2),
  '√3': Math.sqrt(3),
  '√5': Math.sqrt(5),
  '√7': Math.sqrt(7),
  '√8': Math.sqrt(8),
  '√10': Math.sqrt(10),
  '√11': Math.sqrt(11),
  '√12': Math.sqrt(12),
  '√13': Math.sqrt(13),
  '√15': Math.sqrt(15),
  '√17': Math.sqrt(17),
  '√19': Math.sqrt(19),
  '√20': Math.sqrt(20),

  // Raíces cuadradas negativas
  '-√2': -Math.sqrt(2),
  '-√3': -Math.sqrt(3),
  '-√5': -Math.sqrt(5)
};

console.log('Variables y constantes inicializadas correctamente');

/* =========== FUNCIÓN PARA CONVERTIR TEXTO EN NÚMERO =========== */
function parseNumber(input) {
  // Limpiar el input de espacios en blanco
  input = input.trim().replace(/\s+/g, '');

  // Verificar si es una constante matemática directa
  if (Object.prototype.hasOwnProperty.call(CONSTANTS, input)) {
    return CONSTANTS[input];
  }

  // Reemplazar constantes matemáticas en la expresión
  let processedInput = input;
  for (const [symbol, value] of Object.entries(CONSTANTS)) {
    // Crear expresión regular para reemplazar el símbolo
    const regex = new RegExp(symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    processedInput = processedInput.replace(regex, value.toString());
  }

  // Manejar fracciones simples (sin otros operadores)
  if (input.includes('/') && !input.includes('*') && !input.includes('+') && !input.includes('-', 1)) {
    const parts = input.split('/');
    if (parts.length === 2) {
      const numerator = parseFloat(parts[0]);
      const denominator = parseFloat(parts[1]);
      // Verificar que ambos son números válidos y denominador no es cero
      if (!isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
        return numerator / denominator;
      }
    }
  }

  // Manejar raíces cuadradas básicas con símbolo √
  if (input.startsWith('√') && !input.includes('*') && !input.includes('+') && !input.includes('-', 1)) {
    const radicand = parseFloat(input.slice(1));
    if (!isNaN(radicand) && radicand >= 0) {
      return Math.sqrt(radicand);
    }
  }

  // Manejar raíces cuadradas negativas
  if (input.startsWith('-√') && !input.includes('*') && !input.includes('+')) {
    const radicand = parseFloat(input.slice(2));
    if (!isNaN(radicand) && radicand >= 0) {
      return -Math.sqrt(radicand);
    }
  }

  // Manejar función sqrt() con cualquier expresión dentro
  if (input.includes('sqrt(')) {
    const match = input.match(/sqrt\(([^)]+)\)/);
    if (match) {
      const innerExpression = match[1];
      let innerValue;

      try {
        // Para fracciones simples dentro de sqrt()
        if (innerExpression.includes('/') && !innerExpression.includes('*') && !innerExpression.includes('+') && !innerExpression.includes('-', 1)) {
          const parts = innerExpression.split('/');
          if (parts.length === 2) {
            const num = parseFloat(parts[0]);
            const den = parseFloat(parts[1]);
            if (!isNaN(num) && !isNaN(den) && den !== 0) {
              innerValue = num / den;
            }
          }
        } else {
          // Para otras expresiones, evaluar directamente si son seguras
          const safeChars = /^[0-9+\-*/.() ]+$/;
          if (safeChars.test(innerExpression)) {
            innerValue = Function('"use strict"; return (' + innerExpression + ')')();
          } else {
            innerValue = parseFloat(innerExpression);
          }
        }

        // Si el valor interno es válido, calcular su raíz cuadrada
        if (!isNaN(innerValue) && innerValue >= 0) {
          return Math.sqrt(innerValue);
        }
      } catch (e) {
        // Si falla la evaluación, continuar con el flujo normal
      }
    }
  }

  // Evaluar expresiones matemáticas más complejas
  try {
    // Reemplazar operadores por equivalentes de JavaScript
    processedInput = processedInput.replace(/\^/g, '**'); // Potencias

    // Verificar que solo contiene caracteres seguros para evaluar
    const safeChars = /^[0-9+\-*/.() ]+$/;
    if (safeChars.test(processedInput)) {
      const result = Function('"use strict"; return (' + processedInput + ')')();
      if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
        return result;
      }
    }
  } catch (e) {
    // Si falla la evaluación, continuar con el parsing normal
  }

  // Intentar parsear como número decimal normal
  const num = parseFloat(processedInput);
  if (!isNaN(num)) {
    return num;
  }

  // Si nada funcionó, retornar null
  return null;
}

/* ==================== FUNCIONES DE CLASIFICACIÓN ==================== */
function classifyNumber(num, originalInput) {
  // Verificar si es un número natural (entero positivo)
  if (num > 0 && Number.isInteger(num)) {
    return 'naturals';
  }

  // Verificar si es un número entero
  if (Number.isInteger(num)) {
    return 'integers';
  }

  // Lista de constantes irracionales conocidas
  const irrationalConstants = [
    'π', 'pi', 'e', 'φ', 'phi', 'τ', 'tau', 'ln2', 'ln10',
    '√2', '√3', '√5', '√7', '√8', '√10', '√11', '√12', '√13',
    '√15', '√17', '√19', '√20',
    '-√2', '-√3', '-√5'
  ];

  // Si es una constante irracional directa
  if (irrationalConstants.includes(originalInput)) {
    return 'irrationals';
  }

  // Verificar si contiene sqrt() y clasificar según el contenido
  if (originalInput.includes('sqrt(')) {
    const sqrtMatch = originalInput.match(/sqrt\(([^)]+)\)/);
    if (sqrtMatch) {
      const innerExpression = sqrtMatch[1];
      let innerValue;

      try {
        // Evaluar lo que está dentro del sqrt()
        if (innerExpression.includes('/')) {
          // Fracción simple
          const parts = innerExpression.split('/');
          if (parts.length === 2) {
            const n = parseFloat(parts[0]);
            const d = parseFloat(parts[1]);
            if (!isNaN(n) && !isNaN(d) && d !== 0) {
              innerValue = n / d;
            }
          }
        } else {
          // Número simple
          innerValue = parseFloat(innerExpression);
        }

        if (!isNaN(innerValue) && innerValue >= 0) {
          const sqrtResult = Math.sqrt(innerValue);

          // Verificar si es un cuadrado perfecto
          if (Number.isInteger(sqrtResult)) {
            // Es cuadrado perfecto
            if (sqrtResult > 0) {
              return 'naturals';
            } else if (sqrtResult === 0) {
              return 'integers';
            }
          } else {
            // No es cuadrado perfecto, es irracional
            return 'irrationals';
          }
        }
      } catch (e) {
        // Si hay error en la evaluación, asumir que es irracional
        return 'irrationals';
      }
    }
  }

  // Verificar si contiene símbolo √ y no es cuadrado perfecto
  if (originalInput.includes('√')) {
    return 'irrationals';
  }

  // Analizar expresiones con operaciones matemáticas
  if (originalInput.includes('*') || originalInput.includes('+') || originalInput.includes('-') || originalInput.includes('/')) {

    // Lista de símbolos irracionales para detectar en expresiones
    const irrationalSymbols = ['π', 'pi', 'e', 'φ', 'phi', 'τ', 'tau', 'ln2', 'ln10', '√', 'sqrt'];

    // Verificar si la expresión contiene números irracionales
    const containsIrrationals = irrationalSymbols.some(symbol => originalInput.includes(symbol));

    if (containsIrrationals) {
      // Casos especiales donde operaciones con irracionales pueden dar resultado racional
      const specialRationalCases = [
        // Casos como π/π = 1, e/e = 1
        /π\/π/, /pi\/pi/, /e\/e/, /φ\/φ/, /phi\/phi/, /τ\/τ/, /tau\/tau/,
        /√2\/√2/, /√3\/√3/, /√5\/√5/,
        // Casos como π-π = 0
        /π-π/, /pi-pi/, /e-e/, /φ-φ/, /phi-phi/,
        // Otros casos especiales
        /2\*π\/τ/, /τ\/2\*π/
      ];

      const isSpecialRational = specialRationalCases.some(pattern =>
        pattern.test(originalInput.replace(/\s/g, ''))
      );

      if (isSpecialRational) {
        if (num > 0 && Number.isInteger(num)) return 'naturals';
        if (Number.isInteger(num)) return 'integers';
        return 'rationals';
      }

      // Si contiene irracionales y no es caso especial, es irracional
      return 'irrationals';
    }
  }

  // Verificar si es una fracción simple (racional)
  if (originalInput.includes('/')) {
    return 'rationals';
  }

  // Si es decimal, asumimos que es racional a menos que se especifique lo contrario
  return 'rationals';
}

function getClassificationName(classification) {
  const names = {
    'naturals': 'ℕ (Naturales)',
    'integers': 'ℤ (Enteros)',
    'rationals': 'ℚ (Racionales)',
    'irrationals': 'ℝ-ℚ (Irracionales)'
  };
  return names[classification] || 'No clasificado';
}

/* ==================== FUNCIONES DE INTERFAZ DE USUARIO ==================== */
function addNumber() {
  const input = document.getElementById('numberInput').value;

  if (!input) {
    alert('Por favor ingresa un número');
    return;
  }

  const value = parseNumber(input);
  if (value === null) {
    alert('Formato de número no válido. Ejemplos válidos: sqrt(7), 2*π, 1/e, √2, -1/2');
    return;
  }

  if (Math.abs(value) > currentRange) {
    alert(`El número está fuera del rango actual (-${currentRange} a ${currentRange}). El rango se puede modificar en el código.`);
    return;
  }

  // Verificar si el punto ya existe (con tolerancia para errores de punto flotante)
  const existingPoint = points.find(p => Math.abs(p.value - value) < 0.0001);
  if (existingPoint) {
    alert('Este número ya está en la recta numérica');
    return;
  }

  // Clasificar el número y agregarlo al array
  const classification = classifyNumber(value, input);

  points.push({
    value,
    originalInput: input,
    classification
  });

  // Limpiar el input y actualizar la visualización
  document.getElementById('numberInput').value = '';
  updateDisplay();

  console.log(`Número agregado: ${input} = ${value} (${classification})`);
}

function addPresetNumber(input) {
  const value = parseNumber(input);

  if (value === null || Math.abs(value) > currentRange) {
    alert(`El número ${input} está fuera del rango actual`);
    return;
  }

  // Verificar si el punto ya existe
  const existingPoint = points.find(p => Math.abs(p.value - value) < 0.0001);
  if (existingPoint) {
    alert('Este número ya está en la recta numérica');
    return;
  }

  // Clasificar el número y agregarlo
  const classification = classifyNumber(value, input);

  points.push({
    value,
    originalInput: input,
    classification
  });

  // Actualizar la visualización
  updateDisplay();

  console.log(`Número predefinido agregado: ${input} = ${value} (${classification})`);
}

function clearAll() {
  points = [];
  updateDisplay();
  console.log('Todos los puntos eliminados');
}

function updateDisplay() {
  drawNumberLine();
  updatePointsList();
  updateDistanceSelectors();
}

/* ==================== FUNCIONES DE VISUALIZACIÓN ==================== */
function drawNumberLine() {
  const numberLine = document.getElementById('numberLine');
  numberLine.innerHTML = '';

  // Crear la línea base de la recta
  const line = document.createElement('div');
  line.className = 'line';
  numberLine.appendChild(line);

  // Crear marcas de graduación
  const tickCount = currentRange * 2 + 1; // De -range a +range
  for (let i = 0; i < tickCount; i++) {
    const value = -currentRange + i;
    const percentage = (i / (tickCount - 1)) * 90 + 5; // 5% de margen a cada lado

    // Crear la marca vertical
    const tick = document.createElement('div');
    tick.className = 'tick';
    tick.style.left = percentage + '%';
    numberLine.appendChild(tick);

    // Crear la etiqueta numérica
    const label = document.createElement('div');
    label.className = 'tick-label';
    label.style.left = percentage + '%';
    label.textContent = value;
    numberLine.appendChild(label);
  }

  // Agregar los puntos de números agregados
  points.forEach((point, index) => {
    const percentage = ((point.value + currentRange) / (2 * currentRange)) * 90 + 5;

    // Crear el elemento visual del punto
    const pointElement = document.createElement('div');
    pointElement.className = `number-point ${point.classification}`;
    pointElement.style.left = percentage + '%';
    pointElement.draggable = false;

    // Crear la etiqueta del punto
    const pointLabel = document.createElement('div');
    pointLabel.className = 'point-label';
    pointLabel.textContent = `${point.originalInput} ≈ ${point.value.toFixed(3)}`;
    pointElement.appendChild(pointLabel);

    // Agregar evento de clic para eliminar
    pointElement.onclick = () => removePoint(index);
    pointElement.title = `${point.originalInput} (${getClassificationName(point.classification)})\nHaz clic para eliminar`;

    numberLine.appendChild(pointElement);
  });
}

function removePoint(index) {
  if (confirm('¿Deseas eliminar este punto?')) {
    const removedPoint = points.splice(index, 1)[0];
    updateDisplay();
    console.log(`Punto eliminado: ${removedPoint.originalInput}`);
  }
}

function updatePointsList() {
  const pointsList = document.getElementById('pointsList');

  // Si no hay puntos, mostrar mensaje informativo
  if (points.length === 0) {
    pointsList.innerHTML = `
      <div class="empty-state">
        <p>Agrega números para ver su clasificación automática aquí</p>
        <small>Los puntos aparecerán ordenados de menor a mayor</small>
      </div>
    `;
    return;
  }

  // Ordenar puntos por valor de menor a mayor
  const sortedPoints = [...points].sort((a, b) => a.value - b.value);

  // Generar HTML para cada punto
  pointsList.innerHTML = sortedPoints.map(point => `
    <div class="point-item" style="border-left: 4px solid ${getClassificationColor(point.classification)}">
      <div>
        <strong>${point.originalInput}</strong> ≈ ${point.value.toFixed(6)}<br>
        <small>${getClassificationName(point.classification)}</small>
      </div>
      <div style="text-align: right;">
        <small>Posición: ${point.value.toFixed(3)}</small>
      </div>
    </div>
  `).join('');
}

function getClassificationColor(classification) {
  const colors = {
    'naturals': '#e74c3c',   // Rojo
    'integers': '#3498db',   // Azul
    'rationals': '#27ae60',  // Verde
    'irrationals': '#f1c40f' // Amarillo
  };
  return colors[classification] || '#95a5a6';
}

/* ==================== CALCULADORA DE DISTANCIAS ==================== */
function updateDistanceSelectors() {
  const pointAItems = document.getElementById('pointA-items');
  const pointBItems = document.getElementById('pointB-items');
  const pointASelected = document.getElementById('pointA-selected');
  const pointBSelected = document.getElementById('pointB-selected');

  // Limpiar las opciones existentes
  pointAItems.innerHTML = '<div data-value="">Selecciona un punto</div>';
  pointBItems.innerHTML = '<div data-value="">Selecciona un punto</div>';

  // Resetear el texto seleccionado si no hay puntos
  if (points.length === 0) {
    pointASelected.textContent = 'Selecciona un punto';
    pointBSelected.textContent = 'Selecciona un punto';
    document.getElementById('pointA-container').setAttribute('data-value', '');
    document.getElementById('pointB-container').setAttribute('data-value', '');
    return;
  }

  // Agregar cada punto como opción en ambos selectores
  points.forEach((point, index) => {
    const optionText = `${point.originalInput} (${point.value.toFixed(3)})`;

    // Crear opción para el selector A
    const optionA = document.createElement('div');
    optionA.setAttribute('data-value', index);
    optionA.textContent = optionText;
    optionA.onclick = () => selectPoint('A', index, optionText);
    pointAItems.appendChild(optionA);

    // Crear opción para el selector B
    const optionB = document.createElement('div');
    optionB.setAttribute('data-value', index);
    optionB.textContent = optionText;
    optionB.onclick = () => selectPoint('B', index, optionText);
    pointBItems.appendChild(optionB);
  });
}

function selectPoint(selector, index, text) {
  document.getElementById(`point${selector}-selected`).textContent = text;
  document.getElementById(`point${selector}-container`).setAttribute('data-value', index);
  document.getElementById(`point${selector}-items`).classList.remove('show');
}

function calculateDistance() {
  const pointAValue = document.getElementById('pointA-container').getAttribute('data-value');
  const pointBValue = document.getElementById('pointB-container').getAttribute('data-value');
  const resultDiv = document.getElementById('distanceResult');

  // Verificar que ambos puntos estén seleccionados
  if (!pointAValue || !pointBValue) {
    resultDiv.innerHTML = '<div style="color: #dc3545; text-align: center; padding: 15px;">Selecciona ambos puntos para calcular la distancia</div>';
    return;
  }

  // Verificar que los puntos sean diferentes
  if (pointAValue === pointBValue) {
    resultDiv.innerHTML = '<div style="color: #dc3545; text-align: center; padding: 15px;">Selecciona dos puntos diferentes</div>';
    return;
  }

  // Obtener los puntos seleccionados
  const pointA = points[parseInt(pointAValue, 10)];
  const pointB = points[parseInt(pointBValue, 10)];

  // Calcular la distancia como valor absoluto de la diferencia
  const distance = Math.abs(pointA.value - pointB.value);

  // Mostrar el resultado formateado
  resultDiv.innerHTML = `
    <div class="distance-result">
      <strong>Distancia entre ${pointA.originalInput} y ${pointB.originalInput}:</strong><br>
      <strong>d(a,b) = |${pointA.value.toFixed(3)} - ${pointB.value.toFixed(3)}| = ${distance.toFixed(6)} unidades</strong>
    </div>
  `;

  console.log(`Distancia calculada: |${pointA.value} - ${pointB.value}| = ${distance}`);
}

/* ==================== EVENT LISTENERS Y INICIALIZACIÓN ==================== */

// Event listener para detectar Enter en el input de números
document.getElementById('numberInput').addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    addNumber();
  }
});

// Event listeners para manejar los dropdowns personalizados
document.getElementById('pointA-selected').onclick = function (e) {
  e.stopPropagation();
  const items = document.getElementById('pointA-items');
  const isOpen = items.classList.contains('show');

  // Cerrar todos los dropdowns primero
  document.querySelectorAll('.select-items').forEach(item => {
    item.classList.remove('show');
  });

  // Alternar el estado del dropdown clickeado
  if (!isOpen) {
    items.classList.add('show');
  }
};

document.getElementById('pointB-selected').onclick = function (e) {
  e.stopPropagation();
  const items = document.getElementById('pointB-items');
  const isOpen = items.classList.contains('show');

  // Cerrar todos los dropdowns primero
  document.querySelectorAll('.select-items').forEach(item => {
    item.classList.remove('show');
  });

  // Alternar el estado del dropdown clickeado
  if (!isOpen) {
    items.classList.add('show');
  }
};

// Cerrar dropdowns al hacer clic fuera de ellos
document.addEventListener('click', function (e) {
  if (!e.target.closest('.custom-select')) {
    document.querySelectorAll('.select-items').forEach(item => {
      item.classList.remove('show');
    });
  }
});

// Inicializar la aplicación
console.log('Aplicación inicializada correctamente');
updateDisplay();