import React, { useState, useEffect, useRef } from "react";
import EditorActions from "./EditorActions";
import EditorTextarea from "./EditorTextarea";
import EditorStatusBar from "./EditorStatusBar";
import DraftPopup from "./DraftPopup";

// Apni path sahi check kar lena, usually it is one level up
import { convertToKrutiDev } from '../../utils/krutidev';
import { convertToShivaji } from '../../utils/shivaji';
import { convertToPreeti } from '../../utils/preeti';

const Editor = ({
  user,
  speechText,
  manualText,
  setManualText,

  // Commands from Dashboard
  translationCommand,
  setTranslationCommand,
  transliterationCommand,
  setTransliterationCommand,
  fontConvertCommand,
  setFontConvertCommand,

  // Loading States & Setters
  isTranslating, setIsTranslating,
  isTransliterating, setIsTransliterating,
  isConverting, setIsConverting,
  isOCRLoading, setIsOCRLoading,
  isAudioLoading, setIsAudioLoading,
  isAIGenerating, setIsAIGenerating
}) => {
  const lastProcessedSpeechRef = useRef("");
  const [showChat, setShowChat] = useState(false);
  const [showDraftPopup, setShowDraftPopup] = useState(false);

  // 🌐 API Base URL
  const [API_BASE_URL, setApiBaseUrl] = useState(
    import.meta.env.VITE_API_URL || "http://localhost:5000"
  );

  // Load Config
  useEffect(() => {
    fetch("/config.json")
      .then((res) => res.json())
      .then((cfg) => {
        if (cfg.API_URL) setApiBaseUrl(cfg.API_URL);
      })
      .catch((err) => console.error("Failed to load config.json", err));
  }, []);

  // 🎤 Speech Append Logic (UPDATED: Inserts at Cursor Position)
  useEffect(() => {
    if (!speechText) return;
    if (speechText === lastProcessedSpeechRef.current) return;

    // 1. Punctuation Processing
    const processSpeechText = (text) => {
      let processed = text;
      
      const commands = [
        { phrases: ["comma", "alpviram", "swalpviram"], symbol: "," },
        { phrases: ["full stop", "purna viram", "purnaviram"], symbol: "." },
        { phrases: ["question mark", "prashnchin", "prashna chinha", "prashnvachak"], symbol: "?" },
        { phrases: ["exclamation", "vismayadibodhak", "aashcharyavachak"], symbol: "!" },
        { phrases: ["colon", "apurna viram", "apurnaviram"], symbol: ":" },
        { phrases: ["semi colon", "ardhviram"], symbol: ";" },
        { phrases: ["hyphen", "yojak chinh", "sanyog chinh"], symbol: "-" },
        { phrases: ["slash", "tirchi rekha", "tirki regh"], symbol: "/" },
        { phrases: ["open bracket", "koshak shuru", "kans suru"], symbol: "(" },
        { phrases: ["close bracket", "koshak band", "kans band"], symbol: ")" },
        { phrases: ["double quote", "dohra uddharan", "duheri avtaran"], symbol: '"' },
        { phrases: ["single quote", "ekal uddharan", "ekeri avtaran"], symbol: "'" },
        { phrases: ["at the rate", "et da ret"], symbol: "@" },
        { phrases: ["plus sign", "jama chinh", "berij chinh"], symbol: "+" },
      ];

      // Replace phrases with symbols (Case Insensitive)
      commands.forEach(({ phrases, symbol }) => {
        phrases.forEach(phrase => {
          const regex = new RegExp(`\\b${phrase}\\b`, 'gi');
          processed = processed.replace(regex, symbol);
        });
      });
      
      return processed;
    };

    // 2. Helper to insert HTML at current Cursor Position
    const insertHtmlAtCursor = (html) => {
        const sel = window.getSelection();
        
        // Check if cursor exists and is valid
        if (sel.rangeCount > 0) {
            const range = sel.getRangeAt(0);
            
            // Delete current selection if any
            range.deleteContents();

            // Create HTML fragment
            const fragment = range.createContextualFragment(html);
            const lastNode = fragment.lastChild;
            
            // Insert the fragment
            range.insertNode(fragment);

            // Move cursor after the inserted text
            if (lastNode) {
                range.setStartAfter(lastNode);
                range.setEndAfter(lastNode); 
                sel.removeAllRanges();
                sel.addRange(range);
            }

            // SYNC WITH REACT STATE:
            // Find the closest contenteditable parent to get the full updated HTML
            let container = range.commonAncestorContainer;
            while (container && container.nodeType !== 1) { 
                container = container.parentNode;
            }
            const editorDiv = container?.closest('[contenteditable="true"]');
            
            if (editorDiv) {
                setManualText(editorDiv.innerHTML);
            } else {
                // Fallback if structure is unexpected
                setManualText((prev) => (prev || "") + " " + html);
            }
        } else {
            // Fallback: If no cursor, append to end
            setManualText((prev) => (prev || "") + " " + html);
        }
    };

    // 3. Execution Logic
    let cleanSpeech = processSpeechText(speechText);
    const lowerSpeech = speechText.toLowerCase();

    // A. NEW PARAGRAPH
    const paraCommands = ["new paragraph", "naya paragraph", "naya pairagraph", "naveen parichhed", "navin parichhed"];
    if (paraCommands.some(cmd => lowerSpeech.includes(cmd))) {
         paraCommands.forEach(cmd => {
            cleanSpeech = cleanSpeech.replace(new RegExp(`\\b${cmd}\\b`, 'gi'), "");
         });
         // Close current p and start new p
         insertHtmlAtCursor(`</p><p>${cleanSpeech}`);
    } 
    // B. NEW LINE
    else if (["new line", "nai line", "naveen aol", "navin aol"].some(cmd => lowerSpeech.includes(cmd))) {
         ["new line", "nai line", "naveen aol", "navin aol"].forEach(cmd => {
            cleanSpeech = cleanSpeech.replace(new RegExp(`\\b${cmd}\\b`, 'gi'), "");
         });
         // Insert Break
         insertHtmlAtCursor(`<br>${cleanSpeech}`);
    } 
    // C. NORMAL TEXT
    else {
         // Insert text with a leading space
         insertHtmlAtCursor(` ${cleanSpeech}`);
    }

    lastProcessedSpeechRef.current = speechText;
  }, [speechText, setManualText]);

  // 🌐 Translation Effect
  useEffect(() => {
    const runTranslation = async () => {
      if (!translationCommand?.textToTranslate || !translationCommand?.lang) return;
      
      try {
        setIsTranslating(true);
        const plainText = translationCommand.textToTranslate.replace(/<[^>]*>/g, "");
        
        const res = await fetch(`${API_BASE_URL}/api/translate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            text: plainText, 
            targetLang: translationCommand.lang 
          }),
        });

        if (!res.ok) throw new Error("Translation Failed");
        const data = await res.json();
        
        if (data.translatedText) {
          setManualText(`<p>${data.translatedText}</p>`);
        }
      } catch (err) {
        console.error("Translation error:", err);
        alert("Translation Error. Please try again.");
      } finally {
        setIsTranslating(false);
        setTranslationCommand(null);
      }
    };
    runTranslation();
  }, [translationCommand, API_BASE_URL, setManualText, setIsTranslating, setTranslationCommand]);

  // ✍️ Transliteration Effect
  useEffect(() => {
    const runTransliteration = async () => {
      if (!transliterationCommand) return;
      
      try {
        setIsTransliterating(true);
        const plainText = transliterationCommand.textToTransliterate.replace(/<[^>]*>/g, "");
        
        const res = await fetch(`${API_BASE_URL}/api/transliterate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: plainText,
            sourceLang: "hi",
            targetScript: transliterationCommand.script === "en" ? "Latn" : "Deva",
          }),
        });

        if (!res.ok) throw new Error("Transliteration Failed");
        const data = await res.json();
        
        if (data.transliteratedText) {
          setManualText(`<p>${data.transliteratedText}</p>`);
        }
      } catch (err) {
        console.error("Transliteration error:", err);
        alert("Transliteration Error. Please try again.");
      } finally {
        setIsTransliterating(false);
        setTransliterationCommand(null);
      }
    };
    runTransliteration();
  }, [transliterationCommand, API_BASE_URL, setManualText, setIsTransliterating, setTransliterationCommand]);

  // 🔠 Font Conversion Effect
  useEffect(() => {
    const runFontConversion = async () => {
      if (!fontConvertCommand?.textToConvert || !fontConvertCommand?.font) return;

      try {
        setIsConverting(true);

        const plainText = fontConvertCommand.textToConvert.replace(/<[^>]*>/g, "");
        let convertedText = plainText;

        setTimeout(async () => {
          
          // CASE 1: KrutiDev
          if (fontConvertCommand.font === "krutidev") {
            console.log("Converting to KrutiDev...");
            convertedText = convertToKrutiDev(plainText);
          } 
          
          // CASE 2: Shivaji
          else if (fontConvertCommand.font === "Shivaji") {
             console.log("Converting to Shivaji...");
             convertedText = convertToShivaji(plainText);
          }

          // CASE 3: Preeti
          else if (fontConvertCommand.font === "Preeti") {
             console.log("Converting to Preeti...");
             convertedText = convertToPreeti(plainText);
          }

          // CASE 4: Unicode
          else if (fontConvertCommand.font === "unicode") {
            try {
              const res = await fetch(`${API_BASE_URL}/api/font-convert/krutidev-to-unicode`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: plainText })
              });
              const data = await res.json();
              convertedText = data.convertedText || plainText;
            } catch (apiError) {
              console.error("API Error converting to Unicode:", apiError);
              convertedText = plainText;
            }
          }

          setManualText(`<p>${convertedText}</p>`);
          setIsConverting(false);
          setFontConvertCommand(null);
          
        }, 500);
        
      } catch (err) {
        console.error("Font conversion error:", err);
        setIsConverting(false);
        setFontConvertCommand(null);
      }
    };

    runFontConversion();
  }, [fontConvertCommand, setManualText, setIsConverting, setFontConvertCommand]);

  // Helper to clear storage
  const clearAutoSave = () => {
      if(user?._id) {
          localStorage.removeItem(`autosave_${user._id}`);
          setManualText(''); 
      }
  }

  return (
    <div className="flex-1 w-full h-full flex flex-col bg-white relative overflow-hidden">
      
      {/* Container wrapper */}
      <div className="flex-1 border-l border-gray-200 flex flex-col overflow-hidden min-h-0">
        
        {/* Editor Toolbar */}
        <EditorActions
          manualText={manualText}
          setManualText={setManualText}
          showChat={showChat}
          setShowChat={setShowChat}
          
          setIsTranslating={setIsTranslating}
          
          isOCRLoading={isOCRLoading}
          setIsOCRLoading={setIsOCRLoading}
          
          isAudioLoading={isAudioLoading}
          setIsAudioLoading={setIsAudioLoading}
          
          setShowDraftPopup={setShowDraftPopup}
          setIsAIGenerating={setIsAIGenerating}
          
          API={API_BASE_URL}
          onClear={clearAutoSave}
        />

        {/* Text Area */}
        <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
          <EditorTextarea
            manualText={manualText}
            setManualText={setManualText}
            showChat={showChat}
          />
        </div>

        {/* Status Bar */}
        <EditorStatusBar
          manualText={manualText}
          speechText={speechText}
          isTranslating={isTranslating}
          isTransliterating={isTransliterating}
          isConverting={isConverting}
          isOCRLoading={isOCRLoading}
          isAudioLoading={isAudioLoading}
          isAIGenerating={isAIGenerating}
        />
      </div>

      {showDraftPopup && (
        <DraftPopup
          onClose={() => setShowDraftPopup(false)}
          setManualText={setManualText}
          setIsAIGenerating={setIsAIGenerating}
        />
      )}
    </div>
  );
};

export default Editor;