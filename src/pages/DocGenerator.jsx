import React, { useState } from 'react';
import Layout from '../Components/Layout';
import './Chat.css'; // Re-using some styles

function DocGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDocument, setGeneratedDocument] = useState('');
  const [docGenForm, setDocGenForm] = useState({
    deponentName: '',
    address: '',
    statement: '',
  });

  const handleDocGenSubmit = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setGeneratedDocument('');

    try {
      const res = await fetch("http://localhost:5000/api/generate-doc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(docGenForm),
      });

      if (!res.ok) {
        throw new Error("Failed to generate document from server.");
      }

      const data = await res.json();
      setGeneratedDocument(data.document || "Error: Could not parse the document.");

    } catch (err) {
      console.error("Document generation error:", err);
      setGeneratedDocument(`Error: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleCopy = () => {
    navigator.clipboard.writeText(generatedDocument);
  };
  
  const handleGenerateNew = () => {
    setGeneratedDocument('');
    setDocGenForm({ deponentName: '', address: '', statement: '' });
  };

  return (
    <Layout>
      <div className="doc-generator-page">
        <h1>Legal Document Generator</h1>
        <p>Select a document type and fill in the details below.</p>
        
        <div className="doc-generator-container">
            {!generatedDocument ? (
              <form onSubmit={handleDocGenSubmit} className="doc-gen-form">
                <h2>Affidavit Details</h2>
                <label>Deponent Name</label>
                <input type="text" value={docGenForm.deponentName} onChange={(e) => setDocGenForm({...docGenForm, deponentName: e.target.value})} required />
                <label>Address</label>
                <input type="text" value={docGenForm.address} onChange={(e) => setDocGenForm({...docGenForm, address: e.target.value})} required />
                <label>Statement of Facts</label>
                <textarea
                  placeholder="Briefly state the facts of the matter..."
                  value={docGenForm.statement}
                  onChange={(e) => setDocGenForm({...docGenForm, statement: e.target.value})}
                  required
                  rows="8"
                />
                <div className="form-buttons">
                  <button type="submit" disabled={isGenerating}>
                    {isGenerating ? 'Generating...' : 'Generate Document'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="generated-doc-display">
                <h2>Generated Document</h2>
                <pre className="generated-doc-text">{generatedDocument}</pre>
                <div className="form-buttons">
                   <button type="button" onClick={handleCopy}>Copy to Clipboard</button>
                   <button type="button" onClick={handleGenerateNew}>Generate New Document</button>
                </div>
              </div>
            )}
        </div>
      </div>
    </Layout>
  );
}

export default DocGenerator; 