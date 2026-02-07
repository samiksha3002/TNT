export const convertToShivaji = (sourceText) => {
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
    text = text.replace(/द\s*्\s*य/g, "द्य"); 
    text = text.replace(/ह\s*्\s*म/g, "ह्म"); 

    // -----------------------------------------------------------
    // STEP 1: Handle 'Ra' (र्) Reph Logic
    // -----------------------------------------------------------
    text = text.replace(/र्([क-ह])/g, "$1Z");
    
    // Fix Z Position (Jump Matras)
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
    // STEP 3: Shivaji Specific Mapping (Strict Half Chars)
    // -----------------------------------------------------------
    const array_one = [
        // Ligatures
        "‘", "’", "“", "”", "(", ")", "{", "}", "=", "।", "?", "-", "µ", "॰", ",", ".", "् ",
        "०", "१", "२", "३", "४", "५", "६", "७", "८", "९", "x", 

        // Fix for 'Mahattva' -> Convert 'tt' to 'R'+'R' manually if needed, 
        // but removing 'त्त' from here forces it to use Half T (R) + Half T (R) which looks cleaner in some fonts.
        // Let's keep 'त्त' but fix half chars below.
        "द्ध", "ट्ट", "ट्ठ", "ड्ढ", 
        "क्र", "प्र", "द्र", "म्र", "ग्र", "ब्र", "स्र", 
        "त्र", "क्ष", "ज्ञ", "श्र", "त्त", "क्त", "दृ", "कृ", 
        "ह्न", "ह्य", "हृ", "ह्म", "द्य", 
        "ट्र", "ड्र", "श्व", "द्व", 
        
        // Explicit Half Characters (The Bug Fix Area)
        "क्", "ख्", "ग्", "घ्", "ङ्", 
        "च्", "छ्", "ज्", "झ्", "ञ्", 
        "ट्", "ठ्", "ड्", "ढ्", "ण्", // Punyas fixed here
        "त्", "थ्", "द्", "ध्", "न्", 
        "प्", "फ्", "ब्", "भ्", "म्", 
        "य्", "र्", "ल्", "व्", "श्", "ष्", "स्", "ह्",
        
        // Marathi Specifics
        "ळ", "ॐ", "ऱ", 

        // Matras
        "ा", "ि", "ी", "ु", "ू", "ृ", "े", "ै", "ो", "ौ", "ं", "ँ", "ः", "ॅ", "ऽ", "़", 

        // Consonants
        "अ", "आ", "इ", "ई", "उ", "ऊ", "ऋ", "ए", "ऐ", "ओ", "औ", "अं", "अः", 
        "क", "ख", "ग", "घ", "ङ", "च", "छ", "ज", "झ", "ञ", 
        "ट", "ठ", "ड", "ढ", "ण", "त", "थ", "द", "ध", "न", 
        "प", "फ", "ब", "भ", "म", "य", "र", "ल", "व", "श", "ष", "स", "ह",
        "्" 
    ];

    const array_two = [
        // Mappings
        "^", "*", "Þ", "ß", "¼", "½", "¿", "À", "¾", "A", "\\", "&", "&", "A", "]", "-", "~ ", 
        "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "N", 

        "ð", "ê", "ë", "ï", 
        "Ø", "iz", "nz", "ez", "xz", "cz", "lz", 
        "=", "{k", "K", "Jh", "Ù", "Dr", "—", "—", 
        "à", "á", "º", "ã", "|", 
        "Vª", "Mª", "Üo", "n~o",

        // Half Chars Mappings (FIXED)
        "D", "[", "X", "¿", "?", 
        "P", "N", "T", ">", "¥", 
        "V", "B", "M", "<", ".",   // <--- Fixed: 'ण्' maps to '.' (Dot), not '.k'
        "R", "F", "n", "/", "U", 
        "I", "Q", "C", "H", "E", 
        "¸", "j", "Y", "O", "'", "\"", "L", "g", // <--- Fixed: 'ल्' maps to 'Y', 'व्' to 'O'

        // Marathi Mappings
        "Ø", "†", "J", // ळ maps to 'Ø' (Common Shivaji/Kruti Lla)

        // Matras
        "k", "f", "h", "q", "w", "`", "s", "S", "ks", "kS", "a", "¡", "%", "W", "·", "¸", 

        // Consonants
        "v", "vk", "b", "bZ", "m", "Å", "_", ",","S", "vks", "vkS", "va", "v%", 
        "d", "[k", "x", "?k", "?", "p", "N", "t", ">", "¥", 
        "V", "B", "M", "<", ".k", "r", "Fk", "n", "/", "u", 
        "i", "Q", "c", "Hk", "e", ";", "j", "y", "o", "'k", "\"k", "l", "g",
        "~" 
    ];

    for (let i = 0; i < array_one.length; i++) {
        if(text.includes(array_one[i])) {
            text = text.split(array_one[i]).join(array_two[i]);
        }
    }

    return text;
};