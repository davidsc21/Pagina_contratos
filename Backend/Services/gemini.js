async function llamarGemini(prompt, temperatura) {
    const apiKey = process.env.GEMINI_API_KEY;
    const modelo = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

    if (!apiKey) {
        const error = new Error("La clave GEMINI_API_KEY no está configurada");
        error.codigo = "IA_SIN_CONFIGURAR";
        throw error;
    }

    const respuesta = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelo)}:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: temperatura, maxOutputTokens: 4096 }
            })
        }
    );

    const datos = await respuesta.json();

    if (!respuesta.ok) {
        const error = new Error(datos?.error?.message || "Error al llamar a Gemini");
        error.status = 502;
        throw error;
    }

    const texto = datos?.candidates?.[0]?.content?.parts
        ?.map((parte) => parte.text)
        .join("")
        ?.trim();

    if (!texto) {
        const error = new Error("Gemini no devolvió una respuesta válida");
        error.status = 502;
        throw error;
    }

    return texto;
}

async function adaptarClausula({ titulo, contenido, objetivo }) {
    const prompt = [
        "Eres un redactor de contratos colombiano, experto en contratos de prestación de servicios industriales.",
        "Reescribe la cláusula que se te presenta para adaptarla al OBJETIVO del contrato indicado.",
        "Instrucciones:",
        "- Conserva el estilo técnico y jurídico, la numeración interna y los términos CONTRATISTA, PALCESAR y CONTRATANTE.",
        "- No inventes montos, fechas, nombres ni datos ajenos: solo ajusta el contenido con base en el objetivo.",
        "- No incluyas el título de la cláusula ni etiquetas ni texto adicional.",
        "- Devuelve ÚNICAMENTE el texto de la cláusula modificada, separando cada párrafo con una línea en blanco.",
        "",
        "OBJETIVO DEL CONTRATO:",
        objetivo || "(no se indicó un objetivo)",
        "",
        "CLÁUSULA ACTUAL:",
        `Título: ${titulo}`,
        contenido
    ].join("\n");

    return llamarGemini(prompt, 0.4);
}

async function generarObjetivoGeneral(objetivo) {
    const prompt = [
        "Eres un asistente que redacta contratos en Colombia.",
        "A partir del siguiente OBJETIVO de un contrato de prestación de servicios, redacta una descripción CORTA para el título del contrato.",
        "Reglas:",
        "- Máximo 12 palabras.",
        "- Devuélvela en MAYÚSCULAS.",
        "- No incluyas punto final, comillas, dos puntos, ni la palabra 'CONTRATO'.",
        "- No agregues explicaciones ni etiquetas.",
        "- Devuelve únicamente la descripción.",
        "",
        "OBJETIVO:",
        objetivo
    ].join("\n");

    return llamarGemini(prompt, 0.3);
}

module.exports = { adaptarClausula, generarObjetivoGeneral };