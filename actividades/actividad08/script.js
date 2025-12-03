

	// Clase principal de la calculadora
class Calculator {
    constructor() {
        this.variablesInput = document.getElementById('variables');
        this.equationsInput = document.getElementById('equations');
        this.calculateButton = document.getElementById('calculate-btn');
        this.resultDiv = document.getElementById('result');
        
        this.init();
    }
    
    // Inicializar eventos
    init() {
        this.calculateButton.addEventListener('click', () => this.calculate());
        
        // También permitir calcular con Ctrl+Enter en los campos
        this.variablesInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                this.calculate();
            }
        });
        
        this.equationsInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                this.calculate();
            }
        });
    }
    
    // Parsear las variables del campo de texto
    parseVariables(variablesText) {
        const variables = {};
        const lines = variablesText.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine) continue;
            
            // Separar por comas para manejar múltiples declaraciones en una línea
            const parts = trimmedLine.split(',');
            
            for (const part of parts) {
                const trimmedPart = part.trim();
                if (!trimmedPart) continue;
                
                // Buscar asignaciones como "w1 = 1" o "variable = valor"
                const assignmentMatch = trimmedPart.match(/^(\w+)\s*=\s*(.+)$/);
                if (assignmentMatch) {
                    const [, varName, value] = assignmentMatch;
                    try {
                        // Intentar evaluar el valor (puede ser numérico o una expresión)
                        variables[varName.trim()] = this.evaluateExpression(value.trim(), variables);
                    } catch (error) {
                        throw new Error(`Error al evaluar la variable "${varName}": ${error.message}`);
                    }
                } else {
                    // Si no hay asignación, asumir que es solo el nombre de la variable
                    const varName = trimmedPart.trim();
                    if (varName && !variables.hasOwnProperty(varName)) {
                        variables[varName] = 0; // Valor por defecto
                    }
                }
            }
        }
        
        return variables;
    }
    
    // Evaluar expresiones matemáticas
    evaluateExpression(expression, variables) {
        // Primero validar que la expresión original solo contenga caracteres seguros
        // Permitimos: letras, números, operadores (+, -, *, /, ^), paréntesis, puntos, espacios
        if (!/^[a-zA-Z0-9+\-*/().\s^]+$/.test(expression)) {
            throw new Error(`Expresión contiene caracteres no válidos: ${expression}`);
        }
        
        // Convertir ^ a ** para potencias (JavaScript usa ** en lugar de ^)
        let processedExpression = expression.replace(/\^/g, '**');
        
        // Reemplazar variables conocidas en la expresión
        for (const [varName, value] of Object.entries(variables)) {
            const regex = new RegExp(`\\b${varName}\\b`, 'g');
            processedExpression = processedExpression.replace(regex, value);
        }
        
        // Verificar que no queden variables sin resolver (letras)
        if (/[a-zA-Z]/.test(processedExpression)) {
            const undefinedVars = processedExpression.match(/[a-zA-Z]+/g);
            throw new Error(`Variables sin definir: ${undefinedVars.join(', ')}`);
        }
        
        try {
            return Function(`"use strict"; return (${processedExpression})`)();
        } catch (error) {
            throw new Error(`Error al evaluar: ${processedExpression}`);
        }
    }
    
    // Función principal de cálculo
    calculate() {
        try {
            const variablesText = this.variablesInput.value.trim();
            const equationsText = this.equationsInput.value.trim();
            
            if (!variablesText && !equationsText) {
                this.showResult('Por favor ingresa las variables y ecuaciones', 'error');
                return;
            }
            
            // Parsear variables
            const variables = this.parseVariables(variablesText);
            
            // Procesar ecuaciones
            const equations = equationsText.split('\n').filter(line => line.trim());
            const results = [];
            
            for (const equation of equations) {
                const trimmedEquation = equation.trim();
                if (!trimmedEquation) continue;
                
                // Buscar ecuaciones como "result = expression"
                const equationMatch = trimmedEquation.match(/^(\w+)\s*=\s*(.+)$/);
                if (equationMatch) {
                    const [, resultVar, expression] = equationMatch;
                    
                    try {
                        const result = this.evaluateExpression(expression, variables);
                        variables[resultVar] = result;
                        results.push(`${resultVar} = ${result}`);
                    } catch (error) {
                        throw new Error(`Error en ecuación "${trimmedEquation}": ${error.message}`);
                    }
                } else {
                    // Si no es una asignación, evaluar como expresión directa
                    try {
                        const result = this.evaluateExpression(trimmedEquation, variables);
                        results.push(`${trimmedEquation} = ${result}`);
                    } catch (error) {
                        throw new Error(`Error al evaluar "${trimmedEquation}": ${error.message}`);
                    }
                }
            }
            
            if (results.length === 0) {
                this.showResult('No se encontraron ecuaciones válidas para calcular', 'warning');
            } else {
                this.showResult(results.join('\n'), 'success');
            }
            
        } catch (error) {
            this.showResult(`Error: ${error.message}`, 'error');
        }
    }
    
    // Mostrar resultados en la interfaz
    showResult(message, type = 'success') {
        this.resultDiv.textContent = message;
        
        // Remover clases anteriores
        this.resultDiv.classList.remove('result-success', 'result-error', 'result-warning');
        
        // Agregar clase según el tipo
        if (type !== 'success') {
            this.resultDiv.classList.add(`result-${type}`);
        }
    }
}

// Inicializar la calculadora cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new Calculator();
});
