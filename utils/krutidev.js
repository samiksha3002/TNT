export const convertToKrutiDev = (sourceText) => {
    if (!sourceText) return "";

    let text = sourceText;

    // -----------------------------------------------------------
    // STEP 0: Pre-Processing
    // -----------------------------------------------------------
    text = text.replace(/&nbsp;/g, " ").replace(/\u00A0/g, " ");
    
    // Join disparate chars
    text = text.replace(/द्\s*्\s*ध/g, "द्ध"); 
    text = text.replace(/त्\s*्\s*त/g, "त्त"); 
    text = text.replace(/द\s*्\s*द/g, "द्द");
    text = text.replace(/ट\s*्\s*ट/g, "ट्ट");
    text = text.replace(/ड\s*्\s*ड/g, "ड्ड");
    text = text.replace(/ड\s*्\s*ढ/g, "ड्ढ");
    text = text.replace(/द\s*्\s*य/g, "द्य"); 
    text = text.replace(/ह\s*्\s*म/g, "ह्म"); 
    text = text.replace(/ल\s*्\s*ल/g, "ल्ल"); // Ensure joint LLa

    // -----------------------------------------------------------
    // STEP 0.5: SUPER PATCH (Fixes Complex Words BEFORE Processing)
    // -----------------------------------------------------------
    
    // 1. Fix 'Vidyarthi' (र्थ्य) - This MUST be before 'Ra' logic
    text = text.replace(/र्थ्य/g, "F;k±"); 
    text = text.replace(/र्थ/g, "FkZ");

    // 2. Fix 'Drishti' (दृ)
    text = text.replace(/दृ/g, "n`");

    // 3. Fix 'Gadkille' (ल्ल) -> Half L (Y) + Full L (y)
    text = text.replace(/ल्ल/g, "Yy");

    // 4. Fix 'Udvign' (द्व) -> }
    text = text.replace(/द्व/g, "}");
    text = text.replace(/द\s*्\s*व/g, "}");

    // 5. Fix 'Sahyadri' (ह्य)
    text = text.replace(/ह्य/g, "g~;");
    text = text.replace(/ह\s*्\s*य/g, "g~;");

    // -----------------------------------------------------------
    // STEP 1: Handle 'Ra' (र्) Reph Logic
    // -----------------------------------------------------------
    text = text.replace(/र्([क-ह])/g, "$1Z");
    
    // Fix Z Position for Matras
    const hindi_matras = "ािीुूृेैोौं:ँॅ";
    const z_regex = new RegExp(`Z([${hindi_matras}])`, "g");
    text = text.replace(z_regex, "$1Z"); 
    text = text.replace(z_regex, "$1Z"); 

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
             text = text.replace(string_to_replace, "f" + character_base + "्" + character_left_to_i);
        } else {
             text = text.replace(character_left_to_i + "ि", "f" + character_left_to_i);
        }
        position_of_i = text.search(/ि/, position_of_i + 1);
    }

    // -----------------------------------------------------------
    // STEP 3: Mapping Arrays
    // -----------------------------------------------------------
    const array_one = [
        // A. Ligatures
        "‘", "’", "“", "”", "(", ")", "{", "}", "=", "।", "?", "-", "µ", "॰", ",", ".", "् ",
        "०", "१", "२", "३", "४", "५", "६", "७", "८", "९", "x", 

        "द्ध", "ट्ट", "ट्ठ", "ड्ढ", 
        "क्र", "प्र", "द्र", "म्र", "ग्र", "ब्र", "स्र", 
        "त्र", "क्ष", "ज्ञ", "श्र", "त्त", "क्त", 
        "ह्न", "ह्य", "हृ", "ह्म", "द्य", 
        "ट्र", "ड्र", "श्व", 
        
        // B. Half Characters
        "क्", "ख्", "ग्", "घ्", "ङ्", 
        "च्", "छ्", "ज्", "झ्", "ञ्", 
        "ट्", "ठ्", "ड्", "ढ्", "ण्", 
        "त्", "थ्", "द्", "ध्", "न्", 
        "प्", "फ्", "ब्", "भ्", "म्", 
        "य्", "र्", "ल्", "व्", "श्", "ष्", "स्", "ह्",

        // C. Matras
        "ा", "ि", "ी", "ु", "ू", "ृ", "े", "ै", "ो", "ौ", "ं", "ँ", "ः", "ॅ", "ऽ", "़", 

        // D. Consonants
        "अ", "आ", "इ", "ई", "उ", "ऊ", "ऋ", "ए", "ऐ", "ओ", "औ", "अं", "अः", 
        "क", "ख", "ग", "घ", "ङ", "च", "छ", "ज", "झ", "ञ", 
        "ट", "ठ", "ड", "ढ", "ण", "त", "थ", "द", "ध", "न", 
        "प", "फ", "ब", "भ", "म", "य", "र", "ल", "व", "श", "ष", "स", "ह",
        "्", "ळ"
    ];

    const array_two = [
        // A. Ligatures Mappings
        "^", "*", "Þ", "ß", "¼", "½", "¿", "À", "¾", "A", "\\", "&", "&", "A", "]", "A", "~ ", 
        "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "N", 

        ")", "ê", "ë", "ï", 
        "Ø", "iz", "nz", "ez", "xz", "cz", "lz", 
        "=", "{k", "K", "Jh", "Ù", "Dr", 
        "à", "á", "º", "ã", "|", 
        "Vª", "Mª", "Üo", 

        // B. Half Characters Mappings
        "D", "[", "X", "¿", "?", 
        "P", "N", "T", ">", "¥", 
        "V", "B", "M", "<", ".k", 
        "R", "F", "n", "/", "U", 
        "i", "Q", "c", "H", "e", 
        "¸", "j", "y", "o", "'", "\"", "L", "g", 

        // C. Matras
        "k", "f", "h", "q", "w", "`", "s", "S", "ks", "kS", "a", "¡", "%", "W", "·", "¸", 

        // D. Consonants
        "v", "vk", "b", "bZ", "m", "Å", "_", ",","S", "vks", "vkS", "va", "v%", 
        "d", "[k", "x", "?k", "?", "p", "N", "t", ">", "¥", 
        "V", "B", "M", "<", ".k", "r", "Fk", "n", "/", "u", 
        "i", "Q", "c", "Hk", "e", ";", "j", "y", "o", "'k", "\"k", "l", "g",
        "~", "G"
    ];

    // -----------------------------------------------------------
    // STEP 4: Execution
    // -----------------------------------------------------------
    for (let i = 0; i < array_one.length; i++) {
        if(text.includes(array_one[i])) {
            text = text.split(array_one[i]).join(array_two[i]);
        }
    }

    return text;
};