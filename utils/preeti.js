export const convertToPreeti = (sourceText) => {
    if (!sourceText) return "";

    let text = sourceText;

    // -----------------------------------------------------------
    // STEP 0: Pre-Processing (Cleaning)
    // -----------------------------------------------------------
    text = text.replace(/&nbsp;/g, " ").replace(/\u00A0/g, " ");
    
    // Fix common disjointed words
    text = text.replace(/द्\s*्\s*ध/g, "द्ध");
    text = text.replace(/त्\s*्\s*त/g, "त्त");

    // -----------------------------------------------------------
    // STEP 1: 'Ra' (र्) Reph Logic (Preeti Style)
    // -----------------------------------------------------------
    // Unicode: र् + क = र्क | Preeti: s + { = र्क (Reph is usually typed AFTER)
    text = text.replace(/र्([क-ह])/g, "$1{");

    // -----------------------------------------------------------
    // STEP 2: Chhoti 'i' (ि) Logic
    // -----------------------------------------------------------
    var position_of_i = text.indexOf("ि");
    while (position_of_i !== -1) {
        var character_left_to_i = text.charAt(position_of_i - 1);
        var character_left_to_i_prev = text.charAt(position_of_i - 2);
        
        if (character_left_to_i_prev === "्") {
             var character_base = text.charAt(position_of_i - 3);
             var string_to_replace = character_base + "्" + character_left_to_i + "ि";
             text = text.replace(string_to_replace, "l" + character_base + "्" + character_left_to_i);
        } else {
             text = text.replace(character_left_to_i + "ि", "l" + character_left_to_i);
        }
        position_of_i = text.search(/ि/, position_of_i + 1);
    }

    // -----------------------------------------------------------
    // STEP 3: The Master Mapping (With Ligatures Fix)
    // -----------------------------------------------------------
    const array_one = [
        // 1. Priority Ligatures (जो आपके आउटपुट में टूट रहे थे)
        "श्री", "श्र", "त्र", "क्ष", "ज्ञ", 
        "क्र", "प्र", "द्र", "म्र", "ग्र", "ब्र", "स्र", "ह्र", // Paden Ra
        "ट्र", "ड्र", "ष्ट", "ष्ठ", "द्ध", "ट्ट", "ट्ठ", 
        
        // 2. Explicit Half Characters (Shift Keys)
        "क्", "ख्", "ग्", "घ्", 
        "च्", "छ्", "ज्", "झ्", "ञ्", 
        "ट्", "ठ्", "ड्", "ढ्", "ण्", 
        "त्", "थ्", "द्", "ध्", "न्", 
        "प्", "फ्", "ब्", "भ्", "म्", 
        "य्", "र्", "ल्", "व्", "श्", "ष्", "स्", "ह्",
        
        // 3. Special Symbols
        "‘", "’", "“", "”", "(", ")", "{", "}", "=", "।", "?", "-", "µ", "॰", ",", ".", "् ",
        "०", "१", "२", "३", "४", "५", "६", "७", "८", "९", 

        // 4. Matras
        "ा", "ि", "ी", "ु", "ू", "ृ", "े", "ै", "ो", "ौ", "ं", "ँ", "ः", "ॅ", "ऽ", "़", 
        
        // 5. Vowels
        "अ", "आ", "इ", "ई", "उ", "ऊ", "ऋ", "ए", "ऐ", "ओ", "औ", "अं", "अः", 

        // 6. Consonants
        "क", "ख", "ग", "घ", "ङ", 
        "च", "छ", "ज", "झ", "ञ", 
        "ट", "ठ", "ड", "ढ", "ण", 
        "त", "थ", "द", "ध", "न", 
        "प", "फ", "ब", "भ", "म", 
        "य", "र", "ल", "व", "श", "ष", "स", "ह",
        "्"
    ];

    const array_two = [
        // 1. Ligatures Mappings
        ">L", ">", "q", "If", "1", 
        "qm", "k|", "b|", "d|", "u|", "a|", ":|", "x|", // k|, u|, etc.
        "6«", "8«", "i6", "i7", "4", "6\~6", "6\~7", 
        
        // 2. Half Characters (Shift Keys)
        "S", "V", "U", "3", 
        "R", "5", "H", "Z", "0f", // 0f is tricky, keeping simple
        "6\\", "7\\", "8\\", "9\\", "0", 
        "T", "Y", "b\\", "W", "G", 
        "K", "km", "A", "E", "D", 
        "o\\", "/\\", "N", "O", "z", "if", ":", "x\\",
        
        // 3. Symbols
        "‘", "’", "“", "”", "(", ")", "{", "}", ".", "|", "?", "-", "µ", "e", ",", ".", "\\", 
        "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", 

        // 4. Matras
        "f", "l", "L", "'", "\"", "[", "]", "}", "f]", "f}", "{", "+", ":", "µ", "·", "+", 

        // 5. Vowels
        "c", "cf", "O", "O{", "p", "p{", "P", "P]", "P}", "cf]", "cf}", "c{", "cM", 

        // 6. Consonants
        "s", "v", "u", "U", "%", 
        "r", "R", "h", "H", "~", 
        "6", "7", "8", "9", "0", 
        "t", "y", "b", "w", "g", 
        "k", "m", "a", "e", "d", 
        "o", "/", "n", "j", "z", "if", ";", "x", 
        "\\" 
    ];

    for (let i = 0; i < array_one.length; i++) {
        if(text.includes(array_one[i])) {
            text = text.split(array_one[i]).join(array_two[i]);
        }
    }

    return text;
};