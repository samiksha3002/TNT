import React from "react";
// Using react-quill-new to fix the findDOMNode warning
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css'; 
import AiChat from "../components/AiChat";

// ✅ Added quillRef to props
const EditorTextarea = ({ manualText, setManualText, showChat, quillRef }) => {
  
  // ❌ Removed the internal const quillRef = useRef(null) 
  // because we are now using the one passed from Editor.jsx

  // Custom Toolbar configuration
  const modules = {
    toolbar: [
      [{ 'font': [] }, { 'size': [] }],
      ['bold', 'italic', 'underline', 'strike'],        
      [{ 'color': [] }, { 'background': [] }],          
      [{ 'script': 'sub'}, { 'script': 'super' }],      
      [{ 'header': '1' }, { 'header': '2' }, 'blockquote', 'code-block'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }, { 'align': [] }],
      ['link', 'image', 'video'],
      ['clean']                                         
    ],
  };

  return (
    <div className="flex flex-1 overflow-hidden bg-white">
      {/* RICH TEXT EDITOR SECTION */}
      <div className={`flex flex-col flex-1 min-w-0 ${showChat ? "w-2/3" : "w-full"}`}>
        <ReactQuill 
          ref={quillRef} // ✅ This now points to the parent's ref
          theme="snow"
          value={manualText}
          onChange={setManualText} 
          modules={modules}
          placeholder="Start typing or speaking..."
          className="h-full flex flex-col"
        />
      </div>

      {/* AI CHAT SECTION */}
      {showChat && (
        <div className="w-1/3 border-l bg-gray-50">
          <AiChat contextText={manualText} />
        </div>
      )}

      {/* CUSTOM CSS to fix layout and remove sliding under buttons */}
      <style>{`
        .quill {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .ql-toolbar {
          border-top: none !important;
          border-left: none !important;
          border-right: none !important;
          border-bottom: 1px solid #e5e7eb !important;
          background: #f9fafb;
        }
        .ql-container {
          flex: 1;
          overflow-y: auto;
          font-size: 1.125rem; 
          border: none !important;
        }
        .ql-editor {
          min-height: 100%;
          padding: 2rem; 
        }
        .ql-editor.ql-blank::before {
          left: 2rem;
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
};

export default EditorTextarea;