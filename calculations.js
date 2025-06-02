import { auth } from './app.js';
			const ChartAnnotation = window['chartjs-plugin-annotation'];
			const form = document.getElementById('anthropometry-form');
			const resultElements = {
					    // IMC and ICC
					    imc: document.getElementById('result-imc'),
					    imcSource: document.getElementById('imc-source'),
					    icc: document.getElementById('result-icc'),
					    iccSource: document.getElementById('icc-source'),
					
					    // Body Fat Percentages
					    grasaPctActual: document.getElementById('result-grasa-pct-actual'),
					    grasaPctActualSource: document.getElementById('grasa-pct-actual-source'),
					    grasaPctMetabolic: document.getElementById('result-grasa-pct-metabolic'),
					    grasaPctMetabolicSource: document.getElementById('grasa-pct-metabolic-source'),
					    grasaPctDeseado: document.getElementById('result-grasa-pct-deseado'),
					    grasaPctDeseadoSource: document.getElementById('grasa-pct-deseado-source'),
					    grasaPctDeurenberg: document.getElementById('result-grasa-pct-Deurenberg'),
					    grasaPctDeurenbergSource: document.getElementById('grasa-pct-Deurenberg-source'),
					    grasaPctCUNBAE: document.getElementById('result-grasa-pct-CUN-BAE'),
					    grasaPctCUNBAESource: document.getElementById('grasa-pct-CUN-BAE-source'),
					    grasavisceralActual: document.getElementById('result-grasa-pct-visceral'),
				            grasavisceralActualSource: document.getElementById('grasa-pct-visceral-source'),
				            grasaAbsActual: document.getElementById('result-grasa-abdominal'),
				            grasaAbsActualSource: document.getElementById('grasa-abdominal-source'),
					
					    // Fat Mass
					    masaGrasaActual: document.getElementById('result-masa-grasa-actual'),
					    masaGrasaActualSource: document.getElementById('masa-grasa-actual-source'),
					    masaGrasaMetabolic: document.getElementById('result-masa-grasa-metabolic'),
					    masaGrasaMetabolicSource: document.getElementById('masa-grasa-metabolic-source'),
					
					    // Lean Mass
					    masaMagraActual: document.getElementById('result-masa-magra-actual'),
					    masaMagraActualSource: document.getElementById('masa-magra-actual-source'),
					    masaMagraMetabolic: document.getElementById('result-masa-magra-metabolic'),
					    masaMagraMetabolicSource: document.getElementById('masa-grasa-metabolic-source'),
					
					    // IMLG
					    imlgActual: document.getElementById('result-imlg-actual'),
					    imlgActualSource: document.getElementById('imlg-actual-source'),
					    imlgMetabolic: document.getElementById('result-imlg-metabolic'),
					    imlgMetabolicSource: document.getElementById('imlg-metabolic-source'),
					
					    // IMG
					    imgActual: document.getElementById('result-img-actual'),
					    imgActualSource: document.getElementById('img-actual-source'),
					    imgMetabolic: document.getElementById('result-img-metabolic'),
					    imgMetabolicSource: document.getElementById('img-metabolic-source'),
					
					    // Tipología
					    tipologiaActual: document.getElementById('result-tipologia-actual'),
					    tipologiaActualSource: document.getElementById('tipologia-actual-source'),
					    tipologiaMetabolic: document.getElementById('result-tipologia-metabolic'),
					    tipologiaMetabolicSource: document.getElementById('tipologia-metabolic-source'),
					
					    // Metabolic Rate and Age
					    BRMEstimado: document.getElementById('result-tmb'),
					    BRMEstimadoSource: document.getElementById('tmb-source'),
					    edadmetabolica: document.getElementById('result-edadmetabolica'),
					    edadmetabolicaSource: document.getElementById('edadmetabolica-source'),
					
					    // Structural Metrics
					    somatotipo: document.getElementById('result-somatotipo'),
					    somatotipoSource: document.getElementById('somatotipo-source'),
					    amb: document.getElementById('result-amb'),
					    ambSource: document.getElementById('amb-source'),
					    ambc: document.getElementById('result-ambc'),
					    ambcSource: document.getElementById('ambc-source'),
					    mmt: document.getElementById('result-mmt'),
					    mmtSource: document.getElementById('mmt-source'),
					    mmt2: document.getElementById('result-mmt2'),
					    mmt2Source: document.getElementById('mmt2-source'),
					    Pctmmt: document.getElementById('result-Pct-mmt'),
					    PctmmtSource: document.getElementById('Pct-mmt-source'),
					    Pctmmt2: document.getElementById('result-Pct-mmt2'),
					    Pctmmt2Source: document.getElementById('Pct-mmt2-source'),
					    masaOsea: document.getElementById('result-masa-osea'),
					    masaOseaSource: document.getElementById('masa-osea-source'),
					    masaResidual: document.getElementById('result-masa-residual'),
					    masaResidualSource: document.getElementById('masa-residual-source'),
					
					    // Objectives
					    pesoIdeal: document.getElementById('result-peso-ideal'),
					    //pesoIdealSource: document.getElementById('peso-ideal-source'),
					    pesoIdealMetabolic: document.getElementById('result-peso-ideal-metabolic'),
					    pesoObjetivo: document.getElementById('result-peso-objetivo'),
					    pesoObjetivoMetabolic: document.getElementById('result-peso-objetivo-metabolic'),
					    //pesoObjetivoSource: document.getElementById('peso-objetivo-source'),
					    pesoMuscular: document.getElementById('result-peso-muscular'),
					    pesoMuscularSource: document.getElementById('peso-muscular-source'),
					
					    // Other
					    aguacorporal: document.getElementById('result-agua-corporal'),
					    aguacorporalSource: document.getElementById('agua-corporal-source'),
					   // Bioquímicos
					    
					};
        console.log('resultElements:', Object.entries(resultElements).map(([key, val]) => ({ key, val: val ? val.id : null })));
        const explanationSection = document.getElementById('explanation-section');
        const explanationContent = document.getElementById('explanation-content');
		
		
		
        // Function to safely parse float, returns NaN if invalid
        const parseFloatSafe = (value) => {
            console.log(`Parsing value for ${value}:`, value);
            const num = parseFloat(value);
            return isNaN(num) ? NaN : num;
        };

        // Function to format numbers
        const formatResult = (value, decimals = 1) => {
            if (isNaN(value) || value === null || value === undefined) {
                return '---';
            }
            return value.toFixed(decimals);
        };
		
		function calculateIMC(data) {
    let { genero, edad, peso, altura, esDeportista, pliegues, porcentajeGrasa, cintura } = data;

    // Verificar datos obligatorios
    if (!genero || !edad || !peso || !altura) {
        throw new Error('Faltan datos obligatorios: genero, edad, peso, altura');
    }

    // Verificar que la edad sea mayor o igual a 5 años
    if (edad < 5) {
        throw new Error('El cálculo de IMC es para personas de 5 años o más');
    }

		    // Calcular IMC
		    const alturaMetros = altura / 100; // Convertir altura a metros
		    const imc = peso / (alturaMetros * alturaMetros);
		
		    // Inicializar objeto de resultado
		    let imcSource = {};
		
		    // Lógica para adultos (≥18 años)
		    if (edad >= 18) {
		        if (imc < 16.0) {
		            imcSource = {
		                clasificacion: 'Delgadez severa',
		                riesgo: 'Alto riesgo de desnutrición'
		            };
		        } else if (imc >= 16.0 && imc <= 16.9) {
		            imcSource = {
		                clasificacion: 'Delgadez moderada',
		                riesgo: 'Riesgo de desnutrición'
		            };
		        } else if (imc >= 17.0 && imc <= 18.4) {
		            imcSource = {
		                clasificacion: 'Delgadez leve',
		                riesgo: 'Riesgo leve'
		            };
		        } else if (imc >= 18.5 && imc <= 24.9) {
		            imcSource = {
		                clasificacion: 'Normal',
		                riesgo: 'Riesgo mínimo'
		            };
		        } else if (imc >= 25.0 && imc <= 29.9) {
		            imcSource = {
		                clasificacion: 'Sobrepeso',
		                riesgo: 'Riesgo moderado'
		            };
		        } else if (imc >= 30.0 && imc <= 34.9) {
		            imcSource = {
		                clasificacion: 'Obesidad grado I',
		                riesgo: 'Alto riesgo'
		            };
		        } else if (imc >= 35.0 && imc <= 39.9) {
		            imcSource = {
		                clasificacion: 'Obesidad grado II',
		                riesgo: 'Riesgo muy alto de cánceres'
		            };
		        } else if (imc >= 40.0) {
		            imcSource = {
		                clasificacion: 'Obesidad grado III (mórbida)',
		                riesgo: 'Riesgo extremadamente alto'
		            };
		        }
		    } else {
		        // Lógica para pediátrico (5 a <18 años)
		
		        // Verificar rango de altura (85 a 175 cm)
		        if (altura < 85 || altura > 175) {
		            throw new Error('La altura debe estar entre 85 y 175 cm según las tablas pediátricas');
		        }
		
		        // Convertir edad a meses para mayor precisión
		        const edadMeses = Math.floor(edad * 12);
		
		        // Tablas de IMC para la edad (OMS 2007)
		        const imcTablasNiñas = {
		            "5:1": { zMinus3: 11.8, zMinus2: 12.6, zPlus1: 16.9, zPlus2: 18.9 },
		            "5:6": { zMinus3: 11.7, zMinus2: 12.6, zPlus1: 16.9, zPlus2: 19.0 },
		            "6:0": { zMinus3: 11.7, zMinus2: 12.6, zPlus1: 17.0, zPlus2: 19.2 },
		            "6:6": { zMinus3: 11.7, zMinus2: 12.6, zPlus1: 17.1, zPlus2: 19.5 },
		            "7:0": { zMinus3: 11.8, zMinus2: 12.6, zPlus1: 17.3, zPlus2: 19.8 },
		            "7:6": { zMinus3: 11.8, zMinus2: 12.7, zPlus1: 17.5, zPlus2: 20.1 },
		            "8:0": { zMinus3: 11.9, zMinus2: 12.8, zPlus1: 17.7, zPlus2: 20.6 },
		            "8:6": { zMinus3: 12.0, zMinus2: 12.9, zPlus1: 18.0, zPlus2: 21.0 },
		            "9:0": { zMinus3: 12.1, zMinus2: 13.0, zPlus1: 18.3, zPlus2: 21.5 },
		            "9:6": { zMinus3: 12.2, zMinus2: 13.2, zPlus1: 18.7, zPlus2: 22.0 },
		            "10:0": { zMinus3: 12.4, zMinus2: 13.4, zPlus1: 19.0, zPlus2: 22.6 },
		            "10:6": { zMinus3: 12.5, zMinus2: 13.6, zPlus1: 19.4, zPlus2: 23.1 },
		            "11:0": { zMinus3: 12.7, zMinus2: 13.8, zPlus1: 19.9, zPlus2: 23.7 },
		            "11:6": { zMinus3: 12.9, zMinus2: 14.0, zPlus1: 20.3, zPlus2: 24.3 },
		            "12:0": { zMinus3: 13.2, zMinus2: 14.3, zPlus1: 20.8, zPlus2: 25.0 },
		            "12:6": { zMinus3: 13.4, zMinus2: 14.6, zPlus1: 21.3, zPlus2: 25.6 },
		            "13:0": { zMinus3: 13.6, zMinus2: 14.8, zPlus1: 21.8, zPlus2: 26.2 },
		            "13:6": { zMinus3: 13.8, zMinus2: 15.1, zPlus1: 22.3, zPlus2: 26.8 },
		            "14:0": { zMinus3: 14.0, zMinus2: 15.3, zPlus1: 22.7, zPlus2: 27.3 },
		            "14:6": { zMinus3: 14.2, zMinus2: 15.6, zPlus1: 23.1, zPlus2: 27.8 },
		            "15:0": { zMinus3: 14.4, zMinus2: 15.8, zPlus1: 23.5, zPlus2: 28.2 },
		            "15:6": { zMinus3: 14.5, zMinus2: 15.9, zPlus1: 23.8, zPlus2: 28.6 },
		            "16:0": { zMinus3: 14.6, zMinus2: 16.1, zPlus1: 24.1, zPlus2: 28.9 },
		            "16:6": { zMinus3: 14.7, zMinus2: 16.2, zPlus1: 24.3, zPlus2: 29.1 },
		            "17:0": { zMinus3: 14.7, zMinus2: 16.3, zPlus1: 24.5, zPlus2: 29.3 },
		            "17:6": { zMinus3: 14.7, zMinus2: 16.3, zPlus1: 24.6, zPlus2: 29.4 },
		            "18:0": { zMinus3: 14.7, zMinus2: 16.3, zPlus1: 24.8, zPlus2: 29.5 }
		        };
		
		        const imcTablasNiños = {
		            "5:1": { zMinus3: 12.1, zMinus2: 12.9, zPlus1: 16.6, zPlus2: 18.3 },
		            "5:6": { zMinus3: 12.1, zMinus2: 12.9, zPlus1: 16.7, zPlus2: 18.4 },
		            "6:0": { zMinus3: 12.1, zMinus2: 12.9, zPlus1: 16.8, zPlus2: 18.5 },
		            "6:6": { zMinus3: 12.2, zMinus2: 13.0, zPlus1: 16.9, zPlus2: 18.7 },
		            "7:0": { zMinus3: 12.3, zMinus2: 13.0, zPlus1: 17.0, zPlus2: 19.0 },
		            "7:6": { zMinus3: 12.3, zMinus2: 13.1, zPlus1: 17.2, zPlus2: 19.3 },
		            "8:0": { zMinus3: 12.4, zMinus2: 13.2, zPlus1: 17.4, zPlus2: 19.7 },
		            "8:6": { zMinus3: 12.5, zMinus2: 13.3, zPlus1: 17.7, zPlus2: 20.1 },
		            "9:0": { zMinus3: 12.6, zMinus2: 13.4, zPlus1: 17.9, zPlus2: 20.5 },
		            "9:6": { zMinus3: 12.7, zMinus2: 13.5, zPlus1: 18.2, zPlus2: 20.9 },
		            "10:0": { zMinus3: 12.8, zMinus2: 13.6, zPlus1: 18.5, zPlus2: 21.4 },
		            "10:6": { zMinus3: 12.9, zMinus2: 13.8, zPlus1: 18.8, zPlus2: 21.9 },
		            "11:0": { zMinus3: 13.1, zMinus2: 14.0, zPlus1: 19.2, zPlus2: 22.5 },
		            "11:6": { zMinus3: 13.2, zMinus2: 14.1, zPlus1: 19.5, zPlus2: 23.0 },
		            "12:0": { zMinus3: 13.4, zMinus2: 14.4, zPlus1: 19.9, zPlus2: 23.6 },
		            "12:6": { zMinus3: 13.6, zMinus2: 14.6, zPlus1: 20.4, zPlus2: 24.2 },
		            "13:0": { zMinus3: 13.8, zMinus2: 14.8, zPlus1: 20.8, zPlus2: 24.8 },
		            "13:6": { zMinus3: 14.0, zMinus2: 15.1, zPlus1: 21.3, zPlus2: 25.3 },
		            "14:0": { zMinus3: 14.3, zMinus2: 15.4, zPlus1: 21.8, zPlus2: 25.9 },
		            "14:6": { zMinus3: 14.5, zMinus2: 15.6, zPlus1: 22.2, zPlus2: 26.5 },
		            "15:0": { zMinus3: 14.7, zMinus2: 15.9, zPlus1: 22.7, zPlus2: 27.0 },
		            "15:6": { zMinus3: 14.9, zMinus2: 16.2, zPlus1: 23.1, zPlus2: 27.4 },
		            "16:0": { zMinus3: 15.1, zMinus2: 16.4, zPlus1: 23.5, zPlus2: 27.9 },
		            "16:6": { zMinus3: 15.3, zMinus2: 16.6, zPlus1: 23.9, zPlus2: 28.3 },
		            "17:0": { zMinus3: 15.4, zMinus2: 16.8, zPlus1: 24.3, zPlus2: 28.6 },
		            "17:6": { zMinus3: 15.6, zMinus2: 17.0, zPlus1: 24.6, zPlus2: 29.0 },
		            "18:0": { zMinus3: 15.7, zMinus2: 17.2, zPlus1: 24.9, zPlus2: 29.2 }
		        };
		
		        // Validar peso según tablas de estatura (como referencia)
		        function validarPesoPorEstatura(altura, peso) {
		            const alturaEntera = Math.round(altura);
		            if (alturaEntera >= 85 && alturaEntera <= 114) {
		                return peso >= 10 && peso <= 37; // Rango de la tabla 85-114 cm
		            } else if (alturaEntera >= 115 && alturaEntera <= 144) {
		                return peso >= 12 && peso <= 44; // Rango de la tabla 115-144 cm
		            } else if (alturaEntera >= 145 && alturaEntera <= 175) {
		                return peso >= 19 && peso <= 52; // Rango de la tabla 145-175 cm
		            }
		            return false;
		        }
		
		        // Validar peso
		        if (!validarPesoPorEstatura(altura, peso)) {
		            throw new Error('El peso está fuera del rango esperado para la altura según las tablas pediátricas');
		        }
		
		        // Obtener límites de IMC según edad y sexo
		        function getIMCLimits(genero, edadMeses) {
		            const edadAnios = Math.floor(edadMeses / 12);
		            const mesesRestantes = edadMeses % 12;
		            const key1 = `${edadAnios}:${mesesRestantes >= 6 ? 6 : 0}`;
		            const key2 = mesesRestantes >= 6 ? `${edadAnios + 1}:0` : `${edadAnios}:6`;
		
		            const tabla = genero.toLowerCase() === 'femenino' ? imcTablasNiñas : imcTablasNiños;
		            const limites1 = tabla[key1] || tabla[`${edadAnios}:0`];
		            const limites2 = tabla[key2] || tabla[`${edadAnios + 1}:0`];
		
		            if (!limites1 || !limites2) {
		                throw new Error('Edad fuera del rango de las tablas OMS');
		            }
		
		            // Interpolación lineal para valores intermedios
		            const factor = mesesRestantes >= 6 ? (mesesRestantes - 6) / 6 : mesesRestantes / 6;
		            return {
		                zMinus3: limites1.zMinus3 + (limites2.zMinus3 - limites1.zMinus3) * factor,
		                zMinus2: limites1.zMinus2 + (limites2.zMinus2 - limites1.zMinus2) * factor,
		                zPlus1: limites1.zPlus1 + (limites2.zPlus1 - limites1.zPlus1) * factor,
		                zPlus2: limites1.zPlus2 + (limites2.zPlus2 - limites1.zPlus2) * factor
		            };
		        }
		
		        const imcLimits = getIMCLimits(genero, edadMeses);
		
		        // Determinar clasificación según OMS pediátrica
		        if (imc < imcLimits.zMinus3) {
		            imcSource = {
		                clasificacion: 'Desnutrición severa',
		                riesgo: 'Alto riesgo de desnutrición',
		                percentil: '<0.1'
		            };
		        } else if (imc >= imcLimits.zMinus3 && imc < imcLimits.zMinus2) {
		            imcSource = {
		                clasificacion: 'Desnutrición moderada',
		                riesgo: 'Riesgo de desnutrición',
		                percentil: '0.1-2.3'
		            };
		        } else if (imc >= imcLimits.zMinus2 && imc <= imcLimits.zPlus1) {
		            imcSource = {
		                clasificacion: 'Normal',
		                riesgo: 'Riesgo mínimo',
		                percentil: '2.3-84.1'
		            };
		        } else if (imc > imcLimits.zPlus1 && imc <= imcLimits.zPlus2) {
		            imcSource = {
		                clasificacion: 'Sobrepeso',
		                riesgo: 'Riesgo moderado',
		                percentil: '84.1-97.7'
		            };
		        } else if (imc > imcLimits.zPlus2) {
		            imcSource = {
		                clasificacion: 'Obesidad',
		                riesgo: 'Alto riesgo de enfermedades metabólicas',
		                percentil: '>97.7'
		            };
		        }
		    }
		
		    // Agregar el valor numérico del IMC al objeto
		    imcSource.imc = imc.toFixed(2); // Redondear a 2 decimales
		
		    // Considerar si es deportista
		    if (esDeportista) {
		        imcSource.nota = 'Nota: En deportistas, el IMC puede no reflejar con precisión la composición corporal debido a mayor masa muscular';
		    }
		
		    // Devolver objeto con imc y imcSource
		    return { imc, imcSource };
		}

		// Function to calculate ICC
			function calculateICC(data) {
			    // Validar datos de entrada
			    if (!data.circ_cintura || !data.circ_cadera || !data.genero) {
			        throw new Error('Faltan datos requeridos: circunferencia de cintura, cadera o género');
			    }
			
			    const cintura = Number(data.circ_cintura);
			    const cadera = Number(data.circ_cadera);
			    const genero = data.genero.toLowerCase();
			
			    // Validar valores numéricos
			    if (isNaN(cintura) || cintura <= 0) {
			        throw new Error('Circunferencia de cintura inválida');
			    }
			    if (isNaN(cadera) || cadera <= 0) {
			        throw new Error('Circunferencia de cadera inválida');
			    }
			    if (!['masculino', 'femenino'].includes(genero)) {
			        throw new Error('Género debe ser "masculino" o "femenino"');
			    }
			
			    // Calcular ICC
			    const icc = cintura / cadera;
			
			    // Determinar clasificación y riesgo
			    let clasificacion = '';
			    let riesgo = '';
			
			    if (genero === 'masculino') {
			        if (icc < 0.78) {
			            clasificacion = 'Ginoide';
			            riesgo = 'Riesgo Bajo';
			        } else if (icc >= 0.78 && icc <= 0.94) {
			            clasificacion = 'Normal';
			            riesgo = 'Riesgo Bajo';
			        } else if (icc > 0.94 && icc < 1.0) {
			            clasificacion = 'Androide';
			            riesgo = 'Riesgo Alto';
			        } else { // icc >= 1.0
			            clasificacion = 'Androide';
			            riesgo = 'Riesgo Muy Alto';
			        }
			    } else { // femenino
			        if (icc < 0.71) {
			            clasificacion = 'Ginoide';
			            riesgo = 'Riesgo Bajo';
			        } else if (icc >= 0.71 && icc <= 0.84) {
			            clasificacion = 'Normal';
			            riesgo = 'Riesgo Bajo';
			        } else if (icc > 0.84 && icc < 1.0) {
			            clasificacion = 'Androide';
			            riesgo = 'Riesgo Alto';
			        } else { // icc >= 1.0
			            clasificacion = 'Androide';
			            riesgo = 'Riesgo Muy Alto';
			        }
			    }
			
			    return {
			        icc: icc,
			        iccSource: {
			            clasificacion: clasificacion,
			            riesgo: riesgo
			        }
			    };
			}

			//Funtion %Body Water
			function calcularACT(edad, genero, altura, peso, esDeportista) {
			    // Validar entradas
			    if (!edad || !genero || !altura || !peso) {
			        console.error('calcularACT - Error: Faltan datos requeridos', { edad, genero, altura, peso });
				    return { error: 'Por favor, ingrese todos los datos requeridos.' };
			    }
			
			    if (edad < 6 || altura < 90 || peso < 15) {
				    console.error('calcularACT - Error: Valores no permitidos', { edad, altura, peso });
			        return { error: 'Los valores no pueden ser tan bajos.' };
			    }
			
			    let actKg, porcentajeACT, rangoReferencia, fuente, clasificacion;
			//const alturaMetros = altura / 100; // Convertir altura a metros
			    // Calcular ACT según sexo, edad y fórmula correspondiente
			    if (edad > 64) {
			        // Fórmulas de Lee et al. para población mayor (>64 años)
			        if (genero.toLowerCase() === 'masculino') {
			            actKg = -28.3497 + (0.243057 * altura) + (0.366248 * peso);
			            fuente = 'Lee et al.';
			        } else if (genero.toLowerCase() === 'femenino') {
			            actKg = -26.6224 + (0.262513 * altura) + (0.232948 * peso);
			            fuente = 'Lee et al.';
			        } else {
					console.error('calcularACT - Error: Genero no válido', { genero });
			            return { error: 'Sexo no válido. Use "hombre" o "mujer".' };
			        }
			    } else {
			        // Fórmulas de Watson para población general o deportistas (≤64 años)
			        if (genero.toLowerCase() === 'masculino') {
			            actKg = 2.447 - 0.09516 * edad + 0.1074 * altura + 0.3362 * peso;
			            fuente = 'Watson et al., 1980';
			        } else if (genero.toLowerCase() === 'femenino') {
			            actKg = 2.097 + 0.1069 * altura + 0.2466 * peso;
			            fuente = 'Watson et al., 1980';
			        } else {
					console.error('calcularACT - Error: Genero no válido', { genero });
			            return { error: 'Sexo no válido. Use "hombre" o "mujer".' };
			        }
			    }
			
			    // Calcular porcentaje de ACT
			    porcentajeACT = (actKg / peso) * 100;
			
			    // Determinar rango de referencia y clasificar % ACT
			    let limiteInferior, limiteSuperior;
			
			    if (esDeportista && edad <= 64) {
			        // Rangos para deportistas
			        if (genero.toLowerCase() === 'masculino') {
			            limiteInferior = 60;
			            limiteSuperior = 70;
			            rangoReferencia = '60% - 70%';
			        } else {
			            limiteInferior = 55;
			            limiteSuperior = 65;
			            rangoReferencia = '55% - 65%';
			        }
			    } else {
			        // Rangos para población general según edad
			        if (edad >= 12 && edad <= 18) {
			            if (genero.toLowerCase() === 'masculino') {
			                limiteInferior = 52;
			                limiteSuperior = 66;
			                rangoReferencia = '52% - 66%';
			            } else {
			                limiteInferior = 49;
			                limiteSuperior = 63;
			                rangoReferencia = '49% - 63%';
			            }
			        } else if (edad >= 19 && edad <= 50) {
			            if (genero.toLowerCase() === 'masculino') {
			                limiteInferior = 43;
			                limiteSuperior = 73;
			                rangoReferencia = '43% - 73%';
			            } else {
			                limiteInferior = 41;
			                limiteSuperior = 60;
			                rangoReferencia = '41% - 60%';
			            }
			        } else if (edad >= 51) {
			            // Incluye a mayores de 64 años (población general)
			            if (genero.toLowerCase() === 'masculino') {
			                limiteInferior = 47;
			                limiteSuperior = 67;
			                rangoReferencia = '47% - 67%';
			            } else {
			                limiteInferior = 39;
			                limiteSuperior = 57;
			                rangoReferencia = '39% - 57%';
			            }
			        } else {
					console.error('calcularACT - Error: Edad no válida para rangos de referencia (<12 años)', { edad });
			            return { error: 'Rango de referencia no disponible para menores de 12 años.' };
			        }
			    }
			
			    // Clasificar % ACT dentro del rango
			    const rango = limiteSuperior - limiteInferior;
			    const cuarto = rango / 4;
			
			    if (porcentajeACT < limiteInferior) {
			        clasificacion = 'Muy Bajo';
			    } else if (porcentajeACT >= limiteInferior && porcentajeACT < limiteInferior + cuarto) {
			        clasificacion = 'Bajo';
			    } else if (porcentajeACT >= limiteInferior + cuarto && porcentajeACT < limiteInferior + 3 * cuarto) {
			        clasificacion = 'Normal';
			    } else if (porcentajeACT >= limiteInferior + 3 * cuarto && porcentajeACT <= limiteSuperior) {
			        clasificacion = 'Medio Alto';
			    } else {
			        clasificacion = 'Por encima del rango de referencia';
			    }

				// Registrar resultados
				    console.log('calcularACT - Resultados:', {
				        actKg: actKg.toFixed(2),
				        porcentajeACT: porcentajeACT.toFixed(2),
				        rangoReferencia,
				        clasificacion,
				        fuente
				    });

			    // Devolver resultados
			    // Registrar resultados
			    const resultados = {
			        actKg: actKg.toFixed(2),
			        porcentajeACT: porcentajeACT.toFixed(2),
			        rangoReferencia,
			        clasificacion,
			        fuente
			    };
			    console.log('[calcularACT] Resultados calculados:', resultados);
			
			    return resultados;
			}




			// Function to estimate metabolic Age
				function calculateMetabolicAge(data) {
				let { genero, edad, peso, altura, esDeportista, pliegues, porcentajeGrasa, cintura,imc } = data;
	
				// Verificar datos obligatorios
				if (!genero || !edad || !peso || !altura) {
					throw new Error('Faltan datos obligatorios: genero, edad, peso, altura');
				}
					
				// Validación para culturistas: forzar esDeportista = true si % grasa es bajo e IMC es alto
				let grasaEval;
				if (pliegues) {
					const { tricipital, subescapular, suprailiaco, bicipital } = pliegues;
					if (!tricipital || !subescapular || !suprailiaco || !bicipital) {
						throw new Error('Faltan mediciones de pliegues cutáneos para Durnin-Womersley');
					}
					const sumaPliegues = tricipital + subescapular + suprailiaco + bicipital;
					let c, m;
					if (genero === 'masculino') {
						if (edad >= 17 && edad <= 19) { c = 1.1620; m = 0.0630; }
						else if (edad >= 20 && edad <= 29) { c = 1.1631; m = 0.0632; }
						else if (edad >= 30 && edad <= 39) { c = 1.1422; m = 0.0544; }
						else if (edad >= 40 && edad <= 49) { c = 1.1620; m = 0.0700; }
						else if (edad >= 50) { c = 1.1715; m = 0.0779; }
					} else if (genero === 'femenino') {
						if (edad >= 17 && edad <= 19) { c = 1.1549; m = 0.0678; }
						else if (edad >= 20 && edad <= 29) { c = 1.1599; m = 0.0717; }
						else if (edad >= 30 && edad <= 39) { c = 1.1423; m = 0.0632; }
						else if (edad >= 40 && edad <= 49) { c = 1.1333; m = 0.0612; }
						else if (edad >= 50) { c = 1.1339; m = 0.0645; }
					} else {
						throw new Error('Género no válido');
					}
					const logSumPliegues = Math.log10(sumaPliegues);
					const densidadCorporal = c - (m * logSumPliegues);
					grasaEval = (457 / densidadCorporal) - 414.2;
				} else if (porcentajeGrasa) {
					grasaEval = porcentajeGrasa;
				}
	
				// Forzar esDeportista = true para culturistas (IMC ≥ 30 y % grasa bajo)
				const umbralGrasaCulturista = genero === 'masculino' ? 15 : 20;
				if (imc >= 30 && grasaEval && grasaEval < umbralGrasaCulturista) {
					esDeportista = true;
				}
	
				// Determinar nivel de actividad según si es deportista o no
				const nivelActividad = esDeportista ? 'intenso' : 'sedentario';
	
				// Evaluar obesidad para no deportistas
				let esObeso = false;
				if (!esDeportista) {
					if (!grasaEval) {
						throw new Error('Se requiere pliegues o porcentajeGrasa para evaluar obesidad');
					}
					// Definir obesidad: IMC ≥ 30 y % grasa > umbral saludable
					const umbralGrasa = genero === 'masculino' ? 25 : 32;
					esObeso = imc >= 30 && grasaEval > umbralGrasa;
				}
	
				// Escenario 1: Deportista, 18-61 años, pliegues conocidos
				    if (esDeportista && pliegues && edad >= 18 && edad <= 61) {
				        const { tricipital, subescapular, suprailiaco, bicipital } = pliegues;
				        if (!tricipital || !subescapular || !suprailiaco || !bicipital) {
				            throw new Error('Faltan mediciones de pliegues cutáneos');
				        }
				        const method = 'Siri_Katch-McArdle_Harris-Benedict(Dxt,Pliegues)';
				        const { edadMetabolica, bmrReal, masaMagra, masaGrasa } = metodo1(genero, edad, peso, altura, tricipital, subescapular, suprailiaco, bicipital, false);
				        return {
				            edadMetabolica,
				            BRMEstimado: bmrReal,
				            method,
				            BRMEstimadoSource: method,
				            masaMagra,
				            masaGrasa
				        };
				    }
				    // Escenario 2: Deportista, % grasa conocido
				    else if (esDeportista && porcentajeGrasa) {
				        const method = 'Siri_Katch-McArdle_Harris-Benedict(Dxt,%Grasa Conocido)';
				        const { edadMetabolica, bmrReal, masaMagra, masaGrasa } = metodo1(genero, edad, peso, altura, null, null, null, null, true, porcentajeGrasa);
				        return {
				            edadMetabolica,
				            BRMEstimado: bmrReal,
				            method,
				            BRMEstimadoSource: method,
				            masaMagra,
				            masaGrasa
				        };
				    }
				    // Escenario 3: No deportista, pliegues conocidos, no obeso
				    else if (!esDeportista && pliegues && !esObeso) {
				        const { tricipital, subescapular, suprailiaco, bicipital } = pliegues;
				        if (!tricipital || !subescapular || !suprailiaco || !bicipital) {
				            throw new Error('Faltan mediciones de pliegues cutáneos para Durnin-Womersley');
				        }
				        const method = 'Brozek_Harris-Benedict(No-Dxt,Pliegues,No-Obeso)';
				        const { edadMetabolica, bmrReal, masaMagra, masaGrasa } = metodo2(genero, edad, peso, altura, null, cintura, nivelActividad, { tricipital, subescapular, suprailiaco, bicipital }, false);
				        return {
				            edadMetabolica,
				            BRMEstimado: bmrReal,
				            method,
				            BRMEstimadoSource: method,
				            masaMagra,
				            masaGrasa
				        };
				    }
				    // Escenario 4: No deportista, % grasa conocido, no obeso
				    else if (!esDeportista && porcentajeGrasa && !esObeso) {
				        if (!cintura) {
				            throw new Error('Se requiere medida de cintura para Método 2');
				        }
				        const method = 'Brozek_Harris-Benedict(No-Dxt,%Grasa Conocido,No-Obeso)';
				        const { edadMetabolica, bmrReal, masaMagra, masaGrasa } = metodo2(genero, edad, peso, altura, porcentajeGrasa, cintura, nivelActividad, null, false);
				        return {
				            edadMetabolica,
				            BRMEstimado: bmrReal,
				            method,
				            BRMEstimadoSource: method,
				            masaMagra,
				            masaGrasa
				        };
				    }
				    // Escenario 5: No deportista, pliegues conocidos, obeso
				    else if (!esDeportista && pliegues && esObeso) {
				        const { tricipital, subescapular, suprailiaco, bicipital } = pliegues;
				        if (!tricipital || !subescapular || !suprailiaco || !bicipital) {
				            throw new Error('Faltan mediciones de pliegues cutáneos para Durnin-Womersley');
				        }
				        const method = 'Wagner_Harris-Benedict(No-Dxt,Pliegues,Obeso)';
				        const { edadMetabolica, bmrReal, masaMagra, masaGrasa } = metodo2(genero, edad, peso, altura, null, cintura, nivelActividad, { tricipital, subescapular, suprailiaco, bicipital }, true);
				        return {
				            edadMetabolica,
				            BRMEstimado: bmrReal,
				            method,
				            BRMEstimadoSource: method,
				            masaMagra,
				            masaGrasa
				        };
				    }
				    // Escenario 6: No deportista, % grasa conocido, obeso
				    else if (!esDeportista && porcentajeGrasa && esObeso) {
				        if (!cintura) {
				            throw new Error('Se requiere medida de cintura para Método 2');
				        }
				        const method = 'Wagner_Harris-Benedict(No-Dxt,%Grasa Conocido,Obeso)';
				        const { edadMetabolica, bmrReal, masaMagra, masaGrasa } = metodo2(genero, edad, peso, altura, porcentajeGrasa, cintura, nivelActividad, null, true);
				        return {
				            edadMetabolica,
				            BRMEstimado: bmrReal,
				            method,
				            BRMEstimadoSource: method,
				            masaMagra,
				            masaGrasa
				        };
				    }
				    else {
				        throw new Error('No se cumplen las condiciones para ningún escenario');
				    }
				}
	
			function metodo1(genero, edad, peso, altura, tricipital, subescapular, suprailiaco, bicipital, usePorcentajeGrasa = false, porcentajeGrasa = null) {
			    let grasa;
			    if (!usePorcentajeGrasa) {
			        const sumaPliegues = tricipital + subescapular + suprailiaco + bicipital;
			        let c, m;
			        if (genero === 'masculino') {
			            if (edad >= 17 && edad <= 19) { c = 1.1620; m = 0.0630; }
			            else if (edad >= 20 && edad <= 29) { c = 1.1631; m = 0.0632; }
			            else if (edad >= 30 && edad <= 39) { c = 1.1422; m = 0.0544; }
			            else if (edad >= 40 && edad <= 49) { c = 1.1620; m = 0.0700; }
			            else if (edad >= 50) { c = 1.1715; m = 0.0779; }
			        } else if (genero === 'femenino') {
			            if (edad >= 17 && edad <= 19) { c = 1.1549; m = 0.0678; }
			            else if (edad >= 20 && edad <= 29) { c = 1.1599; m = 0.0717; }
			            else if (edad >= 30 && edad <= 39) { c = 1.1423; m = 0.0632; }
			            else if (edad >= 40 && edad <= 49) { c = 1.1333; m = 0.0612; }
			            else if (edad >= 50) { c = 1.1339; m = 0.0645; }
			        } else {
			            throw new Error('Género no válido');
			        }
			        const logSumPliegues = Math.log10(sumaPliegues);
			        const densidadCorporal = c - (m * logSumPliegues);
			        grasa = (495 / densidadCorporal) - 450;
			    } else {
			        grasa = porcentajeGrasa;
			    }
			
			    // Calcular masa magra y grasa
			    const masaGrasa = (grasa / 100) * peso;
			    const masaMagra = peso - masaGrasa;
			
			    // Calcular BMR real con Katch-McArdle
			    const bmrReal = 370 + (21.6 * masaMagra);
			
			    // Calcular edad metabólica con Harris-Benedict ajustada
			    let edadMetabolica;
			    if (genero === 'masculino') {
			        const numerador = 88.362 + (13.397 * peso) + (4.799 * altura) - bmrReal;
			        edadMetabolica = numerador / 5.677; // Corregido de 5.7 a 5.677 para consistencia
			    } else if (genero === 'femenino') {
			        const numerador = 447.593 + (9.247 * peso) + (3.098 * altura) - bmrReal;
			        edadMetabolica = numerador / 4.33; // Corregido de 4.7 a 4.33 para consistencia
			    } else {
			        throw new Error('Género no válido');
			    }
			
			    return {
			        edadMetabolica: Number(edadMetabolica.toFixed(1)),
			        bmrReal: Number(bmrReal.toFixed(1)),
			        masaMagra: Number(masaMagra.toFixed(1)),
			        masaGrasa: Number(masaGrasa.toFixed(1))
			    };
			}
			
			function metodo2(genero, edad, peso, altura, porcentajeGrasa, cintura, nivelActividad, pliegues = null, esObeso = false) {
			    let grasa;
			    if (pliegues) {
			        const { tricipital, subescapular, suprailiaco, bicipital } = pliegues;
			        const sumaPliegues = tricipital + subescapular + suprailiaco + bicipital;
			        let c, m;
			        if (genero === 'masculino') {
			            if (edad >= 17 && edad <= 19) { c = 1.1620; m = 0.0630; }
			            else if (edad >= 20 && edad <= 29) { c = 1.1631; m = 0.0632; }
			            else if (edad >= 30 && edad <= 39) { c = 1.1422; m = 0.0544; }
			            else if (edad >= 40 && edad <= 49) { c = 1.1620; m = 0.0700; }
			            else if (edad >= 50) { c = 1.1715; m = 0.0779; }
			        } else if (genero === 'femenino') {
			            if (edad >= 17 && edad <= 19) { c = 1.1549; m = 0.0678; }
			            else if (edad >= 20 && edad <= 29) { c = 1.1599; m = 0.0717; }
			            else if (edad >= 30 && edad <= 39) { c = 1.1423; m = 0.0632; }
			            else if (edad >= 40 && edad <= 49) { c = 1.1333; m = 0.0612; }
			            else if (edad >= 50) { c = 1.1339; m = 0.0645; }
			        } else {
			            throw new Error('Género no válido');
			        }
			        const logSumPliegues = Math.log10(sumaPliegues);
			        const densidadCorporal = c - (m * logSumPliegues);
			        grasa = esObeso ? (498 / densidadCorporal) - 451 : (457 / densidadCorporal) - 414.2;
			    } else {
			        grasa = porcentajeGrasa;
			    }
			
			    // Calcular masa magra y grasa
			    const masaGrasa = (grasa / 100) * peso;
			    const masaMagra = peso - masaGrasa;
			
			    // Calcular BMR Real (Katch-McArdle)
			    const bmrReal = 370 + (21.6 * masaMagra);
			
			    // Calcular BMR Esperado (Harris-Benedict)
			    let bmrEsperado;
			    if (genero === 'femenino') {
			        bmrEsperado = 447.593 + (9.247 * peso) + (3.098 * altura) - (4.33 * edad);
			    } else if (genero === 'masculino') {
			        bmrEsperado = 88.362 + (13.397 * peso) + (4.799 * altura) - (5.677 * edad);
			    } else {
			        throw new Error('Género no válido');
			    }
			
			    // Calcular Delta BMR
			    const deltaBMR = (bmrEsperado - bmrReal) / 15;
			
			    // Calcular Delta Cintura
			    let deltaCintura;
			    const whtr = cintura / altura;
			    const ajusteWHtR = Math.max(1, whtr / 0.5);
			    const ajusteEdad = edad > 50 ? 1 + 0.01 * (edad - 50) : 1;
			    if (genero === 'femenino') {
			        if (cintura <= 80) {
			            deltaCintura = 0;
			        } else {
			            deltaCintura = 0.2 * (cintura - 80) * ajusteWHtR * ajusteEdad;
			            deltaCintura = Math.min(deltaCintura, 10);
			        }
			    } else if (genero === 'masculino') { // Corregido de 'Masculino' a 'masculino'
			        if (cintura <= 94) {
			            deltaCintura = 0;
			        } else {
			            deltaCintura = 0.2 * (cintura - 94) * ajusteWHtR * ajusteEdad;
			            deltaCintura = Math.min(deltaCintura, 10);
			        }
			    }
			
			    // Calcular Delta Actividad
			    const ajustesActividad = {
			        'sedentario': 3,
			        'ligero': 1,
			        'moderado': -1,
			        'intenso': -4,
			        'atleta': -5
			    };
			    const deltaActividad = ajustesActividad[nivelActividad] || 0;
			
			    // Calcular Edad Metabólica
			    const edadMetabolica = edad + deltaBMR + deltaCintura + deltaActividad;
			
			    return {
			        edadMetabolica: Number(edadMetabolica.toFixed(2)),
			        bmrReal: Number(bmrReal.toFixed(1)),
			        masaMagra: Number(masaMagra.toFixed(1)),
			        masaGrasa: Number(masaGrasa.toFixed(1))
			    };
			}	
			
	        		// Updated estimateTargetBodyFat function
				const estimateTargetBodyFat = (gender, isAthlete, age) => {
					console.log(`Estimating target body fat for gender: ${gender}, isAthlete: ${isAthlete}, age: ${age}`);
					const ranges = {
						masculino: {
							athlete: {
								'18-29': [7, 13],
								'30-49': [9, 17],
								'50+': [10, 19]
							},
							nonAthlete: {
								'18-29': [14, 20],
								'30-49': [17, 23],
								'50+': [20, 25]
							}
						},
						femenino: {
							athlete: {
								'18-29': [14, 20],
								'30-49': [16, 22],
								'50+': [18, 25]
							},
							nonAthlete: {
								'18-29': [20, 28],
								'30-49': [23, 30],
								'50+': [27, 33]
							}
						}
					};
	
					let ageRange;
					if (age >= 18 && age <= 29) {
						ageRange = '18-29';
					} else if (age >= 30 && age <= 49) {
						ageRange = '30-49';
					} else if (age >= 50) {
						ageRange = '50+';
					} else {
						console.warn('Edad fuera de rango válido:', age);
						return NaN;
					}
	
					try {
						const category = isAthlete ? 'athlete' : 'nonAthlete';
						const [min, max] = ranges[gender][category][ageRange];
						const target = (min + max) / 2;
						console.log(`Target body fat: ${target}% (range: ${min}–${max}%)`);
						return Number(target.toFixed(1));
					} catch (error) {
						console.error('Error estimating target body fat:', error);
						return NaN;
					}
				};
	
	        // Function to calculate % Body Fat using Slaughter (ages 6-17)
	        const calculateSlaughterBodyFat = (data) => {
	            console.log('Calculating Slaughter Body Fat');
	            if (data.pliegue_tricipital && data.pliegue_pantorrilla && data.genero) {
	                const sumPliegues = data.pliegue_tricipital + data.pliegue_pantorrilla;
	                console.log(`Sum of skinfolds: ${sumPliegues}`);
	                if (data.genero === 'masculino') {
	                    return 0.735 * sumPliegues + 1.0;
	                } else if (data.genero === 'femenino') {
	                    return 0.610 * sumPliegues + 5.1;
	                }
	            }
	            console.warn('Slaughter: Missing skinfolds or gender');
	            return NaN;
	        };
	
	        // Function to calculate % Body Fat using Jackson-Pollock (3 skinfolds, adults, athletes)
	        const calculateJacksonPollockBodyFat = (data) => {
	            console.log('Calculating Jackson-Pollock Body Fat');
	            if (data.pliegue_tricipital && data.pliegue_subescapular && data.pliegue_suprailiaco && data.edad && data.genero) {
	                const sumPliegues = data.pliegue_tricipital + data.pliegue_subescapular + data.pliegue_suprailiaco;
	                console.log(`Sum of skinfolds: ${sumPliegues}, Age: ${data.edad}, Gender: ${data.genero}`);
	                if (sumPliegues < 10) {
	                    console.warn('Sum of skinfolds too low (< 10 mm), may produce unreliable results');
	                    return NaN;
	                }
	                let dc;
	                if (data.genero === 'masculino') {
	                    dc = 1.10938 - (0.0008267 * sumPliegues) + (0.0000016 * sumPliegues * sumPliegues) - (0.0002574 * data.edad);
	                } else if (data.genero === 'femenino') {
	                    dc = 1.0994921 - (0.0009929 * sumPliegues) + (0.0000023 * sumPliegues * sumPliegues) - (0.0001392 * data.edad);
	                }
	                if (dc) {
	                    console.log(`Body density: ${dc}`);
	                    const bodyFat = (495 / dc) - 450;
	                    console.log(`Calculated % Body Fat: ${bodyFat}`);
	                    return bodyFat;
	                }
	            }
	            console.warn('Jackson-Pollock: Missing skinfolds, age, or gender');
	            return NaN;
	        };
	
	        // Function to calculate % Body Fat using Circumferences (adults)
	        const calculateCircumferenceBodyFat = (data) => {
	            console.log('Calculating Circumference-Based Body Fat');
	            if (data.circ_cintura && data.circ_cadera && data.circ_cuello && data.altura && data.genero) {
	                console.log(`Circumferences: Cintura=${data.circ_cintura}, Cadera=${data.circ_cadera}, Cuello=${data.circ_cuello}, Altura=${data.altura}, Gender=${data.genero}`);
	                let dc;
	                if (data.genero === 'masculino') {
	                    const logWaistNeck = Math.log10(data.circ_cintura - data.circ_cuello);
	                    const logHeight = Math.log10(data.altura);
	                    dc = 1.0324 - (0.19077 * logWaistNeck) + (0.15456 * logHeight);
	                } else if (data.genero === 'femenino') {
	                    const logWaistHipNeck = Math.log10(data.circ_cintura + data.circ_cadera - data.circ_cuello);
	                    const logHeight = Math.log10(data.altura);
	                    dc = 1.29579 - (0.35004 * logWaistHipNeck) + (0.22100 * logHeight);
	                }
	                if (dc) {
	                    console.log(`Body density: ${dc}`);
	                    const bodyFat = (495 / dc) - 450;
	                    console.log(`Calculated % Body Fat: ${bodyFat}`);
	                    return bodyFat;
	                }
	            }
	            console.warn('Circumference Method: Missing cintura, cadera, cuello, altura, or gender');
	            return NaN;
	        };
	
	        // Function to calculate % Body Fat using Durnin-Womersley (4 skinfolds, adults, general population)
	        const calculateDurninWomersleyBodyFat = (data) => {
	            console.log('Calculating Durnin-Womersley Body Fat');
	            if (data.pliegue_bicipital && data.pliegue_tricipital && data.pliegue_subescapular && data.pliegue_suprailiaco && data.edad && data.genero) {
	                const sumPliegues = data.pliegue_bicipital + data.pliegue_tricipital + data.pliegue_subescapular + data.pliegue_suprailiaco;
	                console.log(`Sum of skinfolds: ${sumPliegues}, Age: ${data.edad}`);
	                const constants = {
	                    masculino: {
	                        '17-19': { c: 1.1620, m: 0.0630 },
	                        '20-29': { c: 1.1631, m: 0.0632 },
	                        '30-39': { c: 1.1422, m: 0.0544 },
	                        '40-49': { c: 1.1620, m: 0.0700 },
	                        '50+': { c: 1.1715, m: 0.0779 }
	                    },
	                    femenino: {
	                        '17-19': { c: 1.1549, m: 0.0678 },
	                        '20-29': { c: 1.1599, m: 0.0717 },
	                        '30-39': { c: 1.1423, m: 0.0632 },
	                        '40-49': { c: 1.1333, m: 0.0612 },
	                        '50+': { c: 1.1339, m: 0.0645 }
	                    }
	                };
	                let ageRange;
	                if (data.edad <= 19) ageRange = '17-19';
	                else if (data.edad <= 29) ageRange = '20-29';
	                else if (data.edad <= 39) ageRange = '30-39';
	                else if (data.edad <= 49) ageRange = '40-49';
	                else ageRange = '50+';
	                
	                const { c, m } = constants[data.genero][ageRange] || {};
	                if (c && m) {
	                    const dc = c - (m * Math.log10(sumPliegues));
	                    console.log(`Body density: ${dc}`);
	                    const bodyFat = (495 / dc) - 450;
	                    console.log(`Calculated % Body Fat: ${bodyFat}`);
	                    return bodyFat;
	                }
	            }
	            console.warn('Durnin-Womersley: Missing skinfolds, age, or gender');
	            return NaN;
	        };
			
				//Funcion para Explicacion Tipología del Cuerpo según Índices de Masa (IMLG e IMG)
				const generateBodyCompositionAnalysis = (data, cliente) => {
				const { peso = 0, altura = 0, porcentajeGrasa = 0 } = data || {};
				const { sexo = 'no especificado', edad = 'no especificada', esDeportista = false } = cliente || {};
	
	    // Validar datos de entrada
	    if (!peso || !altura || !porcentajeGrasa) {
	        console.warn('generateBodyCompositionAnalysis: Datos insuficientes', { peso, altura, porcentajeGrasa });
	        return {
	            imlg: NaN,
	            img: NaN,
	            tipologia: 'Indefinido',
	            imlgCategory: '',
	            imgCategory: '',
	            typologyNumber: 0,
	            typologyDesc: 'Datos insuficientes para determinar la tipología.',
	            explanation: '<p>Datos insuficientes para calcular IMLG, IMG y tipología.</p>'
	        };
	    }
	
	    // Calcular masa grasa y masa magra
	    const masaGrasa = peso * (porcentajeGrasa / 100);
	    const masaMagra = peso - masaGrasa;
	    const alturaMetros = altura / 100;
	
	    // Calcular IMLG (FFMI) e IMG (FMI)
	    const imlg = masaMagra / (alturaMetros * alturaMetros);
	    const img = masaGrasa / (alturaMetros * alturaMetros);
		
		
	
	    // Determinar categorías de IMLG e IMG según sexo
	    let imlgCategory = '', imgCategory = '', tipologia = '';
	    let imlgRangeDesc = '', imgRangeDesc = '';
	    let typologyNumber = 0, typologyDesc = '';
	
	    if (sexo.toLowerCase() === 'masculino') {
	        // IMLG para hombres
	        if (imlg < 18) {
	            imlgCategory = 'Nivel Bajo';
	            imlgRangeDesc = 'Posiblemente indica baja masa muscular o desnutrición.';
	        } else if (imlg >= 18 && imlg <= 20) {
	            imlgCategory = 'Normal/Promedio';
	            imlgRangeDesc = 'Nivel típico de masa magra para la población general.';
	        } else if (imlg > 20 && imlg <= 25) {
	            imlgCategory = 'Nivel Bueno/Alto';
	            imlgRangeDesc = 'Asociado con mayor masa muscular, típico de hombres atléticos.';
	        } else {
	            imlgCategory = 'Extremo';
	            imlgRangeDesc = 'Excede el límite superior típico (25).';
	        }
	
	        // IMG para hombres
	        if (img < 4) {
	            imgCategory = 'Nivel Bajo';
	            imgRangeDesc = 'Posiblemente indica muy poca grasa corporal.';
	        } else if (img >= 4 && img <= 6) {
	            imgCategory = 'Normal/Saludable';
	            imgRangeDesc = 'Nivel saludable de grasa corporal.';
	        } else if (img > 6 && img <= 9) {
	            imgCategory = 'Sobrepeso (grasa)';
	            imgRangeDesc = 'Exceso de grasa corporal, considerado sobrepeso.';
	        } else {
	            imgCategory = 'Obesidad (grasa)';
	            imgRangeDesc = 'Alta grasa corporal, considerado obesidad.';
	        }
	    } else if (sexo.toLowerCase() === 'femenino') {
	        // IMLG para mujeres
	        if (imlg < 15) {
	            imlgCategory = 'Nivel Bajo';
	            imlgRangeDesc = 'Posiblemente indica baja masa muscular o desnutrición.';
	        } else if (imlg >= 15 && imlg <= 17) {
	            imlgCategory = 'Normal/Promedio';
	            imlgRangeDesc = 'Nivel típico de masa magra para la población general.';
	        } else if (imlg > 17 && imlg <= 22) {
	            imlgCategory = 'Nivel Bueno/Alto';
	            imlgRangeDesc = 'Asociado con mayor masa muscular, típico de mujeres atléticas.';
	        } else {
	            imlgCategory = 'Nivel Extremo > 22';
	            imlgRangeDesc = 'Excede el límite superior típico (22).';
	        }
	
	        // IMG para mujeres
	        if (img < 6) {
	            imgCategory = 'Nivel Bajo';
	            imgRangeDesc = 'Posiblemente indica muy poca grasa corporal.';
	        } else if (img >= 6 && img <= 9) {
	            imgCategory = 'Normal/Saludable';
	            imgRangeDesc = 'Nivel saludable de grasa corporal.';
	        } else if (img > 9 && img <= 12) {
	            imgCategory = 'Sobrepeso (grasa)';
	            imgRangeDesc = 'Exceso de grasa corporal, considerado sobrepeso.';
	        } else {
	            imgCategory = 'Obesidad (grasa)';
	            imgRangeDesc = 'Alta grasa corporal, considerado obesidad.';
	        }
	    } else {
	        // Rangos genéricos
	        if (imlg < 16.5) {
	            imlgCategory = 'Nivel Bajo';
	            imlgRangeDesc = 'Posiblemente indica baja masa muscular o desnutrición.';
	        } else if (imlg >= 16.5 && imlg <= 19) {
	            imlgCategory = 'Normal/Promedio';
	            imlgRangeDesc = 'Nivel típico de masa magra.';
	        } else if (imlg > 19 && imlg <= 23) {
	            imlgCategory = 'Nivel Bueno/Alto';
	            imlgRangeDesc = 'Asociado con mayor masa muscular.';
	        } else {
	            imlgCategory = 'Nivel Extremo';
	            imlgRangeDesc = 'Excede los límites superiores típicos.';
	        }
	
	        if (img < 5) {
	            imgCategory = 'Nivel Bajo';
	            imgRangeDesc = 'Posiblemente indica muy poca grasa corporal.';
	        } else if (img >= 5 && img <= 7.5) {
	            imgCategory = 'Normal/Saludable';
	            imgRangeDesc = 'Nivel saludable de grasa corporal.';
	        } else if (img > 7.5 && img <= 10.5) {
	            imgCategory = 'Sobrepeso (grasa)';
	            imgRangeDesc = 'Exceso de grasa corporal.';
	        } else {
	            imgCategory = 'Obesidad (grasa)';
	            imgRangeDesc = 'Alta grasa corporal.';
	        }
	    }
	
	    // Determinar niveles para la tipología
	    let imlgLevel, imgLevel;
	    if (sexo.toLowerCase() === 'masculino') {
	        imlgLevel = imlg < 18 ? 'bajo' : imlg <= 20 ? 'medio' : 'alto';
	        imgLevel = img < 4 ? 'bajo' : img <= 6 ? 'medio' : 'alto';
	    } else if (sexo.toLowerCase() === 'femenino') {
	        imlgLevel = imlg < 15 ? 'bajo' : imlg <= 17 ? 'medio' : 'alto';
	        imgLevel = img < 6 ? 'bajo' : img <= 9 ? 'medio' : 'alto';
	    } else {
	        imlgLevel = imlg < 16.5 ? 'bajo' : imlg <= 19 ? 'medio' : 'alto';
	        imgLevel = img < 5 ? 'bajo' : img <= 7.5 ? 'medio' : 'alto';
	    }
	
	    // Mapa de tipologías con número y descripción
	    const tipologiaMap = {
	        'bajo-bajo': {
	            name: 'Ectomorfo',
	            number: 1,
	            desc: 'Cuerpo delgado con baja masa muscular y poca grasa. Puede tener dificultad para ganar peso.'
	        },
	        'bajo-medio': {
	            name: 'Ectomorfo con grasa moderada',
	            number: 2,
	            desc: 'Cuerpo delgado con algo de grasa corporal, pero aún baja masa muscular.'
	        },
	        'bajo-alto': {
	            name: 'Endomorfo delgado',
	            number: 3,
	            desc: 'Cuerpo con alta grasa corporal pero baja masa muscular, a menudo con apariencia más redondeada.'
	        },
	        'medio-bajo': {
	            name: 'Mesomorfo delgado',
	            number: 4,
	            desc: 'Cuerpo equilibrado con masa muscular promedio y poca grasa, ideal para actividades atléticas.'
	        },
	        'medio-medio': {
	            name: 'Balanceado',
	            number: 5,
	            desc: 'Cuerpo con proporciones promedio de masa muscular y grasa, típico de la población general.'
	        },
	        'medio-alto': {
	            name: 'Endomorfo musculado',
	            number: 6,
	            desc: 'Cuerpo con masa muscular promedio pero alta grasa, común en personas con fuerza pero algo de sobrepeso.'
	        },
	        'alto-bajo': {
	            name: 'Mesomorfo puro',
	            number: 7,
	            desc: 'Cuerpo muy muscular con poca grasa, típico de atletas de alto rendimiento.'
	        },
	        'alto-medio': {
	            name: 'Mesomorfo con grasa',
	            number: 8,
	            desc: 'Cuerpo musculoso con algo de grasa corporal, común en deportes de fuerza.'
	        },
	        'alto-alto': {
	            name: 'Endomorfo robusto',
	            number: 9,
	            desc: 'Cuerpo con alta masa muscular y alta grasa, típico de personas robustas o con sobrepeso muscular.'
	        }
	    };
	
	    const tipologiaData = tipologiaMap[`${imlgLevel}-${imgLevel}`] || {
	        name: 'Indefinido',
	        number: 0,
	        desc: 'No se pudo determinar la tipología debido a datos insuficientes.'
	    };
	
	    tipologia = tipologiaData.name;
	    typologyNumber = tipologiaData.number;
	    typologyDesc = tipologiaData.desc;
	
	
	
	    // Generar análisis básico (se amplía en generateExplanationsAndSuggestions)
	    const explanation = `
	        <p><strong>Análisis de Composición Corporal:</strong></p>
	        <p><strong>IMLG (Índice de Masa Libre de Grasa):</strong> ${formatResult(imlg, 1)} kg/m² (${imlgCategory})</p>
	        <p>${imlgRangeDesc}</p>
	        <p><strong>IMG (Índice de Masa Grasa):</strong> ${formatResult(img, 1)} kg/m² (${imgCategory})</p>
	        <p>${imgRangeDesc}</p>
	        <p><strong>Tipología del Cuerpo:</strong> ${tipologia}</p>
	    `;
	
	    return {
	        imlg,
	        img,
	        tipologia,
	        imlgCategory,
	        imgCategory,
	        imlgRangeDesc,
	        imgRangeDesc,
	        typologyNumber,
	        typologyDesc,
	        explanation,
	        masaGrasa,
	        masaMagra
	    };
	};
			
			
			// Nueva función para generar la explicación detallada del somatotipo
			const generateSomatotypeExplanation = (results, cliente) => {
			const { endomorfia, mesomorfia, ectomorfia } = results;
			const { sexo = 'no especificado', edad = 'no especificada', esDeportista = false } = cliente || {};

			// Definir las descripciones de la tabla para cada componente
			const somatotypeDescriptions = {
				endomorfia: [
					{ value: 1, desc: "Baja adiposidad relativa; poca grasa subcutánea; contornos musculares y óseos visibles." },
					{ value: 1.5, desc: "Baja adiposidad relativa; poca grasa subcutánea; contornos musculares y óseos visibles." },
					{ value: 2, desc: "Baja adiposidad relativa; poca grasa subcutánea; contornos musculares y óseos visibles." },
					{ value: 2.5, desc: "Moderada adiposidad relativa; algo de grasa subcutánea sobre los contornos musculares; apariencia más blanda." },
					{ value: 3, desc: "Moderada adiposidad relativa; algo de grasa subcutánea sobre los contornos musculares; apariencia más blanda." },
					{ value: 3.5, desc: "Moderada adiposidad relativa; algo de grasa subcutánea sobre los contornos musculares; apariencia más blanda." },
					{ value: 4, desc: "Alta adiposidad relativa; grasa subcutánea abundante; redondeo de formas; tendencia al almacenamiento de grasa en el abdomen." },
					{ value: 4.5, desc: "Alta adiposidad relativa; grasa subcutánea abundante; redondeo de formas; tendencia al almacenamiento de grasa en el abdomen." },
					{ value: 5, desc: "Alta adiposidad relativa; grasa subcutánea abundante; redondeo de formas; tendencia al almacenamiento de grasa en el abdomen." },
					{ value: 5.5, desc: "Alta adiposidad relativa; grasa subcutánea abundante; redondeo de formas; tendencia al almacenamiento de grasa en el abdomen." },
					{ value: 6, desc: "Relativamente alta adiposidad; extrema subcutánea y abundante; grandes cantidades de grasa." },
					{ value: 6.5, desc: "Relativamente alta adiposidad; extrema subcutánea y abundante; grandes cantidades de grasa." },
					{ value: 7, desc: "Relativamente alta adiposidad; extrema subcutánea y abundante; grandes cantidades de grasa." },
					{ value: 7.5, desc: "Relativamente alta adiposidad; extrema subcutánea y abundante; grandes cantidades de grasa." },
					{ value: 8, desc: "Relativamente alta adiposidad; extrema subcutánea y abundante; grandes cantidades de grasa." },
					{ value: 8.5, desc: "Relativamente alta adiposidad; extrema subcutánea y abundante; grandes cantidades de grasa." }
				],
				mesomorfia: [
					{ value: 1, desc: "Bajo desarrollo músculo-esquelético relativo; delgadez de extremidades; pequeños diámetros articulares." },
					{ value: 1.5, desc: "Bajo desarrollo músculo-esquelético relativo; delgadez de extremidades; pequeños diámetros articulares." },
					{ value: 2, desc: "Bajo desarrollo músculo-esquelético relativo; delgadez de extremidades; pequeños diámetros articulares." },
					{ value: 2.5, desc: "Moderado desarrollo músculo-esquelético relativo; músculos ligeramente marcados; diámetros articulares medios." },
					{ value: 3, desc: "Moderado desarrollo músculo-esquelético relativo; músculos ligeramente marcados; diámetros articulares medios." },
					{ value: 3.5, desc: "Moderado desarrollo músculo-esquelético relativo; músculos ligeramente marcados; diámetros articulares medios." },
					{ value: 4, desc: "Alto desarrollo músculo-esquelético relativo; formas musculares bien definidas; grandes diámetros articulares." },
					{ value: 4.5, desc: "Alto desarrollo músculo-esquelético relativo; formas musculares bien definidas; grandes diámetros articulares." },
					{ value: 5, desc: "Alto desarrollo músculo-esquelético relativo; formas musculares bien definidas; grandes diámetros articulares." },
					{ value: 5.5, desc: "Alto desarrollo músculo-esquelético relativo; formas musculares bien definidas; grandes diámetros articulares." },
					{ value: 6, desc: "Desarrollo músculo-esquelético extremadamente elevado; volumen muscular sobresaliente; articulaciones muy grandes." },
					{ value: 6.5, desc: "Desarrollo músculo-esquelético extremadamente elevado; volumen muscular sobresaliente; articulaciones muy grandes." },
					{ value: 7, desc: "Desarrollo músculo-esquelético extremadamente elevado; volumen muscular sobresaliente; articulaciones muy grandes." },
					{ value: 7.5, desc: "Desarrollo músculo-esquelético extremadamente elevado; volumen muscular sobresaliente; articulaciones muy grandes." },
					{ value: 8, desc: "Desarrollo músculo-esquelético extremadamente elevado; volumen muscular sobresaliente; articulaciones muy grandes." },
					{ value: 8.5, desc: "Desarrollo músculo-esquelético extremadamente elevado; volumen muscular sobresaliente; articulaciones muy grandes." }
				],
				ectomorfia: [
					{ value: 1, desc: "Linealidad relativa baja; gran volumen por unidad de altura; extremidades voluminosas." },
					{ value: 1.5, desc: "Linealidad relativa baja; gran volumen por unidad de altura; extremidades voluminosas." },
					{ value: 2, desc: "Linealidad relativa baja; gran volumen por unidad de altura; extremidades voluminosas." },
					{ value: 2.5, desc: "Linealidad relativa moderada; volumen corporal medio por unidad de altura." },
					{ value: 3, desc: "Linealidad relativa moderada; volumen corporal medio por unidad de altura." },
					{ value: 3.5, desc: "Linealidad relativa moderada; volumen corporal medio por unidad de altura." },
					{ value: 4, desc: "Linealidad relativa elevada; bajo volumen corporal por unidad de altura." },
					{ value: 4.5, desc: "Linealidad relativa elevada; bajo volumen corporal por unidad de altura." },
					{ value: 5, desc: "Linealidad relativa elevada; bajo volumen corporal por unidad de altura." },
					{ value: 5.5, desc: "Linealidad relativa elevada; bajo volumen corporal por unidad de altura." },
					{ value: 6, desc: "Linealidad extremadamente elevada; volumen mínimo por unidad de altura." },
					{ value: 6.5, desc: "Linealidad extremadamente elevada; volumen mínimo por unidad de altura." },
					{ value: 7, desc: "Linealidad extremadamente elevada; volumen mínimo por unidad de altura." },
					{ value: 7.5, desc: "Linealidad extremadamente elevada; volumen mínimo por unidad de altura." },
					{ value: 8, desc: "Linealidad extremadamente elevada; volumen mínimo por unidad de altura." },
					{ value: 8.5, desc: "Linealidad extremadamente elevada; volumen mínimo por unidad de altura." }
				]
			};

			// Función para encontrar la descripción más cercana a un valor dado
				const findClosestDescription = (value, componentArray) => {
					// Limitar el valor entre 1 y 8.5
					const clampedValue = Math.max(1, Math.min(value, 8.5));
					// Encontrar el valor más cercano en el array
					let closest = componentArray[0];
					let minDiff = Math.abs(clampedValue - closest.value);
					for (const entry of componentArray) {
						const diff = Math.abs(clampedValue - entry.value);
						if (diff < minDiff) {
							minDiff = diff;
							closest = entry;
						}
					}
					return closest.desc;
				};

				// Obtener las descripciones específicas para los valores del usuario
				const endoDesc = findClosestDescription(endomorfia, somatotypeDescriptions.endomorfia);
				const mesoDesc = findClosestDescription(mesomorfia, somatotypeDescriptions.mesomorfia);
				const ectoDesc = findClosestDescription(ectomorfia, somatotypeDescriptions.ectomorfia);

				// Generar la explicación con las descripciones específicas
				let explanation = `
					<h3>Medición del Somatotipo</h3>
					<p>Tu somatotipo, calculado mediante el método Heath-Carter, es <strong>${formatResult(endomorfia, 1)}-${formatResult(mesomorfia, 1)}-${formatResult(ectomorfia, 1)}</strong>. Esto indica:</p>
					<ul>
						<li><strong>Endomorfia (${formatResult(endomorfia, 1)})</strong>: Representa la tendencia a almacenar grasa corporal. Una puntuación alta (cercana a 7 o más) indica una constitución más redondeada con mayor grasa corporal. <br><em>${endoDesc}</em></li>
						<li><strong>Mesomorfia (${formatResult(mesomorfia, 1)})</strong>: Representa la muscularidad y fuerza. Una puntuación alta indica una constitución atlética, con facilidad para ganar músculo. <br><em>${mesoDesc}</em></li>
						<li><strong>Ectomorfia (${formatResult(ectomorfia, 1)})</strong>: Representa la delgadez y estructura ósea ligera. Una puntuación alta indica un cuerpo delgado, con poca grasa y músculo. <br><em>${ectoDesc}</em></li>
					</ul>
				`;

				// Determinar si el somatotipo es equilibrado o dominante
				const maxScore = Math.max(endomorfia, mesomorfia, ectomorfia);
				const minScore = Math.min(endomorfia, mesomorfia, ectomorfia);
				const isBalanced = (maxScore - minScore) <= 2; // Consideramos equilibrado si la diferencia entre el máximo y el mínimo es <= 2
				let dominantType = '';
				if (!isBalanced) {
					if (maxScore === endomorfia) dominantType = 'Endomorfo';
					else if (maxScore === mesomorfia) dominantType = 'Mesomorfo';
					else dominantType = 'Ectomorfo';
				}

				// Clasificación del somatotipo
				const dominantColor = dominantType === 'Endomorfo' ? '#f8d7da' :
					  dominantType === 'Mesomorfo' ? '#d1ecf1' : '#d4edda';

				const dominantEmoji = dominantType === 'Endomorfo' ? '🍩' :
					  dominantType === 'Mesomorfo' ? '💪' : '🏃‍♂️';
					  
				if (isBalanced) {
					explanation += `
						<p>Tu somatotipo es <strong>equilibrado</strong>, lo que significa que no tienes un componente claramente dominante. Esto indica una constitución relativamente balanceada entre grasa, muscularidad y delgadez.</p>
					`;
				} else {
					explanation += `
						<p>Tu somatotipo es <strong>${dominantType} dominante</strong>, ya que tu puntuación más alta es en ${dominantType.toLowerCase()} (${maxScore}). Esto sugiere que tu constitución tiende hacia las siguientes características:</p>
					`;
					if (dominantType === 'Endomorfo') {
						explanation += `
							<p><strong>Características de un Endomorfo</strong>: Cuerpo más redondeado, facilidad para ganar grasa, estructura ósea generalmente más ancha. Los deportistas no suelen pertenecer a esta categoría, pero con dieta y ejercicio puedes moverte hacia un perfil más mesomórfico.</p>
						`;
					} else if (dominantType === 'Mesomorfo') {
						explanation += `
							<p><strong>Características de un Mesomorfo</strong>: Complexión atlética, hombros anchos, facilidad para ganar músculo y fuerza. Los mesomorfos suelen destacar en deportes que requieren potencia y agilidad, como levantamiento de pesas o lanzamiento de peso.</p>
						`;
					} else {
						explanation += `
							<p><strong>Características de un Ectomorfo</strong>: Cuerpo delgado, extremidades largas, poca grasa y músculo, dificultad para ganar peso. Los ectomorfos suelen destacar en deportes de resistencia, como corredores de largas distancias o jugadores de baloncesto.</p>
						`;
					}
				}

				// Clasificación avanzada del tipo combinado
				const e = endomorfia;
				const m = mesomorfia;
				const ec = ectomorfia;

				const sorted = [
					{ type: 'Endomorfo', value: e },
					{ type: 'Mesomorfo', value: m },
					{ type: 'Ectomorfo', value: ec }
				].sort((a, b) => b.value - a.value);

				const [first, second] = sorted;
				let advancedType = '';

				if (first.type === 'Mesomorfo') {
					if (second.type === 'Endomorfo' && m > 5 && e > 3) {
						advancedType = 'Meso endomórfico';
					} else if (second.type === 'Ectomorfo' && m > 5 && ec > 3) {
						advancedType = 'Meso ectomórfico';
					} else {
						advancedType = 'Mesomorfo balanceado';
					}
				} else if (first.type === 'Endomorfo') {
					if (second.type === 'Mesomorfo' && e >= m && e > 5) {
						advancedType = 'Endo mesomórfico';
					} else if (second.type === 'Mesomorfo') {
						advancedType = 'Endomorfo mesomorfo';
					} else if (second.type === 'Ectomorfo') {
						advancedType = 'Endo ectomórfico';
					} else {
						advancedType = 'Endomorfo balanceado';
					}
				} else if (first.type === 'Ectomorfo') {
					if (second.type === 'Mesomorfo' && ec >= m && ec > 5) {
						advancedType = 'Ecto mesomórfico';
					} else if (second.type === 'Mesomorfo') {
						advancedType = 'Ectomorfo mesomorfo';
					} else if (second.type === 'Endomorfo') {
						advancedType = 'Ecto endomórfico';
					} else {
						advancedType = 'Ectomorfo balanceado';
					}

					// Zona intermedia especial
					if (Math.abs(e - ec) < 1.5 && m < 2 && e > 3 && ec > 3) {
						advancedType = 'Ectomorfo endomorfo (zona intermedia inferior)';
					}
				}

				explanation += `
					<div style="background-color:#e8f5e9; border-left:4px solid #388e3c; padding:12px 16px; margin:16px 0; border-radius:5px;">
						<p style="margin:0;"><strong>📊 Clasificación avanzada:</strong> Tu somatotipo se identifica como <strong style="color:#2e7d32;">${advancedType}</strong>, reflejando un perfil combinado entre <strong>${first.type}</strong> y <strong>${second.type}</strong>.</p>
					</div>
				`;

				// Personalización según sexo, edad y si es deportista
				explanation += `<h4>Consideraciones Personalizadas</h4>`;
				if (sexo !== 'no especificado') {
					if (sexo.toLowerCase() === 'masculino') {
						explanation += `<p><strong>Sexo (Masculino)</strong>: Los hombres tienden a tener puntuaciones más altas de mesomorfia debido a niveles más altos de testosterona, lo que facilita el desarrollo muscular. Tu mesomorfia de ${formatResult(mesomorfia, 1)} refleja ${mesomorfia >= 5 ? 'una buena predisposición para ganar músculo' : 'una muscularidad moderada o baja'}.</p>`;
					} else if (sexo.toLowerCase() === 'femenino') {
						explanation += `<p><strong>Sexo (Femenino)</strong>: Las mujeres tienden a tener puntuaciones más altas de endomorfia debido a una mayor proporción de grasa corporal esencial. Tu endomorfia de ${formatResult(endomorfia, 1)} indica ${endomorfia >= 5 ? 'una tendencia a almacenar más grasa' : 'un nivel de grasa corporal relativamente bajo para una mujer'}.</p>`;
					}
				}

				if (edad !== 'no especificada') {
					explanation += `<p><strong>Edad (${edad} años)</strong>: La edad puede influir en tu somatotipo. A medida que envejecemos, el metabolismo puede ralentizarse, aumentando la endomorfia. Además, la pérdida de masa muscular con la edad puede reducir la mesomorfia. Tu edad (${edad}) sugiere que ${edad >= 40 ? 'puedes estar experimentando cambios en tu composición corporal que favorecen la endomorfia' : 'tu somatotipo puede ser más estable y reflejar tu genética y estilo de vida actual'}.</p>`;
				}

				explanation += `<p><strong>¿Deportista? (${esDeportista ? 'Sí' : 'No'})</strong>: `;
				if (esDeportista) {
					if (dominantType === 'Mesomorfo') {
						explanation += `Como deportista con un somatotipo mesomorfo dominante, tienes una ventaja natural para deportes que requieren fuerza y potencia, como levantamiento de pesas o deportes de equipo. Tu mesomorfia de ${formatResult(mesomorfia, 1)} es ideal para estas actividades.</p>`;
					} else if (dominantType === 'Ectomorfo') {
						explanation += `Como deportista con un somatotipo ectomorfo dominante, probablemente destacas en deportes de resistencia como running o ciclismo, donde tu ectomorfia de ${formatResult(ectomorfia, 1)} te da una ventaja en eficiencia y agilidad.</p>`;
					} else {
						explanation += `Aunque tienes un somatotipo endomorfo dominante, participas en actividades deportivas, lo cual es excelente. Con un enfoque en dieta y entrenamiento, puedes reducir tu endomorfia (${formatResult(endomorfia, 1)}) y moverte hacia un perfil más mesomórfico, mejorando tu rendimiento.</p>`;
					}
				} else {
					explanation += `No eres deportista, pero tu somatotipo (${dominantType.toLowerCase()} dominante) puede guiarte si decides iniciar una actividad física. `;
					if (dominantType === 'Endomorfo') {
						explanation += `Con tu endomorfia de ${formatResult(endomorfia, 1)}, podrías beneficiarte de ejercicios cardiovasculares y control de dieta para reducir grasa corporal.</p>`;
					} else if (dominantType === 'Mesomorfo') {
						explanation += `Tu mesomorfia de ${formatResult(mesomorfia, 1)} indica que podrías tener éxito en actividades que desarrollen fuerza y músculo, como entrenamiento con pesas.</p>`;
					} else {
						explanation += `Tu ectomorfia de ${formatResult(ectomorfia, 1)} sugiere que podrías destacar en actividades de resistencia como running, y podrías enfocarte en ganar masa muscular si ese es tu objetivo.</p>`;
					}
				}

				// Información adicional sobre el somatotipo
				explanation += `
					<h4>Notas Adicionales</h4>
					<p>El somatotipo no es fijo y puede cambiar con la edad, la nutrición y el entrenamiento, aunque la estructura ósea subyacente (más relacionada con la ectomorfia y mesomorfia) tiende a ser más estable. La determinación precisa del somatotipo requiere mediciones antropométricas específicas (pliegues cutáneos, perímetros de miembros, diámetros óseos, peso, altura) realizadas por un profesional y el uso de fórmulas específicas (método Heath-Carter).</p>
					<p>Estos "tipos" son tendencias generales y no categorías rígidas. La mayoría de las personas son una mezcla de los tres componentes, y tu somatotipo refleja cómo se combinan estos en tu cuerpo.</p>
				`;

				// Nueva sección: Categorías de Predominancia Física
				explanation += `<h4>Categorías de Predominancia Física y Recomendaciones</h4>`;

				// Definir las categorías de predominancia física
				const categories = [
					{
						category: 'Fuerza Máxima / Potencia',
						sports: 'Halterofilia, Powerlifting, Lanzamiento de Peso',
						somatotype: { endo: 2.5, meso: 7.0, ecto: 1.0 },
						somatotypeDesc: 'Bajo/Moderado en adiposidad (Endo), extremadamente alto en músculo (Meso), bajo en linealidad (Ecto). Maximiza palanca y masa muscular.',
						diet: 'Dieta hipercalórica controlada, muy alta en proteínas (2.0-2.5 g/kg+), carbohidratos adecuados (5-7 g/kg), timing de nutrientes. Puede permitirse más grasa (% endo) si beneficia la fuerza absoluta.'
					},
					{
						category: 'Fuerza Potencia',
						sports: 'Velocista (100/200m), Saltador (Longitud, Triple, Altura), Lanzador (Jabalina, Disco)',
						somatotype: { endo: 2.0, meso: 5.5, ecto: 2.5 },
						somatotypeDesc: 'Bajo en adiposidad (Endo), muy alto en músculo relativo (Meso), bajo/moderado en linealidad (Ecto). Físico explosivo y definido.',
						diet: 'Aporte proteico alto (1.8-2.2 g/kg), carbohidratos suficientes (5-7 g/kg), bajo % graso mantenido. Foco en recuperación muscular. Hidratación esencial.'
					},
					{
						category: 'Fuerza Resistencia',
						sports: 'Remo, Lucha Olímpica, Judo, Natación (200m estilos/libre)',
						somatotype: { endo: 3.0, meso: 5.5, ecto: 2.0 },
						somatotypeDesc: 'Bajo/Moderado en adiposidad (Endo, variable), alto/muy alto en músculo (Meso), bajo/moderado en linealidad (Ecto). Fuerza sostenida.',
						diet: 'Carbohidratos y proteínas balanceados-altos (CHO: 6-8 g/kg, PRO: 1.7-2.2 g/kg). Buena hidratación, posible manejo de peso en lucha/judo.'
					},
					{
						category: 'Fuerza Resistencia / Resistencia',
						sports: 'Natación (400m, 1500m), Ciclismo en Pista (Persecución), Piragüismo/Kayak (500m, 1000m)',
						somatotype: { endo: 2.5, meso: 4.5, ecto: 3.5 },
						somatotypeDesc: 'Bajo en adiposidad (Endo), buen músculo (Meso), moderado/alto en linealidad (Ecto). Eficiencia y potencia sostenida.',
						diet: 'Carbohidratos altos (7-10 g/kg), proteínas moderadas (1.5-1.8 g/kg), énfasis en recuperación, hidratación y electrolitos. Gestión del % graso.'
					},
					{
						category: 'Larga Resistencia',
						sports: 'Corredor (Maratón, Ultramaratón), Triatlón (Olímpico, Ironman), Ciclismo de Ruta (Grandes Vueltas)',
						somatotype: { endo: 1.5, meso: 3.5, ecto: 4.5 },
						somatotypeDesc: 'Muy bajo en adiposidad (Endo), bajo en músculo (Meso), muy alto en linealidad (Ecto). Maximiza eficiencia energética y disipación de calor.',
						diet: 'Dieta muy alta en carbohidratos (8-12+ g/kg), proteína suficiente (1.2-1.7 g/kg), énfasis extremo en hidratación, electrolitos y nutrición intra-ejercicio. Control estricto de peso y composición.'
					},
					{
						category: 'Mixto / Equipo',
						sports: 'Fútbol, Baloncesto, Rugby, Balonmano, Voleibol, Hockey (Hierba/Hielo)',
						somatotype: { endo: 3.0, meso: 4.5, ecto: 3.0 },
						somatotypeDesc: 'Variable, pero generalmente: bajo/moderado Endo, buen Meso, moderado Ecto. Perfiles versátiles.',
						diet: 'Carbohidratos periodizados (5-9 g/kg), proteína moderada-alta (1.6-2.0 g/kg), control % graso, hidratación, recuperación. Varía mucho por posición.'
					},
					{
						category: 'Mixto (Potencia, Agilidad, Resistencia)',
						sports: 'Tenis, Bádminton, Boxeo, Esgrima, Gimnasia Artística',
						somatotype: { endo: 2.0, meso: 4.5, ecto: 3.5 },
						somatotypeDesc: 'Bajo Endo, buen Meso (muy alto en Gimnasia), mod/alto Ecto (variable). Combinación de cualidades.',
						diet: 'Carbohidratos para energía y resistencia (6-8 g/kg), proteína para recuperación/potencia (1.6-2.0 g/kg), hidratación y nutrición intra-esfuerzo. Muy bajo % graso en Gimnasia. Control de peso en Boxeo.'
					}
				];

				// Calcular la categoría más cercana al somatotipo del usuario usando distancia euclidiana
				let closestCategory = null;
				let minDistance = Infinity;
				categories.forEach(cat => {
					const distance = Math.sqrt(
						Math.pow(endomorfia - cat.somatotype.endo, 2) +
						Math.pow(mesomorfia - cat.somatotype.meso, 2) +
						Math.pow(ectomorfia - cat.somatotype.ecto, 2)
					);
					if (distance < minDistance) {
						minDistance = distance;
						closestCategory = cat;
					}
				});

				// Introducción a la categoría más cercana
				explanation += `
					<p>Basado en tu somatotipo (${formatResult(endomorfia, 1)}-${formatResult(mesomorfia, 1)}-${formatResult(ectomorfia, 1)}), tu perfil se asemeja más a la categoría de <strong>${closestCategory.category}</strong>. Esto sugiere que podrías destacar en deportes como ${closestCategory.sports}, y tu dieta y entrenamiento podrían ajustarse según las recomendaciones para este perfil. A continuación, se presenta una tabla con las categorías de predominancia física, sus somatotipos típicos y consideraciones dietéticas:</p>
				`;

				// Generar la tabla
				explanation += `
					<table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 0.9em;">
						<thead>
							<tr style="background-color: #e9f5e9; color: #2e7d32;">
								<th style="border: 1px solid #c8e6c9; padding: 10px; text-align: left;">Categoría</th>
								<th style="border: 1px solid #c8e6c9; padding: 10px; text-align: left;">Deportes Ejemplo</th>
								<th style="border: 1px solid #c8e6c9; padding: 10px; text-align: left;">Somatotipo Típico (Endo-Meso-Ecto)</th>
								<th style="border: 1px solid #c8e6c9; padding: 10px; text-align: left;">Explicación del Somatotipo</th>
								<th style="border: 1px solid #c8e6c9; padding: 10px; text-align: left;">Consideraciones Dietéticas</th>
							</tr>
						</thead>
						<tbody>
				`;
				categories.forEach(cat => {
					const isClosest = cat.category === closestCategory.category;
					explanation += `
						<tr style="${isClosest ? 'background-color: #f1f8f1; font-weight: bold;' : ''}">
							<td style="border: 1px solid #c8e6c9; padding: 10px;">${cat.category}</td>
							<td style="border: 1px solid #c8e6c9; padding: 10px;">${cat.sports}</td>
							<td style="border: 1px solid #c8e6c9; padding: 10px;">${cat.somatotype.endo}-${cat.somatotype.meso}-${cat.somatotype.ecto}</td>
							<td style="border: 1px solid #c8e6c9; padding: 10px;">${cat.somatotypeDesc}</td>
							<td style="border: 1px solid #c8e6c9; padding: 10px;">${cat.diet}</td>
						</tr>
					`;
				});
				explanation += `
						</tbody>
					</table>
				`;

				return explanation;
			};
			
			
        // Function to generate explanations and suggestions
        const generateExplanationsAndSuggestions = (data, results, bodyCompResults) => {
            const isAthlete = data.es_deportista === 'si';
            const gender = data.genero;
            let content = '';
			const { peso = 0, porcentajeGrasa = results.grasaPctActual || 0, sexo = 'no especificado', esDeportista = data.es_deportista === 'si' } = data;
			const { imc = NaN } = results;
			const {
				imlg = NaN,
				img = NaN,
				tipologia = 'Indefinido',
				imlgCategory = '',
				imgCategory = '',
				imlgRangeDesc = '',
				imgRangeDesc = '',
				typologyNumber = 0,
				typologyDesc = '',
				masaGrasa = NaN,
				masaMagra = NaN
			} = bodyCompResults || {};
            
            content += '<h3>Explicación de los Resultados</h3>';

            // IMC
            content += '<p><strong>Índice de Masa Corporal (IMC):</strong> Mide la relación entre tu peso y altura. ';
            if (!isNaN(results.imc)) {
                content += 'Tu IMC es ' + formatResult(results.imc, 1) + ' kg/m². ';
                if (results.imc < 18.5) {
                    content += 'Estás en rango de bajo peso. Esto puede indicar necesidad de ganancia de peso, especialmente si no eres deportista. ';
                } else if (results.imc >= 18.5 && results.imc < 25) {
                    content += 'Estás en un rango saludable. Ideal para mantenimiento. ';
                } else if (results.imc >= 25 && results.imc < 30) {
                    content += 'Estás en sobrepeso. Podrías beneficiarte de una pérdida de grasa. ';
                } else {
                    content += 'Estás en rango de obesidad. Se recomienda pérdida de grasa para mejorar la salud. ';
                }
                if (isAthlete) {
                    content += 'Nota: Los deportistas pueden tener un IMC más alto debido a mayor masa muscular, así que evalúa junto con el % de grasa. ';
                }
                content += 'Rangos saludables (OMS): 18.5-24.9 kg/m². ';
                content += '<div class="chart-container "><canvas id="imc-chart" width="440" height="400" style="display: block; box-sizing: border-box; height: 400px; width: 440px;"></canvas></div>';
            } else {
                content += 'No calculado. ';
            }
            content += '</p>';

            // ICC
            content += '<p><strong>Índice Cintura-Cadera (ICC):</strong> Mide la distribución de grasa corporal (cintura/cadera) y evalúa el riesgo cardiovascular. Un ICC alto indica acumulación de grasa abdominal (tipo androide, forma de "manzana"), asociada a mayor riesgo de diabetes tipo 2, síndrome metabólico, enfermedades hepáticas, cánceres relacionados con obesidad, apnea del sueño y problemas cardiovasculares (hipertensión, infarto). Un ICC bajo sugiere grasa en caderas/muslos (tipo ginoide, forma de "pera"), de menor riesgo. En hombres, la tipología androide es más común debido a andrógenos. En mujeres, la tipología ginoide predomina por estrógenos, pero cambios hormonales (menopausia, embarazo) pueden desplazar la grasa hacia un patrón androide, aumentando riesgos. ';
			if (!isNaN(results.icc)) {
				content += 'Tu ICC es ' + formatResult(results.icc, 2) + '. ';
				if (gender === 'masculino') {
					if (results.icc < 0.78) {
						content += 'ICC < 0.78 (tipo ginoide): Bajo riesgo cardiovascular. ¡Buen indicador de salud! ';
					} else if (results.icc >= 0.78 && results.icc <= 0.94) {
						content += 'ICC 0.78-0.94: Normal. Riesgo cardiovascular bajo. ';
					} else if (results.icc > 0.94 && results.icc < 1.0) {
						content += 'ICC > 0.94 (tipo androide): Riesgo cardiovascular elevado debido a grasa visceral. Considera reducir grasa abdominal. Acumulación de grasa visceral (alrededor de órganos internos) y subcutánea abdominal. La grasa visceral libera ácidos grasos libres y citoquinas proinflamatorias (como IL-6 y TNF-α), aumentando el riesgo de hipertensión, aterosclerosis y eventos cardíacos (infarto, angina). Riesgo aumentado de contraer Diabetes tipo II, La grasa abdominal contribuye a la resistencia a la insulina al alterar la señalización de glucosa en hígado, músculo y tejido adiposo. Riesgo de Síndrome Metabólico, Mayor prevalencia de dislipidemia (triglicéridos altos, HDL bajo), hipertensión y glucosa elevada, componentes clave del síndrome metabólico. Riesgo de Enfermedades Hepáticas, Acumulación de grasa en el hígado (esteatosis hepática no alcohólica) debido al exceso de lípidos provenientes de la grasa visceral.Cancer: Mayor riesgo de cánceres relacionados con obesidad (colon, mama, endometrio), ya que la grasa visceral promueve inflamación crónica y desregulación hormonal.Apenea del Sueño: Apnea obstructiva del sueño, osteoartritis (por estrés en articulaciones) y disfunción eréctil en hombres. ';
					} else {
						content += 'ICC ≥ 1.0: Riesgo cardiovascular muy alto. Consulta a un profesional de inmediato, para un plan de acción de reducción de grasa abdominal. Factores Agravantes, Sedentarismo, dieta alta en grasas saturadas/azúcares, estrés crónico (elevación de cortisol) y predisposición genética. ';
					}
				} else {
					if (results.icc < 0.71) {
						content += 'ICC < 0.71 (tipo ginoide): Bajo riesgo cardiovascular. ¡Buen indicador de salud! ';
					} else if (results.icc >= 0.71 && results.icc <= 0.84) {
						content += 'ICC 0.71-0.84: Normal. Riesgo cardiovascular bajo. ';
					} else if (results.icc > 0.84 && results.icc < 1.0) {
						content += 'ICC > 0.84 (tipo androide): Riesgo cardiovascular elevado debido a grasa visceral. Considera reducir grasa abdominal. Acumulación de grasa visceral (alrededor de órganos internos) y subcutánea abdominal. La grasa visceral libera ácidos grasos libres y citoquinas proinflamatorias (como IL-6 y TNF-α), aumentando el riesgo de hipertensión, aterosclerosis y eventos cardíacos (infarto, angina). Riesgo aumentado de contraer Diabetes tipo II, La grasa abdominal contribuye a la resistencia a la insulina al alterar la señalización de glucosa en hígado, músculo y tejido adiposo. Riesgo de Síndrome Metabólico, Mayor prevalencia de dislipidemia (triglicéridos altos, HDL bajo), hipertensión y glucosa elevada, componentes clave del síndrome metabólico. Riesgo de Enfermedades Hepáticas, Acumulación de grasa en el hígado (esteatosis hepática no alcohólica) debido al exceso de lípidos provenientes de la grasa visceral.Cancer: Mayor riesgo de cánceres relacionados con obesidad (colon, mama, endometrio), ya que la grasa visceral promueve inflamación crónica y desregulación hormonal.Apenea del Sueño: Apnea obstructiva del sueño, osteoartritis (por estrés en articulaciones) .';
					} else {
						content += 'ICC ≥ 1.0: Riesgo cardiovascular muy alto. Consulta a un profesional de inmediato, para un plan de acción de reducción de grasa abdominal. Factores Agravantes, Sedentarismo, dieta alta en grasas saturadas/azúcares, estrés crónico (elevación de cortisol) y predisposición genética. ';
					}
				}
				content += '<div class="chart-container"><canvas id="icc-chart" width="440" height="400" style="display: block; box-sizing: border-box; height: 400px; width: 440px;"></canvas></div>';
				content += '<p><strong>Sugerencias y Recomendaciones:</strong> ';
				if (gender === 'masculino') {
					if (results.icc < 0.78) {
						content += 'Tu ICC indica un patrón ginoide con bajo riesgo. Mantén una dieta equilibrada rica en frutas, verduras y proteínas magras. Realiza ejercicio regular (150 min/semana de actividad aeróbica moderada) y estiramientos para proteger articulaciones y mejorar circulación. ';
					} else if (results.icc >= 0.78 && results.icc <= 0.94) {
						content += 'Tu ICC está en el rango normal. Continúa con hábitos saludables: come alimentos integrales, limita azúcares refinados y realiza ejercicio combinado (aeróbico y fuerza, 3-5 veces/semana). Monitorea tu ICC periódicamente. ';
					} else if (results.icc > 0.94 && results.icc < 1.0) {
						content += 'Tu ICC indica un patrón androide con riesgo elevado. Reduce grasa abdominal con una dieta baja en grasas saturadas y azúcares (enfócate en vegetales, legumbres, pescado). Realiza 30 min/día de ejercicio aeróbico (caminar rápido, ciclismo) y entrenamiento de fuerza 2-3 veces/semana. Maneja el estrés con técnicas como meditación, ya que el cortisol promueve grasa visceral. Considera consultar a un nutricionista. ';
					} else {
						content += 'Tu ICC indica un riesgo muy alto. Consulta a un médico para evaluar glucosa, lípidos y presión arterial. Adopta una dieta supervisada (baja en calorías, alta en fibra) y un plan de ejercicio personalizado (aeróbico + fuerza, 5 días/semana). Evita sedentarismo y reduce estrés crónico. Un profesional puede ayudarte a crear un plan integral. ';
					}
				} else {
					if (results.icc < 0.71) {
						content += 'Tu ICC indica un patrón ginoide con bajo riesgo. Mantén una dieta equilibrada rica en frutas, verduras y proteínas magras. Realiza ejercicio regular (150 min/semana de actividad aeróbica moderada) y estiramientos para proteger articulaciones y mejorar circulación. ';
					} else if (results.icc >= 0.71 && results.icc <= 0.84) {
						content += 'Tu ICC está en el rango normal. Continúa con hábitos saludables: come alimentos integrales, limita azúcares refinados y realiza ejercicio combinado (aeróbico y fuerza, 3-5 veces/semana). Monitorea tu ICC periódicamente. ';
					} else if (results.icc > 0.84 && results.icc < 1.0) {
						content += 'Tu ICC indica un patrón androide con riesgo elevado. Reduce grasa abdominal con una dieta baja en grasas saturadas y azúcares (enfócate en vegetales, legumbres, pescado). Realiza 30 min/día de ejercicio aeróbico (caminar rápido, ciclismo) y entrenamiento de fuerza 2-3 veces/semana. Maneja el estrés con técnicas como meditación, ya que el cortisol promueve grasa visceral. Considera consultar a un nutricionista. ';
					} else {
						content += 'Tu ICC indica un riesgo muy alto. Consulta a un médico para evaluar glucosa, lípidos y presión arterial. Adopta una dieta supervisada (baja en calorías, alta en fibra) y un plan de ejercicio personalizado (aeróbico + fuerza, 5 días/semana). Evita sedentarismo y reduce estrés crónico. Un profesional puede ayudarte a crear un plan integral. ';
					}
				}
				content += '</p>';
			} else {
				content += 'No calculado. Asegúrate de medir correctamente cintura (entre última costilla y cresta ilíaca) y cadera (máxima anchura glúteos). ';
			}
			content += gender === 'masculino' ? 'Rangos (OMS, hombres): < 0.78 (ginoide), 0.78-0.94 (normal), > 0.94 (androide), ≥ 1.0 (muy alto riesgo). ' : 'Rangos (OMS, mujeres): < 0.71 (ginoide), 0.71-0.84 (normal), > 0.84 (androide), ≥ 1.0 (muy alto riesgo). ';
			content += 'El ICC es más preciso que el IMC para predecir riesgos cardiovasculares (OMS). </p>';
            content += '</p>';
			
            // % Grasa Corporal Actual
            content += '<p><strong>% Grasa Corporal Actual:</strong> Representa el porcentaje de tu peso que es grasa. ';
            if (!isNaN(results.grasaPctActual)) {
                content += 'Tu % de grasa es ' + formatResult(results.grasaPctActual, 1) + '%. ';
                if (gender === 'masculino') {
                    if (isAthlete) {
                        if (results.grasaPctActual < 6) content += 'Muy bajo (<6%). Puede afectar la salud hormonal. ';
                        else if (results.grasaPctActual <= 12) content += 'Óptimo para deportistas (6-12%). Ideal para rendimiento. ';
                        else if (results.grasaPctActual <= 18) content += 'Aceptable (12-18%). Podrías reducir grasa para mejorar rendimiento. ';
                        else content += 'Alto (>18%). Recomendable reducir grasa para salud y rendimiento. ';
                    } else {
                        if (results.grasaPctActual < 8) content += 'Muy bajo (<8%). Puede afectar la salud. ';
                        else if (results.grasaPctActual <= 20) content += 'Saludable (8-20%). Bueno para mantenimiento. ';
                        else if (results.grasaPctActual <= 25) content += 'Moderado (20-25%). Considera pérdida de grasa. ';
                        else content += 'Alto (>25%). Recomendable reducir grasa para salud. ';
                    }
                } else {
                    if (isAthlete) {
                        if (results.grasaPctActual < 14) content += 'Muy bajo (<14%). Puede afectar la salud hormonal. ';
                        else if (results.grasaPctActual <= 20) content += 'Óptimo para deportistas (14-20%). Ideal para rendimiento. ';
                        else if (results.grasaPctActual <= 25) content += 'Aceptable (20-25%). Podrías reducir grasa para mejorar rendimiento. ';
                        else content += 'Alto (>25%). Recomendable reducir grasa para salud y rendimiento. ';
                    } else {
                        if (results.grasaPctActual < 16) content += 'Muy bajo (<16%). Puede afectar la salud. ';
                        else if (results.grasaPctActual <= 30) content += 'Saludable (16-30%). Bueno para mantenimiento. ';
                        else if (results.grasaPctActual <= 35) content += 'Moderado (30-35%). Considera pérdida de grasa. ';
                        else content += 'Alto (>35%). Recomendable reducir grasa para salud. ';
                    }
                }
                content += '<div class="chart-container "><canvas id="bodyfat-chart" width="440" height="400" style="display: block; box-sizing: border-box; height: 400px; width: 440px;"></canvas></div>';
            } else {
                content += 'No calculado. ';
            }
            content += gender === 'masculino' ? (isAthlete ? 'Rango óptimo deportistas: 6-12%. Saludable no deportistas: 8-20%. ' : 'Rango saludable: 8-20%. ') : (isAthlete ? 'Rango óptimo deportistas: 14-20%. Saludable no deportistas: 16-30%. ' : 'Rango saludable: 16-30%. ');
            content += '</p>';

            // % Grasa Corporal Deseado
				content += '<p><strong>% Grasa Corporal Deseado:</strong> Porcentaje de grasa ideal según tu género y nivel de actividad. ';
				if (!isNaN(results.grasaPctDeseado)) {
					content += 'Tu % de grasa corporal deseado es ' + formatResult(results.grasaPctDeseado, 1) + '%. ';
					content += 'Tu % de grasa actual es ' + formatResult(results.grasaPctActual, 1) + '%. ';
					if (gender === 'masculino') {
						if (isAthlete) {
							if (results.grasaPctDeseado >= 6 && results.grasaPctDeseado <= 15) {
								content += 'Este valor está dentro del rango saludable para deportistas hombres (6-15%). ';
							} else if (results.grasaPctDeseado < 6) {
								content += 'Este valor está por debajo del rango saludable para deportistas hombres (6-15%). Esto puede ser peligroso para tu salud hormonal e inmunológica; consulta a un profesional. ';
							} else {
								content += 'Este valor está por encima del rango saludable para deportistas hombres (6-15%). Podrías beneficiarte de reducir tu grasa corporal para mejorar el rendimiento. ';
							}
						} else {
							if (results.grasaPctDeseado >= 10 && results.grasaPctDeseado <= 20) {
								content += 'Este valor está dentro del rango saludable para hombres no deportistas (10-20%). ';
							} else if (results.grasaPctDeseado < 10) {
								content += 'Este valor está por debajo del rango saludable para hombres no deportistas (10-20%). Esto puede afectar tu salud hormonal e inmunológica; consulta a un profesional. ';
							} else {
								content += 'Este valor está por encima del rango saludable para hombres no deportistas (10-20%). Considera reducir tu grasa corporal para mejorar tu salud general. ';
							}
						}
					} else {
						if (isAthlete) {
							if (results.grasaPctDeseado >= 12 && results.grasaPctDeseado <= 22) {
								content += 'Este valor está dentro del rango saludable para deportistas mujeres (12-22%). ';
							} else if (results.grasaPctDeseado < 12) {
								content += 'Este valor está por debajo del rango saludable para deportistas mujeres (12-22%). Esto puede ser peligroso para tu salud hormonal e inmunológica; consulta a un profesional. ';
							} else {
								content += 'Este valor está por encima del rango saludable para deportistas mujeres (12-22%). Podrías beneficiarte de reducir tu grasa corporal para mejorar el rendimiento. ';
							}
						} else {
							if (results.grasaPctDeseado >= 18 && results.grasaPctDeseado <= 28) {
								content += 'Este valor está dentro del rango saludable para mujeres no deportistas (18-28%). ';
							} else if (results.grasaPctDeseado < 18) {
								content += 'Este valor está por debajo del rango saludable para mujeres no deportistas (18-28%). Esto puede afectar tu salud hormonal e inmunológica; consulta a un profesional. ';
							} else {
								content += 'Estás por encima del rango saludable para mujeres no deportistas (18-28%). Considera reducir tu grasa corporal para mejorar tu salud general. ';
							}
						}
					}
					content += 'Mantener un porcentaje de grasa corporal saludable es crucial porque la grasa es necesaria para la regulación hormonal, el almacenamiento de energía y la salud general. Un porcentaje demasiado bajo puede interrumpir las funciones hormonales y debilitar el sistema inmunológico, mientras que un porcentaje demasiado alto aumenta el riesgo de enfermedades cardiovasculares y trastornos metabólicos. ';
				} else {
					content += 'No calculado. ';
				}
				content += '</p>';

            // Masa Grasa
				content += '<h3>Masa Grasa y Masa Magra(MLG)</h3>';
				  content +='<p><strong>Masa Grasa:</strong> Peso de la grasa en tu cuerpo.';
				if (!isNaN(results.masaGrasa)) {
					const fatPercentage = (results.masaGrasa / data.peso) * 100;
					content += 'Tu masa grasa es ' + formatResult(results.masaGrasa, 1) + ' kg, que representa ' + formatResult(fatPercentage, 1) + '% de tu peso corporal. ';
					if (gender === 'masculino') {
						if (isAthlete) {
							if (fatPercentage >= 6 && fatPercentage <= 15) {
								content += 'Estás en un rango saludable para deportistas hombres (6-15% del peso corporal). ';
							} else if (fatPercentage < 6) {
								content += 'Estás por debajo del rango saludable para deportistas hombres (6-15% del peso corporal). Esto puede ser peligroso para tu salud; consulta a un profesional. ';
							} else {
								content += 'Estás por encima del rango saludable para deportistas hombres (6-15% del peso corporal). Podrías beneficiarte de reducir tu masa grasa para mejorar el rendimiento. ';
							}
						} else {
							if (fatPercentage >= 10 && fatPercentage <= 20) {
								content += 'Estás en un rango saludable para hombres no deportistas (10-20% del peso corporal). ';
							} else if (fatPercentage < 10) {
								content += 'Estás por debajo del rango saludable para hombres no deportistas (10-20% del peso corporal). Esto puede afectar tu salud; consulta a un profesional. ';
							} else {
								content += 'Estás por encima del rango saludable para hombres no deportistas (10-20% del peso corporal). Considera reducir tu masa grasa para mejorar tu salud. ';
							}
						}
					} else {
						if (isAthlete) {
							if (fatPercentage >= 12 && fatPercentage <= 22) {
								content += 'Estás en un rango saludable para deportistas mujeres (12-22% del peso corporal). ';
							} else if (fatPercentage < 12) {
								content += 'Estás por debajo del rango saludable para deportistas mujeres (12-22% del peso corporal). Esto puede ser peligroso para tu salud; consulta a un profesional. ';
							} else {
								content += 'Estás por encima del rango saludable para deportistas mujeres (12-22% del peso corporal). Podrías beneficiarte de reducir tu masa grasa para mejorar el rendimiento. ';
							}
						} else {
							if (fatPercentage >= 18 && fatPercentage <= 28) {
								content += 'Estás en un rango saludable para mujeres no deportistas (18-28% del peso corporal). ';
							} else if (fatPercentage < 18) {
								content += 'Estás por debajo del rango saludable para mujeres no deportistas (18-28% del peso corporal). Esto puede afectar tu salud; consulta a un profesional. ';
							} else {
								content += 'Estás por encima del rango saludable para mujeres no deportistas (18-28% del peso corporal). Considera reducir tu masa grasa para mejorar tu salud. ';
							}
						}
					}
					content += 'La masa grasa es importante porque proporciona energía, aislamiento térmico y amortiguación para los órganos, pero debe estar equilibrada. Un exceso de masa grasa contribuye a riesgos cardiovasculares y metabólicos, mientras que una cantidad insuficiente puede afectar funciones fisiológicas como la regulación hormonal. ';
				} else {
					content += 'No calculado. ';
				}
				content += '</p>';

            // Masa Magra (MLG)
            // Masa Magra (MLG)
				content += '<p><strong>Masa Magra (MLG):</strong> Peso de tu cuerpo sin grasa (músculos, órganos, huesos, etc.). ';
				if (!isNaN(results.mlg)) {
					content += 'Tu masa magra es ' + formatResult(results.mlg, 1) + ' kg, que representa ' + formatResult((results.mlg / data.peso) * 100, 1) + '% de tu peso corporal. ';
					if (gender === 'masculino') {
						if (isAthlete) {
							if (results.mlg / data.peso >= 0.80 && results.mlg / data.peso <= 0.90) {
								content += 'Estás en un rango saludable para deportistas hombres (80-90% del peso corporal). ';
							} else if (results.mlg / data.peso < 0.80) {
								content += 'Estás por debajo del rango saludable para deportistas hombres (80-90% del peso corporal). Considera aumentar tu masa muscular. ';
							} else {
								content += 'Estás por encima del rango saludable para deportistas hombres (80-90% del peso corporal). Esto puede ser normal dependiendo de tu deporte, pero evalúa con un profesional. ';
							}
						} else {
							if (results.mlg / data.peso >= 0.75 && results.mlg / data.peso <= 0.85) {
								content += 'Estás en un rango saludable para hombres no deportistas (75-85% del peso corporal). ';
							} else if (results.mlg / data.peso < 0.75) {
								content += 'Estás por debajo del rango saludable para hombres no deportistas (75-85% del peso corporal). Considera aumentar tu masa muscular para mejorar tu salud. ';
							} else {
								content += 'Estás por encima del rango saludable para hombres no deportistas (75-85% del peso corporal). Esto puede indicar un exceso de masa muscular; evalúa con un profesional. ';
							}
						}
					} else {
						if (isAthlete) {
							if (results.mlg / data.peso >= 0.70 && results.mlg / data.peso <= 0.80) {
								content += 'Estás en un rango saludable para deportistas mujeres (70-80% del peso corporal). ';
							} else if (results.mlg / data.peso < 0.70) {
								content += 'Estás por debajo del rango saludable para deportistas mujeres (70-80% del peso corporal). Considera aumentar tu masa muscular. ';
							} else {
								content += 'Estás por encima del rango saludable para deportistas mujeres (70-80% del peso corporal). Esto puede ser normal dependiendo de tu deporte, pero evalúa con un profesional. ';
							}
						} else {
							if (results.mlg / data.peso >= 0.65 && results.mlg / data.peso <= 0.75) {
								content += 'Estás en un rango saludable para mujeres no deportistas (65-75% del peso corporal). ';
							} else if (results.mlg / data.peso < 0.65) {
								content += 'Estás por debajo del rango saludable para mujeres no deportistas (65-75% del peso corporal). Considera aumentar tu masa muscular para mejorar tu salud. ';
							} else {
								content += 'Estás por encima del rango saludable para mujeres no deportistas (65-75% del peso corporal). Esto puede indicar un exceso de masa muscular; evalúa con un profesional. ';
							}
						}
					}
					content += 'Mantener una MLG saludable es crucial porque incluye músculos, órganos y agua, soportando el metabolismo, la fuerza y la salud general. Una MLG baja puede causar debilidad y problemas metabólicos, mientras que una MLG excesivamente alta en no deportistas podría indicar desequilibrios o sobreentrenamiento. ';
				} else {
					content += 'No calculado. ';
				}
				content += '</p>';

				//MLG IMG
				//  Masa Grasa y Masa Magra
		content += `
        
        <p>Basado en tu porcentaje de grasa corporal (${formatResult(porcentajeGrasa, 1)}%) y peso (${formatResult(peso, 1)} kg):</p>
        <ul>
            <li><strong>Masa Grasa:</strong> ${formatResult(masaGrasa, 1)} kg. Esto representa la cantidad total de grasa corporal.</li>
            <li><strong>Masa Magra (MLG):</strong> ${formatResult(masaMagra, 1)} kg. Incluye músculos, huesos, órganos y agua.</li>
        </ul>
    `;

    // Nueva sección: Tipología del cuerpo según IMLG e IMG
    if (!isNaN(bodyCompResults.imlg) && !isNaN(bodyCompResults.img)) {
        const { imlg, img, tipologia, typologyNumber, imlgCategory, imlgRangeDesc, imgCategory, imgRangeDesc, typologyDesc } = bodyCompResults;
        content += `
            <h3>Tipología del Cuerpo según Índices de Masa (IMLG e IMG)</h3>
            <p>Utilizando los estándares de referencia NHANES/Frisancho 2008, calculamos los siguientes índices:</p>
            <ul>
                <li><strong>Índice de Masa Libre de Grasa (IMLG):</strong> ${formatResult(imlg, 1)} kg/m² (Categoría: ${imlgCategory}). <br><em>${imlgRangeDesc}</em></li>
                <li><strong>Índice de Masa Grasa (IMG):</strong> ${formatResult(img, 1)} kg/m² (Categoría: ${imgCategory}). <br><em>${imgRangeDesc}</em></li>
            </ul>
            <p>El plano está dividido en una cuadrícula de 3x3, creando 9 secciones distintas. Cada sección corresponde a una tipología de físico, y las fronteras de estas secciones se ajustan dinámicamente según el sexo, la edad y el nivel de actividad física:</p>
            <ul>
                <li>Las secciones en la parte inferior del eje Y (IMG bajo) representan físicos con baja grasa corporal.</li>
                <li>Las secciones en la parte superior del eje Y (IMG alto) representan físicos con alta grasa corporal (adiposos u obesos).</li>
                <li>Las secciones en la parte izquierda del eje X (IMLG bajo) representan físicos con baja masa libre de grasa (delgados o sedentarios).</li>
                <li>Las secciones en la parte derecha del eje X (IMLG alto) representan físicos con alta masa libre de grasa (musculosos o atletas).</li>
            </ul>
            <p>Los valores de IMLG e IMG se clasifican como "Fuera de rango" si están por debajo de los límites mínimos (IMLG: 11.5 kg/m², IMG: 2 kg/m²) o por encima de los límites máximos definidos para tu sexo, edad y nivel de actividad física.</p>
            <h4>Interpretación de las Tipologías</h4>
            <p>Basado en estos índices, tu tipología corporal se clasifica como <strong>${tipologia} (#${typologyNumber})</strong>:</p>
            <div style="background-color:#e8f5e9; border-left:4px solid #388e3c; padding:12px 16px; margin:16px 0; border-radius:5px;">
                <p style="margin:0;"><strong>📊 Descripción de la Tipología:</strong> ${typologyDesc}</p>
            </div>
            <p>La ubicación de cada tipología en la cuadrícula corresponde a su combinación de IMLG e IMG:</p>
            <ol>
                <li><strong>Adiposo Sedentario:</strong> Alto IMG, bajo IMLG. Mucha grasa, poca masa muscular o magra.</li>
                <li><strong>Obeso Sedentario:</strong> Muy alto IMG, bajo IMLG. Mayor cantidad de grasa que el adiposo sedentario, poca masa muscular.</li>
                <li><strong>Obeso Sólido:</strong> Muy alto IMG, IMLG moderado a alto. Mucha grasa, pero también una cantidad considerable de masa magra (no necesariamente muscular de atleta, puede ser estructura ósea grande u órganos).</li>
                <li><strong>Delgado Adiposo Sedentario:</strong> IMG moderado, IMLG bajo. No necesariamente mucho peso total, pero con un porcentaje de grasa relativamente alto y poca masa magra (el clásico "skinny fat").</li>
                <li><strong>Promedio:</strong> IMG y IMLG en rangos intermedios, considerados típicos para la población general no especialmente entrenada.</li>
                <li><strong>Atleta Promedio:</strong> IMG en rango normal o ligeramente bajo, IMLG moderado a alto. Buena masa muscular y niveles de grasa saludables o ligeramente por debajo del promedio.</li>
                <li><strong>Delgado:</strong> Bajo IMG, bajo IMLG. Poca grasa y poca masa magra/muscular.</li>
                <li><strong>Esbelto Magro Atleta:</strong> Bajo IMG, IMLG moderado a alto. Poca grasa y buena cantidad de masa magra/muscular (físico definido).</li>
                <li><strong>Musculoso Atleta:</strong> Bajo IMG, IMLG muy alto. Muy poca grasa y una gran cantidad de masa magra/muscular.</li>
            </ol>
            <div id="typology-legend-container" style="margin-bottom: 20px;"></div>
            <div id="typology-chart-container"></div>
            <p><em>Nota:</em> Estos rangos son guías generales basadas en estándares de población. La interpretación debe considerar tu nivel de actividad física, salud general y otros indicadores clínicos. Consulta a un profesional para un análisis más detallado.</p>
        `;
    } else {
        content += '<p>No se pudieron calcular los índices de composición corporal debido a datos insuficientes (falta peso, altura o porcentaje de grasa).</p>';
    }
		// Explicación de Edad Metabólica
        // Explicación de Edad Metabólica
    content += '<h3>Edad Metabólica</h3>';
    if (!isNaN(results.edadmetabolica)) {
        const ageDifference = results.edadmetabolica - data.edad;
        const ageDiffText = ageDifference > 0 ? `+${formatResult(ageDifference, 1)}` : formatResult(ageDifference, 1);
        content += `<p>Tu <strong>Edad Metabólica</strong> es de ${formatResult(results.edadmetabolica, 1)} años (${ageDiffText} vs. edad cronológica).</p>`;
        content += '<p>La <strong>edad metabólica</strong> refleja cómo tu tasa metabólica basal (BMR) se compara con la de otras personas de tu edad. La BMR es el número de calorías que tu cuerpo quema en reposo. Un BMR más alto indica un metabolismo más eficiente y una edad metabólica más baja, mientras que un BMR más bajo sugiere una edad metabólica más alta.</p>';
        content += '<p><strong>Nota:</strong> La edad metabólica no mide directamente tu salud general o expectativa de vida, pero puede ser un indicador útil para ajustar tu estilo de vida.</p>';
		
		

     
        // Factores clave que afectan la edad metabólica
        content += '<h4>Factores Clave</h4>';
        let cinturaImpact = 0;
        let grasaImpact = 0;
        let actividadImpact = data.es_deportista === 'si' ? -2.8 : 3.0;
        if (data.circ_cintura) {
            if (data.genero === 'masculino' && data.circ_cintura > 94) {
                cinturaImpact = data.circ_cintura > 102 ? 0.7 * (data.circ_cintura - 94) : 0.3 * (data.circ_cintura - 94);
            } else if (data.genero === 'femenino' && data.circ_cintura > 80) {
                cinturaImpact = data.circ_cintura > 88 ? 0.7 * (data.circ_cintura - 80) : 0.3 * (data.circ_cintura - 80);
            }
        }
        if (!isNaN(results.grasaPctActual)) {
            if (data.genero === 'masculino' && results.grasaPctActual > 18) {
                grasaImpact = results.grasaPctActual > 25 ? 10.5 : 5.0;
            } else if (data.genero === 'femenino' && results.grasaPctActual > 24) {
                grasaImpact = results.grasaPctActual > 32 ? 10.5 : 5.0;
            }
        }
        content += '<ul>';
        if (cinturaImpact > 0) {
            content += `<li><strong>Circunferencia de cintura (${formatResult(data.circ_cintura, 1)} cm):</strong> Contribuye aproximadamente +${formatResult(cinturaImpact, 1)} años debido a la grasa visceral acumulada.</li>`;
        }
        if (grasaImpact > 0) {
            content += `<li><strong>Porcentaje de grasa (${formatResult(results.grasaPctActual, 1)}%):</strong> Añade aproximadamente +${formatResult(grasaImpact, 1)} años por estar por encima del rango saludable.</li>`;
        }
        content += `<li><strong>Nivel de actividad:</strong> ${data.es_deportista === 'si' ? 'Tu actividad física reduce unos -2.8 años.' : 'El sedentarismo añade unos +3.0 años.'}</li>`;
        content += '</ul>';

        // Interpretación
        content += '<h4>Interpretación</h4>';
        if (results.edadmetabolica > data.edad) {
            content += `<p>Tu edad metabólica es mayor que tu edad cronológica (${formatResult(data.edad, 0)} años), lo que sugiere un metabolismo más lento. Esto puede deberse a una mayor proporción de grasa corporal, menor masa muscular o sedentarismo. ¡No te preocupes! Con cambios en tu estilo de vida, puedes reducir tu edad metabólica.</p>`;
        } else if (results.edadmetabolica < data.edad) {
            content += `<p>¡Excelente! Tu edad metabólica es menor que tu edad cronológica (${formatResult(data.edad, 0)} años), lo que indica un metabolismo eficiente, probablemente gracias a una buena composición corporal y hábitos activos. Sigue así para mantener esta ventaja.</p>`;
        } else {
            content += `<p>Tu edad metabólica coincide con tu edad cronológica (${formatResult(data.edad, 0)} años), lo que refleja un metabolismo típico para tu edad. Continúa con hábitos saludables y considera estrategias para optimizar tu metabolismo.</p>`;
        }

        // Recomendaciones
        content += '<h4>¿Cómo Mejorar tu Edad Metabólica?</h4>';
        content += '<p>Para reducir tu edad metabólica, enfócate en <strong>disminuir la grasa corporal</strong>, <strong>aumentar la masa magra</strong> o ambas. Aquí tienes estrategias prácticas:</p>';

        content += '<h5>1. Disminuir la Grasa Corporal</h5>';
        content += '<ul>';
        content += '<li><strong>Haz Cardio:</strong> El ejercicio cardiovascular quema calorías y grasa. Prueba el <strong>HIIT</strong> (intervalos de alta intensidad) para maximizar calorías en menos tiempo, o <strong>LISS</strong> (cardio de baja intensidad, como caminar rápido) para quemar más grasa por minuto. Apunta a 150 min/semana (ej.: 30 min/día, 5 días).</li>';
        content += '<li><strong>Crea un Déficit Calórico:</strong> Come menos calorías de las que quemas (déficit de 300-500 kcal/día). Calcula tu <strong>TDEE</strong> (gasto energético diario total) y mantén la ingesta entre tu BMR y TDEE para perder grasa de forma sostenible.</li>';
        content += '<li><strong>Reduce Carbohidratos:</strong> Limita los carbohidratos al 30% de tus calorías diarias, ajustándolos según tu actividad (más actividad, más carbohidratos). Esto fomenta que tu cuerpo use grasa almacenada como energía.</li>';
        content += '<li><strong>Come Alimentos Saludables:</strong> Prioriza alimentos integrales (verduras, frutas, proteínas magras, grasas saludables). Evita azúcares refinados y grasas trans para mejorar tu salud general.</li>';
        if (data.circ_cintura && ((data.genero === 'masculino' && data.circ_cintura > 94) || (data.genero === 'femenino' && data.circ_cintura > 80))) {
            content += `<li><strong>Reduce la Cintura:</strong> Tu circunferencia de cintura (${formatResult(data.circ_cintura, 1)} cm) está por encima del rango saludable. Apunta a <${data.genero === 'masculino' ? '94' : '80'} cm con dieta y cardio.</li>`;
        }
        content += '</ul>';

        content += '<h5>2. Aumentar la Masa Magra</h5>';
        content += '<ul>';
        content += '<li><strong>Levanta Pesas:</strong> Incorpora entrenamientos de resistencia 2-3 veces por semana para construir músculo, lo que acelera tu metabolismo. Ejercicios como sentadillas, peso muerto y press de banca son ideales.</li>';
        content += '<li><strong>Come Suficientes Calorías:</strong> Para ganar músculo, consume al menos tu TDEE o un ligero exceso calórico (100-200 kcal). Aumenta calorías gradualmente después de perder grasa.</li>';
        content += '<li><strong>Aumenta Proteínas:</strong> Consume 1.6-2.2 g de proteína por kg de peso corporal (aprox. 30% de tus calorías). Fuentes como pollo, pescado, huevos, tofu o legumbres son excelentes.</li>';
        content += '</ul>';

        if ((data.genero === 'masculino' && results.grasaPctActual > 18) || (data.genero === 'femenino' && results.grasaPctActual > 24)) {
            content += '<h5>3. Recomendaciones para Obesidad</h5>';
            content += '<ul>';
            content += '<li><strong>Pérdida de Peso Gradual:</strong> Apunta a reducir un 5-10% de tu peso corporal para mejorar tu metabolismo. Hazlo lentamente (0.5-1 kg/semana).</li>';
            content += '<li><strong>Dieta Mediterránea:</strong> Adopta una dieta rica en frutas, verduras, pescado, aceite de oliva y frutos secos para combatir la inflamación y el estrés oxidativo.</li>';
            content += '<li><strong>Suplementos:</strong> Considera omega-3 (antiinflamatorio) y vitamina D (mejora sensibilidad a la insulina), pero consulta a un médico primero.</li>';
            content += '<li><strong>Consulta Profesional:</strong> Trabaja con un endocrinólogo o nutricionista para un plan personalizado.</li>';
            content += '</ul>';
        }
		
		
        // Riesgos asociados
        content += '<h4>Riesgos Asociados</h4>';
        content += '<ul>';
        if (data.circ_cintura && ((data.genero === 'masculino' && data.circ_cintura > 100) || (data.genero === 'femenino' && data.circ_cintura > 88))) {
            content += `<li>Tu cintura (${formatResult(data.circ_cintura, 1)} cm) aumenta significativamente el riesgo de problemas cardiovasculares y resistencia a la insulina.</li>`;
        }
        if (data.es_deportista !== 'si' && results.grasaPctActual > (data.genero === 'masculino' ? 18 : 24)) {
            content += '<li>El sedentarismo combinado con un exceso de grasa corporal puede acelerar el envejecimiento celular y problemas metabólicos.</li>';
        }
        content += '</ul>';

        // Conclusión
        content += '<h4>Conclusión</h4>';
        content += `<p>Tu metabolismo funciona como el de una persona de ${formatResult(results.edadmetabolica, 1)} años. Para optimizarlo:</p>`;
        content += '<ul>';
        content += '<li><strong>Prioriza:</strong> Reducir la grasa visceral (cintura) con dieta y cardio.</li>';
        content += '<li><strong>Combina:</strong> Ejercicio aeróbico y de fuerza para mejorar la composición corporal.</li>';
        content += '<li><strong>Consulta:</strong> Un profesional para un plan personalizado.</li>';
        content += '</ul>';
        content += '<p><strong>¿Listo para empezar?</strong> Si necesitas un plan detallado, ¡puedes consultar a un nutricionista o entrenador! 😊</p>';
    } else {
        content += '<p>No se pudo calcular la edad metabólica debido a datos insuficientes (falta porcentaje de grasa, medidas de pliegues o cintura).</p>';
    }
    // Consideraciones personalizadas según IMC y composición
   // Sección 3: Consideraciones según IMC
    content += `
        <h4>Consideraciones según tu IMC y Composición Corporal</h4>
    `;
    if (!isNaN(imc)) {
        if (imc < 18.5) {
            content += `
                <p>Tu IMC (${formatResult(imc, 1)}) indica <strong>bajo peso</strong>. Podrías aumentar tu ingesta calórica y entrenar fuerza para ganar masa magra (${formatResult(masaMagra, 1)} kg).</p>
            `;
        } else if (imc >= 18.5 && imc <= 24.9) {
            content += `
                <p>Tu IMC (${formatResult(imc, 1)}) está en un rango <strong>saludable</strong>. Puedes optimizar tu composición corporal (${formatResult(porcentajeGrasa, 1)}% grasa) según tus objetivos.</p>
            `;
        } else if (imc >= 25 && imc <= 29.9) {
            content += `
                <p>Tu IMC (${formatResult(imc, 1)}) indica <strong>sobrepeso</strong>. Si tu grasa (${formatResult(masaGrasa, 1)} kg) es alta, considera un déficit calórico y ejercicio cardiovascular.</p>
            `;
        } else {
            content += `
                <p>Tu IMC (${formatResult(imc, 1)}) indica <strong>obesidad</strong>. Reducir grasa (${formatResult(masaGrasa, 1)} kg) con dieta y ejercicio puede mejorar tu salud.</p>
            `;
        }
    } else {
        content += `<p>No se pudo calcular el IMC debido a datos insuficientes.</p>`;
    }

    // Sección 4: Sugerencias según contexto (deportista o no)
    content += `
        <h3>Sugerencias Personalizadas</h3>
    `;
    if (esDeportista) {
        content += `<p><strong>Contexto Deportivo:</strong> Como deportista, tu masa magra (${formatResult(masaMagra, 1)} kg) es clave para el rendimiento.</p>`;
        if (porcentajeGrasa > (sexo.toLowerCase() === 'masculino' ? 20 : 30)) {
            content += `<p>Tu grasa (${formatResult(porcentajeGrasa, 1)}%) podría ser alta. Reducirla puede mejorar agilidad y resistencia.</p>`;
        } else {
            content += `<p>Tu grasa (${formatResult(porcentajeGrasa, 1)}%) está en un rango adecuado para deportistas.</p>`;
        }
    } else {
        content += `<p><strong>Contexto No Deportivo:</strong> Si buscas empezar actividad física:</p>`;
        if (masaGrasa > (sexo.toLowerCase() === 'masculino' ? 20 : 30)) {
            content += `<p>Tu masa grasa (${formatResult(masaGrasa, 1)} kg) es alta. Prueba ejercicios cardiovasculares y una dieta balanceada.</p>`;
        } else {
            content += `<p>Tu composición está equilibrada. El entrenamiento de fuerza puede aumentar tu masa magra (${formatResult(masaMagra, 1)} kg).</p>`;
        }
    }
		
		
		// Nueva explicación: Relación entre IMLG, TMB y GET
        // Relación entre IMLG, TMB y GET
    // Relación entre IMLG, TMB y GET
    content += '<h3>Relación entre IMLG, TMB y GET</h3>';
    if (!isNaN(bodyCompResults.imlg) && data.peso && (data.grasa_actual_conocida || !isNaN(results.grasaPctActual))) {
        // Use grasa_actual_conocida if valid, otherwise fall back to porcentajeGrasa
        const grasaPercent = (typeof data.grasa_actual_conocida !== 'undefined' && !isNaN(data.grasa_actual_conocida) && data.grasa_actual_conocida >= 0)
            ? data.grasa_actual_conocida
            : results.grasaPctActual;
        const masaMagra = data.peso * (1 - grasaPercent / 100);
        const bmr = 370 + (21.6 * masaMagra); // TMB based on lean mass
        const activityFactors = {
            'sedentario': 1.2,
            'ligero': 1.375,
            'moderado': 1.55,
            'intenso': 1.725,
            'atleta': 1.9
        };
        // Set activityLevel based on esDeportista
        const activityLevel = data.esDeportista === 'si' ? 'intenso' : 'sedentario';
        const activityFactor = activityFactors[activityLevel];
        const get = bmr * activityFactor; // GET includes activity

        // Personalization variables
        const age = Number(data.edad) || 30; // Default to 30 if missing
        const gender = data.genero || 'masculino'; // Default to masculino
        const isAthlete = data.esDeportista === 'si';
        const isObese = results.esObeso || false; // Assume calculated in handler
        const ageGroup = age < 18 ? '6-17' : age <= 24 ? '18-24' : age <= 44 ? '25-44' : '45+';

        // Reference ranges for IMLG and TMB (approximated)
        const refRanges = {
            'masculino': {
                '18-24': { imlg: { p25: 15, p50: 17.5, p75: 20 }, tmb: { p25: 1400, p50: 1600, p75: 1800 } },
                '25-44': { imlg: { p25: 14.5, p50: 17, p75: 19.5 }, tmb: { p25: 1350, p50: 1550, p75: 1750 } },
                '45+': { imlg: { p25: 13, p50: 15.5, p75: 18 }, tmb: { p25: 1200, p50: 1400, p75: 1600 } }
            },
            'femenino': {
                '18-24': { imlg: { p25: 12, p50: 14.5, p75: 17 }, tmb: { p25: 1200, p50: 1350, p75: 1500 } },
                '25-44': { imlg: { p25: 11.5, p50: 14, p75: 16.5 }, tmb: { p25: 1150, p50: 1300, p75: 1450 } },
                '45+': { imlg: { p25: 10, p50: 12.5, p75: 15 }, tmb: { p25: 1000, p50: 1150, p75: 1300 } }
            }
        };
        const refs = refRanges[gender][ageGroup] || refRanges[gender]['18-24']; // Fallback to 18-24

        // Six scenarios logic
        // Six scenarios logic with brief explanations
        
        let scenarioText = '';
        let suggestionsText = '';
        if (isObese) {
            if (bodyCompResults.imlg < refs.imlg.p25) {
                scenarioText = `Escenario 3: Tu IMLG (${formatResult(bodyCompResults.imlg, 1)} kg/m²) está por debajo del rango típico (P25: ${refs.imlg.p25} kg/m²) para tu edad y sexo, indicando baja masa magra debido a alta grasa corporal, típico en obesidad. Enfócate en entrenamiento de fuerza y reducción de grasa para mejorar tu metabolismo.`;
                suggestionsText = `
                    <ul>
                        <li><strong>Aumenta IMLG:</strong> Realiza entrenamiento de fuerza (p. ej., pesas o ejercicios de peso corporal, 3 veces/semana) para construir masa magra${ageGroup === '45+' ? ', crucial para prevenir sarcopenia' : ''}.</li>
                        <li><strong>Eleva TMB:</strong> Consume una dieta rica en proteínas (1.6–2.2 g/kg de peso) para apoyar el crecimiento muscular y metabolismo.</li>
                        <li><strong>Optimiza GET:</strong> Incorpora actividad moderada (p. ej., caminar, ciclismo, 30 min/día) para aumentar GET y crear un déficit calórico para perder grasa.</li>
                    </ul>`;
            } else {
                scenarioText = `Escenario 3: Tu IMLG (${formatResult(bodyCompResults.imlg, 1)} kg/m²) está dentro o por encima del rango típico (P25: ${refs.imlg.p25} kg/m²) para tu edad y sexo, lo cual es positivo a pesar de la obesidad. Mantén o aumenta masa magra mientras reduces grasa para optimizar tu salud metabólica.`;
                suggestionsText = `
                    <ul>
                        <li><strong>Preserva IMLG:</strong> Continúa con entrenamiento de fuerza (3 veces/semana) para mantener masa magra mientras reduces grasa${ageGroup === '45+' ? ', previniendo pérdida muscular' : ''}.</li>
                        <li><strong>Mantén TMB:</strong> Asegura un aporte adecuado de proteínas (1.2–1.6 g/kg) para sostener tu metabolismo durante la pérdida de peso.</li>
                        <li><strong>Incrementa GET:</strong> Aumenta la actividad (p. ej., 200 min/semana de ejercicio moderado) y controla la ingesta calórica para favorecer la pérdida de grasa.</li>
                    </ul>`;
            }
        } else if (isAthlete) {
            if (bodyCompResults.imlg >= refs.imlg.p75 && bmr >= refs.tmb.p75) {
                scenarioText = `Escenario 4: Tu IMLG (${formatResult(bodyCompResults.imlg, 1)} kg/m²) y TMB (${formatResult(bmr, 1)} kcal/día) están en el rango óptimo (≥P75: IMLG ${refs.imlg.p75} kg/m², TMB ${refs.tmb.p75} kcal/día), ideales para alto rendimiento deportivo. Continúa con tu entrenamiento y nutrición para mantener este nivel.`;
                suggestionsText = `
                    <ul>
                        <li><strong>Sostén IMLG:</strong> Mantén masa magra con entrenamiento avanzado de fuerza e hipertrofia (5–6 veces/semana)${gender === 'femenino' ? ', maximizando tu potencial muscular' : ''}.</li>
                        <li><strong>Optimiza TMB:</strong> Consume comidas ricas en proteínas y nutrientes, sincronizadas con tus entrenamientos, para maximizar el metabolismo.</li>
                        <li><strong>Equilibra GET:</strong> Asegura que tu ingesta calórica coincida con tu GET (${formatResult(get, 1)} kcal/día) para apoyar el rendimiento y recuperación.</li>
                    </ul>`;
            } else if (bodyCompResults.imlg >= refs.imlg.p50) {
                scenarioText = `Escenario 5: Tu IMLG (${formatResult(bodyCompResults.imlg, 1)} kg/m²) y TMB (${formatResult(bmr, 1)} kcal/día) están en un rango competitivo (P50–P75: IMLG ${refs.imlg.p50}–${refs.imlg.p75} kg/m²), adecuado para deportistas recreativos o competitivos. Considera entrenamiento específico para optimizar masa magra y rendimiento.`;
                suggestionsText = `
                    <ul>
                        <li><strong>Mejora IMLG:</strong> Implementa programas de fuerza periodizados (4–5 veces/semana) para aumentar masa magra${gender === 'femenino' ? ', elevando tu TMB' : ''}.</li>
                        <li><strong>Apoya TMB:</strong> Incluye proteínas (1.6–2.0 g/kg) y carbohidratos complejos para sostener energía y metabolismo.</li>
                        <li><strong>Eleva GET:</strong> Optimiza el volumen e intensidad del entrenamiento, asegurando calorías suficientes para ganancias de rendimiento.</li>
                    </ul>`;
            } else {
                scenarioText = `Escenario 6: Tu IMLG (${formatResult(bodyCompResults.imlg, 1)} kg/m²) está por debajo del rango esperado para deportistas (<P50: ${refs.imlg.p50} kg/m²), indicando masa magra insuficiente para tu nivel deportivo. Consulta a un entrenador para aumentar músculo y mejorar rendimiento.`;
                suggestionsText = `
                    <ul>
                        <li><strong>Aumenta IMLG:</strong> Prioriza entrenamiento de fuerza intensivo (4–5 veces/semana) para ganar masa magra${ageGroup === '45+' ? ', contrarrestando pérdida muscular' : ''}.</li>
                        <li><strong>Impulsa TMB:</strong> Consume una dieta alta en proteínas (1.8–2.2 g/kg) con comidas frecuentes para apoyar el crecimiento muscular.</li>
                        <li><strong>Incrementa GET:</strong> Aumenta la frecuencia de entrenamiento y calorías para elevar GET y alcanzar objetivos de musculación.</li>
                    </ul>`;
            }
        } else {
            if (bodyCompResults.imlg >= refs.imlg.p25 && bodyCompResults.imlg <= refs.imlg.p75 &&
                bmr >= refs.tmb.p25 && bmr <= refs.tmb.p75) {
                scenarioText = `Escenario 1: Tu IMLG (${formatResult(bodyCompResults.imlg, 1)} kg/m²) y TMB (${formatResult(bmr, 1)} kcal/día) están dentro del rango saludable (P25–P75: IMLG ${refs.imlg.p25}–${refs.imlg.p75} kg/m², TMB ${refs.tmb.p25}–${refs.tmb.p75} kcal/día), reflejando una composición corporal y metabolismo equilibrados. Mantén un estilo de vida activo para preservar esta salud.`;
                suggestionsText = `
                    <ul>
                        <li><strong>Mantén IMLG:</strong> Realiza entrenamiento de fuerza regular (2–3 veces/semana) para preservar masa magra${ageGroup === '45+' ? ', previniendo sarcopenia' : ''}.</li>
                        <li><strong>Sostén TMB:</strong> Sigue una dieta equilibrada con proteínas (1.2–1.6 g/kg) para mantener tu metabolismo.</li>
                        <li><strong>Mejora GET:</strong> Aumenta la actividad (p. ej., 150 min/semana de ejercicio moderado) para optimizar GET y salud general.</li>
                    </ul>`;
            } else {
                scenarioText = `Escenario 2: Tu IMLG (${formatResult(bodyCompResults.imlg, 1)} kg/m²) o TMB (${formatResult(bmr, 1)} kcal/día) están fuera del rango típico (P25–P75: IMLG ${refs.imlg.p25}–${refs.imlg.p75} kg/m², TMB ${refs.tmb.p25}–${refs.tmb.p75} kcal/día), sugiriendo masa muscular baja o alta. Evalúa con un profesional para ajustar dieta o ejercicio según tu caso.`;
                suggestionsText = `
                    <ul>
                        <li><strong>Ajusta IMLG:</strong> Si es bajo (<${refs.imlg.p25} kg/m²), prioriza entrenamiento de fuerza; si es alto (>${refs.imlg.p75} kg/m²), mantén con ejercicio equilibrado${ageGroup === '45+' ? ', crucial para la salud muscular' : ''}.</li>
                        <li><strong>Optimiza TMB:</strong> Para TMB bajo (<${refs.tmb.p25} kcal/día), consume proteínas y entrena fuerza; para TMB alto, mantén actividad constante.</li>
                        <li><strong>Equilibra GET:</strong> Agrega ejercicio estructurado (3–5 días/semana) para alinear GET con tus metas de peso o musculatura.</li>
                    </ul>`;
            }
        }

        // Enhanced explanation with refined unisex activity factors note and scenario explanations
        content += `
            <p>Tu <strong>Índice de Masa Libre de Grasa (IMLG)</strong> de ${formatResult(bodyCompResults.imlg, 1)} kg/m² mide la cantidad de masa magra (músculos, órganos, huesos) relativa a tu altura, siendo un indicador clave de tu composición corporal. Con un peso de ${formatResult(data.peso, 1)} kg y un porcentaje de grasa de ${formatResult(grasaPercent, 1)}%, tu masa magra estimada es de ${formatResult(masaMagra, 1)} kg. La masa magra es el principal determinante de tu <strong>Tasa Metabólica Basal (TMB)</strong>, que representa las calorías que tu cuerpo quema en reposo para funciones vitales como respiración y circulación.</p>
            <p>Tu TMB estimada es de ${formatResult(bmr, 1)} kcal/día, lo que refleja tu metabolismo basal. Este valor está influenciado por tu <strong>sexo</strong> (${gender === 'masculino' ? 'los hombres suelen tener mayor masa magra y TMB debido a mayor musculatura' : 'las mujeres suelen tener menor masa magra y TMB, pero pueden optimizarla con entrenamiento'}), tu <strong>edad</strong> (${ageGroup === '18-24' ? 'los adultos jóvenes tienen TMB más alta por mayor masa muscular' : ageGroup === '25-44' ? 'los adultos mantienen TMB estable si son activos' : 'los adultos mayores pueden ver una disminución en TMB debido a pérdida muscular'}), y tu masa magra. Comparado con el rango típico para tu grupo (TMB P25–P75: ${refs.tmb.p25}–${refs.tmb.p75} kcal/día), tu TMB sugiere ${bmr < refs.tmb.p25 ? 'un metabolismo más bajo, posiblemente por menor masa magra' : bmr > refs.tmb.p75 ? 'un metabolismo elevado, probablemente por alta masa magra' : 'un metabolismo típico'}.</p>
            <p>El <strong>Gasto Energético Total (GET)</strong> incorpora tu actividad física y se estima en ${formatResult(get, 1)} kcal/día para un nivel de actividad <strong>${activityLevel}</strong> (factor: ${activityFactor}). <strong>Nota:</strong> Los factores de actividad son universales para ambos sexos, pero el GET es mayor en hombres debido a su mayor TMB, mientras que las mujeres pueden aumentar su TMB y GET con entrenamiento. Este valor indica las calorías totales que necesitas diariamente, incluyendo actividad física. Un nivel de actividad ${activityLevel === 'sedentario' ? 'sedentario implica un GET más bajo, aumentando el riesgo de acumular grasa si la ingesta calórica excede el GET' : 'intenso, típico de deportistas, eleva significativamente el GET, apoyando metas de rendimiento y mantenimiento de masa magra'}. Para optimizar tu GET, considera ${isAthlete ? 'mantener o aumentar tu entrenamiento para apoyar tus objetivos deportivos' : 'incrementar tu actividad física para mejorar IMLG y GET'}.</p>
			<h4><strong>Interpretación:</strong></h4>
            <p> ${scenarioText} Tu IMLG y TMB son fundamentales para tu salud metabólica y rendimiento físico. Un IMLG más alto, especialmente en deportistas, mejora la fuerza y eficiencia energética, mientras que un GET adecuado asegura que tu ingesta calórica apoye tus objetivos (p. ej., pérdida de grasa, ganancia muscular, mantenimiento). ${ageGroup === '45+' ? 'En adultos mayores, mantener o aumentar IMLG es clave para prevenir sarcopenia y mantener un metabolismo saludable.' : isAthlete ? 'En deportistas, un IMLG y GET elevados son esenciales para el rendimiento y la recuperación.' : 'En la población general, un IMLG y GET equilibrados promueven salud a largo plazo.'}</p>
            <p><strong>Fuente del Porcentaje de Grasa:</strong> ${data.grasa_actual_conocida ? 'Valor conocido proporcionado' : 'Estimación de la herramienta'} (${formatResult(grasaPercent, 1)}%).</p>
        `;

        // Personalized suggestions for improving IMLG, TMB, and GET
        content += `
            <h3>Sugerencias Personalizadas</h3>
            <p>Basado en tus resultados, aquí tienes recomendaciones para optimizar tu IMLG, TMB y GET:</p>
            ${suggestionsText}
        `;
    } else {
        content += `<p>No se pudo calcular la relación entre IMLG, TMB y GET debido a datos insuficientes (falta peso, porcentaje de grasa o IMLG).</p>`;
    }
    // Insertar el contenido en el DOM
    document.getElementById("explanation-content").innerHTML = content;
			
			
				
				
            // Área Muscular Brazo (AMB)
	
		 content += `
        <h3>Reserva Proteica AMB, Masa Ósea y Masa Residual</h3>
    `;

    // Área Muscular Brazo (AMB) Explanation
    content += '<h4>Área Muscular Brazo (AMB)</h4>';
    content += '<p><strong>Área Muscular Brazo (AMB):</strong> Representa la masa muscular del brazo, un indicador clave de fuerza funcional y salud muscular. ';
    if (!isNaN(results.amb) && data.edad && ['masculino', 'femenino'].includes(data.genero)) {
        const age = Number(data.edad);
        const gender = data.genero;
        const isAthlete = data.esDeportista === 'si';
        const isObese = results.esObeso || false;
        const ageGroup = age >= 45 ? '45+' : '18-44';
        content += `Tu AMB es ${formatResult(results.amb, 1)} cm². `;

        // Define AMB reference ranges
        const ambRanges = {
            masculino: {
                general: {
                    '18-20': { P5: 23.4, P50: 30.4, P95: 39.6 },
                    '21-24': { P5: 23.6, P50: 30.6, P95: 39.8 },
                    '25-29': { P5: 23.8, P50: 31.0, P95: 40.0 },
                    '30-34': { P5: 23.5, P50: 30.6, P95: 39.8 },
                    '35-39': { P5: 22.9, P50: 29.9, P95: 39.0 },
                    '40-44': { P5: 22.6, P50: 29.5, P95: 38.5 },
                    '45-49': { P5: 21.8, P50: 28.5, P95: 37.3 },
                    '50-54': { P5: 21.2, P50: 27.9, P95: 36.5 },
                    '55-59': { P5: 20.6, P50: 27.1, P95: 35.5 },
                    '60-64': { P5: 20.2, P50: 26.4, P95: 34.7 },
                    '65-70': { P5: 19.0, P50: 25.0, P95: 33.0 },
                    '70+': { P5: 16.5, P50: 21.9, P95: 29.0 }
                },
                athlete: {
                    '18-20': { P50: 30.5, P75: 34.5, P90: 40.5 },
                    '21-24': { P50: 30.8, P75: 34.8, P90: 41.0 },
                    '25-29': { P50: 31.2, P75: 35.2, P90: 41.5 },
                    '30-34': { P50: 30.8, P75: 34.7, P90: 41.0 },
                    '35-39': { P50: 30.0, P75: 33.8, P90: 40.0 },
                    '40-44': { P50: 29.6, P75: 33.3, P90: 39.5 },
                    '45-49': { P50: 28.7, P75: 32.1, P90: 38.3 },
                    '50-54': { P50: 28.1, P75: 31.5, P90: 37.5 },
                    '55-59': { P50: 27.2, P75: 30.5, P90: 36.4 },
                    '60-64': { P50: 26.5, P75: 29.7, P90: 35.5 },
                    '65-70': { P50: 25.0, P75: 28.2, P90: 34.0 },
                    '70+': { P50: 21.9, P75: 25.2, P90: 30.0 }
                }
            },
            femenino: {
                general: {
                    '18-20': { P5: 17.7, P50: 22.6, P95: 28.8 },
                    '21-24': { P5: 17.9, P50: 22.8, P95: 29.1 },
                    '25-29': { P5: 18.0, P50: 23.2, P95: 29.8 },
                    '30-34': { P5: 17.8, P50: 22.9, P95: 29.4 },
                    '35-39': { P5: 17.3, P50: 22.4, P95: 29.0 },
                    '40-44': { P5: 17.1, P50: 22.2, P95: 28.8 },
                    '45-49': { P5: 16.6, P50: 21.8, P95: 28.4 },
                    '50-54': { P5: 16.3, P50: 21.4, P95: 27.9 },
                    '55-59': { P5: 15.8, P50: 21.0, P95: 27.4 },
                    '60-64': { P5: 15.4, P50: 20.5, P95: 26.8 },
                    '65-70': { P5: 14.7, P50: 19.5, P95: 25.6 },
                    '70+': { P5: 13.2, P50: 17.7, P95: 23.5 }
                },
                athlete: {
                    '18-20': { P50: 22.7, P75: 25.8, P90: 30.5 },
                    '21-24': { P50: 22.9, P75: 26.0, P90: 31.0 },
                    '25-29': { P50: 23.3, P75: 26.5, P90: 31.5 },
                    '30-34': { P50: 23.0, P75: 26.2, P90: 31.0 },
                    '35-39': { P50: 22.5, P75: 25.5, P90: 30.2 },
                    '40-44': { P50: 22.2, P75: 25.1, P90: 29.7 },
                    '45-49': { P50: 21.8, P75: 24.6, P90: 29.0 },
                    '50-54': { P50: 21.4, P75: 24.1, P90: 28.4 },
                    '55-59': { P50: 21.0, P75: 23.6, P90: 27.8 },
                    '60-64': { P50: 20.5, P75: 22.9, P90: 27.0 },
                    '65-70': { P50: 19.5, P75: 21.8, P90: 25.6 },
                    '70+': { P50: 17.7, P75: 20.0, P90: 24.0 }
                }
            }
        };

        // Determine age range
        let ageRange;
        if (age >= 18 && age <= 20) ageRange = '18-20';
        else if (age <= 24) ageRange = '21-24';
        else if (age <= 29) ageRange = '25-29';
        else if (age <= 34) ageRange = '30-34';
        else if (age <= 39) ageRange = '35-39';
        else if (age <= 44) ageRange = '40-44';
        else if (age <= 49) ageRange = '45-49';
        else if (age <= 54) ageRange = '50-54';
        else if (age <= 59) ageRange = '55-59';
        else if (age <= 64) ageRange = '60-64';
        else if (age <= 70) ageRange = '65-70';
        else ageRange = '70+';

        // Select ranges
        const ranges = isAthlete ? ambRanges[gender].athlete[ageRange] : ambRanges[gender].general[ageRange];

        // Interpret AMB
        if (isAthlete) {
            if (results.amb < ranges.P50) {
                content += `Tu AMB está por debajo del percentil 50 (${ranges.P50} cm²) para deportistas ${gender === 'masculino' ? 'hombres' : 'mujeres'} de ${ageRange} años. Esto sugiere que tu masa muscular del brazo es menor que la de atletas recreativos. Considera un programa de entrenamiento de fuerza enfocado en el tren superior para alcanzar niveles competitivos. `;
            } else if (results.amb >= ranges.P50 && results.amb < ranges.P75) {
                content += `Tu AMB está en el percentil 50 (${ranges.P50} cm²), comparable a deportistas recreativos ${gender === 'masculino' ? 'hombres' : 'mujeres'} de ${ageRange} años. Esto indica una buena base muscular, adecuada para actividades físicas regulares. Puedes mantener o intensificar tu entrenamiento para acercarte a niveles competitivos. `;
            } else if (results.amb >= ranges.P75 && results.amb < ranges.P90) {
                content += `Tu AMB está en el percentil 75 (${ranges.P75} cm²), comparable a deportistas competitivos ${gender === 'masculino' ? 'hombres' : 'mujeres'} de ${ageRange} años. Tienes una musculatura del brazo sólida, ideal para deportes semiprofesionales. Continúa con un entrenamiento estructurado para mantener o mejorar este nivel. `;
            } else {
                content += `Tu AMB está en o por encima del percentil 90 (${ranges.P90} cm²), comparable a deportistas de élite o de fuerza ${gender === 'masculino' ? 'hombres' : 'mujeres'} de ${ageRange} años. Esto es excepcional y típico en deportes como halterofilia o rugby. Asegúrate de equilibrar tu entrenamiento para evitar lesiones y consulta con un profesional si buscas optimizar tu rendimiento. `;
            }
        } else {
            if (results.amb < ranges.P5) {
                content += `Tu AMB está por debajo del percentil 5 (${ranges.P5} cm²) para ${gender === 'masculino' ? 'hombres' : 'mujeres'} de ${ageRange} años. Esto indica una masa muscular del brazo muy baja, lo que puede afectar la fuerza funcional. Te recomendamos iniciar un programa de entrenamiento de fuerza supervisado para mejorar tu musculatura y salud general. `;
            } else if (results.amb >= ranges.P5 && results.amb < ranges.P50) {
                content += `Tu AMB está entre los percentiles 5 y 50 (${ranges.P5}–${ranges.P50} cm²) para ${gender === 'masculino' ? 'hombres' : 'mujeres'} de ${ageRange} años. Tu masa muscular del brazo es inferior al promedio. Incorporar ejercicios de fuerza (como pesas o entrenamiento de resistencia) puede ayudarte a mejorar tu fuerza y funcionalidad. `;
            } else if (results.amb >= ranges.P50 && results.amb < ranges.P95) {
                content += `Tu AMB está en el percentil 50 o superior (${ranges.P50}–${ranges.P95} cm²) para ${gender === 'masculino' ? 'hombres' : 'mujeres'} de ${ageRange} años. Esto indica una masa muscular del brazo saludable, adecuada para actividades diarias y buena condición física. Mantén un estilo de vida activo para preservar esta musculatura. `;
            } else {
                content += `Tu AMB está por encima del percentil 95 (${ranges.P95} cm²) para ${gender === 'masculino' ? 'hombres' : 'mujeres'} de ${ageRange} años. Tienes una musculatura del brazo excepcionalmente alta, comparable a atletas entrenados. Si no eres deportista, evalúa con un profesional para asegurar que tu entrenamiento sea equilibrado y no cause desproporciones. `;
            }
        }

        content += 'El AMB es un indicador de la masa muscular del tren superior, esencial para actividades diarias, deportes y prevención de sarcopenia (pérdida muscular por envejecimiento). Mantener un AMB saludable mejora la fuerza, la postura y la calidad de vida. ';
    } else {
        content += 'No calculado debido a datos insuficientes (falta AMB, edad o género). Asegúrate de proporcionar circunferencia del brazo contraído, pliegue tricipital, edad y género. ';
    }
    content += '</p>';

    // Masa Ósea Explanation
    content += '<h4>Masa Ósea</h4>';
    content += '<p><strong>Masa Ósea:</strong> Peso estimado de tus huesos, calculado con la fórmula de Rocha. Una masa ósea saludable soporta la estructura corporal y reduce el riesgo de osteoporosis. ';
    if (!isNaN(results.masaOsea) && data.peso && data.edad && ['masculino', 'femenino'].includes(data.genero)) {
        const boneMassPct = (results.masaOsea / data.peso) * 100;
        const age = Number(data.edad);
        const gender = data.genero;
        const isAthlete = data.esDeportista === 'si';
        content += `Tu masa ósea es ${formatResult(results.masaOsea, 1)} kg, que representa ${formatResult(boneMassPct, 1)}% de tu peso corporal. `;

        // Define boneMassRanges for explanation
        const boneMassRanges = {
            masculino: {
                '15-19': [14, 15],
                '20-29': [14, 15],
                '30-39': [13.5, 14.5],
                '40-49': [13, 14],
                '50-59': [12, 13.5],
                '60-69': [11.5, 13],
                '70+': [11, 12.5],
                athlete: [15, 16]
            },
            femenino: {
                '15-19': [12, 13.5],
                '20-29': [12, 13.5],
                '30-39': [11.5, 13],
                '40-49': [11, 12.5],
                '50-59': [10.5, 12],
                '60-69': [10, 11.5],
                '70+': [9.5, 11],
                athlete: [13, 14]
            }
        };

        // Determine age range
        let boneAgeRange;
        if (age >= 15 && age <= 19) boneAgeRange = '15-19';
        else if (age <= 29) boneAgeRange = '20-29';
        else if (age <= 39) boneAgeRange = '30-39';
        else if (age <= 49) boneAgeRange = '40-49';
        else if (age <= 59) boneAgeRange = '50-59';
        else if (age <= 69) boneAgeRange = '60-69';
        else boneAgeRange = '70+';

        // Select ranges
        const boneRanges = isAthlete ? boneMassRanges[gender].athlete : boneMassRanges[gender][boneAgeRange];
        const [min, max] = boneRanges;

        // Interpret bone mass
        if (boneMassPct >= min && boneMassPct <= max) {
            content += `Estás en un rango saludable (${min}–${max}%) para ${isAthlete ? 'deportistas' : 'adultos'} ${gender === 'masculino' ? 'hombres' : 'mujeres'} de ${boneAgeRange === '70+' ? '70 años o más' : boneAgeRange + ' años'}. `;
            content += isAthlete ? 'Esto refleja una densidad ósea sólida, común en deportes de fuerza o impacto.' : 'Esto indica buena salud ósea para tu edad y sexo.';
        } else if (boneMassPct < min) {
            content += `Estás por debajo del rango saludable (${min}–${max}%) para ${isAthlete ? 'deportistas' : 'adultos'} ${gender === 'masculino' ? 'hombres' : 'mujeres'} de ${boneAgeRange === '70+' ? '70 años o más' : boneAgeRange + ' años'}. `;
            content += 'Una masa ósea baja puede aumentar el riesgo de osteoporosis o fracturas, especialmente si eres mayor o mujer postmenopáusica. Considera ejercicios de resistencia (como pesas) y una dieta rica en calcio y vitamina D. Consulta a un profesional para evaluar tu densidad ósea.';
        } else {
            content += `Estás por encima del rango saludable (${min}–${max}%) para ${isAthlete ? 'deportistas' : 'adultos'} ${gender === 'masculino' ? 'hombres' : 'mujeres'} de ${boneAgeRange === '70+' ? '70 años o más' : boneAgeRange + ' años'}. `;
            content += 'Valores muy altos son raros y podrían indicar condiciones óseas inusuales o un cálculo afectado por medidas antropométricas. Consulta a un profesional para una evaluación precisa (ej., densitometría ósea).';
        }
        if (age >= 50 && gender === 'femenino') {
            content += ' Como mujer mayor de 50 años, estás en una etapa de mayor riesgo de pérdida ósea debido a la menopausia. Ejercicios de impacto moderado (caminar, saltar) y suplementos de calcio/vitamina D pueden ser clave.';
        } else if (age >= 60) {
            content += ' A partir de los 60 años, la pérdida ósea es más pronunciada. Mantén un estilo de vida activo con ejercicios de resistencia y una dieta equilibrada para proteger tu salud ósea.';
        } else if (age <= 29) {
            content += ' Estás en la etapa de pico de masa ósea. Aprovecha para fortalecer tus huesos con ejercicios de fuerza e impacto, ya que esto beneficia tu salud ósea a largo plazo.';
        }
        content += ' La masa ósea es crucial para la integridad estructural, la prevención de fracturas y la calidad de vida. Factores como el ejercicio (especialmente de fuerza o impacto), la ingesta de calcio/vitamina D y evitar el sedentarismo son esenciales para mantenerla.';
    } else {
        content += 'No calculado debido a datos insuficientes (falta masa ósea, peso, edad o género). Asegúrate de proporcionar altura, diámetros de muñeca y fémur, peso, edad y género.';
    }
    content += '</p>';

			
			// Masa Muscular Total (MMT)
			content += '<h4>Masa Muscular Total (MMT) Estimada</h4>';
			content += '<p><strong>Definición:</strong> La MMT estima la masa muscular esquelética total, clave para el movimiento, el metabolismo y la salud general. Calculada a partir de la altura y el área muscular del brazo (AMB).</p>';
			
				content += '<p><strong>Fórmula y Validación Científica:</strong> Una fórmula comúnmente referenciada para estimar la Masa Muscular Total (MMT) es una adaptación de los trabajos de <strong>Martin et al. (1990)</strong>, expresada como: <code>MMT = altura (cm) * (0.0264 + (sedentarios=0.0024/dxtistas=0.0029) * AMB (cm²))</code>. La validez y aplicabilidad de este tipo de estimaciones han sido investigadas y apoyadas por estudios posteriores, como los de <strong>Lee et al. (2000)</strong>, y cuentan con el respaldo de investigadores reconocidos en el campo de la composición corporal como <strong>Heymsfield y Clarys</strong>.</p>'

				content += '<p><strong>Valores de Referencia:</strong> Los valores de referencia para la MMT son fundamentales para su interpretación y se suelen expresar mediante percentiles (por ejemplo, P5, P50, P95). Estos valores para la población general se derivan principalmente de investigaciones poblacionales amplias, como las realizadas por <strong>Janssen et al. (2000)</strong> y <strong>Lee et al. (2000)</strong>. En el contexto deportivo, los trabajos de <strong>Martin y Drinkwater</strong> son fuentes importantes para establecer rangos de referencia en atletas (p. ej., P50, P75, P90), reconociendo las adaptaciones musculares específicas del entrenamiento.</p>'

				content += '<p><strong>Ajustes Específicos por Deporte:</strong> En la evaluación de atletas, a veces se consideran ajustes o interpretaciones específicas del AMB y la MMT según la disciplina deportiva. Por ejemplo, se ha sugerido la aplicación de factores ligeramente diferentes en la estimación de la densidad muscular o en la interpretación de los componentes del área del brazo (ej., utilizando multiplicadores como 0.0030 para deportes de fuerza o 0.0028 para deportes de resistencia en ciertos cálculos indirectos). Es importante destacar que, si bien estos ajustes se basan en principios fisiológicos y observaciones de expertos como <strong>Martin y Drinkwater</strong>, pueden ser extrapolaciones prácticas y no siempre estar validados como fórmulas universales en un único estudio para cada modalidad deportiva específica.</p>'

				content += '<p><strong>Contexto Explicativo: Sarcopenia y Salud Metabólica:</strong> La MMT no solo es relevante para el rendimiento físico, sino que es un indicador crucial de la salud metabólica general. Niveles adecuados de masa muscular son protectores contra diversas condiciones metabólicas. En el ámbito clínico, la MMT es de especial interés en el diagnóstico y seguimiento de la sarcopenia (pérdida de masa y función muscular asociada al envejecimiento o a enfermedades crónicas). La importancia de la masa muscular para la salud y la prevención de la sarcopenia está ampliamente respaldada por la literatura científica, incluyendo trabajos de <strong>Janssen et al. (2002)</strong>, <strong>Roubenoff</strong>, y <strong>Baumgartner</strong>, con aportaciones significativas de investigadores como <strong>Lee y Ross</strong> sobre el papel del músculo esquelético en la salud metabólica y la longevidad.</p>'

				

			if (!isNaN(results.mmt)) {
				const mmtKg = formatResult(results.mmt, 1);
				const mmtPct = formatResult((results.mmt / data.peso) * 100, 1);
				content += `<p><strong>Tu MMT:</strong> ${mmtKg} kg (${mmtPct}% de tu peso corporal).</p>`;

				// Determine age range
				const age = Number(data.edad);
				let ageRange;
				if (age >= 18 && age <= 24) ageRange = '18-24';
				else if (age <= 34) ageRange = '25-34';
				else if (age <= 44) ageRange = '35-44';
				else if (age <= 54) ageRange = '45-54';
				else if (age <= 64) ageRange = '55-64';
				else if (age <= 74) ageRange = '65-74';
				else ageRange = '>75';

				// Reference values (from Tabla Educativa)
				const referenceValues = {
					'masculino': {
						'18-24': { p5: 22.5, p50: 30.0, p95: 37.0, athlete: { p50: [33, 36], p75: [36, 40], p90: [40, 45] } },
						'25-34': { p5: 22.0, p50: 29.5, p95: 36.5, athlete: { p50: [32, 35], p75: [35, 39], p90: [39, 44] } },
						'35-44': { p5: 21.0, p50: 28.5, p95: 35.0, athlete: { p50: [30, 33], p75: [33, 37], p90: [37, 42] } },
						'45-54': { p5: 19.5, p50: 27.0, p95: 33.0, athlete: { p50: [28, 31], p75: [31, 35], p90: [35, 40] } },
						'55-64': { p5: 18.0, p50: 25.0, p95: 30.5, athlete: { p50: [26, 29], p75: [29, 33], p90: [33, 38] } },
						'65-74': { p5: 16.5, p50: 23.0, p95: 28.0, athlete: { p50: [24, 27], p75: [27, 31], p90: [31, 35] } },
						'>75': { p5: 15.0, p50: 21.0, p95: 26.5, athlete: { p50: [24, 27], p75: [27, 31], p90: [31, 35] } }
					},
					'femenino': {
						'18-24': { p5: 15.5, p50: 21.0, p95: 27.5, athlete: { p50: [22, 25], p75: [25, 28], p90: [28, 32] } },
						'25-34': { p5: 15.0, p50: 20.7, p95: 27.2, athlete: { p50: [21, 24], p75: [24, 27], p90: [27, 31] } },
						'35-44': { p5: 14.4, p50: 20.0, p95: 26.5, athlete: { p50: [20, 23], p75: [23, 26], p90: [26, 30] } },
						'45-54': { p5: 13.6, p50: 19.0, p95: 25.0, athlete: { p50: [19, 22], p75: [22, 25], p90: [25, 29] } },
						'55-64': { p5: 12.7, p50: 18.0, p95: 23.7, athlete: { p50: [18, 21], p75: [21, 24], p90: [24, 28] } },
						'65-74': { p5: 11.5, p50: 16.7, p95: 22.0, athlete: { p50: [17, 20], p75: [20, 23], p90: [23, 27] } },
						'>75': { p5: 10.5, p50: 15.5, p95: 20.5, athlete: { p50: [17, 20], p75: [20, 23], p90: [23, 27] } }
					}
				};

				const isAthlete = data.es_deportista === 'si';
				const refs = referenceValues[data.genero][ageRange];

				// Compare MMT to references
				content += `<p><strong>Comparación con Valores de Referencia (Edad ${ageRange}, ${data.genero}):</strong></p>`;
				content += '<ul>';
				if (!isAthlete) {
					content += `<li><strong>Población General:</strong> Tu MMT de ${mmtKg} kg está `;
					if (results.mmt < refs.p5) {
						content += `por debajo del percentil 5 (${refs.p5} kg). Esto sugiere una masa muscular baja; considera entrenamiento de fuerza para mejorar tu salud y prevenir fragilidad.`;
					} else if (results.mmt >= refs.p5 && results.mmt <= refs.p50) {
						content += `entre los percentiles 5 y 50 (${refs.p5}–${refs.p50} kg), indicando una masa muscular promedio o baja. Entrenamiento regular puede optimizar tu salud metabólica.`;
					} else if (results.mmt > refs.p50 && results.mmt <= refs.p95) {
						content += `entre los percentiles 50 y 95 (${refs.p50}–${refs.p95} kg), indicando una masa muscular promedio o alta, adecuada para la mayoría de las personas.`;
					} else {
						content += `por encima del percentil 95 (${refs.p95} kg). Esto es poco común en no deportistas; consulta con un profesional para evaluar tu composición corporal.`;
					}
					content += '</li>';
				} else {
					content += `<li><strong>Deportistas:</strong> Tu MMT de ${mmtKg} kg está `;
					const [p50Low, p50High] = refs.athlete.p50;
					const [p75Low, p75High] = refs.athlete.p75;
					const [p90Low, p90High] = refs.athlete.p90;
					if (results.mmt < p50Low) {
						content += `por debajo del rango recreativo (${p50Low}–${p50High} kg). Considera aumentar tu masa muscular, especialmente si practicas deportes de fuerza o potencia.`;
					} else if (results.mmt >= p50Low && results.mmt <= p75High) {
						content += `en el rango recreativo a competitivo (${p50Low}–${p75High} kg), adecuado para muchos deportes. Ideal para deportes de resistencia o mixtos.`;
					} else if (results.mmt > p75High && results.mmt <= p90High) {
						content += `en el rango competitivo a alto rendimiento (${p75Low}–${p90High} kg), típico en deportes de fuerza o potencia (e.g., halterofilia, rugby).`;
					} else {
						content += `por encima del rango de alto rendimiento (${p90High} kg). Esto es excepcional; consulta con un entrenador para optimizar tu rendimiento.`;
					}
					content += '</li>';
				}
				content += '</ul>';

				// Reference table (simplified for display)
				content += `<p><strong>Valores de Referencia (kg):</strong></p>`;
				content += `<table style="width:100%; border-collapse: collapse; margin: 10px 0;">
					<tr style="background-color: #f2f2f2;">
						<th>Grupo</th>
						<th>P5</th>
						<th>P50</th>
						<th>P95</th>
						${isAthlete ? '<th>Atletas P50</th><th>Atletas P75</th><th>Atletas P90</th>' : ''}
					</tr>
					<tr>
						<td>${isAthlete ? 'Atletas' : 'General'}</td>
						<td>${refs.p5}</td>
						<td>${refs.p50}</td>
						<td>${refs.p95}</td>
						${isAthlete ? `<td>${refs.athlete.p50[0]}–${refs.athlete.p50[1]}</td>
									   <td>${refs.athlete.p75[0]}–${refs.athlete.p75[1]}</td>
									   <td>${refs.athlete.p90[0]}–${refs.athlete.p90[1]}</td>` : ''}
					</tr>
				</table>`;

				// Percentage-based feedback (secondary)
				content += `<p><strong>Porcentaje de Peso Corporal:</strong> `;
				if (data.genero === 'masculino') {
					if (isAthlete) {
						if (results.mmt / data.peso >= 0.45 && results.mmt / data.peso <= 0.55) {
							content += `Tu MMT (${mmtPct}%) está en el rango saludable para deportistas hombres (45–55%). `;
						} else if (results.mmt / data.peso < 0.45) {
							content += `Tu MMT (${mmtPct}%) está por debajo del rango saludable para deportistas hombres (45–55%). `;
						} else {
							content += `Tu MMT (${mmtPct}%) está por encima del rango saludable para deportistas hombres (45–55%). `;
						}
					} else {
						if (results.mmt / data.peso >= 0.38 && results.mmt / data.peso <= 0.48) {
							content += `Tu MMT (${mmtPct}%) está en el rango saludable para hombres no deportistas (38–48%). `;
						} else if (results.mmt / data.peso < 0.38) {
							content += `Tu MMT (${mmtPct}%) está por debajo del rango saludable para hombres no deportistas (38–48%). `;
						} else {
							content += `Tu MMT (${mmtPct}%) está por encima del rango saludable para hombres no deportistas (38–48%). `;
						}
					}
				} else {
					if (isAthlete) {
						if (results.mmt / data.peso >= 0.35 && results.mmt / data.peso <= 0.45) {
							content += `Tu MMT (${mmtPct}%) está en el rango saludable para deportistas mujeres (35–45%). `;
						} else if (results.mmt / data.peso < 0.35) {
							content += `Tu MMT (${mmtPct}%) está por debajo del rango saludable para deportistas mujeres (35–45%). `;
						} else {
							content += `Tu MMT (${mmtPct}%) está por encima del rango saludable para deportistas mujeres (35–45%). `;
						}
					} else {
						if (results.mmt / data.peso >= 0.30 && results.mmt / data.peso <= 0.40) {
							content += `Tu MMT (${mmtPct}%) está en el rango saludable para mujeres no deportistas (30–40%). `;
						} else if (results.mmt / data.peso < 0.30) {
							content += `Tu MMT (${mmtPct}%) está por debajo del rango saludable para mujeres no deportistas (30–40%). `;
						} else {
							content += `Tu MMT (${mmtPct}%) está por encima del rango saludable para mujeres no deportistas (30–40%). `;
						}
					}
				}
				content += `Estos porcentajes son orientativos y varían según el tipo de deporte y objetivos personales.</p>`;

				// Educational notes
				content += `<p><strong>Consideraciones Clave:</strong></p>`;
				content += `<ul>
					<li><strong>Tipo de Deporte:</strong> Los deportes de fuerza/potencia (e.g., halterofilia, rugby) requieren mayor MMT, mientras que los de resistencia (e.g., ciclismo, running) tienden a valores intermedios. Los deportes estéticos (e.g., gimnasia) buscan un equilibrio.</li>
					<li><strong>Edad y Sarcopenia:</strong> A partir de los 40–50 años, la masa muscular puede disminuir (sarcopenia) si no se mantiene con ejercicio. Para mayores de 55, mantener MMT es crucial para la movilidad y prevención de caídas.</li>
					<li><strong>Salud Metabólica:</strong> Una MMT adecuada mejora la sensibilidad a la insulina, el metabolismo y reduce el riesgo de fragilidad o problemas metabólicos.</li>
					<li><strong>Consulta Profesional:</strong> Si tu MMT está fuera de los rangos, consulta con un entrenador o nutricionista para personalizar tu plan de entrenamiento o dieta.</li>
				</ul>`;
			} else {
				content += `<p><strong>Tu MMT:</strong> No calculado debido a datos insuficientes (falta altura, circunferencia del brazo o pliegue tricipital).</p>`;
			}

            // Masa Residual
				// Masa Residual Explanation
    content += '<h4>Masa Residual</h4>';
    content += '<p><strong>Masa Residual:</strong> La Masa Residual (MR) representa el peso de órganos vitales (corazón, hígado, riñones), líquidos corporales (sangre, linfa) y tejidos conectivos, excluyendo grasa, músculo y hueso. ';
    if (!isNaN(results.masaResidual) && data.peso && ['masculino', 'femenino'].includes(data.genero) && data.edad) {
        const mr = results.masaResidual;
        const mrPercent = (mr / data.peso * 100);
        const age = Number(data.edad);
        const gender = data.genero;
        const isAthlete = data.esDeportista === 'si';
        const isObese = results.esObeso || false;
        const activityLevel = isAthlete ? 'athlete' : (data.esDeportista === 'no' ? 'sedentary' : 'active');
        const ageGroup = age <= 24 ? '18-24' : age <= 44 ? '25-44' : age <= 64 ? '45-64' : '65+';

        // Define mrRanges
        const mrRanges = {
            masculino: {
                '18-24': { sedentary: { min: 22, max: 24 }, active: { min: 23, max: 25 }, athlete: { min: 24, max: 26 } },
                '25-44': { sedentary: { min: 21, max: 23 }, active: { min: 22, max: 24 }, athlete: { min: 23, max: 25 } },
                '45-64': { sedentary: { min: 20, max: 22 }, active: { min: 21, max: 23 }, athlete: { min: 22, max: 24 } },
                '65+': { sedentary: { min: 19, max: 21 }, active: { min: 20, max: 22 }, athlete: { min: 21, max: 23 } }
            },
            femenino: {
                '18-24': { sedentary: { min: 19, max: 21 }, active: { min: 20, max: 22 }, athlete: { min: 21, max: 23 } },
                '25-44': { sedentary: { min: 18, max: 20 }, active: { min: 19, max: 21 }, athlete: { min: 20, max: 22 } },
                '45-64': { sedentary: { min: 17, max: 19 }, active: { min: 18, max: 20 }, athlete: { min: 19, max: 21 } },
                '65+': { sedentary: { min: 16, max: 18 }, active: { min: 17, max: 19 }, athlete: { min: 18, max: 20 } }
            }
        };

        const ranges = mrRanges[gender][ageGroup][activityLevel];
        const mrStatus = mrPercent < ranges.min ? 'bajo' : mrPercent > ranges.max ? 'alto' : 'típico';
        content += `Tu MR es ${formatResult(mr, 1)} kg, equivalente al ${formatResult(mrPercent, 1)}% de tu peso corporal. Es esencial para funciones metabólicas (p. ej., actividad de órganos), equilibrio de fluidos y soporte estructural, contribuyendo al gasto energético basal. Tu MR está ${mrStatus} para ${gender === 'masculino' ? 'hombres' : 'mujeres'} de ${ageGroup} años con un nivel de actividad ${activityLevel === 'sedentary' ? 'sedentario' : activityLevel === 'active' ? 'activo' : 'deportista'} (rango típico: ${ranges.min}–${ranges.max}%). `;
        if (mrPercent < ranges.min) {
            content += 'Una MR baja puede indicar déficits nutricionales o menor resiliencia metabólica. Asegúrate de consumir suficientes calorías y micronutrientes (ej., frutas, verduras) y mantén una hidratación adecuada (2–3 L de agua al día).';
        } else if (mrPercent > ranges.max) {
            content += 'Una MR alta puede deberse a adaptaciones atléticas o cálculos antropométricos. Si no eres deportista, consulta a un profesional para evaluar tu composición corporal.';
        }
        content += ' La MR es un componente fijo pero crítico para la salud metabólica. Una dieta equilibrada y un estilo de vida activo ayudan a mantener su función.';
    } else {
        content += 'No calculado debido a datos insuficientes (falta masa residual, peso, género o edad). Asegúrate de proporcionar peso, género y edad.';
    }
    content += '</p>';
	
	
			 // Sugerencias y Consideraciones Personalizadas
			content += '<h4>Sugerencias y Consideraciones Personalizadas</h4>';
			content += '<p>Basado en tus resultados de Área Muscular Brazo (AMB), Masa Ósea y Masa Residual (MR), aquí tienes recomendaciones personalizadas para optimizar tu salud y rendimiento:</p>';
			content += '<ul>';

    // AMB Suggestions
    if (!isNaN(results.amb) && data.edad && ['masculino', 'femenino'].includes(data.genero)) {
        const startTime = performance.now();
        const age = Number(data.edad);
        const gender = data.genero;
        const isAthlete = data.esDeportista === 'si';
        const isObese = results.esObeso || false;
        const ageGroup = age >= 45 ? '45+' : '18-44';

        // Define age range
        let ageRange;
        if (age >= 18 && age <= 20) ageRange = '18-20';
        else if (age <= 24) ageRange = '21-24';
        else if (age <= 29) ageRange = '25-29';
        else if (age <= 34) ageRange = '30-34';
        else if (age <= 39) ageRange = '35-39';
        else if (age <= 44) ageRange = '40-44';
        else if (age <= 49) ageRange = '45-49';
        else if (age <= 54) ageRange = '50-54';
        else if (age <= 59) ageRange = '55-59';
        else if (age <= 64) ageRange = '60-64';
        else if (age <= 70) ageRange = '65-70';
        else ageRange = '70+';

        // Define ambRanges for suggestions
        const ambRanges = {
            masculino: {
                general: {
                    '18-20': { P5: 23.4, P50: 30.4, P95: 39.6 },
                    '21-24': { P5: 23.6, P50: 30.6, P95: 39.8 },
                    '25-29': { P5: 23.8, P50: 31.0, P95: 40.0 },
                    '30-34': { P5: 23.5, P50: 30.6, P95: 39.8 },
                    '35-39': { P5: 22.9, P50: 29.9, P95: 39.0 },
                    '40-44': { P5: 22.6, P50: 29.5, P95: 38.5 },
                    '45-49': { P5: 21.8, P50: 28.5, P95: 37.3 },
                    '50-54': { P5: 21.2, P50: 27.9, P95: 36.5 },
                    '55-59': { P5: 20.6, P50: 27.1, P95: 35.5 },
                    '60-64': { P5: 20.2, P50: 26.4, P95: 34.7 },
                    '65-70': { P5: 19.0, P50: 25.0, P95: 33.0 },
                    '70+': { P5: 16.5, P50: 21.9, P95: 29.0 }
                },
                athlete: {
                    '18-20': { P50: 30.5, P75: 34.5, P90: 40.5 },
                    '21-24': { P50: 30.8, P75: 34.8, P90: 41.0 },
                    '25-29': { P50: 31.2, P75: 35.2, P90: 41.5 },
                    '30-34': { P50: 30.8, P75: 34.7, P90: 41.0 },
                    '35-39': { P50: 30.0, P75: 33.8, P90: 40.0 },
                    '40-44': { P50: 29.6, P75: 33.3, P90: 39.5 },
                    '45-49': { P50: 28.7, P75: 32.1, P90: 38.3 },
                    '50-54': { P50: 28.1, P75: 31.5, P90: 37.5 },
                    '55-59': { P50: 27.2, P75: 30.5, P90: 36.4 },
                    '60-64': { P50: 26.5, P75: 29.7, P90: 35.5 },
                    '65-70': { P50: 25.0, P75: 28.2, P90: 34.0 },
                    '70+': { P50: 21.9, P75: 25.2, P90: 30.0 }
                }
            },
            femenino: {
                general: {
                    '18-20': { P5: 17.7, P50: 22.6, P95: 28.8 },
                    '21-24': { P5: 17.9, P50: 22.8, P95: 29.1 },
                    '25-29': { P5: 18.0, P50: 23.2, P95: 29.8 },
                    '30-34': { P5: 17.8, P50: 22.9, P95: 29.4 },
                    '35-39': { P5: 17.3, P50: 22.4, P95: 29.0 },
                    '40-44': { P5: 17.1, P50: 22.2, P95: 28.8 },
                    '45-49': { P5: 16.6, P50: 21.8, P95: 28.4 },
                    '50-54': { P5: 16.3, P50: 21.4, P95: 27.9 },
                    '55-59': { P5: 15.8, P50: 21.0, P95: 27.4 },
                    '60-64': { P5: 15.4, P50: 20.5, P95: 26.8 },
                    '65-70': { P5: 14.7, P50: 19.5, P95: 25.6 },
                    '70+': { P5: 13.2, P50: 17.7, P95: 23.5 }
                },
                athlete: {
                    '18-20': { P50: 22.7, P75: 25.8, P90: 30.5 },
                    '21-24': { P50: 22.9, P75: 26.0, P90: 31.0 },
                    '25-29': { P50: 23.3, P75: 26.5, P90: 31.5 },
                    '30-34': { P50: 23.0, P75: 26.2, P90: 31.0 },
                    '35-39': { P50: 22.5, P75: 25.5, P90: 30.2 },
                    '40-44': { P50: 22.2, P75: 25.1, P90: 29.7 },
                    '45-49': { P50: 21.8, P75: 24.6, P90: 29.0 },
                    '50-54': { P50: 21.4, P75: 24.1, P90: 28.4 },
                    '55-59': { P50: 21.0, P75: 23.6, P90: 27.8 },
                    '60-64': { P50: 20.5, P75: 22.9, P90: 27.0 },
                    '65-70': { P50: 19.5, P75: 21.8, P90: 25.6 },
                    '70+': { P50: 17.7, P75: 20.0, P90: 24.0 }
                }
            }
        };

        // Select ranges
        const ranges = isAthlete ? ambRanges[gender].athlete[ageRange] : ambRanges[gender].general[ageRange];

        content += '<li><strong>Área Muscular Brazo (AMB):</strong> ';
        if (isAthlete) {
            if (results.amb < ranges.P50) {
                content += `Tu AMB está por debajo del promedio para deportistas. Inicia un programa de entrenamiento de fuerza (ej., levantamiento de pesas, ejercicios con bandas elásticas) enfocado en el tren superior, 2–3 veces por semana. Asegura una ingesta de proteínas de 1.6–2.2 g/kg de peso corporal al día para apoyar el crecimiento muscular. Consulta a un entrenador para optimizar tu rendimiento.`;
            } else if (results.amb >= ranges.P50 && results.amb < ranges.P75) {
                content += `Tu AMB es adecuado para deportistas recreativos. Mantén tu entrenamiento de fuerza regular (2–3 sesiones semanales) y considera aumentar la intensidad para alcanzar niveles competitivos. Una dieta con 1.4–2.0 g/kg de proteínas diarias apoyará tu musculatura.`;
            } else if (results.amb >= ranges.P75 && results.amb < ranges.P90) {
                content += `Tu AMB es sólido, comparable a deportistas competitivos. Continúa con un entrenamiento estructurado, incluyendo ejercicios de fuerza y movilidad, para mantener este nivel. Asegura 1.6–2.0 g/kg de proteínas diarias y considera trabajar con un nutricionista para optimizar recuperación.`;
            } else {
                content += `Tu AMB es excepcional, típico de deportistas de élite. Enfócate en un entrenamiento equilibrado para evitar lesiones, combinando fuerza, flexibilidad y recuperación. Una dieta con 1.6–2.2 g/kg de proteínas y consulta con un profesional ayudarán a maximizar tu rendimiento.`;
            }
        } else {
            if (results.amb < ranges.P5) {
                content += `Tu AMB es muy bajo, lo que aumenta el riesgo de sarcopenia${ageGroup === '45+' ? ', especialmente crítico a tu edad' : ''}. Inicia un programa supervisado de entrenamiento de fuerza (ej., pesas ligeras, ejercicios de resistencia) 2–3 veces por semana. Consume 1.2–1.6 g/kg de proteínas al día (ej., pollo, legumbres, lácteos) y consulta a un nutricionista para apoyar la ganancia muscular.`;
            } else if (results.amb >= ranges.P5 && results.amb < ranges.P50) {
                content += `Tu AMB es inferior al promedio. Incorpora ejercicios de fuerza (ej., flexiones, pesas) 2–3 veces por semana para mejorar tu musculatura. Asegura 1.0–1.4 g/kg de proteínas diarias. ${ageGroup === '45+' ? 'Esto es clave para prevenir sarcopenia.' : ''}`;
            } else if (results.amb >= ranges.P50 && results.amb < ranges.P95) {
                content += `Tu AMB es saludable. Mantén un estilo de vida activo con ejercicios de fuerza regulares (2–3 veces por semana) y una dieta equilibrada con 1.0–1.2 g/kg de proteínas para preservar tu musculatura. ${ageGroup === '45+' ? 'Esto ayuda a prevenir sarcopenia.' : ''}`;
            } else {
                content += `Tu AMB es excepcionalmente alto. Si no eres deportista, evalúa con un profesional para asegurar que tu entrenamiento sea equilibrado y evite desproporciones. Mantén 1.0–1.4 g/kg de proteínas diarias y ejercicios variados (fuerza y movilidad).`;
            }
        }
        if (isObese) {
            content += ` Dado tu estado de obesidad, prioriza ejercicios de fuerza para preservar músculo mientras reduces grasa. Una dieta controlada en calorías con alto contenido proteico es esencial.`;
        }
        content += '</li>';
        console.log(`AMB suggestions took ${performance.now() - startTime}ms`);
    } else {
        content += '<li><strong>Área Muscular Brazo (AMB):</strong> No calculado. Proporciona datos de circunferencia del brazo, pliegue tricipital, edad y género para recibir recomendaciones personalizadas.</li>';
    }

    // Masa Ósea Suggestions
    if (!isNaN(results.masaOsea) && data.peso && data.edad && ['masculino', 'femenino'].includes(data.genero)) {
        const startTime = performance.now();
        const boneMassPct = (results.masaOsea / data.peso) * 100;
        const age = Number(data.edad);
        const gender = data.genero;
        const isAthlete = data.esDeportista === 'si';

        // Define boneMassRanges for suggestions
        const boneMassRanges = {
            masculino: {
                '15-19': [14, 15],
                '20-29': [14, 15],
                '30-39': [13.5, 14.5],
                '40-49': [13, 14],
                '50-59': [12, 13.5],
                '60-69': [11.5, 13],
                '70+': [11, 12.5],
                athlete: [15, 16]
            },
            femenino: {
                '15-19': [12, 13.5],
                '20-29': [12, 13.5],
                '30-39': [11.5, 13],
                '40-49': [11, 12.5],
                '50-59': [10.5, 12],
                '60-69': [10, 11.5],
                '70+': [9.5, 11],
                athlete: [13, 14]
            }
        };

        // Define boneAgeRange
        const boneAgeRange = age >= 15 && age <= 19 ? '15-19' : 
                             age <= 29 ? '20-29' : 
                             age <= 39 ? '30-39' : 
                             age <= 49 ? '40-49' : 
                             age <= 59 ? '50-59' : 
                             age <= 69 ? '60-69' : '70+';

        // Select ranges
        const boneRanges = isAthlete ? boneMassRanges[gender].athlete : boneMassRanges[gender][boneAgeRange];
        const [min, max] = boneRanges;

        content += '<li><strong>Masa Ósea:</strong> ';
        if (boneMassPct < min) {
            content += `Tu masa ósea está por debajo del rango saludable. Incorpora ejercicios de impacto y resistencia (ej., caminar rápido, levantar pesas) 3–4 veces por semana. Asegura 1000–1200 mg de calcio al día (ej., lácteos, brócoli) y 800–1000 IU de vitamina D. Consulta a un médico para evaluar tu densidad ósea, especialmente si eres mayor o mujer postmenopáusica.`;
        } else if (boneMassPct >= min && boneMassPct <= max) {
            content += `Tu masa ósea está en un rango saludable. Mantén ejercicios de impacto moderado (ej., caminar, saltar) y resistencia 3–4 veces por semana, junto con 1000 mg de calcio y 600–800 IU de vitamina D diarios para preservar tu salud ósea.`;
        } else {
            content += `Tu masa ósea está por encima del rango saludable, lo cual es raro. Consulta a un profesional para una evaluación precisa (ej., densitometría ósea) y asegúrate de mantener una dieta equilibrada con 1000 mg de calcio y 600–800 IU de vitamina D.`;
        }
        if (age >= 50 && gender === 'femenino') {
            content += ` Como mujer mayor de 50 años, prioriza ejercicios de impacto y una dieta rica en calcio para minimizar la pérdida ósea relacionada con la menopausia.`;
        } else if (age >= 60) {
            content += ` A partir de los 60 años, los ejercicios de resistencia son clave para prevenir la osteoporosis. Consulta a un profesional para un plan personalizado.`;
        }
        content += '</li>';
        console.log(`Masa Ósea suggestions took ${performance.now() - startTime}ms`);
    } else {
        content += '<li><strong>Masa Ósea:</strong> No calculado. Proporciona datos de altura, diámetros óseos, peso, edad y género para recomendaciones personalizadas.</li>';
    }

    // Masa Residual Suggestions
    if (!isNaN(results.masaResidual) && data.peso && ['masculino', 'femenino'].includes(data.genero) && data.edad) {
        const startTime = performance.now();
        const mr = results.masaResidual;
        const mrPercent = (mr / data.peso * 100);
        const age = Number(data.edad);
        const gender = data.genero;
        const isAthlete = data.esDeportista === 'si';
        const isObese = results.esObeso || false;
        const activityLevel = isAthlete ? 'athlete' : (data.esDeportista === 'no' ? 'sedentary' : 'active');
        const ageGroup = age <= 24 ? '18-24' : age <= 44 ? '25-44' : age <= 64 ? '45-64' : '65+';

        // Define mrRanges
        const mrRanges = {
            masculino: {
                '18-24': { sedentary: { min: 22, max: 24 }, active: { min: 23, max: 25 }, athlete: { min: 24, max: 26 } },
                '25-44': { sedentary: { min: 21, max: 23 }, active: { min: 22, max: 24 }, athlete: { min: 23, max: 25 } },
                '45-64': { sedentary: { min: 20, max: 22 }, active: { min: 21, max: 23 }, athlete: { min: 22, max: 24 } },
                '65+': { sedentary: { min: 19, max: 21 }, active: { min: 20, max: 22 }, athlete: { min: 21, max: 23 } }
            },
            femenino: {
                '18-24': { sedentary: { min: 19, max: 21 }, active: { min: 20, max: 22 }, athlete: { min: 21, max: 23 } },
                '25-44': { sedentary: { min: 18, max: 20 }, active: { min: 19, max: 21 }, athlete: { min: 20, max: 22 } },
                '45-64': { sedentary: { min: 17, max: 19 }, active: { min: 18, max: 20 }, athlete: { min: 19, max: 21 } },
                '65+': { sedentary: { min: 16, max: 18 }, active: { min: 17, max: 19 }, athlete: { min: 18, max: 20 } }
            }
        };

        const ranges = mrRanges[gender][ageGroup][activityLevel];

        content += '<li><strong>Masa Residual (MR):</strong> ';
        if (mrPercent < ranges.min) {
            content += `Tu MR está baja, lo que puede indicar déficits nutricionales o menor resiliencia metabólica. Adopta una dieta equilibrada con suficiente proteína (1.0–1.4 g/kg), micronutrientes (ej., frutas, verduras) y mantén una hidratación adecuada (2–3 L de agua al día). Consulta a un nutricionista para optimizar tu estado nutricional.`;
        } else if (mrPercent >= ranges.min && mrPercent <= ranges.max) {
            content += `Tu MR está en un rango saludable. Mantén una dieta equilibrada con proteínas, carbohidratos complejos y grasas saludables, junto con 2–3 L de agua diarios para apoyar la función de órganos y fluidos.`;
        } else {
            content += `Tu MR está alta, posiblemente debido a adaptaciones atléticas o cálculos antropométricos. Asegura una dieta balanceada y consulta a un profesional si no eres deportista para evaluar tu composición corporal.`;
        }
        if (isObese) {
            content += ` Dado tu estado de obesidad, una dieta controlada en calorías y ejercicio regular son esenciales para optimizar tu composición corporal sin comprometer la MR.`;
        }
        content += '</li>';
        console.log(`Masa Residual suggestions took ${performance.now() - startTime}ms`);
    } else {
        content += '<li><strong>Masa Residual (MR):</strong> No calculado. Proporciona datos de peso, género y edad para recomendaciones personalizadas.</li>';
    }

    content += '<li><strong>Consideraciones Generales:</strong> Consulta a un nutricionista, entrenador o médico para personalizar tu plan de entrenamiento y dieta según tus objetivos. Realiza evaluaciones antropométricas periódicas para monitorear tu progreso y ajustar estas recomendaciones.</li>';
    content += '</ul>';

    
	
	
            // Peso Ideal
			content += '<h3>Peso Ideal Estimado</h3>';
            content += '<p><strong>Peso Ideal:</strong> Peso estimado para alcanzar tu % de grasa deseado y/o estimado. ';
            if (!isNaN(results.pesoIdeal)) {
                content += 'Tu peso ideal es ' + formatResult(results.pesoIdeal, 1) + ' kg. ';
                content += 'Es un objetivo basado en tu composición corporal deseada. ';
                content += '<div class="chart-container"><canvas id="weight-chart" width="440" height="400" style="display: block; box-sizing: border-box; height: 400px; width: 440px;"></canvas></div>';
            } else {
                content += 'No calculado. ';
            }
            content += '</p>';

            // Peso a Perder/Ganar
            content += '<p><strong>Peso a Perder/Ganar:</strong> Diferencia entre tu peso ideal y el actual. ';
            if (!isNaN(results.pesoObjetivo)) {
                content += 'Tu peso actual es ' + formatResult(data.peso, 1) + ' kg y tu peso ideal es ' + formatResult(results.pesoIdeal, 1) + ' kg. ';
                if (results.pesoObjetivo > 0) {
                    content += 'Necesitas ganar ' + formatResult(results.pesoObjetivo, 1) + ' kg. Enfócate en ganar masa magra (músculo). ';
                } else if (results.pesoObjetivo < 0) {
                    content += 'Necesitas perder ' + formatResult(Math.abs(results.pesoObjetivo), 1) + ' kg. Enfócate en reducir grasa. ';
                } else {
                    content += 'Estás en tu peso ideal. ';
                }
            } else {
                content += 'No calculado. ';
            }
            content += '</p>';

           
            // Somatotipo
				content += '<h3>Estimacion del Somatotipo</h3>';
				if (!isNaN(results.endomorfia) && !isNaN(results.mesomorfia) && !isNaN(results.ectomorfia)) {
					content += '<p><strong>Somatotipo (Endomorfia, Mesomorfia, Ectomorfia):</strong> Tu somatotipo es ' + formatResult(results.endomorfia, 1) + '-' + formatResult(results.mesomorfia, 1) + '-' + formatResult(results.ectomorfia, 1) + '. ';
					let dominant = '';
					if (results.endomorfia > results.mesomorfia && results.endomorfia > results.ectomorfia) {
						dominant = 'endomorfo';
						content += 'Esto indica que tu componente dominante es Endomorfo, lo que sugiere una mayor facilidad para acumular grasa. ';
					} else if (results.mesomorfia > results.endomorfia && results.mesomorfia > results.ectomorfia) {
						dominant = 'mesomorfo';
						content += 'Esto indica que tu componente dominante es Mesomorfo, lo que sugiere una mayor facilidad para desarrollar musculatura. ';
					} else {
						dominant = 'ectomorfo';
						content += 'Esto indica que tu componente dominante es Ectomorfo, lo que sugiere una constitución más delgada y dificultad para ganar peso. ';
					}
					content += 'El somatotipo refleja tu predisposición genética y puede guiar tus estrategias de dieta y ejercicio. ';
					// Recomendaciones específicas según el somatotipo dominante
					content += 'Dado que tu componente dominante es ' + dominant + ', considera las siguientes recomendaciones específicas: ';
					if (dominant === 'ectomorfo') {
						content += 'Como ectomorfo, tu prioridad debería ser ganar masa muscular. Aumenta tu ingesta calórica con alimentos ricos en proteínas y carbohidratos complejos (como avena, arroz y batatas), y entrena con pesos pesados y pocas repeticiones (6-8 repeticiones por serie). ';
					} else if (dominant === 'mesomorfo') {
						content += 'Como mesomorfo, tienes una ventaja para desarrollar músculo y mantener un físico equilibrado. Mantén una dieta balanceada y un entrenamiento variado, alternando entre fuerza y resistencia para maximizar tu potencial. ';
					} else {
						content += 'Como endomorfo, tu enfoque debería ser controlar la grasa corporal. Incorpora más actividad cardiovascular (como caminar rápido o ciclismo) y asegúrate de mantener un déficit calórico moderado mientras consumes suficiente proteína para preservar tu masa muscular. ';
					}
					content += 'Independientemente de tu somatotipo, la clave es la consistencia y la personalización: ajusta tu plan según tus objetivos, nivel de actividad y respuesta corporal, y consulta a un profesional si necesitas orientación específica. ';
					// Añadir la imagen estática con un canvas superpuesto para el punto
					content += '</p><div class="chart-container" style="position: relative;"><img id="somatotype-image" src="https://fermagil.github.io/Nutri_Plan_v2/somatotype-chart.png" alt="Carta de Somatotipo" style="width: 100%; height: auto;"><canvas id="somatotype-point-canvas" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></canvas></div>';
				}
            

            // Sugerencias
            content += '<h3>Sugerencias para Mejorar tu Composición Corporal</h3>';
            let goal = '';
            if (!isNaN(results.pesoObjetivo)) {
                if (results.pesoObjetivo < -2) {
                    goal = 'perdida';
                    content += '<p><strong>Objetivo: Pérdida de grasa</strong></p>';
                    content += '<ul>';
                    content += '<li><strong>Dieta:</strong> Crea un déficit calórico moderado (300-500 kcal menos por día). Prioriza proteínas (2 g/kg de peso), vegetales, y grasas saludables. Reduce carbohidratos refinados.</li>';
                    content += '<li><strong>Ejercicio:</strong> Combina cardio (3-4 veces/semana, 30 min) y entrenamiento de fuerza (3-5 veces/semana) para preservar músculo. ';
                    if (isAthlete) content += '<li><strong>Para deportistas:</strong> Mantén un déficit pequeño para no afectar el rendimiento. Incluye ejercicios específicos para tu deporte.</li>';
                    content += '<li><strong>Hábitos:</strong> Duerme 7-8 horas, controla el estrés, y mantén una hidratación adecuada.</li>';
                    content += '</ul>';
                } else if (results.pesoObjetivo > 2) {
                    goal = 'ganancia';
                    content += '<p><strong>Objetivo: Ganancia muscular</strong></p>';
                    content += '<ul>';
                    content += '<li><strong>Dieta:</strong> Crea un superávit calórico moderado (300-500 kcal más por día). Aumenta proteínas (2-2.5 g/kg de peso) y carbohidratos complejos.</li>';
                    content += '<li><strong>Ejercicio:</strong> Enfócate en entrenamiento de fuerza progresivo (4-5 veces/semana). Incluye ejercicios compuestos (sentadillas, peso muerto, press).</li>';
                    if (isAthlete) content += '<li><strong>Para deportistas:</strong> Ajusta el superávit según demandas energéticas de tu deporte. Considera suplementos como creatina tras consultar un profesional.</li>';
                    content += '<li><strong>Hábitos:</strong> Descansa lo suficiente (7-8 horas) y optimiza la recuperación con estiramientos o masajes.</li>';
                    content += '</ul>';
                } else {
                    goal = 'mantenimiento';
                    content += '<p><strong>Objetivo: Mantenimiento</strong></p>';
                    content += '<ul>';
                    content += '<li><strong>Dieta:</strong> Mantén un balance calórico. Consume proteínas adecuadas (1.6-2 g/kg), carbohidratos y grasas balanceados.</li>';
                    content += '<li><strong>Ejercicio:</strong> Realiza entrenamiento de fuerza (3-4 veces/semana) y algo de cardio (2-3 veces/semana) para mantener salud y composición.</li>';
                    if (isAthlete) content += '<li><strong>Para deportistas:</strong> Ajusta la dieta y entrenamiento según las demandas de tu deporte para optimizar rendimiento.</li>';
                    content += '<li><strong>Hábitos:</strong> Prioriza sueño, hidratación, y manejo del estrés.</li>';
                    content += '</ul>';
                }
            } else {
                content += '<p><strong>Sin datos suficientes para sugerencias específicas.</strong> Completa más medidas para obtener recomendaciones personalizadas.</p>';
                content += '<ul>';
                content += '<li><strong>Dieta:</strong> Sigue una alimentación equilibrada con proteínas, carbohidratos complejos, grasas saludables y vegetales.</li>';
                content += '<li><strong>Ejercicio:</strong> Incluye fuerza y cardio moderados (3-5 veces/semana).</li>';
                content += '<li><strong>Hábitos:</strong> Duerme 7-8 horas, hidrátate y reduce el estrés.</li>';
                content += '</ul>';
            }

            // Explicación personalizada de somatotipo (reemplazo del bloque anterior)
			if (!isNaN(results.endomorfia) && !isNaN(results.mesomorfia) && !isNaN(results.ectomorfia)) {
				const cliente = {
					sexo: data.genero,
					edad: data.edad,
					esDeportista: data.es_deportista === 'si'
				};
				content += generateSomatotypeExplanation(results, cliente);
			}


            content += '<p><strong>Nota:</strong> Consulta a un nutricionista y/o entrenador personal para un plan personalizado. Los cambios deben ser graduales y supervisados.</p>';

            // Generar gráficas después de insertar el contenido
            setTimeout(() => {
		console.log('Elemento #imc-chart:', document.getElementById('imc-chart'));

		// Modern Chart.js Global Defaults for consistency
		Chart.defaults.font.family = '"Inter", sans-serif';
		Chart.defaults.font.size = 14;
		Chart.defaults.color = '#343a40'; // Dark text for labels

		// Gráfica de IMC
	   // Gráfica de IMC
	if (!isNaN(results.imc)) {
		const canvasIMC = document.getElementById('imc-chart');
		if (!canvasIMC) {
			console.error('Canvas #imc-chart no encontrado');
		} else {
        const ctxIMC = canvasIMC.getContext('2d');
        new Chart(ctxIMC, {
            type: 'bar',
            data: {
                labels: ['Bajo peso (<18.5)', 'Normal (18.5-24.9)', 'Sobrepeso (25-29.9)', 'Obesidad (≥30)'],
                datasets: [
                    {
                        label: 'Rangos IMC',
                        data: [18.5, 24.9, 29.9, 40],
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.3)', // Softer red
                            'rgba(40, 167, 69, 0.3)', // Green from weight chart
                            'rgba(255, 206, 86, 0.3)', // Softer yellow
                            'rgba(255, 99, 132, 0.5)', // Stronger red
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            '#28a745', // Green border
                            'rgba(255, 206, 86, 1)',
                            'rgba(255, 99, 132, 1)',
                        ],
                        borderWidth: 1,
                        barThickness: 40,
                    },
                    {
                        label: 'Tu IMC',
                        data: [0, 0, 0, 0].map((_, i) => {
                            if (i === 0 && results.imc < 18.5) return results.imc;
                            if (i === 1 && results.imc >= 18.5 && results.imc < 25) return results.imc;
                            if (i === 2 && results.imc >= 25 && results.imc < 30) return results.imc;
                            if (i === 3 && results.imc >= 30) return results.imc;
                            return 0;
                        }),
                        backgroundColor: '#007bff', // Modern blue for user data
                        borderColor: '#0056b3',
                        borderWidth: 1,
                        barThickness: 20,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 2,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 50,
                        title: { display: true, text: 'IMC (kg/m²)' },
                        grid: { color: '#e0e0e0' },
                    },
                    x: {
                        title: { display: true, text: 'Categorías' },
                        grid: { display: false },
                    },
                },
                plugins: {
                    legend: { position: 'top', labels: { padding: 20 } },
                    title: {
                        display: true,
                        text: 'Índice de Masa Corporal (IMC)',
                        padding: 20,
                        font: { size: 18, weight: '600' },
                    },
                    tooltip: {
                        backgroundColor: 'rgba(52, 58, 64, 0.9)', // Match styling with other charts
                        titleFont: { size: 14, weight: '600' },
                        bodyFont: { size: 12 },
                        padding: 12,
                        cornerRadius: 6,
                        borderColor: '#007bff', // Match the bar color
                        borderWidth: 1,
                        callbacks: {
                            title: function(tooltipItems) {
                                return `Categoría: ${tooltipItems[0].label}`;
                            },
                            label: function(context) {
                                const value = context.parsed.y;
                                if (value === 0) return ''; // Hide tooltip for zero values (non-user bars)
                                return `IMC: ${value.toFixed(1)} kg/m²`;
                            },
                        },
                    }, // Added comma here
                }, // Properly closed plugins object
            }, // Properly closed options object
        }); // Properly closed new Chart
    }
}

    // Gráfica de ICC
    if (!isNaN(results.icc)) {
        const canvasICC = document.getElementById('icc-chart');
        if (!canvasICC) {
            console.error('Canvas #icc-chart no encontrado');
        } else {
            const ctxICC = canvasICC.getContext('2d');
            const threshold = gender === 'masculino' ? 0.9 : 0.85;
            new Chart(ctxICC, {
                type: 'bar',
                data: {
                    labels: ['Saludable (≤' + threshold + ')', 'Riesgo (>' + threshold + ')'],
                    datasets: [
                        {
                            label: 'Rangos ICC',
                            data: [threshold, 1.5],
                            backgroundColor: ['rgba(40, 167, 69, 0.3)', 'rgba(255, 99, 132, 0.3)'],
                            borderColor: ['#28a745', 'rgba(255, 99, 132, 1)'],
                            borderWidth: 1,
                            barThickness: 40,
                        },
                        {
                            label: 'Tu ICC',
                            data: [
                                results.icc <= threshold ? results.icc : 0,
                                results.icc > threshold ? results.icc : 0,
                            ],
                            backgroundColor: '#007bff',
                            borderColor: '#0056b3',
                            borderWidth: 1,
                            barThickness: 20,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    aspectRatio: 2,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 2,
                            title: { display: true, text: 'ICC' },
                            grid: { color: '#e0e0e0' },
                        },
                        x: {
                            title: { display: true, text: 'Categorías' },
                            grid: { display: false },
                        },
                    },
                    plugins: {
                        legend: { position: 'top', labels: { padding: 20 } },
                        title: {
                            display: true,
                            text: 'Índice Cintura-Cadera (ICC)',
                            padding: 20,
                            font: { size: 18, weight: '600' },
                        },
                        tooltip: {
                            backgroundColor: '#343a40',
                            titleFont: { size: 14 },
                            bodyFont: { size: 12 },
                            padding: 10,
                        },
                    },
                },
            });
        }
    }

    // Gráfica de % Grasa Corporal
    if (!isNaN(results.grasaPctActual)) {
        const canvasBodyFat = document.getElementById('bodyfat-chart');
        if (!canvasBodyFat) {
            console.error('Canvas #bodyfat-chart no encontrado');
        } else {
            const ctxBodyFat = canvasBodyFat.getContext('2d');
            let labels, ranges, colors;
            if (gender === 'masculino') {
                if (isAthlete) {
                    labels = ['Muy bajo (<6%)', 'Óptimo (6-12%)', 'Aceptable (12-18%)', 'Alto (>18%)'];
                    ranges = [6, 12, 18, 50];
                    colors = [
                        'rgba(255, 99, 132, 0.3)',
                        'rgba(40, 167, 69, 0.3)',
                        'rgba(255, 206, 86, 0.3)',
                        'rgba(255, 99, 132, 0.5)',
                    ];
                } else {
                    labels = ['Muy bajo (<8%)', 'Saludable (8-20%)', 'Moderado (20-25%)', 'Alto (>25%)'];
                    ranges = [8, 20, 25, 50];
                    colors = [
                        'rgba(255, 99, 132, 0.3)',
                        'rgba(40, 167, 69, 0.3)',
                        'rgba(255, 206, 86, 0.3)',
                        'rgba(255, 99, 132, 0.5)',
                    ];
                }
            } else {
                if (isAthlete) {
                    labels = ['Muy bajo (<14%)', 'Óptimo (14-20%)', 'Aceptable (20-25%)', 'Alto (>25%)'];
                    ranges = [14, 20, 25, 50];
                    colors = [
                        'rgba(255, 99, 132, 0.3)',
                        'rgba(40, 167, 69, 0.3)',
                        'rgba(255, 206, 86, 0.3)',
                        'rgba(255, 99, 132, 0.5)',
                    ];
                } else {
                    labels = ['Muy bajo (<16%)', 'Saludable (16-30%)', 'Moderado (30-35%)', 'Alto (>35%)'];
                    ranges = [16, 30, 35, 50];
                    colors = [
                        'rgba(255, 99, 132, 0.3)',
                        'rgba(40, 167, 69, 0.3)',
                        'rgba(255, 206, 86, 0.3)',
                        'rgba(255, 99, 132, 0.5)',
                    ];
                }
            }
            new Chart(ctxBodyFat, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Rangos % Grasa',
                            data: ranges,
                            backgroundColor: colors,
                            borderColor: colors.map(color => color.replace('0.3', '1').replace('0.5', '1')),
                            borderWidth: 1,
                            barThickness: 40,
                        },
                        {
                            label: 'Tu % Grasa',
                            data: labels.map((_, i) => {
                                if (i === 0 && results.grasaPctActual < ranges[0]) return results.grasaPctActual;
                                if (i === 1 && results.grasaPctActual >= ranges[0] && results.grasaPctActual <= ranges[1]) return results.grasaPctActual;
                                if (i === 2 && results.grasaPctActual > ranges[1] && results.grasaPctActual <= ranges[2]) return results.grasaPctActual;
                                if (i === 3 && results.grasaPctActual > ranges[2]) return results.grasaPctActual;
                                return 0;
                            }),
                            backgroundColor: '#007bff',
                            borderColor: '#0056b3',
                            borderWidth: 1,
                            barThickness: 20,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    aspectRatio: 2,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 60,
                            title: { display: true, text: '% Grasa Corporal' },
                            grid: { color: '#e0e0e0' },
                        },
                        x: {
                            title: { display: true, text: 'Categorías' },
                            grid: { display: false },
                        },
                    },
                    plugins: {
                        legend: { position: 'top', labels: { padding: 20 } },
                        title: {
                            display: true,
                            text: 'Porcentaje de Grasa Corporal',
                            padding: 20,
                            font: { size: 18, weight: '600' },
                        },
                        tooltip: {
                            backgroundColor: '#343a40',
                            titleFont: { size: 14 },
                            bodyFont: { size: 12 },
                            padding: 10,
                        },
                    },
                },
            });
        }
    }
		
		// Gráfica de Tipología Corporal (IMLG vs IMG)
		// Gráfica de Tipología Corporal (IMLG vs IMG) con Chart.js
		// Definir constantes globales
		const xMin = 11.5;
		const yMin = 2;
		const yMax = 14.3 * 1.1; // Mantener margen del 10% para IMG
		const canvasWidth = 700;
		const canvasHeight = 350;
		let currentPointX = 0;
		let currentPointY = 0;
		const pointRadius = 6;

		// Determinar xMax según el género
		let xMax = data.genero === 'masculino' ? 26 : 24;

// Funciones necesarias
function getRanges(sexo, actividad, edad) {
    if (edad < 18) return null;
    let ageGroup = edad <= 29 ? '18-29' : edad <= 49 ? '30-49' : '50+';
    if (sexo === 'mujer') {
        const rangesByAgeAndActivity = {
            '18-29': {
                'sedentario': { imlg: { bajo: 12.5, medio: 14.5, alto: 16.5 }, img: { bajo: 4, medio: 7, alto: 9 }, maxIMLG: 18.5, maxIMG: 13 },
                'activo': { imlg: { bajo: 13.5, medio: 15.5, alto: 17.5 }, img: { bajo: 3, medio: 6, alto: 8 }, maxIMLG: 20, maxIMG: 10 }
            },
            '30-49': {
                'sedentario': { imlg: { bajo: 12, medio: 14, alto: 16 }, img: { bajo: 5, medio: 8, alto: 10 }, maxIMLG: 18, maxIMG: 14.3 },
                'activo': { imlg: { bajo: 13, medio: 15, alto: 17 }, img: { bajo: 3.5, medio: 6.5, alto: 8.5 }, maxIMLG: 19, maxIMG: 11 }
            },
            '50+': {
                'sedentario': { imlg: { bajo: 11.5, medio: 13.5, alto: 15.5 }, img: { bajo: 6, medio: 9, alto: 11 }, maxIMLG: 17.5, maxIMG: 14.3 },
                'activo': { imlg: { bajo: 12.5, medio: 14.5, alto: 16.5 }, img: { bajo: 4, medio: 7, alto: 9 }, maxIMLG: 18.5, maxIMG: 11 }
            }
        };
        return rangesByAgeAndActivity[ageGroup][actividad] || rangesByAgeAndActivity[ageGroup]['sedentario'];
    } else {
        const rangesByAgeAndActivity = {
            '18-29': {
                'sedentario': { imlg: { bajo: 15, medio: 17, alto: 19 }, img: { bajo: 3, medio: 6, alto: 8 }, maxIMLG: 21, maxIMG: 11 },
                'activo': { imlg: { bajo: 16, medio: 18, alto: 20 }, img: { bajo: 2, medio: 5, alto: 7 }, maxIMLG: 23, maxIMG: 9 }
            },
            '30-49': {
                'sedentario': { imlg: { bajo: 14.5, medio: 16.5, alto: 18.5 }, img: { bajo: 4, medio: 7, alto: 9 }, maxIMLG: 20.5, maxIMG: 12 },
                'activo': { imlg: { bajo: 15.5, medio: 17.5, alto: 19.5 }, img: { bajo: 2.5, medio: 5.5, alto: 7.5 }, maxIMLG: 22, maxIMG: 9.5 }
            },
            '50+': {
                'sedentario': { imlg: { bajo: 14, medio: 16, alto: 18 }, img: { bajo: 5, medio: 8, alto: 10 }, maxIMLG: 20, maxIMG: 12 },
                'activo': { imlg: { bajo: 15, medio: 17, alto: 19 }, img: { bajo: 3, medio: 6, alto: 8 }, maxIMLG: 21, maxIMG: 10 }
            }
        };
        return rangesByAgeAndActivity[ageGroup][actividad] || rangesByAgeAndActivity[ageGroup]['sedentario'];
    }
}

function detectarTipologia(imlg, img, sexo, actividad, edad) {
    if (isNaN(imlg) || isNaN(img)) return { tipologia: 'Datos inválidos' };
    if (edad < 18) return { tipologia: 'Edad no válida (debe ser mayor o igual a 18)' };

    const ranges = getRanges(sexo, actividad, edad);
    if (!ranges) return { tipologia: 'Edad no válida' };
    const { imlg: imlgRanges, img: imgRanges, maxIMLG, maxIMG } = ranges;

    let xToUse = Math.max(xMin, Math.min(imlg, xMax)); // Usar xMax dinámico
    let yToUse = Math.max(yMin, Math.min(img, yMax));

    let imlgCategory = xToUse >= imlgRanges.bajo && xToUse < imlgRanges.medio ? 'bajo' :
                      xToUse >= imlgRanges.medio && xToUse < imlgRanges.alto ? 'medio' : 'alto';
    let imgCategory = yToUse >= imgRanges.bajo && yToUse < imgRanges.medio ? 'bajo' :
                     yToUse >= imgRanges.medio && yToUse < imgRanges.alto ? 'medio' : 'alto';

    const typologyMap = {
        'bajo-alto': 'Obeso Sedentario',
        'bajo-medio': 'Delgado Adiposo',
        'bajo-bajo': 'Delgado',
        'medio-alto': 'Adiposo Sedentario',
        'medio-medio': 'Promedio',
        'medio-bajo': 'Esbelto Magro Atleta',
        'alto-alto': 'Obeso Sólido',
        'alto-medio': 'Atleta Promedio',
        'alto-bajo': 'Musculoso Atleta'
    };

    return { tipologia: typologyMap[`${imlgCategory}-${imgCategory}`] || 'Fuera de rango' };
}

function createLegend() {
    const legendContainer = document.getElementById('typology-legend');
    if (!legendContainer) return;

    const typologies = [
        { name: 'Obeso Sedentario', color: 'rgba(255, 153, 153, 0.5)', emoji: '📺🥔' },
        { name: 'Adiposo Sedentario', color: 'rgba(255, 0, 0, 0.5)', emoji: '🥐🍩' },
        { name: 'Obeso Sólido', color: 'rgba(255, 165, 0, 0.5)', emoji: '🍔🦍' },
        { name: 'Delgado Adiposo', color: 'rgba(255, 204, 153, 0.5)', emoji: '🚶🍩' },
        { name: 'Promedio', color: 'rgba(212, 237, 145, 0.5)', emoji: '😊' },
        { name: 'Atleta Promedio', color: 'rgba(0, 128, 0, 0.5)', emoji: '🏃' },
        { name: 'Delgado', color: 'rgba(255, 255, 153, 0.5)', emoji: '🌱🧘' },
        { name: 'Esbelto Magro Atleta', color: 'rgba(0, 128, 0, 0.5)', emoji: '💪🔥' },
        { name: 'Musculoso Atleta', color: 'rgba(0, 128, 0, 0.5)', emoji: '🏋️💪' }
    ];

    legendContainer.innerHTML = '';
    const title = document.createElement('h3');
    title.textContent = 'Tipología Corporal';
    title.style.fontFamily = '"Inter", sans-serif';
    title.style.fontSize = '18px';
    title.style.fontWeight = '600';
    title.style.color = '#343a40';
    title.style.marginBottom = '10px';
    legendContainer.appendChild(title);

    typologies.forEach(typology => {
        const legendItem = document.createElement('div');
        legendItem.style.display = 'inline-block';
        legendItem.style.margin = '0 10px';
        legendItem.style.fontSize = '14px';
        legendItem.style.fontFamily = '"Inter", sans-serif';
        legendItem.style.color = '#343a40';
        legendItem.innerHTML = `
            <span style="display: inline-block; width: 20px; height: 20px; background-color: ${typology.color}; vertical-align: middle; margin-right: 5px; border: 1px solid #343a40;"></span>
            <span>${typology.emoji} ${typology.name}</span>
        `;
        legendContainer.appendChild(legendItem);
    });
}

function mapToCanvas(value, min, max, canvasSize) {
    return ((value - min) / (max - min)) * (canvasSize - 20) + 10; // Ajuste para márgenes
}

// Gráfica de Tipología Corporal (IMLG vs IMG) con canvas
if (!isNaN(bodyCompResults.imlg) && !isNaN(bodyCompResults.img) && data.edad >= 18) {
    const sexo = data.genero === 'masculino' ? 'hombre' : 'mujer';
    const actividad = data.es_deportista === 'si' ? 'activo' : 'sedentario';
    const edad = data.edad;

    const ranges = getRanges(sexo, actividad, edad);
    if (!ranges) return;

    const { imlg: imlgRanges, img: imgRanges, maxIMLG, maxIMG } = ranges;

    // Crear canvas dinámicamente
    const chartContainer = document.createElement('div');
    chartContainer.className = 'chart-container';
    chartContainer.style.width = '100%';
    chartContainer.style.maxWidth = '700px';
    chartContainer.style.margin = '0 auto';
    chartContainer.style.position = 'relative';
    const canvas = document.createElement('canvas');
    canvas.id = 'typology-chart';
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    chartContainer.appendChild(canvas);
    const container = document.getElementById('typology-chart-container');
    if (container) {
        container.innerHTML = '';
        container.appendChild(chartContainer);
    } else {
        console.error('Contenedor #typology-chart-container no encontrado');
        return;
    }

    const ctx = canvas.getContext('2d');

    // Definir regiones
    const regions = [
        { xStart: 0, xEnd: mapToCanvas(imlgRanges.medio, xMin, xMax, canvasWidth), yStart: 0, yEnd: mapToCanvas(imgRanges.alto, yMin, yMax, canvasHeight), typology: 'Obeso Sedentario' },
        { xStart: mapToCanvas(imlgRanges.medio, xMin, xMax, canvasWidth), xEnd: mapToCanvas(imlgRanges.alto, xMin, xMax, canvasWidth), yStart: 0, yEnd: mapToCanvas(imgRanges.alto, yMin, yMax, canvasHeight), typology: 'Adiposo Sedentario' },
        { xStart: mapToCanvas(imlgRanges.alto, xMin, xMax, canvasWidth), xEnd: canvasWidth, yStart: 0, yEnd: mapToCanvas(imgRanges.alto, yMin, yMax, canvasHeight), typology: 'Obeso Sólido' },
        { xStart: 0, xEnd: mapToCanvas(imlgRanges.medio, xMin, xMax, canvasWidth), yStart: mapToCanvas(imgRanges.alto, yMin, yMax, canvasHeight), yEnd: mapToCanvas(imgRanges.medio, yMin, yMax, canvasHeight), typology: 'Delgado Adiposo' },
        { xStart: mapToCanvas(imlgRanges.medio, xMin, xMax, canvasWidth), xEnd: mapToCanvas(imlgRanges.alto, xMin, xMax, canvasWidth), yStart: mapToCanvas(imgRanges.alto, yMin, yMax, canvasHeight), yEnd: mapToCanvas(imgRanges.medio, yMin, yMax, canvasHeight), typology: 'Promedio' },
        { xStart: mapToCanvas(imlgRanges.alto, xMin, xMax, canvasWidth), xEnd: canvasWidth, yStart: mapToCanvas(imgRanges.alto, yMin, yMax, canvasHeight), yEnd: mapToCanvas(imgRanges.medio, yMin, yMax, canvasHeight), typology: 'Atleta Promedio' },
        { xStart: 0, xEnd: mapToCanvas(imlgRanges.medio, xMin, xMax, canvasWidth), yStart: mapToCanvas(imgRanges.medio, yMin, yMax, canvasHeight), yEnd: canvasHeight, typology: 'Delgado' },
        { xStart: mapToCanvas(imlgRanges.medio, xMin, xMax, canvasWidth), xEnd: mapToCanvas(imlgRanges.alto, xMin, xMax, canvasWidth), yStart: mapToCanvas(imgRanges.medio, yMin, yMax, canvasHeight), yEnd: canvasHeight, typology: 'Esbelto Magro Atleta' },
        { xStart: mapToCanvas(imlgRanges.alto, xMin, xMax, canvasWidth), xEnd: canvasWidth, yStart: mapToCanvas(imgRanges.medio, yMin, yMax, canvasHeight), yEnd: canvasHeight, typology: 'Musculoso Atleta' }
    ];

    // Dibujar regiones
    const typologies = [
        { name: 'Obeso Sedentario', color: 'rgba(255, 153, 153, 0.5)', emoji: '📺🥔' },
        { name: 'Adiposo Sedentario', color: 'rgba(255, 0, 0, 0.5)', emoji: '🥐🍩' },
        { name: 'Obeso Sólido', color: 'rgba(255, 165, 0, 0.5)', emoji: '🍔🦍' },
        { name: 'Delgado Adiposo', color: 'rgba(255, 204, 153, 0.5)', emoji: '🚶🍩' },
        { name: 'Promedio', color: 'rgba(212, 237, 145, 0.5)', emoji: '😊' },
        { name: 'Atleta Promedio', color: 'rgba(0, 128, 0, 0.5)', emoji: '🏃' },
        { name: 'Delgado', color: 'rgba(255, 255, 153, 0.5)', emoji: '🌱🧘' },
        { name: 'Esbelto Magro Atleta', color: 'rgba(0, 128, 0, 0.5)', emoji: '💪🔥' },
        { name: 'Musculoso Atleta', color: 'rgba(0, 128, 0, 0.5)', emoji: '🏋️💪' }
    ];

    regions.forEach(region => {
        const typologyObj = typologies.find(t => t.name === region.typology);
        const color = typologyObj ? typologyObj.color : 'rgba(200, 200, 200, 0.5)';
        ctx.fillStyle = color;
        ctx.fillRect(region.xStart, region.yStart, region.xEnd - region.xStart, region.yEnd - region.yStart);

        ctx.fillStyle = 'black';
        ctx.font = '12px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const labelX = (region.xStart + region.xEnd) / 2;
        const labelY = (region.yStart + region.yEnd) / 2;
        ctx.fillText(region.typology, labelX, labelY);
    });

    // Dibujar cuadrícula y etiquetas
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;

    const xMedio = mapToCanvas(imlgRanges.medio, xMin, xMax, canvasWidth);
    const xAlto = mapToCanvas(imlgRanges.alto, xMin, xMax, canvasWidth);
    const yMedio = mapToCanvas(imgRanges.medio, yMin, yMax, canvasHeight);
    const yAlto = mapToCanvas(imgRanges.alto, yMin, yMax, canvasHeight);

    ctx.beginPath();
    ctx.moveTo(xMedio, 0);
    ctx.lineTo(xMedio, canvasHeight);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(xAlto, 0);
    ctx.lineTo(xAlto, canvasHeight);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, yMedio);
    ctx.lineTo(canvasWidth, yMedio);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, yAlto);
    ctx.lineTo(canvasWidth, yAlto);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, canvasHeight);
    ctx.lineTo(canvasWidth, canvasHeight);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, canvasHeight);
    ctx.stroke();

    ctx.font = '10px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let imlg = Math.ceil(xMin); imlg <= xMax; imlg += 2) {
        const x = mapToCanvas(imlg, xMin, xMax, canvasWidth);
        ctx.fillText(imlg, x, canvasHeight - 15);
        ctx.beginPath();
        ctx.moveTo(x, canvasHeight);
        ctx.lineTo(x, canvasHeight - 5);
        ctx.stroke();
    }

    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let img = Math.ceil(yMin); img <= yMax; img += 2) {
        const y = canvasHeight - mapToCanvas(img, yMin, yMax, canvasHeight);
        ctx.fillText(img, 15, y);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(5, y);
        ctx.stroke();
    }

    ctx.textAlign = 'center';
    ctx.fillText('IMLG (kg/m²)', canvasWidth / 2, canvasHeight - 30);
    ctx.save();
    ctx.translate(30, canvasHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('IMG (kg/m²)', 0, 0);
    ctx.restore();

    // Dibujar punto del usuario
    function drawPoint(imlg, img, color) {
        const adjustedImlg = Math.max(xMin, Math.min(imlg, xMax));
        const adjustedImg = Math.max(yMin, Math.min(img, yMax));
        const x = mapToCanvas(adjustedImlg, xMin, xMax, canvasWidth);
        const y = canvasHeight - mapToCanvas(adjustedImg, yMin, yMax, canvasHeight);
        ctx.beginPath();
        ctx.arc(x, y, pointRadius, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = 'black';
        ctx.stroke();

        currentPointX = x;
        currentPointY = y;
    }
    drawPoint(bodyCompResults.imlg, bodyCompResults.img, '#007bff');

    // Crear tooltip
	//const tooltip = document.getElementById('tooltip');
    const tooltip = document.createElement('div');
    tooltip.id = 'typology-tooltip';
    tooltip.style.position = 'absolute';
    tooltip.style.display = 'none';
    tooltip.style.backgroundColor = 'rgba(52, 58, 64, 0.9)';
    tooltip.style.color = 'white';
    tooltip.style.padding = '12px';
    tooltip.style.borderRadius = '6px';
    tooltip.style.fontSize = '12px';
    tooltip.style.fontFamily = '"Inter", sans-serif';
    tooltip.style.pointerEvents = 'none';
    tooltip.style.border = '1px solid #007bff';
    tooltip.style.zIndex = '1000';
    chartContainer.appendChild(tooltip);

    // Evento para el tooltip
    // Evento para el tooltip
	canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    function isCursorOverPoint(mouseX, mouseY) {
        const dx = mouseX - currentPointX;
        const dy = mouseY - currentPointY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        console.log('Mouse:', { x: mouseX, y: mouseY }, 'Point:', { x: currentPointX, y: currentPointY }, 'Distance:', distance, 'Threshold:', pointRadius + 0);
        return distance <= pointRadius + 0;
    }

    if (isCursorOverPoint(mouseX, mouseY)) {
        console.log('Cursor sobre el punto');
        const { tipologia } = detectarTipologia(bodyCompResults.imlg, bodyCompResults.img, sexo, actividad, edad);
        const typologyObj = typologies.find(t => t.name === tipologia);
        const emoji = typologyObj ? typologyObj.emoji : '';
        tooltip.style.display = 'block';
        tooltip.innerHTML = `IMLG: ${bodyCompResults.imlg.toFixed(1)} kg/m²<br>IMG: ${bodyCompResults.img.toFixed(1)} kg/m²<br>Tipología: ${emoji} ${tipologia}`;

        // Posicionar el tooltip justo encima del punto azul
        let tooltipX = rect.left + currentPointX - (tooltip.offsetWidth / 2); // Centrado horizontalmente respecto al canvas
        let tooltipY = rect.top + currentPointY - tooltip.offsetHeight - 0; // Justo encima con 10px de margen

        // Ajustar límites para que no se salga del canvas
        if (tooltipX < rect.left) tooltipX = rect.left;
        if (tooltipX + tooltip.offsetWidth > rect.right) tooltipX = rect.right - tooltip.offsetWidth;
        if (tooltipY < rect.top) tooltipY = rect.top + currentPointY + pointRadius + 0; // Debajo si no cabe arriba
        if (tooltipY + tooltip.offsetHeight > rect.bottom) tooltipY = rect.bottom - tooltip.offsetHeight;
		
		if (tooltipX < 0) {
          tooltipX = 0;
        }
        if (tooltipX + tooltip.offsetWidth > canvas.width) {
          tooltipX = canvas.width - tooltip.offsetWidth;
        }
        if (tooltipY < 0) {
          tooltipY = currentPointY + pointRadius + 2;
        }
        if (tooltipY + tooltip.offsetHeight > canvas.height) {
          tooltipY = canvas.height - tooltip.offsetHeight;
        }
		
        tooltip.style.left = `${tooltipX}px`;
        tooltip.style.top = `${tooltipY}px`;
    } else {
        tooltip.style.display = 'none';
    }
});

canvas.addEventListener('mouseleave', () => {
    tooltip.style.display = 'none';
});


    // Crear leyenda personalizada
    createLegend();
}

    // Gráfica de evolución de peso (adapted from generateWeightEvolutionChart)
// Gráfica de evolución de peso (adapted from generateWeightEvolutionChart)
if (!isNaN(results.pesoIdeal) && !isNaN(data.peso)) {
    const canvasWeight = document.getElementById('weight-chart');
    if (!canvasWeight) {
        console.error('Canvas #weight-chart no encontrado');
    } else {
        const ctxWeight = canvasWeight.getContext('2d');
        const weightDiff = results.pesoIdeal - data.peso;
        const isWeightLoss = weightDiff < 0;
        const weeklyRate = isWeightLoss ? -0.5 : 0.35;
        const totalWeeks = Math.ceil(Math.abs(weightDiff) / Math.abs(weeklyRate));

        // Create an array of all weeks (0 to totalWeeks)
        const allWeeks = Array.from({ length: totalWeeks + 1 }, (_, i) => i);

        // Calculate weight for each week
        const weightData = allWeeks.map(week => {
            return data.peso + (weeklyRate * week);
        });

        // Define intervals for x-axis labels (e.g., 0, 6, 12, ...)
        const intervals = [0];
        for (let week = 6; week <= totalWeeks; week += 6) {
            intervals.push(week);
        }
        if (!intervals.includes(totalWeeks)) {
            intervals.push(totalWeeks);
        }

        // Create labels array: show label only at intervals, empty string otherwise
        const labels = allWeeks.map(week => (intervals.includes(week) ? `Sem ${week}` : ''));

        new Chart(ctxWeight, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Peso Proyectado (kg)',
                        data: weightData,
                        borderColor: '#28a745',
                        backgroundColor: 'rgba(40, 167, 69, 0.1)',
                        fill: true,
                        borderWidth: 3,
                        pointRadius: 5,
                        pointBackgroundColor: '#28a745',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        tension: 0.3,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 2,
                scales: {
                    y: {
                        beginAtZero: false,
                        min: Math.min(data.peso, results.pesoIdeal) - 2,
                        max: Math.max(data.peso, results.pesoIdeal) + 2,
                        title: { display: true, text: 'Peso (kg)' },
                        grid: { color: '#e0e0e0' },
                        ticks: {
                            stepSize: 2,
                            callback: function(value) {
                                return value.toFixed(1);
                            },
                        },
                    },
                    x: {
                        title: { display: true, text: 'Semanas' },
                        grid: { display: false },
                        ticks: {
                            callback: function(value, index, values) {
                                // Only show the label if it's not an empty string
                                return labels[index] || '';
                            },
                        },
                    },
                },
                plugins: {
                    legend: { position: 'top', labels: { padding: 20 } },
                    title: {
                        display: true,
                        text: `Proyección de Peso desde ${formatResult(data.peso, 1)} kg hacia ${formatResult(results.pesoIdeal, 1)} kg`,
                        padding: 20,
                        font: { size: 18, weight: '600' },
                    },
                    tooltip: {
                        enabled: true,
                        mode: 'nearest', // Show tooltip for the nearest point
                        intersect: false, // Allow tooltip to show even when not directly over a point
                        backgroundColor: 'rgba(52, 58, 64, 0.9)',
                        titleFont: { size: 14, weight: '600' },
                        bodyFont: { size: 12 },
                        padding: 12,
                        cornerRadius: 6,
                        borderColor: '#28a745',
                        borderWidth: 1,
                        callbacks: {
                            title: function(tooltipItems) {
                                const week = allWeeks[tooltipItems[0].dataIndex];
                                return `Semana ${week}`;
                            },
                            label: function(context) {
                                return `Peso: ${context.parsed.y.toFixed(1)} kg`;
                            },
                        },
                    },
                },
            },
        });
    }
}
	
		
		// Gráfica de Somatotipo
		/// Dentro del setTimeout en generateExplanationsAndSuggestions, reemplazar la gráfica de somatotipo
		// Gráfica de Somatotipo - Dibujar un punto sobre la imagen
		// Gráfica de Somatotipo - Dibujar un punto sobre la imagen
		// Gráfica de Somatotipo - Dibujar un punto y ejes graduados sobre la imagen
		// Gráfica de Somatotipo - Dibujar un punto y ejes graduados sobre la imagen
		if (!isNaN(results.endomorfia) && !isNaN(results.mesomorfia) && !isNaN(results.ectomorfia)) {
			const canvasSomatotype = document.getElementById('somatotype-point-canvas');
			const imgSomatotype = document.getElementById('somatotype-image');

    if (!canvasSomatotype || !imgSomatotype) {
        console.error('Canvas #somatotype-point-canvas o imagen #somatotype-image no encontrado');
    } else {
        // Esperar a que la imagen se cargue para obtener sus dimensiones
        imgSomatotype.onload = () => {
            const ctxSomatotype = canvasSomatotype.getContext('2d');

            // Ajustar las dimensiones del canvas para que coincidan con la imagen
            canvasSomatotype.width = imgSomatotype.width;
            canvasSomatotype.height = imgSomatotype.height;

            // Limpiar el canvas antes de dibujar
            ctxSomatotype.clearRect(0, 0, canvasSomatotype.width, canvasSomatotype.height);

            // Definir el área del gráfico (triángulo) en píxeles
            const chartWidth = 400; // Ancho del triángulo en píxeles
            const chartHeight = 400; // Alto del triángulo en píxeles
            const chartOffsetX = (imgSomatotype.width - chartWidth) / 2; // Centrar el triángulo en la imagen
            const chartOffsetY = (imgSomatotype.height - chartHeight) / 2;

            // Debugging: Verificar dimensiones
            console.log(`Image Dimensions: width=${imgSomatotype.width}, height=${imgSomatotype.height}`);
            console.log(`Canvas Dimensions: width=${canvasSomatotype.width}, height=${canvasSomatotype.height}`);
            console.log(`Chart Area: offsetX=${chartOffsetX}, offsetY=${chartOffsetY}, width=${chartWidth}, height=${chartHeight}`);

            // Calcular las coordenadas x, y en el sistema del triángulo
            const x = results.ectomorfia - results.endomorfia; // Rango esperado: [-8, 8]
            const y = 2 * results.mesomorfia - (results.endomorfia + results.ectomorfia); // Rango esperado: [-10, 14]

            // Limitar x y y dentro de los rangos esperados
            const xClamped = Math.min(Math.max(x, -8), 8);
            const yClamped = Math.min(Math.max(y, -10), 14);

            // Calcular el centro del gráfico (donde x = 0, y = 0)
            const centerX = chartOffsetX + chartWidth / 2; // Centro horizontal del gráfico
            const centerY = chartOffsetY + chartHeight / 2; // Centro vertical del gráfico (y=0 estará aquí)

            // Ajustar la posición del eje X (un poco más abajo)
            const xAxisY = centerY + 80; // Mover el eje X 80 píxeles más abajo

            // Mapear las coordenadas del triángulo a píxeles en el canvas
            const pixelX = chartOffsetX + ((xClamped + 8) / 16) * chartWidth; // Mapear x de [-8, 8] a [0, chartWidth]
            const pixelY = xAxisY - (yClamped / 14) * (chartHeight / 2); // Mapear y de [-10, 14] con y=0 en xAxisY

            // Debugging: Verificar las coordenadas calculadas
            console.log(`Somatotype Coordinates: x=${x}, y=${y}`);
            console.log(`Clamped Coordinates: xClamped=${xClamped}, yClamped=${yClamped}`);
            console.log(`Pixel Coordinates: pixelX=${pixelX}, pixelY=${pixelY}`);
            console.log(`Chart Center: centerX=${centerX}, centerY=${centerY}, xAxisY=${xAxisY}`);

            // Verificar que el punto esté dentro del área del gráfico
            if (pixelX < chartOffsetX || pixelX > chartOffsetX + chartWidth || pixelY < chartOffsetY || pixelY > chartOffsetY + chartHeight) {
                console.warn('El punto está fuera del área del gráfico:', { pixelX, pixelY });
            } else {
                console.log('El punto está dentro del área del gráfico:', { pixelX, pixelY });
            }

            // Dibujar el punto
            ctxSomatotype.beginPath();
            ctxSomatotype.arc(pixelX, pixelY, 8, 0, 2 * Math.PI); // Radio de 8 píxeles
            ctxSomatotype.fillStyle = '#007bff'; // Color azul
            ctxSomatotype.fill();
            ctxSomatotype.strokeStyle = '#0056b3';
            ctxSomatotype.lineWidth = 2;
            ctxSomatotype.stroke();

            // Añadir una etiqueta con los valores del somatotipo
            ctxSomatotype.font = ' bold 14px Inter, sans-serif';
            ctxSomatotype.fillStyle = '#000000';
            ctxSomatotype.textAlign = 'center';
            ctxSomatotype.fillText(
                `${formatResult(results.endomorfia, 1)}-${formatResult(results.mesomorfia, 1)}-${formatResult(results.ectomorfia, 1)}`,
                pixelX,
                pixelY - 15 // Posicionar la etiqueta 10 píxeles arriba del punto
            );

            // Dibujar el eje X
            ctxSomatotype.beginPath();
            ctxSomatotype.moveTo(chartOffsetX, xAxisY);
            ctxSomatotype.lineTo(chartOffsetX + chartWidth, xAxisY);
            ctxSomatotype.strokeStyle = '#000000';
            ctxSomatotype.lineWidth = 1;
            ctxSomatotype.stroke();

            // Graduaciones del eje X (cada 2 unidades, de -8 a 8)
            ctxSomatotype.font = '12px Inter, sans-serif';
            ctxSomatotype.fillStyle = '#000000';
            ctxSomatotype.textAlign = 'center';
            for (let i = -8; i <= 8; i += 2) {
                const xPos = chartOffsetX + ((i + 8) / 16) * chartWidth; // Mapear i de [-8, 8] a píxeles
                // Marca de graduación
                ctxSomatotype.beginPath();
                ctxSomatotype.moveTo(xPos, xAxisY - 5);
                ctxSomatotype.lineTo(xPos, xAxisY + 5);
                ctxSomatotype.stroke();
                // Etiqueta
                ctxSomatotype.fillText(i.toString(), xPos, xAxisY + 20);
            }
            // Etiqueta del eje X
            ctxSomatotype.fillText('Ectomorfia - Endomorfia', chartOffsetX + chartWidth / 2, xAxisY + 40);

            // Dibujar el eje Y (a la derecha del gráfico)
            const yAxisX = chartOffsetX + chartWidth + 50; // 50 píxeles a la derecha del gráfico
            ctxSomatotype.beginPath();
            ctxSomatotype.moveTo(yAxisX, chartOffsetY);
            ctxSomatotype.lineTo(yAxisX, chartOffsetY + chartHeight);
            ctxSomatotype.strokeStyle = '#000000';
            ctxSomatotype.lineWidth = 1;
            ctxSomatotype.stroke();

            // Graduaciones del eje Y (cada 2 unidades, de -10 a 14, con y=0 en xAxisY)
            ctxSomatotype.textAlign = 'center';
            for (let i = -10; i <= 16; i += 2) {
                const yPos = xAxisY - (i / 11) * (chartHeight / 2); // Mapear i con y=0 en xAxisY
                // Marca de graduación
                ctxSomatotype.beginPath();
                ctxSomatotype.moveTo(yAxisX - 5, yPos);
                ctxSomatotype.lineTo(yAxisX + 5, yPos);
                ctxSomatotype.stroke();
                // Etiqueta
                ctxSomatotype.fillText(i.toString(), yAxisX + 20, yPos + 5);
            }
            // Etiqueta del eje Y (rotada 90 grados)
            ctxSomatotype.save();
            ctxSomatotype.translate(yAxisX + 40, chartOffsetY + chartHeight / 2);
            ctxSomatotype.rotate(-Math.PI / 2);
            ctxSomatotype.fillText('Mesomorfia', 0, 0);
            ctxSomatotype.restore();
        };

        // Si la imagen ya está cargada (por ejemplo, si está en caché), disparar el evento onload manualmente
        if (imgSomatotype.complete) {
            imgSomatotype.onload();
        }
    }
}
}, 100);

            return content;
    };

				

				/// Función auxiliar para depuración Datos %Grasa Visceral
				// Asegurarse de que results esté definido
				//let results = results || { grasaPctActual: null };
				
				// Función para validar y normalizar datos
				const createGrasaVisceralData = (data) => {
				    if (!data || typeof data !== 'object') {
				        console.warn('data no está definido o es inválido. Usando valores por defecto.');
				        data = {};
				    }
				    return {
				        genero: data.genero && typeof data.genero === 'string' ? data.genero.toLowerCase() === 'masculino' ? 'masculino' : 'femenino' : 'femenino',
				        edad: Number(data.edad) || 0,
				        peso: Number(data.peso) || 0,
				        altura: data.altura || 0,
				        esDeportista: data.es_deportista === 'si' ? true : data.es_deportista === 'no' ? false : false, // Your provided logic,
				        pliegue_tricipital: Number(data.pliegue_tricipital) || 0,
				        pliegue_subescapular: Number(data.pliegue_subescapular) || 0,
				        pliegue_suprailiaco: Number(data.pliegue_suprailiaco) || 0,
				        pliegue_bicipital: Number(data.pliegue_bicipital) || 0,
				        cintura: Number(data.circ_cintura) || 0
				       // porcentajeGrasa: isNaN(results.grasaPctActual) ? null : Number(results.grasaPctActual),
				    };
				};
				
				// Función logData corregida
				const logData = (data) => {
				    const { altura, edad, genero, cintura, esDeportista, porcentajeGrasa, pliegue_tricipital, pliegue_subescapular, pliegue_suprailiaco, pliegue_bicipital } = data;
				    console.log('Datos de entrada:', {
				        altura,
				        edad,
				        genero,
				        cintura,
				        esDeportista,
				        porcentajeGrasa,
				        pliegue_tricipital: Number(data.pliegue_tricipital) || 0,
				        pliegue_subescapular: Number(data.pliegue_subescapular) || 0,
				        pliegue_suprailiaco: Number(data.pliegue_suprailiaco) || 0,
				        pliegue_bicipital: Number(data.pliegue_bicipital) || 0,
				    });
				};

				function convertirAltura(data) {
				    // Asumimos que si la altura es mayor a 2.5 metros, probablemente está en cm
				    // Pero mejoramos la lógica para mayor precisión
				    
				    // Primero verificamos si ya está en cm (alturas normales en cm son > 100)
				    if (datos.altura > 100) {
				        console.log('Altura ya está en cm, no se requiere conversión');
				        return data.altura;
				    }
				    
				    // Si no, verificamos si está en metros y necesita conversión
				    if (data.altura > 0.5 && data.altura <= 2.5) {
				        const alturaCm = data.altura * 100;
				        console.log(`Convertida de metros a cm: ${data.altura}m -> ${alturaCm}cm`);
				        return alturaCm;
				    }
				    
				    // Caso de error o valor inválido
				    console.error('Altura inválida:', datos.altura);
				    throw new Error(`Altura ${data.altura} no es válida. Debe ser en cm (>100) o metros (0.5-2.5)`);
				}
				// Funciones de grasa visceral (del código anterior)
				function calcularIAV(cintura, alturaCm) {
				    console.log(`[calcularIAV] cintura: ${cintura} cm, altura: ${alturaCm} cm`);
				    const iav = parseFloat((cintura / alturaCm).toFixed(2));
				    console.log(`[calcularIAV] IAV calculado: ${iav}`);
				    return iav;
				}
				
				function calcularIndiceMixto(porcentajeGrasa, cintura, alturaCm) {
				    console.log(`[calcularIndiceMixto] %grasa: ${porcentajeGrasa}%, cintura: ${cintura} cm, altura: ${alturaCm} cm`);
				    const iav = cintura / alturaCm;
				    const indice = parseFloat((0.4 * (porcentajeGrasa/100) + 0.6 * iav).toFixed(2));
				    console.log(`[calcularIndiceMixto] Índice mixto calculado: ${indice}`);
				    return indice;
				}
				
				function clasificarRiesgoIAV(genero, edad, iav) {
				    console.log(`[clasificarRiesgoIAV] genero: ${genero}, edad: ${edad}, IAV: ${iav}`);
				    if (genero === 'masculino') {
				        if (edad >= 18 && edad <= 39) {
				            if (iav < 0.50) return 'Normal (Bajo riesgo)';
				            if (iav >= 0.50 && iav <= 0.59) return 'Elevado (Riesgo moderado)';
				            return 'Alto (Riesgo elevado)';
				        } else if (edad >= 40 && edad <= 59) {
				            if (iav < 0.55) return 'Normal (Bajo riesgo)';
				            if (iav >= 0.55 && iav <= 0.64) return 'Elevado (Riesgo moderado)';
				            return 'Alto (Riesgo elevado)';
				        } else if (edad >= 60) {
				            if (iav < 0.60) return 'Normal (Bajo riesgo)';
				            if (iav >= 0.60 && iav <= 0.69) return 'Elevado (Riesgo moderado)';
				            return 'Alto (Riesgo elevado)';
				        }
				    } else if (genero === 'femenino') {
				        if (edad >= 18 && edad <= 39) {
				            if (iav < 0.45) return 'Normal (Bajo riesgo)';
				            if (iav >= 0.45 && iav <= 0.54) return 'Elevado (Riesgo moderado)';
				            return 'Alto (Riesgo elevado)';
				        } else if (edad >= 40 && edad <= 59) {
				            if (iav < 0.50) return 'Normal (Bajo riesgo)';
				            if (iav >= 0.50 && iav <= 0.59) return 'Elevado (Riesgo moderado)';
				            return 'Alto (Riesgo elevado)';
				        } else if (edad >= 60) {
				            if (iav < 0.55) return 'Normal (Bajo riesgo)';
				            if (iav >= 0.55 && iav <= 0.64) return 'Elevado (Riesgo moderado)';
				            return 'Alto (Riesgo elevado)';
				        }
				    }
				    const resultado = 'No aplicable';
				    console.log(`[clasificarRiesgoIAV] Resultado: ${resultado}`);
				    return resultado;
				}
				
				function clasificarRiesgoMixto(genero, indiceMixto) {
				    console.log(`[clasificarRiesgoMixto] genero: ${genero}, índice mixto: ${indiceMixto}`);
				    if (genero === 'masculino') {
				        if (indiceMixto < 0.35) return 'Bajo riesgo';
				        if (indiceMixto >= 0.35 && indiceMixto <= 0.45) return 'Riesgo moderado';
				        return 'Alto riesgo';
				    } else if (genero === 'femenino') {
				        if (indiceMixto < 0.40) return 'Bajo riesgo';
				        if (indiceMixto >= 0.40 && indiceMixto <= 0.50) return 'Riesgo moderado';
				        return 'Alto riesgo';
				    }
				    const resultado = 'No aplicable';
				    console.log(`[clasificarRiesgoMixto] Resultado: ${resultado}`);
				    return resultado;
				}
				
				  function calcularGrasaVisceral(data) {
				    console.log('[calcularGrasaVisceral] Iniciando cálculo con datos:', data);
				    const { esDeportista, genero, edad, cintura, altura } = data;
				    let resultados = {};
				    const alturaCm = convertirAltura(data);
				    console.log(`[calcularGrasaVisceral] Altura convertida: ${alturaCm} cm`);
				
				    if (esDeportista) {
				        console.log('[calcularGrasaVisceral] Procesando deportista');
				        
				        if (data.porcentajeGrasaActual) {
				            resultados.porcentajeGrasa = data.porcentajeGrasaActual;
				            console.log(`[calcularGrasaVisceral] Usando %grasa proporcionado: ${resultados.porcentajeGrasa}%`);
				        } else if  ( data.pliegue_tricipital && data.pliegue_subescapular && data.pliegue_bicipital && data.pliegue_suprailiaco) {
				            resultados.porcentajeGrasa = calculateJacksonPollockBodyFat( data.pliegue_tricipital && data.pliegue_subescapular && data.pliegue_bicipital && data.pliegue_suprailiaco && edad);
				            console.log(`[calcularGrasaVisceral] %grasa calculado por Jackson-Pollock: ${resultados.porcentajeGrasa}%`);
				        } else {
				            throw new Error('Para deportistas se requiere % de grasa o medidas de pliegues');
				        }
				        
				        resultados.indiceMixto = calcularIndiceMixto(
				            resultados.porcentajeGrasa, 
				            cintura, 
				            alturaCm
				        );
				        
				        resultados.riesgo = clasificarRiesgoMixto(genero, resultados.indiceMixto);
				        resultados.metodo = 'Fórmula Mixta (Thomas et al. 2013) para Deportistas';
				        
				    } else {
				        console.log('[calcularGrasaVisceral] Procesando no deportista');
				        resultados.iav = calcularIAV(cintura, alturaCm);
				        resultados.riesgo = clasificarRiesgoIAV(genero, edad, resultados.iav);
				        resultados.metodo = 'IAV (Krakauer)';
				    }
				    
				    console.log('[calcularGrasaVisceral] Resultados completos:', resultados);
				    return resultados;
				}
      
			// Define resetResultElements (place before handler, after resultElements)
				const resetResultElements = (elements) => {
					Object.values(elements).forEach(el => {
						if (!el || !el.tagName) {
							console.warn('Elemento nulo o inválido en resultElements:', el);
							return;
						}
						if (el.tagName === 'SPAN') {
							el.textContent = '---';
						} else if (el.tagName === 'SMALL') {
							el.textContent = '(No calculado/estimado)';
						}
					});
				};
			
			console.log('resultElements:', resultElements);
			console.log('imcSource element:', resultElements.imcSource);
      
			
			
				

			// Form submission handler
			form.addEventListener('submit', function (event) {
			    event.preventDefault();
			    console.log('Form submitted via user action');
			    // Show Guardar Datos button
			    const guardarDatosBtn = document.getElementById('guardar_datos');
			    if (guardarDatosBtn) {
			        guardarDatosBtn.style.display = 'inline-block';
			        console.log('Guardar Datos button displayed');
			    } else {
			        console.error('Guardar Datos button not found');
			    }
			// Initialize variables
		        let content = '';
		        let results = { grasaPctActual: null };
			    try {
			        // --- 1. Get Data ---
			        const formData = new FormData(form);
			        const data = {};
			        formData.forEach((value, key) => {
			            const numericFields = [
			                'edad', 'peso', 'altura', 'pliegue_tricipital', 'pliegue_subescapular',
			                'pliegue_suprailiaco', 'pliegue_bicipital', 'pliegue_pantorrilla',
			                'circ_cintura', 'circ_cadera', 'circ_cuello', 'circ_pantorrilla',
			                'circ_brazo', 'circ_brazo_contraido', 'diam_humero', 'diam_femur',
			                'diam_muneca', 'grasa_actual_conocida', 'grasa_deseada',
			                'result-albumina', 'result-prealbumina', 'result-colesterol-total',
			                'result-hdl', 'result-trigliceridos', 'result-glucosa-ayunas',
			                'result-hba1c', 'result-insulina', 'result-pcr-ultrasensible',
			                'result-leptina', 'result-alt', 'result-ggt', 'result-tsh',
			                'result-testosterona', 'result-vitamina-d'
			            ];
			            data[key] = numericFields.includes(key) ? parseFloatSafe(value) : value;
			        });
			
			        console.log('Datos introducidos:', data);
			
			        // --- 2. Perform Calculations ---
			       
			        
			        let content = ''; // For error messages
				let results = { grasaPctActual: null };
			        // Initialize alturaM with validation (single definition)
			        let alturaM = NaN;
			        try {
			            if (data.altura && !isNaN(data.altura)) {
			                alturaM = Number(data.altura) / 100;
			                if (alturaM < 1.2 || alturaM > 2.2) {
			                    throw new Error('Altura debe estar entre 120 y 220 cm');
			                }
			            } else {
			                throw new Error('Altura no proporcionada o inválida');
			            }
			        } catch (e) {
			            console.error('Error inicializando alturaM:', e.message);
			            content += `<p><strong>Error en Altura:</strong> ${e.message}. Por favor, revisa el valor ingresado para altura.</p>`;
			        }
			
			        // Reset results display
			        resetResultElements(resultElements);
			        if (explanationSection) {
			            explanationSection.style.display = 'none';
			        }
			        if (explanationContent) {
			            explanationContent.innerHTML = '';
			        }
			
			        // Check for essential data
			        if (!data.peso || isNaN(data.altura) || !data.genero || !data.edad || !data.es_deportista) {
			            alert('Por favor, complete los campos obligatorios: Género, Edad, Peso, Altura y si es Deportista.');
			            console.error('Missing required fields', { peso: data.peso, altura: data.altura, genero: data.genero, edad: data.edad, es_deportista: data.es_deportista });
			            return;
			        }
			
			        // Función para formatear números (si no está definida)
			            function formatResult(value, precision = 1) {
				    // Si value es una cadena no vacía, devolverla sin modificar
				    if (typeof value === 'string' && value.trim() !== '') {
				        return value;
				    }
				    // Si value es un número finito, formatearlo con la precisión especificada
				    if (Number.isFinite(value)) {
				        return value.toFixed(precision);
				    }
				    // Para cualquier otro caso (null, undefined, NaN, etc.), devolver '---'
				    return '---';
				}
			
			        // Función para formatear el objeto imcSource en una cadena legible
			        function formatImcSource(imcSource) {
			            if (!imcSource || typeof imcSource !== 'object') {
			                return '(No calculado)';
			            }
			        
			            let result = `${imcSource.clasificacion} - ${imcSource.riesgo}`;
			            if (imcSource.percentil) {
			                result += ` (Percentil: ${imcSource.percentil})`;
			            }
			            if (imcSource.nota) {
			                result += `. ${imcSource.nota}`;
			            }
			            return result;
			        }
			
			        // Función para formatear iccSource
			        function formatIccSource(iccSource) {
			            if (!iccSource || typeof iccSource !== 'object') {
			                return '(No calculado)';
			            }
			            return `${iccSource.clasificacion} - ${iccSource.riesgo}`;
			        }
			
			        // Nueva función para formatear ambSource
			        function formatAmbSource(amb, ranges, isAthlete, gender, ageRange) {
			            if (!ranges || isNaN(amb)) {
			                return '(No calculado)';
			            }
			            if (isAthlete) {
			                if (amb < ranges.P50) {
			                    return `Dxt Recreativo percentil <50 (${ranges.P50} cm²)`;
			                } else if (amb >= ranges.P50 && amb < ranges.P75) {
			                    return `Dxt Recreativo/Competitivo Percentil 50 (${ranges.P50} cm²)`;
			                } else if (amb >= ranges.P75 && amb < ranges.P90) {
			                    return `Dxt Competitivo Percentil 75 (${ranges.P75} cm²)`;
			                } else {
			                    return `Dxt Fuerza/Elite Percentil >90 (${ranges.P90} cm²)`;
			                }
			            } else {
			                if (amb < ranges.P5) {
			                    return `Muy bajo percentil <5 (${ranges.P5} cm²)`;
			                } else if (amb >= ranges.P5 && amb < ranges.P50) {
			                    return `Bajo-Medio Percentiles 5–50 (${ranges.P5}–${ranges.P50} cm²)`;
			                } else if (amb >= ranges.P50 && amb < ranges.P95) {
			                    return `Medio-Alto Percentil >50  (${ranges.P50}–${ranges.P95} cm²)`;
			                } else {
			                    return `Muy Alto  percentil >95 (${ranges.P95} cm²)`;
			                }
			            }
			        }
			
			        // Nueva función para formatear PctmmtSource
			        function formatPctmmtSource(pctmmt, gender, isAthlete) {
			            if (isNaN(pctmmt) || !gender) {
			                return '(No calculado)';
			            }
			            gender = gender.toLowerCase();
			            if (gender === 'masculino') {
			                if (isAthlete) {
			                    if (pctmmt >= 45 && pctmmt <= 55) {
			                        return 'Rango saludable (45–55%)';
			                    } else if (pctmmt < 45) {
			                        return 'Por debajo del rango saludable (45–55%)';
			                    } else {
			                        return 'Por encima del rango saludable (45–55%)';
			                    }
			                } else {
			                    if (pctmmt >= 38 && pctmmt <= 48) {
			                        return 'Rango saludable (38–48%)';
			                    } else if (pctmmt < 38) {
			                        return 'Por debajo del rango saludable (38–48%)';
			                    } else {
			                        return 'Por encima del rango saludable (38–48%)';
			                    }
			                }
			            } else if (gender === 'femenino') {
			                if (isAthlete) {
			                    if (pctmmt >= 35 && pctmmt <= 45) {
			                        return 'Rango saludable (35–45%)';
			                    } else if (pctmmt < 35) {
			                        return 'Por debajo del rango saludable (35–45%)';
			                    } else {
			                        return 'Por encima del rango saludable (35–45%)';
			                    }
			                } else {
			                    if (pctmmt >= 30 && pctmmt <= 40) {
			                        return 'Rango saludable (30–40%)';
			                    } else if (pctmmt < 30) {
			                        return 'Por debajo del rango saludable (30–40%)';
			                    } else {
			                        return 'Por encima del rango saludable (30–40%)';
			                    }
			                }
			            }
			            return '(No calculado)';
			        }
			
			        // Nueva función para formatear masaResidualSource
			        function formatMasaResidualSource(masaResidualPct, gender) {
			            if (isNaN(masaResidualPct) || !gender) {
			                return '(No calculado)';
			            }
			            gender = gender.toLowerCase();
			            if (gender === 'masculino') {
			                if (masaResidualPct >= 22 && masaResidualPct <= 26) {
			                    return 'Rango típico (22–26%)';
			                } else if (masaResidualPct < 22) {
			                    return 'Por debajo del rango típico (22–26%)';
			                } else {
			                    return 'Por encima del rango típico (22–26%)';
			                }
			            } else if (gender === 'femenino') {
			                if (masaResidualPct >= 19 && masaResidualPct <= 23) {
			                    return 'Rango típico (19–23%)';
			                } else if (masaResidualPct < 19) {
			                    return 'Por debajo del rango típico (19–23%)';
			                } else {
			                    return 'Por encima del rango típico (19–23%)';
			                }
			            }
			            return '(No calculado)';
			        }
			
			        // Actualizada función para formatear masaOseaSource con Observaciones
			        function formatMasaOseaSource(boneMassPct, gender, age, isAthlete) {
			            if (isNaN(boneMassPct) || !gender || !age) {
			                return '(No calculado)';
			            }
			            gender = gender.toLowerCase();
			            const boneMassRanges = {
			                masculino: {
			                    '15-19': { range: [14, 15], obs: 'Pico óseo' },
			                    '20-29': { range: [14, 15], obs: 'Máximo óseo' },
			                    '30-39': { range: [13.5, 14.5], obs: 'Inicio descenso' },
			                    '40-49': { range: [13, 14], obs: 'Pérdida sin ejercicio' },
			                    '50-59': { range: [12, 13.5], obs: 'Riesgo desmineralización' },
			                    '60-69': { range: [11.5, 13], obs: 'Disminución sin ejercicio' },
			                    '70+': { range: [11, 12.5], obs: 'Alto riesgo fracturas' },
			                    athlete: { range: [15, 16], obs: 'Densidad ósea sólida' }
			                },
			                femenino: {
			                    '15-19': { range: [12, 13.5], obs: 'Desarrollo óseo' },
			                    '20-29': { range: [12, 13.5], obs: 'Máximo óseo' },
			                    '30-39': { range: [11.5, 13], obs: 'Pérdida inicial' },
			                    '40-49': { range: [11, 12.5], obs: 'Pérdida acelerada' },
			                    '50-59': { range: [10.5, 12], obs: 'Riesgo osteoporosis' },
			                    '60-69': { range: [10, 11.5], obs: 'Pérdida significativa' },
			                    '70+': { range: [9.5, 11], obs: 'Prevención osteoporosis' },
			                    athlete: { range: [13, 14], obs: 'Densidad ósea sólida' }
			                }
			            };
			            const boneAgeRange = age >= 15 && age <= 19 ? '15-19' : 
			                                 age <= 29 ? '20-29' : 
			                                 age <= 39 ? '30-39' : 
			                                 age <= 49 ? '40-49' : 
			                                 age <= 59 ? '50-59' : 
			                                 age <= 69 ? '60-69' : '70+';
			            const entry = isAthlete ? boneMassRanges[gender].athlete : boneMassRanges[gender][boneAgeRange];
			            const [min, max] = entry.range;
			            const obs = entry.obs;
			            const rangeText = `${min}–${max}%`;
			            if (boneMassPct >= min && boneMassPct <= max) {
			                return `Rango saludable (${rangeText}): ${obs}`;
			            } else if (boneMassPct < min) {
			                return `Por debajo del rango saludable (${rangeText}): ${obs}`;
			            } else {
			                return `Por encima del rango saludable (${rangeText}): ${obs}`;
			            }
			        }
			
			        // Function to calculate % Grasa (Deurenberg)
			        function calculateGrasaPctDeurenberg(peso, altura, edad, sexo) {
			            console.log('[GrasaPctDeurenberg] Calculating % Grasa:', { peso, altura, edad, sexo });
			            
			            // Validate inputs
			            if (!peso || !altura || !edad || peso <= 0 || altura <= 0 || edad < 18 || !['hombre', 'mujer'].includes(sexo)) {
			                console.log('[GrasaPctDeurenberg] Invalid inputs, returning null:', { peso, altura, edad, sexo });
			                return null;
			            }
			            
			            // Convert altura from cm to meters
			            const alturaMeters = altura / 100;
			            console.log('[GrasaPctDeurenberg] Converted altura:', { alturaCm: altura, alturaMeters });
			            
			            // Calculate IMC (peso in kg, altura in meters)
			            const imc = peso / (alturaMeters * alturaMeters);
			            console.log('[GrasaPctDeurenberg] Calculated IMC:', { peso, alturaMeters, imc });
			            
			            // Validate IMC
			            if (imc < 10 || imc > 50) {
			                console.log('[GrasaPctDeurenberg] Invalid IMC, returning null:', { imc });
			                return null;
			            }
			            
			            // Map sexo to 1 (hombre) or 0 (mujer)
			            const sexoValue = sexo === 'hombre' ? 1 : 0;
			            
			            // Calculate % Grasa
			            const result = (1.20 * imc) + (0.23 * edad) - (10.8 * sexoValue) - 5.4;
			            console.log('[GrasaPctDeurenberg] Calculation:', {
			                imcTerm: 1.20 * imc,
			                edadTerm: 0.23 * edad,
			                sexoTerm: -10.8 * sexoValue,
			                constant: -5.4,
			                result
			            });
			            
			            return result;
			        }
			
			        // Function to format grasaPctDeurenbergSource based on educational table
			        function formatGrasaPctDeurenbergSource(grasaPct, sexo, edad, imc) {
			            console.log('[GrasaPctDeurenberg] Formatting source:', { grasaPct, sexo, edad, imc });
			            
			            // Validate inputs
			            if (!grasaPct || !sexo || !edad || !imc || edad < 18 || imc < 16.0 || imc > 34.9) {
			                console.log('[GrasaPctDeurenberg] Invalid inputs for source:', { 
			                    grasaPct, 
			                    sexo, 
			                    edad, 
			                    imc, 
			                    reason: !grasaPct ? 'Missing grasaPct' : !sexo ? 'Missing sexo' : !edad ? 'Missing edad' : !imc ? 'Missing imc' : edad < 18 ? 'Edad < 18' : imc < 16.0 ? 'IMC < 16.0' : 'IMC > 34.9' 
			                });
			                return '(No estimado)';
			            }
			        
			            const ranges = {
			                hombre: {
			                    '18-28': [
			                        { imc: [16.0, 18.4], grasa: [0, 12], observaciones: 'Riesgo de desnutrición, anemia, fatiga crónica, problemas reproductivos.' },
			                        { imc: [18.5, 24.9], grasa: [12, 18], observaciones: 'Valores bajos reflejan menor grasa visceral; el aumento de edad incrementa ligeramente el % de grasa.' },
			                        { imc: [25.0, 29.9], grasa: [19, 25], observaciones: 'Aumento notable de grasa subcutánea; ajuste por edad es mínimo en este rango joven.' },
			                        { imc: [30.0, 34.9], grasa: [25, 31], observaciones: 'Obesidad si sedentario; posible musculatura si atleta (e.g., levantador de pesas).' }
			                    ],
			                    '30-49': [
			                        { imc: [18.5, 24.9], grasa: [15, 21], observaciones: 'Incremento del % de grasa con edad debido a pérdida muscular; fórmula ajusta +0.23% por año.' },
			                        { imc: [25.0, 29.9], grasa: [22, 28], observaciones: 'Grasa corporal más pronunciada; riesgo de obesidad central aumenta con edad.' },
			                        { imc: [30.0, 34.9], grasa: [28, 34], observaciones: 'Obesidad probable por edad; músculo menos común salvo en entrenados.' }
			                    ]
			                },
			                mujer: {
			                    '18-28': [
			                        { imc: [16.0, 18.4], grasa: [0, 20], observaciones: 'Riesgo de desnutrición, anemia, fatiga crónica, problemas reproductivos.' },
			                        { imc: [18.5, 24.9], grasa: [20, 26], observaciones: 'Valores más altos que en hombres por mayor grasa esencial; estabilidad en jóvenes.' },
			                        { imc: [25.0, 29.9], grasa: [27, 33], observaciones: 'Aumento de grasa subcutánea; menor variación por edad en este rango.' },
			                        { imc: [30.0, 34.9], grasa: [33, 39], observaciones: 'Obesidad generalizada; músculo raro salvo en deportes de fuerza.' }
			                    ],
			                    '30-49': [
			                        { imc: [18.5, 24.9], grasa: [23, 29], observaciones: 'Subida del % de grasa con edad; influida por cambios hormonales post-30.' },
			                        { imc: [25.0, 29.9], grasa: [30, 36], observaciones: 'Alto riesgo de obesidad; grasa acumulada en caderas y abdomen.' },
			                        { imc: [30.0, 34.9], grasa: [36, 42], observaciones: 'Obesidad con riesgo alto por edad y cambios hormonales.' }
			                    ]
			                }
			            };
			        
			            // Use 30-49 range for edad > 49 to extend applicability
			            const ageRange = edad <= 28 ? '18-28' : '30-49';
			            console.log('[GrasaPctDeurenberg] Selected age range:', ageRange);
			            
			            const sexRanges = ranges[sexo.toLowerCase()]?.[ageRange];
			            if (!sexRanges) {
			                console.log('[GrasaPctDeurenberg] No ranges for sex/age, returning default:', { sexo, ageRange });
			                return '(No estimado)';
			            }
			        
			            // Try exact match first
			            let range = sexRanges.find(r => imc >= r.imc[0] && imc <= r.imc[1] && grasaPct >= r.grasa[0] && grasaPct <= r.grasa[1]);
			            let adjustedGrasaPct = grasaPct;
			            let observaciones = range ? range.observaciones : null;
			        
			            // If no exact match, find closest range and adjust
			            if (!range) {
			                console.log('[GrasaPctDeurenberg] No exact range match, finding closest range:', { imc, grasaPct });
			                let minDistance = Infinity;
			                let closestRange = null;
			        
			                sexRanges.forEach(r => {
			                    // Calculate midpoints for IMC and % Grasa
			                    const imcMid = (r.imc[0] + r.imc[1]) / 2;
			                    const grasaMid = (r.grasa[0] + r.grasa[1]) / 2;
			                    // Euclidean distance
			                    const distance = Math.sqrt(
			                        Math.pow(imc - imcMid, 2) + Math.pow(grasaPct - grasaMid, 2)
			                    );
			                    if (distance < minDistance) {
			                        minDistance = distance;
			                        closestRange = r;
			                    }
			                });
			        
			                range = closestRange;
			                // Adjust grasaPct to fit range bounds
			                if (grasaPct < range.grasa[0]) {
			                    adjustedGrasaPct = range.grasa[0];
			                } else if (grasaPct > range.grasa[1]) {
			                    adjustedGrasaPct = range.grasa[1];
			                }
			                observaciones = `${range.observaciones} (Aproximado: % Grasa ajustado a ${adjustedGrasaPct.toFixed(1)}%)`;
			                console.log('[GrasaPctDeurenberg] Closest range selected:', {
			                    range,
			                    originalGrasaPct: grasaPct,
			                    adjustedGrasaPct,
			                    distance: minDistance
			                });
			            } else {
			                console.log('[GrasaPctDeurenberg] Selected exact range:', range);
			            }
			            
			            return observaciones;
			        }
			
			        // Función para calcular % Grasa CUN-BAE
			        function calculateCUNBAEBodyFat(data, imc) {
			            const { edad, genero, peso, altura } = data;
			            
			            // Validate inputs
			            if (!edad || !genero || !peso || !altura || isNaN(imc)) {
			                console.warn('calculateCUNBAEBodyFat: Datos insuficientes', { edad, genero, peso, altura, imc });
			                return {
			                    grasaPct: NaN,
			                    source: '(No estimado: Datos insuficientes)'
			                };
			            }
			        
			            if (edad < 18) {
			                console.warn('calculateCUNBAEBodyFat: Edad menor a 18 años no soportada');
			                return {
			                    grasaPct: NaN,
			                    source: '(No estimado: Edad < 18 años)'
			                };
			            }
			        
			            const sexo = genero.toLowerCase() === 'masculino' ? 1 : genero.toLowerCase() === 'femenino' ? 0 : null;
			            if (sexo === null) {
			                console.warn('calculateCUNBAEBodyFat: Género no válido', { genero });
			                return {
			                    grasaPct: NaN,
			                    source: '(No estimado: Género no válido)'
			                };
			            }
			
			            // CUN-BAE formula with adjustment
			            const imc2 = imc * imc;
			            const grasaPct = -44.988 +
			                             (0.503 * edad) +
			                             (10.689 * sexo) +
			                             (3.172 * imc) -
			                             (0.026 * imc2) +
			                             (0.181 * imc * sexo) -
			                             (0.02 * imc * edad) -
			                             (0.005 * imc2 * sexo) +
			                             (0.00021 * imc2 * edad) -
			                             11.43;
			        
			            // Categorize based on sex and grasaPct
			            let category = '';
			            if (sexo === 1) { // Hombres
			                if (grasaPct < 12) {
			                    category = 'Bajo (<12%)';
			                } else if (grasaPct >= 12 && grasaPct <= 20) {
			                    category = 'Normal (12–20%)';
			                } else if (grasaPct > 20 && grasaPct <= 25) {
			                    category = 'Elevado (20–25%)';
			                } else {
			                    category = 'Obesidad (>25%)';
			                }
			            } else { // Mujeres
			                if (grasaPct < 25) {
			                    category = 'Bajo (<25%)';
			                } else if (grasaPct >= 25 && grasaPct <= 33) {
			                    category = 'Normal (25–33%)';
			                } else if (grasaPct > 33 && grasaPct <= 39) {
			                    category = 'Elevado (33–39%)';
			                } else {
			                    category = 'Obesidad (>39%)';
			                }
			            }
			        
			            return {
			                grasaPct: grasaPct,
			                source: `CUN-BAE: ${category}`
			            };
			        }

				    	//Funcion Calculo % Grasa Visceral
				   // Collect form data
				    
				// Initial validation
				       if (!data.peso || isNaN(data.altura) || !data.genero || isNaN(data.edad) || !data.es_deportista) {
				            alert('Por favor, complete los campos obligatorios: Género, Edad, Peso, Altura y si es Deportista.');
				            console.error('Missing required fields', {
				                peso: data.peso,
				                altura: data.altura,
				                genero: data.genero,
				                edad: data.edad,
				                es_deportista: data.es_deportista
				            });
				            return;
				        }
				 
				
				


				    // Validate altura
				        
				        try {
				            if (data.altura && !isNaN(data.altura)) {
				                alturaM = Number(data.altura) / 100;
				                if (alturaM < 1.2 || alturaM > 2.2) {
				                    throw new Error('Altura debe estar entre 120 y 220 cm');
				                }
				            } else {
				                throw new Error('Altura no proporcionada o inválida');
				            }
				        } catch (e) {
				            console.error('Error inicializando alturaM:', e.message);
				            content += `<p><strong>Error en Altura:</strong> ${e.message}. Por favor, revisa el valor ingresado para altura.</p>`;
				        }
				
				        // Reset results display
				        resetResultElements(resultElements);
				        if (explanationSection) {
				            explanationSection.style.display = 'none';
				        }
				        if (explanationContent) {
				            explanationContent.innerHTML = '';
				        }
				
				        // Normalize data
				        const GrasaVisceralData = createGrasaVisceralData(data);
				        console.log('Normalized GrasaVisceralData:', GrasaVisceralData);
				        logData(GrasaVisceralData); 
				    
				    // Visceral fat calculation
				    // 1. Primero declara el objeto results si no existe
					if (typeof results === 'undefined') {
					    let results = {};
					   let errors = [];
					}
				    	let errors = [];
				try { 
				    	if (isNaN(GrasaVisceralData.altura) || GrasaVisceralData.altura <= 0) errors.push('Altura inválida o faltante');
				            if (isNaN(GrasaVisceralData.edad) || GrasaVisceralData.edad <= 0) errors.push('Edad inválida o faltante');
				            if (!['masculino', 'femenino'].includes(GrasaVisceralData.genero)) errors.push('Género inválido');
				            if (isNaN(GrasaVisceralData.cintura) || GrasaVisceralData.cintura <= 0) errors.push('Circunferencia de cintura inválida o faltante');
				            if (typeof GrasaVisceralData.esDeportista !== 'boolean') errors.push('Estado de deportista inválido');
				
				            if (errors.length === 0) {
				              data = calcularGrasaVisceral(GrasaVisceralData);
						results.grasavisceralActual = data.porcentajeGrasa || data.iav;
						results.grasavisceralActualSource = `${data.riesgo} - ${data.metodo}`;
						 
						    
						console.log('%Grasa Visceral calculado:', {
						    grasaVisceralActual: results.grasavisceralActual,
						    grasaVisceralActualSource: results.grasavisceralActualSource
						});
				            } else {
				                console.warn('Datos incompletos o inválidos para el cálculo de grasa visceral:', GrasaVisceralData);
				                content += `<p class="error">Errores en grasa visceral: ${errors.join(', ')}</p>`;
				                results.grasavisceralActual = null;
				                results.grasavisceralActualSource = '(No calculado)';
				                window.calculatedResults = {
				                    grasavisceralActual: formatResult(null, 1),
				                    grasavisceralActualSource: '(No calculado)'
				                };
				            }

					
			            // --- Calculate IMC ---
			            if (!isNaN(alturaM) && data.peso && data.edad && data.genero) {
			                try {
			                    const imcResults = calculateIMC(data); // Use a different variable to avoid shadowing
			                    results.imc = imcResults.imc;
			                    results.imcSource = imcResults.imcSource;
			                    console.log('IMC calculado:', results.imc, results.imcSource);
			                } catch (e) {
			                    console.error('Error calculando IMC:', e.message);
			                    results.imc = NaN;
			                    results.imcSource = { clasificacion: 'Error', riesgo: e.message };
			                    content += `<p><strong>Error en IMC:</strong> ${e.message}. Por favor, revisa los datos ingresados.</p>`;
			                }
			            } else {
			                results.imc = NaN;
			                results.imcSource = { clasificacion: 'No calculado', riesgo: 'Datos insuficientes' };
			                content += `<p><strong>IMC:</strong> No calculado debido a datos insuficientes.</p>`;
			            }
			
				            // --- Calculate ICC ---
			            if (data.circ_cintura > 0 && data.circ_cadera > 0 && data.genero) {
			                try {
			                    const iccResults = calculateICC(data);
			                    results.icc = iccResults.icc;
			                    results.iccSource = iccResults.iccSource;
			                    console.log('ICC calculado:', results.icc, results.iccSource);
			                } catch (e) {
			                    console.error('Error calculando ICC:', e.message);
			                    results.icc = NaN;
			                    results.iccSource = { clasificacion: 'Error', riesgo: e.message };
			                    content += `<p><strong>Error en ICC:</strong> ${e.message}. Por favor, revisa los datos ingresados.</p>`;
			                }
			            } else {
			                results.icc = NaN;
			                results.iccSource = { clasificacion: 'No calculado', riesgo: 'Datos insuficientes' };
			                content += `<p><strong>ICC:</strong> No calculado debido a datos insuficientes.</p>`;
			            }
			
			            // --- Calculate Actual Body Fat % ---
			            try {
			                let actualBodyFatPct = NaN;
			                let actualBodyFatSource = '(No calculado)';
			        
			                if (!isNaN(data.grasa_actual_conocida)) {
			                    actualBodyFatPct = data.grasa_actual_conocida;
			                    actualBodyFatSource = '(Proporcionado: BioImpedancia)';
			                    console.log('Usando % Grasa Actual proporcionado:', actualBodyFatPct);
			                } else {
			                    if (data.edad < 6) {
			                        console.warn('Edad < 6 años: No hay ecuación adecuada para calcular % Grasa.');
			                        actualBodyFatSource = '(No calculado: Edad < 6 años)';
			                    } else if (data.edad >= 6 && data.edad <= 17) {
			                        actualBodyFatPct = calculateSlaughterBodyFat(data);
			                        if (!isNaN(actualBodyFatPct)) {
			                            actualBodyFatSource = '(Calculado: Slaughter, 6-17 años)';
			                            console.log('Calculando % Grasa Actual (Slaughter):', actualBodyFatPct);
			                        }
			                    } else {
			                        const isAthlete = data.es_deportista === 'si';
			                        if (isAthlete) {
			                            actualBodyFatPct = calculateJacksonPollockBodyFat(data);
			                            if (!isNaN(actualBodyFatPct)) {
			                                actualBodyFatSource = '(Calculado: Jackson-Pollock, 3 pliegues, deportistas)';
			                                console.log('Calculando % Grasa Actual (Jackson-Pollock):', actualBodyFatPct);
			                            }
			                        } else {
			                            actualBodyFatPct = calculateDurninWomersleyBodyFat(data);
			                            if (!isNaN(actualBodyFatPct)) {
			                                actualBodyFatSource = '(Calculado: Durnin-Womersley, adultos no deportistas)';
			                                console.log('Calculando % Grasa Actual (Durnin-Womersley):', actualBodyFatPct);
			                            }
			                        }
			                        if (isNaN(actualBodyFatPct)) {
			                            actualBodyFatPct = calculateCircumferenceBodyFat(data);
			                            if (!isNaN(actualBodyFatPct)) {
			                                actualBodyFatSource = '(Calculado: Circunferencias US Navy)';
			                                console.log('Calculando % Grasa Actual (Circunferencias US Navy):', actualBodyFatPct);
			                            } else {
			                                console.warn('No se pudo calcular % Grasa Actual: datos insuficientes');
			                            }
			                        }
			                    }
			                }
			        
			                results.grasaPctActual = actualBodyFatPct;
			                results.actualBodyFatSource = actualBodyFatSource;
			            } catch (error) {
			                console.error('Error al calcular porcentaje de grasa:', error.message);
			                results.grasaPctActual = NaN;
			                results.actualBodyFatSource = `Error: ${error.message}`;
			            }
			
			            // --- Calculate Desired Body Fat % ---
			            let desiredBodyFatPct = NaN;
			            let desiredBodyFatSource = '(No estimado)';
			            if (!isNaN(data.grasa_deseada) && data.grasa_deseada > 0) {
			                desiredBodyFatPct = Number(data.grasa_deseada);
			                desiredBodyFatSource = '(Proporcionado)';
			                console.log('Usando % Grasa Deseado proporcionado:', desiredBodyFatPct);
			            } else if (data.genero && data.edad) {
			                const isAthlete = data.es_deportista === 'si';
			                desiredBodyFatPct = estimateTargetBodyFat(data.genero, isAthlete, Number(data.edad));
			                if (!isNaN(desiredBodyFatPct)) {
			                    desiredBodyFatSource = '(Estimado según edad, sexo y nivel AF)';
			                    console.log('Estimando % Grasa Deseado:', desiredBodyFatPct);
			                }
			            }
			            results.grasaPctDeseado = desiredBodyFatPct;
			            results.grasaPctDeseadoSource = desiredBodyFatSource;
			            
			            // --- Calculate IMLG, IMG, and Tipología ---
					    // --- Calculate IMLG, IMG, and Tipología ---
					let bodyCompResults = null;
					//const alturaM = data.altura ? data.altura / 100 : NaN; // Define alturaM
					if (data.peso && !isNaN(data.altura) && !isNaN(results.grasaPctActual) && data.genero && data.edad >= 18) {
					    try {
					        bodyCompResults = generateBodyCompositionAnalysis(
					            {
					                peso: data.peso,
					                altura: data.altura, // Pass altura in cm
					                porcentajeGrasa: results.grasaPctActual
					            },
					            {
					                sexo: data.genero === 'masculino' ? 'hombre' : 'mujer', // Normalize for getRanges
					                edad: data.edad,
					                esDeportista: data.es_deportista === 'si'
					            }
					        );
					
					        // Validate bodyCompResults
					        if (!bodyCompResults || isNaN(bodyCompResults.imlg) || isNaN(bodyCompResults.img)) {
					            throw new Error('generateBodyCompositionAnalysis retornó datos inválidos');
					        }
					
					        results.masaGrasaActual = (results.grasaPctActual / 100) * data.peso;
					        results.masaMagraActual = data.peso - results.masaGrasaActual;
					        results.imlgActual = bodyCompResults.imlg;
					        results.imlgActualSource = bodyCompResults.imlgCategory || '(No calculado)';
					        results.imgActual = bodyCompResults.img;
					        results.imgActualSource = bodyCompResults.imgCategory || '(No calculado)';
					        results.tipologiaActual = bodyCompResults.tipologia || 'Indefinido';
					        results.masaGrasaActualSource = results.actualBodyFatSource;
					        results.mlgActual = results.masaMagraActual;
					        results.mlgActualSource = 'Calculado desde % Grasa Actual';
					
					        console.log('Resultados basados en % Grasa Actual:', {
					            grasaPctActual: results.grasaPctActual,
					            masaGrasaActual: results.masaGrasaActual,
					            masaMagraActual: results.masaMagraActual,
					            imlgActual: results.imlgActual,
					            imgActual: results.imgActual,
					            tipologiaActual: results.tipologiaActual
					        });
					    } catch (e) {
					        console.error('Error calculando IMLG, IMG y Tipología (Actual):', e.message);
					        results.masaGrasaActual = NaN;
					        results.masaMagraActual = NaN;
					        results.imlgActual = NaN;
					        results.imlgActualSource = 'Error: ' + e.message;
					        results.imgActual = NaN;
					        results.imgActualSource = 'Error: ' + e.message;
					        results.tipologiaActual = 'Indefinido';
					        results.mlgActual = NaN;
					        results.mlgActualSource = 'Error: ' + e.message;
					        content += `<p><strong>Error en IMLG e IMG (Actual):</strong> ${e.message}.</p>`;
					        bodyCompResults = null; // Ensure null for consistency
					    }
					} else {
					    console.warn('No se pudieron calcular métricas (Actual): datos insuficientes', {
					        peso: data.peso,
					        alturaM,
					        grasaPctActual: results.grasaPctActual,
					        genero: data.genero,
					        edad: data.edad
					    });
					    results.masaGrasaActual = NaN;
					    results.masaMagraActual = NaN;
					    results.imlgActual = NaN;
					    results.imlgActualSource = '(No calculado: Datos insuficientes)';
					    results.imgActual = NaN;
					    results.imgActualSource = '(No calculado: Datos insuficientes)';
					    results.tipologiaActual = 'Indefinido';
					    results.mlgActual = NaN;
					    results.mlgActualSource = '(No calculado)';
					    content += `<p><strong>IMLG e IMG (Actual):</strong> No calculado debido a datos insuficientes.</p>`;
					}
			
			            // --- Calculate Metabolic Age ---
					console.log('Valor de data.genero:', data.genero);
			            try {
			                const metabolicData = {
			                    genero: data.genero.toLowerCase() === 'masculino' ? 'masculino' : 'femenino',
			                    edad: data.edad,
			                    peso: data.peso,
			                    altura: data.altura,
			                    esDeportista: data.es_deportista === 'si',
			                    pliegues: {
			                        tricipital: data.pliegue_tricipital || 0,
			                        subescapular: data.pliegue_subescapular || 0,
			                        suprailiaco: data.pliegue_suprailiaco || 0,
			                        bicipital: data.pliegue_bicipital || 0
			                    },
			                    porcentajeGrasa: isNaN(results.grasaPctActual) ? null : results.grasaPctActual,
			                    cintura: data.circ_cintura || 0,
			                    imc: data.imc
			                };
			                    console.log('metabolicData:', metabolicData);
					    const metabolicResult = calculateMetabolicAge(metabolicData);
					    console.log('metabolicResult:', metabolicResult);
					
					    results.edadmetabolica = metabolicResult.edadMetabolica;
					    console.log(results.edadmetabolica);
					    console.log(metabolicResult.edadMetabolica);
					    results.edadmetabolicaSource = metabolicResult.method;
					    results.BRMEstimado = metabolicResult.BRMEstimado;
					    results.BRMEstimadoSource = metabolicResult.BRMEstimadoSource;
					    results.masaGrasaMetabolic = metabolicResult.masaGrasa;
					    results.masaMagraMetabolic = metabolicResult.masaMagra;
					    results.masaGrasaMetabolicSource = metabolicResult.method;
					    results.grasaPctMetabolic = (metabolicResult.masaGrasa / data.peso) * 100;
					    results.mlgMetabolic = metabolicResult.masaMagra;
					    results.mlgMetabolicSource = 'Calculado desde Edad Metabólica';
						if (data.peso && !isNaN(alturaM) && !isNaN(results.grasaPctMetabolic)) {
						        try {
						            const bodyCompResultsMetabolic = generateBodyCompositionAnalysis(
						                {
						                    peso: data.peso,
						                    altura: data.altura,
						                    porcentajeGrasa: results.grasaPctMetabolic
						                },
						                {
						                    sexo: data.genero,
						                    edad: data.edad,
						                    esDeportista: data.es_deportista === 'si'
						                }
						            );
						
						            results.imlgMetabolic = bodyCompResultsMetabolic.imlg;
						            results.imlgMetabolicSource = bodyCompResultsMetabolic.imlgCategory || '(No calculado)';
						            results.imgMetabolic = bodyCompResultsMetabolic.img;
						            results.imgMetabolicSource = bodyCompResultsMetabolic.imgCategory || '(No calculado)';
						            results.tipologiaMetabolic = bodyCompResultsMetabolic.tipologia || 'Indefinido';
						
						            console.log('Resultados basados en % Grasa Metabólica:', {
						                grasaPctMetabolic: results.grasaPctMetabolic,
						                masaGrasaMetabolic: results.masaGrasaMetabolic,
						                masaMagraMetabolic: results.masaMagraMetabolic,
						                imlgMetabolic: results.imlgMetabolic,
						                imgMetabolic: results.imgMetabolic,
						                tipologiaMetabolic: results.tipologiaMetabolic
						            });
						        } catch (e) {
						            console.error('Error al calcular la edad metabólica o BMR:', error.message);
							    results.edadmetabolica = NaN;
							    results.edadmetabolicaSource = 'Error en el cálculo';
							    results.BRMEstimado = NaN;
							    results.BRMEstimadoSource = `Error: ${error.message}`;
							    results.masaGrasaMetabolic = NaN;
							    results.masaMagraMetabolic = NaN;
							    results.masaGrasaMetabolicSource = `Error: ${error.message}`;
							    results.grasaPctMetabolic = NaN;
							    results.mlgMetabolic = NaN;
							    results.mlgMetabolicSource = 'Error: ' + error.message;
								if (!isNaN(results.mlgMetabolic) && !isNaN(results.grasaPctDeseado)) {
								    results.pesoIdeal = results.mlgMetabolic / (1 - results.grasaPctDeseado / 100);
								} else {
								    results.pesoIdeal = NaN;
								}
						        }
						    } else {
						        results.imlgMetabolic = NaN;
						        results.imlgMetabolicSource = '(No calculado: Datos insuficientes)';
						        results.imgMetabolic = NaN;
						        results.imgMetabolicSource = '(No calculado: Datos insuficientes)';
						        results.tipologiaMetabolic = 'Indefinido';
						        content += `<p><strong>IMLG e IMG (Metabólico):</strong> No calculado debido a datos insuficientes.</p>`;
						    }
					    		    console.log('Edad Metabólica calculada:', results.edadmetabolica, 'Método:', results.edadmetabolicaSource);
							    console.log('BMR calculado:', results.BRMEstimado, 'Fuente:', results.BRMEstimadoSource);
							    console.log('Masa Magra (Metabólica):', results.masaMagraMetabolic, 'Masa Grasa (Metabólica):', results.masaGrasaMetabolic);
			            } catch (error) {
			                console.error('Error al calcular la edad metabólica o BMR:', error.message);
			                results.edadmetabolica = NaN;
			                results.edadmetabolicaSource = 'Error en el cálculo';
			                results.BRMEstimado = NaN;
			                results.BRMEstimadoSource = `Error: ${error.message}`;
			                results.masaMagra = NaN;
			                results.masaGrasa = NaN;
			                results.masaGrasaSource = `Error: ${error.message}`;
			            }
			
			            // --- Other Calculations ---
			            // Calculate Masa Grasa y Masa Libre de Grasa
			            
				    if (!isNaN(results.grasaPctActual) && data.peso) {
				        try {
				            // Priorizar valores de metabolicResult si están disponibles
				            if (!isNaN(results.masaGrasa) && !isNaN(results.masaMagra)) {
				                // Usar valores de calculateMetabolicAge (Masa Grasa: 35.4, Masa Magra: 64.6)
				                console.log('Usando Masa Grasa y Magra de calculateMetabolicAge:', {
				                    masaGrasa: results.masaGrasa,
				                    masaMagra: results.masaMagra
				                });
				            } else {
				                // Calcular desde results.grasaPctActual (17.913427508394022%)
				                results.masaGrasa = (results.grasaPctActual / 100) * data.peso;
						    console.log('Masa grasa:', results.masaGrasa);
						    console.log('Porcentaje de grasa actual:', results.grasaPctActual);
				                results.masaMagra = data.peso - results.masaGrasa;
						     console.log('Masa grasa:', results.masaGrasa);
				                results.masaGrasaSource = results.actualBodyFatSource || '(Calculado desde % grasa)';
				                console.log('Calculando Masa Grasa y Magra desde % grasa:', {
				                    grasaPctActual: results.grasaPctActual,
				                    peso: data.peso,
				                    masaGrasa: results.masaGrasa,
				                    masaMagra: results.masaMagra
				                });
				            }
				            results.mlg = results.masaMagra;
				            results.mlgSource = 'Calculado a partir de % grasa o edad metabólica';
						 console.log('Masa grasa:', results.masaGrasa);
				        } catch (e) {
				            console.error('Error calculando Masa Grasa y Magra:', e.message);
				            results.masaGrasa = NaN;
				            results.masaMagra = NaN;
				            results.mlg = NaN;
				            results.mlgSource = 'Error: ' + e.message;
				            results.masaGrasaSource = 'Error: ' + e.message;
				            content += `<p><strong>Error en Masa Grasa y Magra:</strong> ${e.message}. Por favor, revisa los datos ingresados.</p>`;
				        }
				    } else {
				        results.masaGrasa = NaN;
				        results.masaMagra = NaN;
				        results.mlg = NaN;
				        results.mlgSource = '(No calculado: Falta % grasa o peso)';
				        results.masaGrasaSource = '(No calculado)';
				        content += `<p><strong>Masa Grasa y Magra:</strong> No calculado debido a datos insuficientes.</p>`;
				    }
			
			            if (!isNaN(results.mlg) && !isNaN(results.grasaPctDeseado)) {
			                results.pesoIdeal = results.mlg / (1 - results.grasaPctDeseado / 100);
			            } else {
			                results.pesoIdeal = NaN;
			            }
					results.pesoIdealActual = !isNaN(results.masaMagraActual) && !isNaN(results.grasaPctDeseado)
					    ? results.masaMagraActual / (1 - results.grasaPctDeseado / 100)
					    : NaN;
					results.pesoIdealMetabolic = !isNaN(results.masaMagraMetabolic) && !isNaN(results.grasaPctDeseado)
					    ? results.masaMagraMetabolic / (1 - results.grasaPctDeseado / 100)
					    : NaN;
			
			            if (data.peso && !isNaN(results.pesoIdeal)) {
			                results.pesoObjetivo = results.pesoIdeal - data.peso;
			            } else {
			                results.pesoObjetivo = NaN;
			            }
			
			            if (!isNaN(alturaM)) {
			                results.imc = data.peso / (alturaM * alturaM);
			            } else {
			                results.imc = NaN;
			            }
			
			            if (data.circ_cadera > 0 && data.circ_cintura) {
			                results.icc = data.circ_cintura / data.circ_cadera;
			            } else {
			                results.icc = NaN;
			            }
			            
			            // Calculate Área Muscular Brazo (AMB)
			            if (data.circ_brazo && data.pliegue_tricipital && data.edad && data.genero) {
			                try {
			                    const circBrazo = Number(data.circ_brazo);
			                    const pliegueTricipital = Number(data.pliegue_tricipital);
			                    const age = Number(data.edad);
			                    const isAthlete = data.es_deportista === 'si';
			                    const gender = data.genero ? data.genero.toLowerCase() : '';
			                    // Log gender for debugging
			                    console.log('Gender for AMB calculation:', gender);
			            
			                    // Validate gender early
			                    if (!['masculino', 'femenino'].includes(gender)) {
			                        throw new Error('Género no válido: debe ser "masculino" o "femenino"');
			                    }
			        
			                    if (circBrazo < 20 || circBrazo > 50) throw new Error('Circunferencia del brazo debe estar entre 20 y 50 cm');
			                    if (pliegueTricipital < 2 || pliegueTricipital > 40) throw new Error('Pliegue tricipital debe estar entre 2 y 40 mm');
			                    if (age < 18) throw new Error('Edad debe ser mayor o igual a 18 años');
			                    if (!['masculino', 'femenino'].includes(data.genero)) throw new Error('Género no válido');
			        
			                    const tricepsCm = pliegueTricipital / 10;
			                    const term = circBrazo - Math.PI * tricepsCm;
			                    const baseAMB = (term * term) / (4 * Math.PI);
			        
			                    let correction = 0;
			                    if (gender === 'masculino') {
			                        correction = isAthlete ? (age < 40 ? 8 : age < 60 ? 7 : 6) : (age < 40 ? 10 : age < 60 ? 9 : 8);
			                    } else if (gender === 'femenino') {
			                        correction = isAthlete ? (age < 40 ? 5 : age < 60 ? 4.5 : 4) : (age < 40 ? 6.5 : age < 60 ? 6 : 5.5);
			                    }
			        
			                    results.amb = Math.max(baseAMB - correction, 0);
			               
			                    // Define AMB reference ranges
			                    const ambRanges = {
			                        masculino: {
			                            general: {
			                                '18-20': { P5: 23.4, P50: 30.4, P95: 39.6 },
			                                '21-24': { P5: 23.6, P50: 30.6, P95: 39.8 },
			                                '25-29': { P5: 23.8, P50: 31.0, P95: 40.0 },
			                                '30-34': { P5: 23.5, P50: 30.6, P95: 39.8 },
			                                '35-39': { P5: 22.9, P50: 29.9, P95: 39.0 },
			                                '40-44': { P5: 22.6, P50: 29.5, P95: 38.5 },
			                                '45-49': { P5: 21.8, P50: 28.5, P95: 37.3 },
			                                '50-54': { P5: 21.2, P50: 27.9, P95: 36.5 },
			                                '55-59': { P5: 20.6, P50: 27.1, P95: 35.5 },
			                                '60-64': { P5: 20.2, P50: 26.4, P95: 34.7 },
			                                '65-70': { P5: 19.0, P50: 25.0, P95: 33.0 },
			                                '70+': { P5: 16.5, P50: 21.9, P95: 29.0 }
			                            },
			                            athlete: {
			                                '18-20': { P50: 30.5, P75: 34.5, P90: 40.5 },
			                                '21-24': { P50: 30.8, P75: 34.8, P90: 41.0 },
			                                '25-29': { P50: 31.2, P75: 35.2, P90: 41.5 },
			                                '30-34': { P50: 30.8, P75: 34.7, P90: 41.0 },
			                                '35-39': { P50: 30.0, P75: 33.8, P90: 40.0 },
			                                '40-44': { P50: 29.6, P75: 33.3, P90: 39.5 },
			                                '45-49': { P50: 28.7, P75: 32.1, P90: 38.3 },
			                                '50-54': { P50: 28.1, P75: 31.5, P90: 37.5 },
			                                '55-59': { P50: 27.2, P75: 30.5, P90: 36.4 },
			                                '60-64': { P50: 26.5, P75: 29.7, P90: 35.5 },
			                                '65-70': { P50: 25.0, P75: 28.2, P90: 34.0 },
			                                '70+': { P50: 21.9, P75: 25.2, P90: 30.0 }
			                            }
			                        },
			                        femenino: {
			                            general: {
			                                '18-20': { P5: 17.7, P50: 22.6, P95: 28.8 },
			                                '21-24': { P5: 17.9, P50: 22.8, P95: 29.1 },
			                                '25-29': { P5: 18.0, P50: 23.2, P95: 29.8 },
			                                '30-34': { P5: 17.8, P50: 22.9, P95: 29.4 },
			                                '35-39': { P5: 17.3, P50: 22.4, P95: 29.0 },
			                                '40-44': { P5: 17.1, P50: 22.2, P95: 28.8 },
			                                '45-49': { P5: 16.6, P50: 21.8, P95: 28.4 },
			                                '50-54': { P5: 16.3, P50: 21.4, P95: 27.9 },
			                                '55-59': { P5: 15.8, P50: 21.0, P95: 27.4 },
			                                '60-64': { P5: 15.4, P50: 20.5, P95: 26.8 },
			                                '65-70': { P5: 14.7, P50: 19.5, P95: 25.6 },
			                                '70+': { P5: 13.2, P50: 17.7, P95: 23.5 }
			                            },
			                            athlete: {
			                                '18-20': { P50: 22.7, P75: 25.8, P90: 30.5 },
			                                '21-24': { P50: 22.9, P75: 26.0, P90: 31.0 },
			                                '25-29': { P50: 23.3, P75: 26.5, P90: 31.5 },
			                                '30-34': { P50: 23.0, P75: 26.2, P90: 31.0 },
			                                '35-39': { P50: 22.5, P75: 25.5, P90: 30.2 },
			                                '40-44': { P50: 22.2, P75: 25.1, P90: 29.7 },
			                                '45-49': { P50: 21.8, P75: 24.6, P90: 29.0 },
			                                '50-54': { P50: 21.4, P75: 24.1, P90: 28.4 },
			                                '55-59': { P50: 21.0, P75: 23.6, P90: 27.8 },
			                                '60-64': { P50: 20.5, P75: 22.9, P90: 27.0 },
			                                '65-70': { P50: 19.5, P75: 21.8, P90: 25.6 },
			                                '70+': { P50: 17.7, P75: 20.0, P90: 24.0 }
			                            }
			                        }
			                    };
			
			                    // Determine age range
			                    let ageRange;
			                    if (age >= 18 && age <= 20) ageRange = '18-20';
			                    else if (age <= 24) ageRange = '21-24';
			                    else if (age <= 29) ageRange = '25-29';
			                    else if (age <= 34) ageRange = '30-34';
			                    else if (age <= 39) ageRange = '35-39';
			                    else if (age <= 44) ageRange = '40-44';
			                    else if (age <= 49) ageRange = '45-49';
			                    else if (age <= 54) ageRange = '50-54';
			                    else if (age <= 59) ageRange = '55-59';
			                    else if (age <= 64) ageRange = '60-64';
			                    else if (age <= 70) ageRange = '65-70';
			                    else ageRange = '70+';
			
			                    // Verify ambRanges[gender]
			                    if (!ambRanges[gender]) {
			                        throw new Error(`No se encontraron rangos de AMB para el género "${gender}"`);
			                    }
			                    // Select ranges
			                    const ranges = isAthlete ? ambRanges[gender].athlete[ageRange] : ambRanges[gender].general[ageRange];
			                    // Verify ranges
			                    if (!ranges) {
			                        throw new Error(`No se encontraron rangos de AMB para el rango de edad "${ageRange}" y género "${gender}"`);
			                    }
			                    // Set ambSource
			                    results.ambSource = formatAmbSource(results.amb, ranges, isAthlete, gender, ageRange);
			        
			                    console.log('AMB calculado:', { amb: results.amb, ambSource: results.ambSource });
			                } catch (e) {
			                    console.error('Error calculando AMB:', e.message);
			                    results.amb = NaN;
			                    results.ambSource = 'Error: ' + e.message;
			                    content += `<p><strong>Error en AMB:</strong> ${e.message}. Por favor, revisa los datos ingresados.</p>`;
			                }
			            } else {
			                results.amb = NaN;
			                results.ambSource = '(No calculado: Datos insuficientes)';
			                content += '<p><strong>Área Muscular Brazo (AMB):</strong> No calculado debido a datos insuficientes (falta circunferencia del brazo, pliegue tricipital, edad o género).</p>';
			            }
			
			            // MMT Calculation and %MMT
			            if (!isNaN(alturaM) && !isNaN(results.amb)  && data.edad && ['masculino', 'femenino'].includes(data.genero.toLowerCase()) && data.peso) {
			                try {
			                    const alturaCm = Number(data.altura);
			                    const amb = Number(results.amb);
			                    const edad = Number(data.edad);
			                    const gender = data.genero.toLowerCase();
			                    const isAthlete = data.es_deportista === 'si';
			                
			                    if (alturaCm < 120 || alturaCm > 220) throw new Error('Altura debe estar entre 120 y 220 cm');
			                    if (amb < 10 || amb > 100) throw new Error('Área Muscular Brazo (AMB) debe estar entre 10 y 100 cm²');
			                    if (edad < 15) throw new Error('Edad debe ser mayor o igual a 15 años para MMT');
			                    if (data.peso <= 0) throw new Error('Peso debe ser mayor a 0');
			        
			                    const sportType = data.tipo_deporte || 'general';
			                    let ambMultiplier = 0.0029;
			                    if (data.es_deportista === 'si') {
			                        switch (sportType) {
			                            case 'fuerza': ambMultiplier = 0.0030; break;
			                            case 'resistencia': ambMultiplier = 0.0028; break;
			                            case 'estetico': ambMultiplier = 0.00285; break;
			                            default: ambMultiplier = 0.0029;
			                        }
			                    } else { // No es deportista
			                        ambMultiplier = 0.0024;
			                    }
			                    
			                    results.mmt = alturaCm * (0.0264 + ambMultiplier * amb);
			                    results.Pctmmt = (results.mmt / data.peso) * 100;
			                    results.PctmmtSource = formatPctmmtSource(results.Pctmmt, gender, isAthlete);
			                    results.mmtSportType = sportType;
			
			                    console.log('MMT y %MMT calculados:', {
			                        mmt: results.mmt,
			                        Pctmmt: results.Pctmmt,
			                        PctmmtSource: results.PctmmtSource,
			                        sportType: sportType
			                    });
			                } catch (e) {
			                    console.error('Error calculando MMT:', e.message);
			                    results.mmt = NaN;
			                    results.Pctmmt = NaN;
			                    results.PctmmtSource = 'Error: ' + e.message;
			                    content += `<p><strong>Error en Masa Muscular Total (MMT):</strong> ${e.message}. Por favor, revisa los datos ingresados.</p>`;
			                }
			            } else {
			                results.mmt = NaN;
			                results.Pctmmt = NaN;
			                results.PctmmtSource = '(No calculado: Datos insuficientes)';
			                content += `<p><strong>Masa Muscular Total (MMT):</strong> No calculado debido a datos insuficientes.</p>`;
			            }
			
			            // Masa Ósea Calculation
			            if (!isNaN(alturaM) && data.diam_muneca && data.diam_femur && data.peso && data.edad && data.genero) {
			                try {
			                    const diamMuneca = Number(data.diam_muneca);
			                    const diamFemur = Number(data.diam_femur);
			                    const peso = Number(data.peso);
			                    const age = Number(data.edad);
			                    const isAthlete = data.es_deportista === 'si';
			                    if (diamMuneca < 4 || diamMuneca > 10) throw new Error('Diámetro de muñeca debe estar entre 4 y 10 cm');
			                    if (diamFemur < 6 || diamFemur > 12) throw new Error('Diámetro de fémur debe estar entre 6 y 12 cm');
			                    if (peso < 30 || peso > 150) throw new Error('Peso debe estar entre 30 y 150 kg');
			                    if (age < 15) throw new Error('Edad debe ser mayor o igual a 15 años');
			                    const diamMunecaM = diamMuneca / 100;
			                    const diamFemurM = diamFemur / 100;
			                    let masaOsea = 3.02 * Math.pow(alturaM * alturaM * diamMunecaM * diamFemurM * 400, 0.712);
			                    if (isAthlete) masaOsea *= 1.05;
			                    results.masaOsea = Number(masaOsea.toFixed(1));
			                    const boneMassPct = (results.masaOsea / peso) * 100;
			                    results.masaOseaSource = formatMasaOseaSource(boneMassPct, data.genero, age, isAthlete);
			                    console.log('Masa Ósea calculada:', {
			                        masaOsea: results.masaOsea,
			                        boneMassPct,
			                        masaOseaSource: results.masaOseaSource
			                    });
			                } catch (e) {
			                    console.error('Error calculando Masa Ósea:', e.message);
			                    results.masaOsea = NaN;
			                    results.masaOseaSource = 'Error: ' + e.message;
			                    content += `<p><strong>Error en Masa Ósea:</strong> ${e.message}. Por favor, revisa los datos ingresados.</p>`;
			                }
			            } else {
			                results.masaOsea = NaN;
			                results.masaOseaSource = '(No calculado: Falta altura, diámetros óseos, peso, edad o género)';
			                content += '<p><strong>Masa Ósea:</strong> No calculado debido a datos insuficientes.</p>';
			            }
			
			            // Masa Residual Calculation
			            if (data.peso && data.genero) {
			                try {
			                    if (data.peso <= 0) throw new Error('Peso debe ser mayor a 0');
			                    if (!['masculino', 'femenino'].includes(data.genero.toLowerCase())) {
			                        throw new Error('Género debe ser "masculino" o "femenino"');
			                    }
			                    const factor = data.genero.toLowerCase() === 'masculino' ? 0.24 : 0.21;
			                    results.masaResidual = data.peso * factor;
			                    const masaResidualPct = (results.masaResidual / data.peso) * 100;
			                    results.masaResidualSource = formatMasaResidualSource(masaResidualPct, data.genero);
			                    console.log('Masa Residual calculada:', {
			                        masaResidual: results.masaResidual,
			                        masaResidualPct,
			                        masaResidualSource: results.masaResidualSource
			                    });
			                } catch (e) {
			                    console.error('Error calculando Masa Residual:', e.message);
			                    results.masaResidual = NaN;
			                    results.masaResidualSource = 'Error: ' + e.message;
			                    content += `<p><strong>Error en Masa Residual:</strong> ${e.message}. Por favor, revisa los datos ingresados.</p>`;
			                }
			            } else {
			                results.masaResidual = NaN;
			                results.masaResidualSource = '(No calculado: Falta peso o género)';
			                content += `<p><strong>Masa Residual:</strong> No calculado debido a datos insuficientes (falta peso o género).</p>`;
			            }
			
			           try {
					    if (
					        data.altura &&
					        data.peso &&
					        data.pliegue_tricipital &&
					        data.pliegue_subescapular &&
					        data.pliegue_suprailiaco &&
					        data.pliegue_pantorrilla &&
					        data.diam_humero &&
					        data.diam_femur &&
					        data.circ_brazo &&
					        data.circ_pantorrilla
					    ) {
					        // Convert and validate inputs
					        const altura = parseFloatSafe(data.altura);
					        const peso = parseFloatSafe(data.peso);
					        const pliegueTricipital = parseFloatSafe(data.pliegue_tricipital);
					        const pliegueSubescapular = parseFloatSafe(data.pliegue_subescapular);
					        const pliegueSuprailiaco = parseFloatSafe(data.pliegue_suprailiaco);
					        const plieguePantorrilla = parseFloatSafe(data.pliegue_pantorrilla);
					        let diamHumero = parseFloatSafe(data.diam_humero);
					        let diamFemur = parseFloatSafe(data.diam_femur);
					        const circBrazo = parseFloatSafe(data.circ_brazo);
					        const circPantorrilla = parseFloatSafe(data.circ_pantorrilla);
					
					        // Validate ranges and units
					        if (altura < 100 || altura > 250) throw new Error('Altura fuera de rango (100–250 cm)');
					        if (peso < 30 || peso > 200) throw new Error('Peso fuera de rango (30–200 kg)');
					        if (pliegueTricipital < 2 || pliegueTricipital > 50) throw new Error('Pliegue tricipital fuera de rango (2–50 mm)');
					        if (pliegueSubescapular < 2 || pliegueSubescapular > 50) throw new Error('Pliegue subescapular fuera de rango (2–50 mm)');
					        if (pliegueSuprailiaco < 2 || pliegueSuprailiaco > 50) throw new Error('Pliegue suprailiaco fuera de rango (2–50 mm)');
					        if (plieguePantorrilla < 2 || plieguePantorrilla > 50) throw new Error('Pliegue pantorrilla fuera de rango (2–50 mm)');
					        if (circBrazo < 20 || circBrazo > 50) throw new Error('Circunferencia brazo fuera de rango (20–50 cm)');
					        if (circPantorrilla < 25 || circPantorrilla > 60) throw new Error('Circunferencia pantorrilla fuera de rango (25–60 cm)');
					
					        // Convert bone diameters from mm to cm if necessary
					        if (diamHumero > 20) {
					            console.warn(`diam_humero (${diamHumero}) parece estar en mm, convirtiendo a cm`);
					            diamHumero /= 10;
					        }
					        if (diamFemur > 20) {
					            console.warn(`diam_femur (${diamFemur}) parece estar en mm, convirtiendo a cm`);
					            diamFemur /= 10;
					        }
					        if (diamHumero < 4 || diamHumero > 10) throw new Error('Diámetro húmero fuera de rango (4–10 cm)');
					        if (diamFemur < 6 || diamFemur > 12) throw new Error('Diámetro fémur fuera de rango (6–12 cm)');
					
					        // Log inputs for debugging
					        console.log('Somatotipo inputs:', {
					            altura, peso, pliegueTricipital, pliegueSubescapular, pliegueSuprailiaco,
					            plieguePantorrilla, diamHumero, diamFemur, circBrazo, circPantorrilla
					        });
					
					        // Endomorfia
					        const sum3Pliegues = pliegueTricipital + pliegueSubescapular + pliegueSuprailiaco;
					        const X = sum3Pliegues * (170.18 / altura);
					        results.endomorfia = -0.7182 + 0.1451 * X - 0.00068 * Math.pow(X, 2) + 0.0000014 * Math.pow(X, 3);
					
					        // Mesomorfia
					        const pliegueTricepsCm = pliegueTricipital / 10;
					        const plieguePantorrillaCm = plieguePantorrilla / 10;
					        const circBrazoCorregido = circBrazo - pliegueTricepsCm;
					        const circPantorrillaCorregida = circPantorrilla - plieguePantorrillaCm;
					        const rawMesomorfia =
					            0.858 * diamHumero +
					            0.601 * diamFemur +
					            0.188 * circBrazoCorregido +
					            0.161 * circPantorrillaCorregida -
					            0.131 * (altura / 100) +
					            4.5;
					        // Normalize mesomorfia to typical range (divide by ~5.7 to scale 28 to ~4.9)
					        results.mesomorfia = rawMesomorfia / 5.7;
					
					        // Ectomorfia
					        const HWR = altura / Math.pow(peso, 1 / 3);
					        if (HWR > 40.75) {
					            results.ectomorfia = 0.732 * HWR - 28.58;
					        } else if (HWR >= 38.25) {
					            results.ectomorfia = 0.463 * HWR - 17.63;
					        } else {
					            results.ectomorfia = 0.1;
					        }
					
					        // Ensure non-negative
					        results.endomorfia = Math.max(0.1, results.endomorfia);
					        results.mesomorfia = Math.max(0.1, results.mesomorfia);
					        results.ectomorfia = Math.max(0.1, results.ectomorfia);
					        results.somatotipoSource = 'Heath-Carter';
					
					        // Validate mesomorfia range
					        if (results.mesomorfia > 10) {
					            console.warn(`Mesomorfia (${results.mesomorfia}) sigue siendo alta tras normalización, revisa los datos de entrada`);
					            content += `<p><strong>Advertencia:</strong> Mesomorfia (${results.mesomorfia.toFixed(1)}) es inusualmente alta, por favor verifica los datos de entrada (diámetros óseos, circunferencias).</p>`;
					        }
					
					        console.log('Somatotipo calculado:', {
					            endomorfia: results.endomorfia,
					            mesomorfia: results.mesomorfia,
					            ectomorfia: results.ectomorfia
					        });
					    } else {
					        throw new Error('Datos insuficientes para somatotipo');
					    }
					} catch (e) {
					    console.error('Error calculando Somatotipo:', e.message);
					    results.endomorfia = NaN;
					    results.mesomorfia = NaN;
					    results.ectomorfia = NaN;
					    results.somatotipoSource = `Error: ${e.message}`;
					    content += `<p><strong>Error en Somatotipo:</strong> ${e.message}.</p>`;
					}
							
			            // Destructure inputs
			            let { genero, edad, peso, altura, esDeportista } = data;
			            console.log('[GrasaPctDeurenberg] Destructured inputs:', { genero, edad, peso, altura, esDeportista });
			        
			            // Parse and validate inputs
			            edad = parseInt(edad);
			            peso = parseFloat(peso);
			            altura = parseFloat(altura);
			            esDeportista = esDeportista === 'true' || esDeportista === true;
			            const sexo = genero?.toLowerCase() === 'masculino' ? 'hombre' : genero?.toLowerCase() === 'femenino' ? 'mujer' : null;
			            console.log('[GrasaPctDeurenberg] Parsed inputs:', { edad, peso, altura, esDeportista, sexo });
			        
			            // Convert altura to meters for logging (not needed for calculation)
			            const alturaMeters = altura > 0 ? altura / 100 : null;
			            console.log('[GrasaPctDeurenberg] Converted altura:', { alturaCm: altura, alturaMeters });
			        
			            // Validate inputs
			            if (!peso || peso <= 0 || !altura || altura <= 0 || !edad || isNaN(edad) || edad < 18 || !sexo) {
			                console.log('[GrasaPctDeurenberg] Input validation failed:', { peso, altura, edad, sexo });
			                results.grasaPctDeurenberg = null;
			                results.grasaPctDeurenbergSource = '(No estimado)';
			            } else {
			                // Calculate % Grasa (Deurenberg)
			                results.grasaPctDeurenberg = calculateGrasaPctDeurenberg(peso, altura, edad, sexo);
			                results.grasaPctDeurenbergSource = formatGrasaPctDeurenbergSource(
			                    results.grasaPctDeurenberg,
			                    sexo,
			                    edad,
			                    peso && altura > 0 ? peso / ((altura / 100) * (altura / 100)) : null
			                );
			            }
			            console.log('[GrasaPctDeurenberg] Calculated results:', {
			                grasaPctDeurenberg: results.grasaPctDeurenberg,
			                grasaPctDeurenbergSource: results.grasaPctDeurenbergSource
			            });
			
			            // --- Calculate % Grasa CUN-BAE ---
			            if (data.edad && data.genero && data.peso && !isNaN(alturaM) && !isNaN(results.imc)) {
			                try {
			                    const cunBaeResults = calculateCUNBAEBodyFat(data, results.imc);
			                    results.grasaPctCUNBAE = cunBaeResults.grasaPct;
			                    results.grasaPctCUNBAESource = cunBaeResults.source;
			                    console.log('CUN-BAE % Grasa calculado:', {
			                        grasaPctCUNBAE: results.grasaPctCUNBAE,
			                        grasaPctCUNBAESource: results.grasaPctCUNBAESource
			                    });
			                } catch (e) {
			                    console.error('Error calculando % Grasa CUN-BAE:', e.message);
			                    results.grasaPctCUNBAE = NaN;
			                    results.grasaPctCUNBAESource = 'Error: ' + e.message;
			                    content += `<p><strong>Error en % Grasa CUN-BAE:</strong> ${e.message}. Por favor, revisa los datos ingresados.</p>`;
			                }
			            } else {
			                results.grasaPctCUNBAE = NaN;
			                results.grasaPctCUNBAESource = '(No estimado: Datos insuficientes)';
			                console.warn('No se pudo calcular % Grasa CUN-BAE: datos insuficientes', {
			                    edad: data.edad,
			                    genero: data.genero,
			                    peso: data.peso,
			                    alturaM,
			                    imc: results.imc
			                });
			                content += `<p><strong>% Grasa CUN-BAE:</strong> No estimado debido a datos insuficientes.</p>`;
			            }

					// Llamar a calcularACT
					// Validar que los datos sean válidos antes de calcular
					   if (isNaN(edad) || isNaN(altura) || isNaN(peso)) {
					        console.error('[Submission Handler] Error: Datos numéricos inválidos', { edad, altura, peso });
					        updateDisplay({ error: 'Por favor, ingrese valores numéricos válidos.' });
					        return;
					    }
					
					  
						// Llamar a calcularACT
						  console.log('[Submission Handler] Llamando a calcularACT');
						  const resultadoAgua = calcularACT(edad, genero, altura, peso, esDeportista);
						
						  // Verificar si calcularACT retornó un resultado válido
						  if (!resultadoAgua || resultadoAgua.error) {
						    console.error('[Submission Handler] Error: calcularACT no retornó un resultado válido', { edad, genero, altura, peso, esDeportista });
						    //updateDisplay({ error: resultadoAgua?.error || 'Error interno durante el cálculo.' });
						  }
						    // Actualizar window.calculatedResults con el error y otros cálculos
						   console.log('results.edadmetabolica:', results.edadmetabolica);

					//Parametro Bioquimicos
				
					
					
					       
					
					      

					
			            // Store results for app.js
			           window.calculatedResults = {
				    imc: formatResult(results.imc, 1),
				    imcSource: results.imcSource ? formatImcSource(results.imcSource) : '(No calculado)',
				    icc: formatResult(results.icc, 2),
				    iccSource: results.iccSource ? formatIccSource(results.iccSource) : '(No calculado)',
				    grasaPctActual: formatResult(results.grasaPctActual, 1),
				    grasaPctActualSource: results.actualBodyFatSource || '(No calculado)',
				    grasaPctDeurenberg: formatResult(results.grasaPctDeurenberg, 1),
				    grasaPctDeurenbergSource: results.grasaPctDeurenbergSource || '(No estimado)',
				    grasaPctCUNBAE: formatResult(results.grasaPctCUNBAE, 1),
				    grasaPctCUNBAESource: results.grasaPctCUNBAESource || '(No estimado)',
				    grasaPctDeseado: formatResult(results.grasaPctDeseado, 1),
				    grasaPctDeseadoSource: results.grasaPctDeseadoSource || '(No estimado)',
				    grasaPctMetabolic: formatResult(results.grasaPctMetabolic, 1),
				    grasaPctMetabolicSource: results.masaGrasaMetabolicSource || '(No calculado)',
				    masaGrasaActual: formatResult(results.masaGrasaActual, 1),
				    masaGrasaActualSource: results.masaGrasaActualSource || '(No calculado)',
				    masaMagraActual: formatResult(results.masaMagraActual, 1),
				    masaMagraActualSource: results.mlgActualSource || '(No calculado)',
				    masaGrasaMetabolic: formatResult(results.masaGrasaMetabolic, 1),
				    masaGrasaMetabolicSource: results.masaGrasaMetabolicSource || '(No calculado)',
				    masaMagraMetabolic: formatResult(results.masaMagraMetabolic, 1),
				    masaMagraMetabolicSource: results.mlgMetabolicSource || '(No calculado)',
				    imlgActual: formatResult(results.imlgActual, 1),
				    imlgActualSource: results.imlgActualSource || '(No calculado)',
				    imgActual: formatResult(results.imgActual, 1),
				    imgActualSource: results.imgActualSource || '(No calculado)',
				    tipologiaActual: results.tipologiaActual || 'Indefinido',
				    tipologiaActualSource: results.tipologiaActual ? 'Calculado' : '(No calculado)',
				    imlgMetabolic: formatResult(results.imlgMetabolic, 1),
				    imlgMetabolicSource: results.imlgMetabolicSource || '(No calculado)',
				    imgMetabolic: formatResult(results.imgMetabolic, 1),
				    imgMetabolicSource: results.imgMetabolicSource || '(No calculado)',
				    tipologiaMetabolic: results.tipologiaMetabolic || 'Indefinido',
				    tipologiaMetabolicSource: results.tipologiaMetabolic ? 'Calculado' : '(No calculado)',
				    BRMEstimado: formatResult(results.BRMEstimado, 0),
				    BRMEstimadoSource: results.BRMEstimadoSource || '(No calculado)',
				    pesoIdeal: formatResult(results.pesoIdeal, 1),
				    pesoIdealActual: formatResult(results.pesoIdealActual, 1),
				    pesoIdealMetabolic: formatResult(results.pesoIdealMetabolic, 1),
				    pesoObjetivo: formatResult(results.pesoObjetivo, 1),
				    edadMetabolica: formatResult(results.edadmetabolica, 0),
				    edadMetabolicaSource: results.edadmetabolicaSource || '(No calculado)',
				    amb: formatResult(results.amb, 1),
				    ambSource: results.ambSource || '(No calculado)',
				    masaOsea: formatResult(results.masaOsea, 1),
				    masaOseaSource: results.masaOseaSource || '(No calculado)',
				    masaResidual: formatResult(results.masaResidual, 1),
				    masaResidualSource: results.masaResidualSource || '(No calculado)',
				    mmt: formatResult(results.mmt, 1),
				    Pctmmt: formatResult(results.Pctmmt, 1),
				    PctmmtSource: results.PctmmtSource || '(No calculado)',
				    aguacorporal: resultElements.aguacorporal.textContent,
				    aguacorporalSource: resultElements.aguacorporalSource.textContent,
				    somatotipo: {
				        endomorphy: formatResult(results.endomorfia, 1),
				        mesomorphy: formatResult(results.mesomorfia, 1),
				        ectomorphy: formatResult(results.ectomorfia, 1),
				        formatted: results.endomorfia && !isNaN(results.endomorfia) ? 
				            `${formatResult(results.endomorfia, 1)} : ${formatResult(results.mesomorfia, 1)} : ${formatResult(results.ectomorfia, 1)}` : '---'
				    },
				    somatotipoSource: results.somatotipoSource || '(No calculado)',
				    grasavisceralActual: formatResult(results.grasavisceralActual, 1),
            			    grasavisceralActualSource: results.grasavisceralActualSource || '(No calculado)'
				};
				    
			            console.log('Resultados calculados:', window.calculatedResults);
				    console.log('[Submission Handler] window.calculatedResults actualizado:', window.calculatedResults);
				    // Depuración para verificar que se creó correctamente
                                    console.log('window.calculatedResults:', window.calculatedResults);
			            console.log('Results for display:', results);
			            console.log('BRMEstimado element:', document.getElementById('result-tmb'));
			            console.log('BRMEstimadoSource element:', document.getElementById('tmb-source'));
				    console.log('[Submission Handler] Resultado de calcularACT:', resultadoAgua);		    
				                  
					
					
					// Actualizar la interfaz
						  //updateDisplay(resultadoAgua);		
						  
			            // --- 3. Update Display ---
				        try {
				                if (!resultElements || typeof resultElements !== 'object') {
				                    throw new Error('resultElements no está definido o es inválido');
				                }
				                const updateElement = (key, value, precision = 1) => {
				                    if (resultElements[key]) {
				                        resultElements[key].textContent = formatResult(value, precision);
				                    } else {
				                        console.warn(`Elemento ${key} no encontrado en resultElements`);
				                    }
				                };
							
							// Update Actual Visceral Fat
							if (typeof results.grasavisceralActual === 'undefined') {
								    console.warn('results.grasavisceralActual no está definido');
								}
							
						                try {
							                updateElement('grasavisceralActual', results.grasavisceralActual, 1);
							                updateElement('grasavisceralActualSource', results.grasavisceralActualSource || '(No calculado)');
							                updateElement('imc', results.imc, 1);
							                updateElement('imcSource', results.imcSource ? `${results.imcSource.clasificacion} (${results.imcSource.riesgo})` : '(No calculado)');
							            } catch (e) {
							                console.error('Error updating DOM:', e.message);
							                content += `<p class="error">Error al actualizar DOM: ${e.message}</p>`;
							            }
							
						            
							// Update Actual Body Fat Results
							updateElement('grasaPctActual', results.grasaPctActual, 1);
							if (resultElements.grasaPctActualSource) {
							    resultElements.grasaPctActualSource.textContent = results.actualBodyFatSource || '(No calculado)';
							}
							updateElement('masaGrasaActual', results.masaGrasaActual, 1);
							if (resultElements.masaGrasaActualSource) {
							    resultElements.masaGrasaActualSource.textContent = results.masaGrasaActualSource || '(No calculado)';
							}
							updateElement('masaMagraActual', results.masaMagraActual, 1);
							if (resultElements.masaMagraActualSource) {
							    resultElements.masaMagraActualSource.textContent = results.masaMagraActualSource || '(No calculado)';
							}
							updateElement('imlgActual', results.imlgActual, 1);
							if (resultElements.imlgActualSource) {
							    resultElements.imlgActualSource.textContent = results.imlgActualSource || '(No calculado)';
							}
							updateElement('imgActual', results.imgActual, 1);
							if (resultElements.imgActualSource) {
							    resultElements.imgActualSource.textContent = results.imgActualSource || '(No calculado)';
							}
							if (resultElements.tipologiaActual) {
							    resultElements.tipologiaActual.textContent = results.tipologiaActual || 'Indefinido';
							}
							if (resultElements.tipologiaActualSource) {
							    resultElements.tipologiaActualSource.textContent = '(Relación IMLG/IMG)';
							}
							
							// Update Metabolic Age Results
							updateElement('grasaPctMetabolic', results.grasaPctMetabolic, 1);
							if (resultElements.grasaPctMetabolicSource) {
							    resultElements.grasaPctMetabolicSource.textContent = results.masaGrasaMetabolicSource || '(No calculado)';
							}
							updateElement('masaGrasaMetabolic', results.masaGrasaMetabolic, 1);
							if (resultElements.masaGrasaMetabolicSource) {
							    resultElements.masaGrasaMetabolicSource.textContent = results.masaGrasaMetabolicSource || '(No calculado)';
							}
							updateElement('masaMagraMetabolic', results.masaMagraMetabolic, 1);
							if (resultElements.masaMagraMetabolicSource) {
							    resultElements.masaMagraMetabolicSource.textContent = results.masaGrasaMetabolicSource || '(No calculado)';
							}
							updateElement('imlgMetabolic', results.imlgMetabolic, 1);
							if (resultElements.imlgMetabolicSource) {
							    resultElements.imlgMetabolicSource.textContent = results.imlgMetabolicSource || '(No calculado)';
							}
							updateElement('imgMetabolic', results.imgMetabolic, 1);
							if (resultElements.imgMetabolicSource) {
							    resultElements.imgMetabolicSource.textContent = results.imgMetabolicSource || '(No calculado)';
							}
							if (resultElements.tipologiaMetabolic) {
							    resultElements.tipologiaMetabolic.textContent = results.tipologiaMetabolic || 'Indefinido';
							}
							if (resultElements.tipologiaMetabolicSource) {
							    resultElements.tipologiaMetabolicSource.textContent = '(Relación IMLG/IMG)';
							}
						
							//Update % Agua
							updateDisplay(resultadoAgua);
							function updateDisplay(resultadoAgua) {
							console.log('[updateDisplay] Resultado recibido:', resultadoAgua);
							
							  
							   // Actualizar la interfaz con updateDisplay
							document.getElementById('result-agua-corporal').textContent = resultadoAgua.aguacorporal;
						    	 updateElement('aguacorporal', resultadoAgua.aguacorporal, 1); // Matches resultElements.imc
								
							
							    // Manejar errores o resultados
							    if (resultadoAgua.error) {
							        console.warn('[updateDisplay] Mostrando mensaje de error:', resultadoAgua.error);
							        //resultElements.aguacorporal.textContent = resultadoAgua.error;
							       // resultElements.aguacorporalSource.textContent = '';
							    } else {
							        console.log('[updateDisplay] Actualizando DOM con resultados');
								    // Redondear actKg y porcentajeACT sin decimales
							            const actKgRedondeado = Math.round(parseFloat(resultadoAgua.actKg));
							            const porcentajeACTRedondeado = Math.round(parseFloat(resultadoAgua.porcentajeACT));
							        resultElements.aguacorporal.textContent = `${actKgRedondeado} kg / ${porcentajeACTRedondeado}%`;
							        resultElements.aguacorporalSource.textContent = `Rango de referencia: ${resultadoAgua.rangoReferencia} (${resultadoAgua.fuente}; InBody USA). Estado: ${resultadoAgua.clasificacion}`;
								    //resultElements.aguacorporal.textContent = `${actKgRedondeado} kg / ${porcentajeACTRedondeado}%`;
								//resultElements.aguacorporalSource.textContent = `Rango de referencia: ${resultadoAgua.rangoReferencia} (${resultadoAgua.fuente}; InBody USA). Estado: ${resultadoAgua.clasificacion}`;
								updateElement('aguacorporal', `${actKgRedondeado} kg / ${porcentajeACTRedondeado}%`);
								updateElement('aguacorporalSource', `Rango de referencia: ${resultadoAgua.rangoReferencia} (${resultadoAgua.fuente}; InBody USA). Estado: ${resultadoAgua.clasificacion}`);
								
						    }
						}
				                // Update IMC
				                updateElement('imc', results.imc, 1); // Matches resultElements.imc
				                if (resultElements.imcSource) { // Use imcSource to match resultElements
				                    resultElements.imcSource.textContent = formatImcSource(results.imcSource);
				                } else {
				                    console.warn('Elemento imcSource no encontrado en resultElements. Verifica que resultElements.imcSource esté definido y que el HTML tenga id="imc-source".');
				                }
				                
				                // Update ICC
				                updateElement('icc', results.icc, 2);
				                if (resultElements.iccSource) {
				                    resultElements.iccSource.textContent = formatIccSource(results.iccSource);
				                } else {
				                    console.warn('Elemento iccSource no encontrado en resultElements. Verifica que resultElements.iccSource esté definido y que el HTML tenga id="icc-source".');
				                }
				
				                // Update IMLG and IMG
				                updateElement('imlg', results.imlg, 1);
				                if (resultElements.imlgSource) {
				                    resultElements.imlgSource.textContent = results.imlgSource || '(No calculado)';
				                } else {
				                    console.warn('Elemento imlgSource no encontrado en resultElements. Verifica que resultElements.imlgSource esté definido y que el HTML tenga id="imlg-source".');
				                }
				                updateElement('img', results.img, 1);
				                if (resultElements.imgSource) {
				                    resultElements.imgSource.textContent = results.imgSource || '(No calculado)';
				                } else {
				                    console.warn('Elemento imgSource no encontrado en resultElements. Verifica que resultElements.imgSource esté definido y que el HTML tenga id="img-source".');
				                }
				                
				                if (resultElements.tipologia) {
				                    resultElements.tipologia.textContent = results.tipologia || 'Indefinido';
				                }
				                
				                // Update other results
					    updateElement('grasaPctActual', results.grasaPctActual, 1);
					    if (resultElements.grasaPctActualSource) {
					        resultElements.grasaPctActualSource.textContent = results.actualBodyFatSource || '(No calculado)';
					    } else {
					        console.warn('Elemento grasaPctActualSource no encontrado en resultElements. Verifica que resultElements.grasaPctActualSource esté definido y que el HTML tenga id="grasa-actual-source".');
					    }
					
					    updateElement('grasaPctDeurenberg', results.grasaPctDeurenberg, 1);
					    if (resultElements.grasaPctDeurenbergSource) {
					        resultElements.grasaPctDeurenbergSource.textContent = results.grasaPctDeurenbergSource || '(No estimado)';
					    } else {
					        console.warn('Elemento grasaPctDeurenbergSource no encontrado en resultElements.');
					    }
					
					    updateElement('grasaPctCUNBAE', results.grasaPctCUNBAE, 1);
					    if (resultElements.grasaPctCUNBAESource) {
					        resultElements.grasaPctCUNBAESource.textContent = results.grasaPctCUNBAESource || '(No estimado)';
					    } else {
					        console.warn('Elemento grasaPctCUNBAESource no encontrado en resultElements.');
					    }
					
					    updateElement('grasaPctDeseado', results.grasaPctDeseado, 1);
					    if (resultElements.grasaPctDeseadoSource) {
					        resultElements.grasaPctDeseadoSource.textContent = results.desiredBodyFatSource || '(No estimado)';
					    } else {
					        console.warn('Elemento grasaPctDeseadoSource no encontrado en resultElements.');
					    }
					
					    updateElement('masaGrasa', results.masaGrasa, 1);
					    if (resultElements.masaGrasaSource) {
					        resultElements.masaGrasaSource.textContent = results.masaGrasaSource || '(No calculado)';
					    } else {
					        console.warn('Elemento masaGrasaSource no encontrado en resultElements.');
					    }
					
					    updateElement('masaMagra', results.masaMagra, 1);
					    updateElement('BRMEstimado', results.BRMEstimado, 1);
					    if (resultElements.BRMEstimadoSource) {
					        resultElements.BRMEstimadoSource.textContent = results.BRMEstimadoSource || '(No calculado)';
					    } else {
					        console.warn('Elemento BRMEstimadoSource no encontrado en resultElements.');
					    }
					
					    updateElement('mlg', results.mlg, 1);
					    if (resultElements.mlgSource) {
					        resultElements.mlgSource.textContent = results.mlgSource || '(No calculado)';
					    } else {
					        console.warn('Elemento mlgSource no encontrado en resultElements.');
					    }
					
					    updateElement('amb', results.amb, 1);
					    if (resultElements.ambSource) {
					        resultElements.ambSource.textContent = results.ambSource || '(No calculado)';
					    } else {
					        console.warn('Elemento ambSource no encontrado en resultElements.');
					    }
					
					    updateElement('masaOsea', results.masaOsea, 1);
					    if (resultElements.masaOseaSource) {
					        resultElements.masaOseaSource.textContent = results.masaOseaSource || '(No calculado)';
					    } else {
					        console.warn('Elemento masaOseaSource no encontrado en resultElements.');
					    }
					
					    updateElement('masaResidual', results.masaResidual, 1);
					    if (resultElements.masaResidualSource) {
					        resultElements.masaResidualSource.textContent = results.masaResidualSource || '(No calculado)';
					    } else {
					        console.warn('Elemento masaResidualSource no encontrado en resultElements.');
					    }
					
					    updateElement('pesoIdeal', results.pesoIdeal, 1);
					    updateElement('pesoObjetivo', results.pesoObjetivo, 1);
					    updateElement('mmt', results.mmt, 1);
					    updateElement('Pctmmt', results.Pctmmt, 1);
					    if (resultElements.PctmmtSource) {
					        resultElements.PctmmtSource.textContent = results.PctmmtSource || '(No calculado)';
					    } else {
					        console.warn('Elemento PctmmtSource no encontrado en resultElements.');
					    }
					
					    updateElement('edadmetabolica', results.edadmetabolica, 1);
					    if (resultElements.edadmetabolicaSource) {
					        resultElements.edadmetabolicaSource.textContent = results.edadmetabolicaSource || '(No calculado)';
					    } else {
					        console.warn('Elemento edadmetabolicaSource no encontrado en resultElements.');
					    }
					
					    // Somatotipo Components
					        if (resultElements.somatotipo) {
						    resultElements.somatotipo.textContent = window.calculatedResults.somatotipo.formatted || '---';
						} else {
						    console.warn('Elemento somatotipo no encontrado en resultElements. Verifica que el elemento con id="result-somatotipo" exista en el HTML.');
						    content += `<p><strong>Advertencia:</strong> No se pudo mostrar el Somatotipo porque el elemento con id="result-somatotipo" no está definido en la interfaz.</p>`;
						}
						
						if (resultElements.somatotipoSource) {
						    resultElements.somatotipoSource.textContent = results.somatotipoSource || '(No calculado)';
						} else {
						    console.warn('Elemento somatotipoSource no encontrado en resultElements. Verifica que el elemento con id="somatotipo-source" exista en el HTML.');
						    content += `<p><strong>Advertencia:</strong> No se pudo mostrar la fuente del Somatotipo porque el elemento con id="somatotipo-source" no está definido en la interfaz.</p>`;
						}
  						updateElement('resultSomatotipo', window.calculatedResults.somatotipo.formatted, 1);
					    // Update explanation section
					    if (explanationContent && content) {
					        explanationContent.innerHTML = content;
					        console.log('Explicaciones actualizadas:', content);
					    } else if (!content) {
					        console.log('No hay mensajes de error o explicaciones para mostrar');
					    } else {
					        console.warn('explanationContent no está definido');
					    }
					
					    if (explanationSection) {
					        explanationSection.style.display = 'block';
					        console.log('Sección de explicaciones mostrada');
					    } else {
					        console.warn('explanationSection no está definido');
					    }
						// --- 4. Generate and Display Explanations ---
							if (!explanationContent) {
							    throw new Error('Elemento explanation-content no encontrado');
							}
							let analysisHtml = '<p>No se pudo generar el análisis de composición corporal: datos insuficientes.</p>';
							if (bodyCompResults && !isNaN(bodyCompResults.imlg) && !isNaN(bodyCompResults.img)) {
							    try {
							        analysisHtml = generateExplanationsAndSuggestions(data, results, bodyCompResults);
							    } catch (e) {
							        console.error('Error generando explicaciones:', e.message);
							        analysisHtml = `<p>Error generando el análisis: ${e.message}</p>`;
							    }
							} else {
							    console.warn('bodyCompResults inválido o datos insuficientes', {
							        bodyCompResults,
							        imlg: bodyCompResults?.imlg,
							        img: bodyCompResults?.img
							    });
							}
							explanationContent.innerHTML = analysisHtml + content; // Append error messages
							if (explanationSection) {
							    explanationSection.style.display = 'block';
							} else {
							    console.warn('explanationSection no encontrado');
							}
							
							

						console.log('Display updated successfully');
						alert('Cálculos realizados. Revisa la sección de Resultados y las Explicaciones.');
					} catch (displayError) {
					    console.error('Error al actualizar la interfaz:', displayError.message);
					    alert('Error al actualizar los resultados: ' + displayError.message);
					}
			} catch (calcError) {
			    console.error('Error durante los cálculos:', calcError.message);
			    alert('Error en los cálculos: ' + calcError.message);
			    content += `<p><strong>Error General:</strong> ${calcError.message}. Por favor, revisa los datos ingresados.</p>`;
			    if (explanationContent) {
			        explanationContent.innerHTML = content;
			    }
			    if (explanationSection) {
			        explanationSection.style.display = 'block';
			    }
			}
			// Display errors
		            if (content) {
		                const errorContainer = document.getElementById('error-container');
		                if (errorContainer) {
		                    errorContainer.innerHTML = content;
		                } else {
		                    console.warn('Error container not found');
		                }
		            }

	} catch (calcError) {
			console.error('Error durante los cálculos:', calcError.message);
			    alert('Error en los cálculos: ' + calcError.message);
			}
			
			// Prevent auto-submission on page load
			window.addEventListener('load', () => {
			    const form = document.getElementById('anthropometry-form');
			    if (form) {
			        form.reset(); // Clear form inputs
			        console.log('Form reset on page load to prevent auto-submission');
			        // Asegurarse de que el botón esté oculto al cargar la página
			        const guardarDatosBtn = document.getElementById('guardar_datos');
			        if (guardarDatosBtn) {
			            guardarDatosBtn.style.display = 'none';
			        }
			    }
			});
			// Initialize results display on page load
			document.addEventListener('DOMContentLoaded', () => {
				console.log('Inicializando visualización de resultados');
				console.log('resultElements:', resultElements);
				resetResultElements(resultElements);
				if (explanationSection) {
					explanationSection.style.display = 'none';
				} else {
					console.error('explanationSection no encontrado');
				}
			});
			
			// After successful calculations
			//const guardarDatosBtn = document.getElementById('guardar_datos');
			if (guardarDatosBtn) {
			    // Verificar si window.calculatedResults es null o está vacío
			    if (!window.calculatedResults || Object.keys(window.calculatedResults).length === 0) {
			        guardarDatosBtn.style.display = 'none'; // Ocultar botón si no hay resultados
			    } else {
			        guardarDatosBtn.style.display = 'inline-block'; // Mostrar botón si hay resultados
			    }
			}
 });   //alert('Cálculos realizados. Revisa la sección de Resultados y las Explicaciones_1.');

