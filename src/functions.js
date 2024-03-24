const compose = (...functions) => {
    return (input) => {
      return functions.reduceRight((acc, fn) => {
        return fn(acc);
      }, input);
    };
  };

// Función para convertir encabezados Markdown a HTML
const convertHeaders = (markdown) => {
    return markdown.replace(/^(#+)\s+(.*)$/gm, (match, hashes, text) => {
        const level = (hashes) => hashes.length; // Llama a una función para contar los símbolos '#'
        const headerTag = `h${level(hashes)}`; // Genera el tag HTML correspondiente
        return level(hashes) <= 6 ? `<${headerTag}>${text}</${headerTag}>` : `${match}`; // Retorna el texto con el tag HTML adecuado
    });
};

const handleEmphasis = (match, text, headerTag, endTag) => {
    return `${headerTag}${text}${endTag}`;
}

const convertItalics = (markdown) => {
    const headerTag = '<em>';
    const endTag = '</em>';
    return markdown.replace(
        /(?<!\*)\*(?!\s)([^*]+?)(?<!\s)\*/g, 
        (match, text) => handleEmphasis(match, text, headerTag, endTag));
}

const convertBolds = (markdown) => {
    const handleEmphasis = (match, text) => `<strong>${text}</strong>`;
    return markdown.replace(/\*\*(?!\s)([^*]+?)(?<!\s)\*\*(?!\*)/g, handleEmphasis);
}

const convertBoldsAndItalics = (markdown) => {
    const handleEmphasis = (match, text) => `<em><strong>${text}</strong></em>`;
    return markdown.replace(/\*\*\*(?!\s)([^*]+?)(?<!\s)\*\*\*/g, handleEmphasis);
}

const composedEmphasis = compose(
    convertItalics, convertBolds, convertBoldsAndItalics
);

const convertCode = (markdown) => {
    return markdown.replace(/(?<!\\)\`([^`]+?)(?<!\\)\`/g, (match, text) => {
        return `<code>${text}</code>`;
    });
}


const convertParagraphs = (data) => { 
    file = data.replace(/^(?!#|>)(.+) {2,}\n/gm, (match, texto) => { 
        return `${texto}<br>`; 
    }); 
    file = file.replace(/^(?!<)(.+)$/gm, (match, parrafo) => { 
        return `<p>${parrafo}</p>`; 
    }); 
    return file; 
}

const convertLinksBasic = (data) => { 
    file = data.replace(/\[([^\]]+)\]\(([^"]+)\)/g, (match, texto, url) => { 
        return `<a href="${url}">${texto}</a>`; 
    }); 
    return file 
}

const convertLinksWithTitle = (data) => { 
    file = data.replace(/\[([^\]]+)\]\(([^)]+)\s\"([^"]+)\"\)/g, (match, texto, url, title) => { 
        return `<a href="${url}" title="${title}">${texto}</a>`; 
    }); 
    return file 
}

const convertLinksAbsolute = (data) => { 
    file = data.replace(/<([^>]+)>/g, (match, url) => { 
        return `<a href="${url}">${url}</a>`; 
    }); 
    return file 
}

const composedLinks = compose(
    convertLinksBasic,
    convertLinksWithTitle,
    convertLinksAbsolute
)

const convertHorizontalRules = (data) => { 
    file = data.replace(/^[-*_]{3,}$/gm, '<hr>'); 
    return file 
}

const convertBlockquotes = (markdown) => {
    return markdown.replace(/^>(.+)$/gm, (match, text) => {
        return `<blockquote>${text}</blockquote>`;
    });
}


const composedTransformations = compose(
    convertParagraphs,
    composedEmphasis,    
    convertHeaders, 
    convertCode,
    convertHorizontalRules,
    convertBlockquotes,
    composedLinks
);

