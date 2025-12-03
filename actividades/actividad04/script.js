/**
     * CALCULADORA DE CONVERSIONES DE NÚMEROS COMPLEJOS
     * Permite conversión entre forma cartesiana, polar y exponencial
     * Soporta fracciones, raíces cuadradas y múltiplos de pi
     */

    // ============================================================================
    // VARIABLES GLOBALES
    // ============================================================================

    let isUpdating = false; // Previene bucles infinitos durante actualizaciones

    // ============================================================================
    // FUNCIONES DE PARSEO
    // ============================================================================

    /**
     * Convierte una cadena de texto a número, soportando expresiones matemáticas
     * @param {string|number} input - Entrada del usuario
     * @returns {number} - Resultado numérico
     */
    function parseNumber(input) {
      // Manejar casos vacíos o nulos
      if (!input && input !== 0) return 0;

      const inputStr = input.toString().trim();
      if (!inputStr) return 0;

      // Preparar expresión reemplazando funciones matemáticas
      let expression = inputStr
        .replace(/sqrt\s*\(/gi, 'Math.sqrt(')  // sqrt(2) → Math.sqrt(2)
        .replace(/pi\b/gi, 'Math.PI');         // pi → Math.PI

      try {
        // Evaluar expresión de forma segura
        const result = Function('"use strict"; return (' + expression + ')')();

        // Verificar que el resultado sea válido
        if (isNaN(result) || !isFinite(result)) {
          return 0;
        }

        return result;
      } catch (error) {
        // En caso de error, retornar 0
        return 0;
      }
    }

    /**
     * Convierte una cadena de texto a ángulo en radianes
     * @param {string|number} input - Entrada del usuario
     * @returns {number} - Ángulo en radianes
     */
    function parseAngle(input) {
      return parseNumber(input); // Usa la misma lógica que parseNumber
    }

    // ============================================================================
    // FUNCIONES DE FORMATO Y VISUALIZACIÓN
    // ============================================================================

    /**
     * Convierte un ángulo en radianes a su representación en múltiplos de pi
     * @param {number} angle - Ángulo en radianes
     * @returns {string} - Representación en formato pi
     */
    function angleToPI(angle) {
      if (Math.abs(angle) < 1e-8) return "0";

      // Múltiplos comunes de pi
      const piMultiples = [
        { value: Math.PI, text: "pi" },
        { value: Math.PI / 2, text: "pi/2" },
        { value: Math.PI / 3, text: "pi/3" },
        { value: Math.PI / 4, text: "pi/4" },
        { value: Math.PI / 6, text: "pi/6" },
        { value: 2 * Math.PI, text: "2*pi" },
        { value: 3 * Math.PI / 2, text: "3*pi/2" },
        { value: 2 * Math.PI / 3, text: "2*pi/3" },
        { value: 3 * Math.PI / 4, text: "3*pi/4" },
        { value: 5 * Math.PI / 6, text: "5*pi/6" },
        { value: 5 * Math.PI / 4, text: "5*pi/4" },
        { value: 4 * Math.PI / 3, text: "4*pi/3" },
        { value: 5 * Math.PI / 3, text: "5*pi/3" },
        { value: 7 * Math.PI / 4, text: "7*pi/4" },
        // Valores negativos
        { value: -Math.PI, text: "-pi" },
        { value: -Math.PI / 2, text: "-pi/2" },
        { value: -Math.PI / 3, text: "-pi/3" },
        { value: -Math.PI / 4, text: "-pi/4" },
        { value: -Math.PI / 6, text: "-pi/6" },
        { value: -2 * Math.PI, text: "-2*pi" },
        { value: -3 * Math.PI / 2, text: "-3*pi/2" },
        { value: -2 * Math.PI / 3, text: "-2*pi/3" },
        { value: -3 * Math.PI / 4, text: "-3*pi/4" },
        { value: -5 * Math.PI / 6, text: "-5*pi/6" }
      ];

      // Buscar coincidencia exacta
      for (let pm of piMultiples) {
        if (Math.abs(angle - pm.value) < 1e-8) {
          return pm.text;
        }
      }

      // Intentar expresar como fracción de pi
      const ratio = angle / Math.PI;

      // Múltiplo entero de pi
      if (Math.abs(ratio - Math.round(ratio)) < 1e-8) {
        const intRatio = Math.round(ratio);
        if (intRatio === 1) return "pi";
        if (intRatio === -1) return "-pi";
        if (intRatio === 0) return "0";
        return intRatio + "*pi";
      }

      // Fracciones simples de pi
      const denominators = [2, 3, 4, 6, 8, 12];
      for (let den of denominators) {
        const num = ratio * den;
        if (Math.abs(num - Math.round(num)) < 1e-8) {
          const intNum = Math.round(num);
          if (intNum === 0) return "0";
          if (den === 1) {
            return intNum === 1 ? "pi" : intNum === -1 ? "-pi" : intNum + "*pi";
          }
          if (intNum === 1) return "pi/" + den;
          if (intNum === -1) return "-pi/" + den;
          return intNum + "*pi/" + den;
        }
      }

      // Si no se puede expresar como múltiplo de pi, usar decimal
      return angle.toFixed(6);
    }

    /**
     * Formatea un número mostrando fracciones y raíces cuando sea posible
     * @param {number} num - Número a formatear
     * @returns {string} - Representación formateada
     */
    function formatNumber(num) {
      if (Math.abs(num) < 1e-10) return "0";

      // Raíces cuadradas comunes
      const sqrtValues = [
        { value: Math.sqrt(2), text: "√2" },
        { value: Math.sqrt(3), text: "√3" },
        { value: Math.sqrt(5), text: "√5" },
        { value: Math.sqrt(6), text: "√6" },
        { value: Math.sqrt(7), text: "√7" },
        { value: Math.sqrt(8), text: "2√2" },
        { value: Math.sqrt(12), text: "2√3" },
        { value: Math.sqrt(18), text: "3√2" },
        { value: Math.sqrt(27), text: "3√3" },
        { value: Math.sqrt(2) / 2, text: "√2/2" },
        { value: Math.sqrt(3) / 2, text: "√3/2" },
        { value: Math.sqrt(3) / 3, text: "√3/3" },
        { value: -Math.sqrt(2), text: "-√2" },
        { value: -Math.sqrt(3), text: "-√3" },
        { value: -Math.sqrt(2) / 2, text: "-√2/2" },
        { value: -Math.sqrt(3) / 2, text: "-√3/2" },
        { value: -Math.sqrt(3) / 3, text: "-√3/3" }
      ];

      // Verificar raíces
      for (let sv of sqrtValues) {
        if (Math.abs(num - sv.value) < 1e-8) {
          return sv.text;
        }
      }

      // Fracciones comunes
      const fractions = [
        { value: 1 / 2, text: "1/2" },
        { value: 1 / 3, text: "1/3" },
        { value: 2 / 3, text: "2/3" },
        { value: 1 / 4, text: "1/4" },
        { value: 3 / 4, text: "3/4" },
        { value: 1 / 6, text: "1/6" },
        { value: 5 / 6, text: "5/6" },
        { value: 1 / 8, text: "1/8" },
        { value: 3 / 8, text: "3/8" },
        { value: 5 / 8, text: "5/8" },
        { value: 7 / 8, text: "7/8" },
        { value: -1 / 2, text: "-1/2" },
        { value: -1 / 3, text: "-1/3" },
        { value: -2 / 3, text: "-2/3" },
        { value: -1 / 4, text: "-1/4" },
        { value: -3 / 4, text: "-3/4" }
      ];

      // Verificar fracciones
      for (let frac of fractions) {
        if (Math.abs(num - frac.value) < 1e-8) {
          return frac.text;
        }
      }

      // Enteros
      if (Math.abs(num - Math.round(num)) < 1e-8) {
        return Math.round(num).toString();
      }

      // Decimal con precisión limitada
      return parseFloat(num.toFixed(6)).toString();
    }

    // ============================================================================
    // FUNCIONES MATEMÁTICAS AUXILIARES
    // ============================================================================

    /**
     * Normaliza un ángulo al rango (-π, π]
     * @param {number} angle - Ángulo en radianes
     * @returns {number} - Ángulo normalizado
     */
    function normalizeAngle(angle) {
      while (angle > Math.PI) angle -= 2 * Math.PI;
      while (angle <= -Math.PI) angle += 2 * Math.PI;
      return angle;
    }

    // ============================================================================
    // FUNCIONES DE ACTUALIZACIÓN
    // ============================================================================

    /**
     * Actualiza todas las formas cuando se modifica la forma cartesiana
     */
    function updateFromCartesian() {
      if (isUpdating) return;
      isUpdating = true;

      // Obtener valores de los campos
      const real = parseNumber(document.getElementById('real').value) || 0;
      const imag = parseNumber(document.getElementById('imag').value) || 0;

      // Calcular módulo y argumento
      const modulus = Math.sqrt(real * real + imag * imag);
      let angle = Math.atan2(imag, real);
      angle = normalizeAngle(angle);

      // Actualizar forma polar
      const modulusFormatted = formatNumber(modulus);
      const angleFormatted = angleToPI(angle);

      document.getElementById('modulus').value = modulusFormatted;
      document.getElementById('angle').value = angleFormatted;
      document.getElementById('angle2').value = angleFormatted;

      // Actualizar forma exponencial
      document.getElementById('exp-modulus').value = modulusFormatted;
      document.getElementById('exp-angle').value = angleFormatted;

      // Actualizar resultados mostrados
      updateResults(real, imag, modulus, angle);

      isUpdating = false;
    }

    /**
     * Actualiza todas las formas cuando se modifica la forma polar
     */
    function updateFromPolar() {
      if (isUpdating) return;
      isUpdating = true;

      // Obtener valores de los campos
      const modulus = parseNumber(document.getElementById('modulus').value) || 0;
      const angle = parseAngle(document.getElementById('angle').value) || 0;
      const normalizedAngle = normalizeAngle(angle);

      // Sincronizar segundo campo de ángulo
      const angleFormatted = angleToPI(normalizedAngle);
      document.getElementById('angle2').value = angleFormatted;

      // Calcular coordenadas cartesianas
      const real = modulus * Math.cos(normalizedAngle);
      const imag = modulus * Math.sin(normalizedAngle);

      // Actualizar forma cartesiana
      document.getElementById('real').value = formatNumber(real);
      document.getElementById('imag').value = formatNumber(imag);

      // Actualizar forma exponencial
      document.getElementById('exp-modulus').value = formatNumber(modulus);
      document.getElementById('exp-angle').value = angleFormatted;

      // Actualizar resultados mostrados
      updateResults(real, imag, modulus, normalizedAngle);

      isUpdating = false;
    }

    /**
     * Actualiza todas las formas cuando se modifica la forma exponencial
     */
    function updateFromExponential() {
      if (isUpdating) return;
      isUpdating = true;

      // Obtener valores de los campos
      const modulus = parseNumber(document.getElementById('exp-modulus').value) || 0;
      const angle = parseAngle(document.getElementById('exp-angle').value) || 0;
      const normalizedAngle = normalizeAngle(angle);

      // Calcular coordenadas cartesianas
      const real = modulus * Math.cos(normalizedAngle);
      const imag = modulus * Math.sin(normalizedAngle);

      // Actualizar forma cartesiana
      document.getElementById('real').value = formatNumber(real);
      document.getElementById('imag').value = formatNumber(imag);

      // Actualizar forma polar
      const angleFormatted = angleToPI(normalizedAngle);
      document.getElementById('modulus').value = formatNumber(modulus);
      document.getElementById('angle').value = angleFormatted;
      document.getElementById('angle2').value = angleFormatted;

      // Actualizar resultados mostrados
      updateResults(real, imag, modulus, normalizedAngle);

      isUpdating = false;
    }

    /**
     * Actualiza los resultados mostrados en todas las secciones
     * @param {number} real - Parte real
     * @param {number} imag - Parte imaginaria  
     * @param {number} modulus - Módulo
     * @param {number} angle - Argumento en radianes
     */
    function updateResults(real, imag, modulus, angle) {
      const angleText = angleToPI(angle);

      // Resultado cartesiano
      let cartesianText = "";
      if (real !== 0 || imag !== 0) {
        if (real !== 0) {
          cartesianText += formatNumber(real);
        }
        if (imag > 0) {
          cartesianText += (real !== 0 ? " + " : "");
          if (imag === 1) {
            cartesianText += "i";
          } else {
            cartesianText += formatNumber(imag) + "i";
          }
        } else if (imag < 0) {
          cartesianText += " - ";
          if (imag === -1) {
            cartesianText += "i";
          } else {
            cartesianText += formatNumber(-imag) + "i";
          }
        }
        if (cartesianText === "") cartesianText = "0";
      } else {
        cartesianText = "0";
      }
      document.getElementById('cartesian-result').textContent = "z = " + cartesianText;

      // Resultado polar
      let polarText = "";
      if (modulus !== 0) {
        polarText = formatNumber(modulus) + "(cos(" + angleText + ") + i sin(" + angleText + "))";
      } else {
        polarText = "0";
      }
      document.getElementById('polar-result').textContent = "z = " + polarText;

      // Resultado exponencial
      let expText = "";
      if (modulus !== 0) {
        expText = formatNumber(modulus) + "e^(i*" + angleText + ")";
      } else {
        expText = "0";
      }
      document.getElementById('exponential-result').textContent = "z = " + expText;
    }

    // ============================================================================
    // FUNCIONES AUXILIARES
    // ============================================================================

    /**
     * Limpia todos los campos de entrada y resultados
     */
    function clearAll() {
      // Limpiar todos los campos de entrada
      const inputs = document.querySelectorAll('input[type="text"], input[type="number"]');
      inputs.forEach(input => input.value = '');

      // Limpiar todos los resultados
      const results = document.querySelectorAll('.result');
      results.forEach(result => result.textContent = 'Ingresa los valores arriba');
    }

    // ============================================================================
    // INICIALIZACIÓN Y EVENT LISTENERS
    // ============================================================================

    /**
     * Configura los event listeners cuando el DOM está listo
     */
    document.addEventListener('DOMContentLoaded', function () {
      // Event listeners para forma cartesiana
      document.getElementById('real').addEventListener('input', updateFromCartesian);
      document.getElementById('imag').addEventListener('input', updateFromCartesian);

      // Event listeners para forma polar
      document.getElementById('modulus').addEventListener('input', updateFromPolar);
      document.getElementById('angle').addEventListener('input', function () {
        document.getElementById('angle2').value = this.value;
        updateFromPolar();
      });

      // Event listeners para forma exponencial
      document.getElementById('exp-modulus').addEventListener('input', updateFromExponential);
      document.getElementById('exp-angle').addEventListener('input', updateFromExponential);
    });