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

const convertLinks = compose(
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
            const minLevel = /^\s*\d+\./.test(line) ? 3 : 2;
            const maxLevel = /^\s*\d+\./.test(line) ? 7 : 6;
            if (level >= maxLevel) {
                result = result.slice(0, result.lastIndexOf('</li>')) + ' ' + content + result.slice(result.lastIndexOf('</li>'));;
            } else {
            if (openTypeList.length === 0 || (level > levelList && level >= minLevel)) { // Abrir una nueva lista si no está abierta o si el nivel de sangría es mayor que el nivel actual
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
            }}
      
            levelList = level;
        } else if (content !== '' && /^\d+\./.test(content) && openTypeList[openTypeList.length - 1] === '<ol>') {
            const level = (line.match(/^\s*/) || [''])[0].length;
            if (level >= 7) {
                result = result.slice(0, result.lastIndexOf('</li>')) + ' ' + content + result.slice(result.lastIndexOf('</li>'));;
            } else {
                result += `<li>${content.replace(/^[*+-]|\d+\. /, '')}</li>`;
            }
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
    convertEmphasis,    
    convertHeaders, 
    convertCode,
    convertHorizontalRules,
    convertBlockquotes,
    checkListFunction,
    convertImage,
    convertLinks,
);
