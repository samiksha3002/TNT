import React, { useState, useEffect, useRef } from "react";
import EditorActions from "./EditorActions";
import EditorTextarea from "./EditorTextarea";
import EditorStatusBar from "./EditorStatusBar";
import DraftPopup from "./DraftPopup";

import { convertToKrutiDev } from '../../utils/krutidev';
import { convertToShivaji } from '../../utils/shivaji';
import { convertToPreeti } from '../../utils/preeti';

const Editor = ({
  user,
  speechText,
  manualText,
  setManualText,
  translationCommand,
  setTranslationCommand,
  transliterationCommand,
  setTransliterationCommand,
  fontConvertCommand,
  setFontConvertCommand,
  isTranslating, setIsTranslating,
  isTransliterating, setIsTransliterating,
  isConverting, setIsConverting,
  isOCRLoading, setIsOCRLoading,
  isAudioLoading, setIsAudioLoading,
  isAIGenerating, setIsAIGenerating
}) => {
  const lastProcessedSpeechRef = useRef("");
  const quillRef = useRef(null); // ✅ Added Ref for cursor control
  const [showChat, setShowChat] = useState(false);
  const [showDraftPopup, setShowDraftPopup] = useState(false);

  const [API_BASE_URL, setApiBaseUrl] = useState(
    import.meta.env.VITE_API_URL || "http://localhost:5000"
  );

  useEffect(() => {
    fetch("/config.json")
      .then((res) => res.json())
      .then((cfg) => {
        if (cfg.API_URL) setApiBaseUrl(cfg.API_URL);
      })
      .catch((err) => console.error("Failed to load config.json", err));
  }, []);

  // 🎤 Speech Logic (Corrected for Cursor Position)
  useEffect(() => {
    if (!speechText || speechText === lastProcessedSpeechRef.current || !quillRef.current) return;

    const editor = quillRef.current.getEditor();
    const range = editor.getSelection();

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

      commands.forEach(({ phrases, symbol }) => {
        phrases.forEach(phrase => {
          const regex = new RegExp(`\\b${phrase}\\b`, 'gi');
          processed = processed.replace(regex, symbol);
        });
      });
      return processed;
    };

    let cleanSpeech = processSpeechText(speechText);
    const lowerSpeech = speechText.toLowerCase();
    let textToInsert = " " + cleanSpeech;

    // Handle Line Breaks
    if (["new paragraph", "naya paragraph", "navin parichhed"].some(cmd => lowerSpeech.includes(cmd))) {
      textToInsert = "\n\n";
    } else if (["new line", "nai line", "navin aol"].some(cmd => lowerSpeech.includes(cmd))) {
      textToInsert = "\n";
    }

    // Insert text at specific cursor position or at the end
    if (range) {
      editor.insertText(range.index, textToInsert, 'user');
      editor.setSelection(range.index + textToInsert.length, 0); // Keep cursor right after new text
    } else {
      const length = editor.getLength();
      editor.insertText(length - 1, textToInsert, 'user');
    }

    // Sync State
    setManualText(editor.root.innerHTML);
    lastProcessedSpeechRef.current = speechText;
  }, [speechText, setManualText]);

  // 🌐 Translation Effect (Kept as is)
  useEffect(() => {
    const runTranslation = async () => {
      if (!translationCommand?.textToTranslate || !translationCommand?.lang) return;
      try {
        setIsTranslating(true);
        const plainText = translationCommand.textToTranslate.replace(/<[^>]*>/g, "");
        const res = await fetch(`${API_BASE_URL}/api/translate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: plainText, targetLang: translationCommand.lang }),
        });
        if (!res.ok) throw new Error("Translation Failed");
        const data = await res.json();
        if (data.translatedText) setManualText(`<p>${data.translatedText}</p>`);
      } catch (err) {
        console.error("Translation error:", err);
      } finally {
        setIsTranslating(false);
        setTranslationCommand(null);
      }
    };
    runTranslation();
  }, [translationCommand, API_BASE_URL, setManualText, setIsTranslating, setTranslationCommand]);

  // ✍️ Transliteration Effect (Kept as is)
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
        if (data.transliteratedText) setManualText(`<p>${data.transliteratedText}</p>`);
      } catch (err) {
        console.error("Transliteration error:", err);
      } finally {
        setIsTransliterating(false);
        setTransliterationCommand(null);
      }
    };
    runTransliteration();
  }, [transliterationCommand, API_BASE_URL, setManualText, setIsTransliterating, setTransliterationCommand]);

  // 🔠 Font Conversion Effect (Kept as is)
  useEffect(() => {
    const runFontConversion = async () => {
      if (!fontConvertCommand?.textToConvert || !fontConvertCommand?.font) return;
      try {
        setIsConverting(true);
        const plainText = fontConvertCommand.textToConvert.replace(/<[^>]*>/g, "");
        let convertedText = plainText;
        setTimeout(async () => {
          if (fontConvertCommand.font === "krutidev") convertedText = convertToKrutiDev(plainText);
          else if (fontConvertCommand.font === "Shivaji") convertedText = convertToShivaji(plainText);
          else if (fontConvertCommand.font === "Preeti") convertedText = convertToPreeti(plainText);
          else if (fontConvertCommand.font === "unicode") {
            const res = await fetch(`${API_BASE_URL}/api/font-convert/krutidev-to-unicode`, {
              method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: plainText })
            });
            const data = await res.json();
            convertedText = data.convertedText || plainText;
          }
          setManualText(`<p>${convertedText}</p>`);
          setIsConverting(false);
          setFontConvertCommand(null);
        }, 500);
      } catch (err) {
        setIsConverting(false);
        setFontConvertCommand(null);
      }
    };
    runFontConversion();
  }, [fontConvertCommand, setManualText, setIsConverting, setFontConvertCommand]);

  const clearAutoSave = () => {
    if (user?._id) {
      localStorage.removeItem(`autosave_${user._id}`);
      setManualText('');
    }
  }

  return (
    <div className="flex-1 w-full h-full flex flex-col bg-white relative overflow-hidden">
      <div className="flex-1 border-l border-gray-200 flex flex-col overflow-hidden min-h-0">
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
          quillRef={quillRef} // ✅ Pass Ref
        />

        <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
          <EditorTextarea
            manualText={manualText}
            setManualText={setManualText}
            showChat={showChat}
            quillRef={quillRef} // ✅ Pass Ref
          />
        </div>

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