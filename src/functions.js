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
    file = data.replace(/(?<!!)\[([^\]]+)\]\(([^)]+)\)/g, (match, texto, url) => { 
        return `<a href="${url}">${texto}</a>`; 
    }); 
    return file 
}

const convertLinksWithTitle = (data) => {
    file = data.replace(/(?<!!)\[([^\]]+)\]\(([^)]+)\s"([^"]+)"\)/g, (match, texto, url, title) => { 
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

const convertImage = (data) => {
    file = data.replace(/!\[([^\]]+)\]\(([^)]+)\)/g, (match, alt, src) => {
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

const checkListFunction = (texto) => {
    const matches = texto.match(/[*+-]|1\./g);
    return matches === null ? texto : matches.length === 1 ? (/^ {0,3}[*+-]|1\./gm.test(texto) ? convertListHTML(texto) : texto) : convertListHTML(texto);
}

function convertListHTML(text) {
    let levelList = 0;
    let openTypeList = [];
    let cutList = false;

    return text.split('\n').reduce((result, line) => {
        const content = line.trim(); // Eliminar la sangría de la línea
        if (content !== '' && ['* ', '+ ', '- ', '1. '].some(prefix => content.startsWith(prefix))) {
            const level = (line.match(/^\s*/) || [''])[0].length;
            if (openTypeList.length === 0 || level > levelList) { // Abrir una nueva lista si no está abierta o si el nivel de sangría es mayor que el nivel actual
                result += content.match(/[*+\-]|1\./g)[0] === '1.' ? '<ol>' : '<ul>';
                openTypeList.push(content.match(/[*+\-]|1\./g)[0] === '1.' ? '<ol>' : '<ul>');
            } else if (level < levelList) {
                result += openTypeList.pop().replace('<', '</').repeat(levelList / 2);
            }

            if (openTypeList[openTypeList.length - 1] === '<ul>' && content.match(/[*+\-]|1\./g)[0] === '1.') {
                cutList = true;
                openTypeList.pop();
                openTypeList.push('<ol>');
                result += `</ul><ol><li>${content.replace(/^[*+-]|\d+\. /, '')}</li>`;
            } else if (openTypeList[openTypeList.length - 1] === '<ol>' && content.match(/[*+\-]|1\./g)[0] !== '1.') {
                openTypeList.pop();
                openTypeList.push('<ul>');
                result += `</ol><ul><li>${content.replace(/^[*+-]|\d+\. /, '')}</li>`;
            } else {
                result += (cutList && openTypeList[openTypeList.length - 1] === '<ul>') ? `<ul>` : ``;
                result += `<li>${content.replace(/^[*+-]|\d+\. /, '')}</li>`;
                cutList = (cutList && openTypeList[openTypeList.length - 1] === '<ul>') ? false : cutList;
            }
      
            levelList = level;
        } else if (content !== '') {
            if (openTypeList.length !== 0) { // Si viene texto y tenemos lista abierta
                result = result.slice(0, result.lastIndexOf('</li>')) + ' ' + content + result.slice(result.lastIndexOf('</li>'));;
            } else result += `${line}\n`;
        } else if (content === '') { // Se acabo esa lista
            if (openTypeList.length !== 0) {
                result += openTypeList.reduceRight((finalAdd, elemento) => finalAdd + elemento.replace('<', '</'), '');
                openTypeList = [];
            }
            result += '\n';
        }
        return result;
    }, '');
};

const composedTransformations = compose(
    convertParagraphs,
    composedEmphasis,    
    convertHeaders, 
    convertCode,
    convertHorizontalRules,
    convertBlockquotes,
    checkListFunction,
    convertImage,
    composedLinks,
);
