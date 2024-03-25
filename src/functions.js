// Función compose para ejecutar varias funciones en orden de derecha a izquierda
const compose = (...functions) => {
    return (input) => {
      return functions.reduceRight((acc, fn) => {
        return fn(acc);
      }, input);
    };
  };

// Función para convertir encabezados Markdown a HTML
const convertHeaders = (markdown) => {
    return markdown.replace(/(#+)\s+(.*)$/gm, (match, hashes, text) => {
        const level = (hashes) => hashes.length;
        const headerTag = `h${level(hashes)}`;
        return level(hashes) <= 6 ? `<${headerTag}>${text}</${headerTag}>` : `${match}`; 
    });
};

const convertItalics = (markdown) => {
    return markdown.replace(/(?<!\*)\*(?!\s)([^*]+?)(?<!\s)\*/g, (match, text) => `<em>${text}</em>`);
}

const convertBolds = (markdown) => {
    return markdown.replace(/\*\*(?!\s)([^*]+?)(?<!\s)\*\*(?!\*)/g, (match, text) => `<strong>${text}</strong>`);
}

const convertBoldsAndItalics = (markdown) => {
    return markdown.replace(/\*\*\*(?!\s)([^*]+?)(?<!\s)\*\*\*/g, (match, text) => `<em><strong>${text}</strong></em>`);
}

const convertEmphasis = compose(
    convertItalics, convertBolds, convertBoldsAndItalics
);

const convertCode = (markdown) => {
    return markdown.replace(/(?<!\\)\`([^`]+?)(?<!\\)\`/g, (match, text) => {
        return `<code>${text}</code>`;
    });
}

const convertParagraphs = (markdown) => { 
    file = markdown.replace(/^(?!#>)(.+) {2,}\n/gm, (match, texto) => { 
        return `${texto}<br>`; 
    }); 
    file = file.replace(/^(?!<)(.+)$/gm, (match, parrafo) => { 
        return `<p>${parrafo}</p>`; 
    }); 
    return file; 
}

const convertLinksBasic = (markdown) => { 
    file = markdown.replace(/(?<!!)\[([^\]]+)\]\(([^)]+)\)/g, (match, texto, url) => { 
        return `<a href="${url}">${texto}</a>`; 
    }); 
    return file 
}

const convertLinksWithTitle = (markdown) => {
    file = markdown.replace(/(?<!!)\[([^\]]+)\]\(([^)]+)\s"([^"]+)"\)/g, (match, texto, url, title) => { 
        return `<a href="${url}" title="${title}">${texto}</a>`; 
    }); 
    return file 
}

const convertLinksAbsolute = (markdown) => { 
    file = markdown.replace(/<([^>]+)>/g, (match, url) => { 
        return `<a href="${url}">${url}</a>`; 
    }); 
    return file 
}

const convertImage = (markdown) => {
    file = markdown.replace(/!\[([^\]]+)\]\(([^)]+)\)/g, (match, alt, src) => {
        return `<img src="${src}" alt="${alt}">`;
    });
    return file
}

const composedLinks = compose(
    convertLinksBasic,
    convertLinksWithTitle,
    convertLinksAbsolute,
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
    convertEmphasis,    
    convertHeaders, 
    convertCode,
    convertHorizontalRules,
    convertBlockquotes,
    convertImage,
    composedLinks,
);

