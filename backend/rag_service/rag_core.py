import json
import os
import numpy as np
import faiss
from dotenv import load_dotenv
import google.generativeai as genai

class RAGCore:
    def __init__(self, data_path='ipc_sections.json'):
        load_dotenv()
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("Gemini API key not found. Please set GEMINI_API_KEY in backend/rag_service/.env")
        
        genai.configure(api_key=self.api_key)
        
        self.data_path = data_path
        self.sections = None
        self.index = None
        self.metadata = None
        self._load_and_embed()

    def _load_and_embed(self):
        # Load JSON file
        with open(self.data_path, 'r', encoding='utf-8') as f:
            self.sections = json.load(f)
        print(f"Loaded {len(self.sections)} sections")

        # Generate embeddings for all sections using Gemini
        print("Generating embeddings with Gemini...")
        
        # We need to handle the content format for the batch embedding API
        # By including the section number and title, we make the embeddings more specific.
        text_contents = [f"{sec['section_number']} - {sec['title']}: {sec['text']}" for sec in self.sections]
        
        # Gemini's API can handle batching internally, but let's batch manually for very large datasets if needed.
        # For now, a single call is fine.
        result = genai.embed_content(
            model="models/embedding-001",
            content=text_contents,
            task_type="RETRIEVAL_DOCUMENT",
            title="IPC Legal Sections" # Optional but recommended
        )
        
        embeddings = result['embedding']
        print("Embeddings generated.")

        # Convert to numpy array for FAISS
        embedding_dim = len(embeddings[0])
        embedding_matrix = np.array(embeddings).astype('float32')

        # Create FAISS index
        self.index = faiss.IndexFlatL2(embedding_dim)
        self.index.add(embedding_matrix)
        print(f"Added {self.index.ntotal} vectors to FAISS index")

        # Save metadata for retrieval
        self.metadata = self.sections

    def _get_embedding(self, text, task_type="RETRIEVAL_QUERY"):
        # This function will now generate an embedding for a single query
        result = genai.embed_content(
            model="models/embedding-001",
            content=text,
            task_type=task_type
        )
        return result['embedding']

    def search(self, query, k=3):
        query_emb = self._get_embedding(query)
        query_vector = np.array(query_emb).astype('float32').reshape(1, -1) # Reshape for search

        distances, indices = self.index.search(query_vector, k)
        results = [self.metadata[i] for i in indices[0]]
        return results 