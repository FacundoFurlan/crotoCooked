import { DE, EN, ES, PT } from "../utils/enums/languages";

const PROJECT_ID = "1a54db0d-16ba-4903-9998-b029ba8b5b00";
let translations = null;
let language = ES;

export async function getTranslations(lang, callback) {
    localStorage.setItem("translations", null);
    translations = null;
    language = lang;
    if (language === ES) {
        return callback ? callback() : false;
    }

    return await fetch(
        `https://traducila.vercel.app/api/translations/${PROJECT_ID}/${language}`
    )
        .then((response) => response.json())
        .then((data) => {
            localStorage.setItem("translations", JSON.stringify(data));
            translations = data;
            if (callback) callback();
        });
}

export function getPhrase(key) {
    if (!translations) {
        const locals = localStorage.getItem("translations");
        translations = locals ? JSON.parse(locals) : null;
    }

    let phrase = key;
    const keys = translations?.data?.words;
    if (keys && Array.isArray(keys)) {
        const translation = keys.find((item) => item.key === key);
        if (translation && translation.translate) {
            phrase = translation.translate;
        }
    }

    return phrase;
}

function isAllowedLanguage(language) {
    const allowedLanguages = [ES, EN, PT, DE];
    return allowedLanguages.includes(language);
}

export function getLanguageConfig() {
    let languageConfig;

    // Obtener desde la URL el idioma
    console.log(window.location.href);

    /* 
        depende como lo manejemos: 
        1) puede venir como www.dominio.com/es
        2) puede venir como www.dominio.com?lang=es
  
        En el primer caso se obtiene con: window.location.pathname
        En el segundo caso se obtiene leyendo el query param lang 
        
        vamos a implementar una logica que cubra ambos casos
      */

    const path =
        window.location.pathname !== "/" ? window.location.pathname : null;
    const params = new URL(window.location.href).searchParams;
    const queryLang = params.get("lang");

    languageConfig = path ?? queryLang;

    if (languageConfig) {
        if (isAllowedLanguage(languageConfig)) {
            return languageConfig;
        }
    }

    const browserLanguage = window.navigator.language;
    if (isAllowedLanguage(browserLanguage)) {
        return browserLanguage;
    }

    return ES;
}