from flask import Flask, request, jsonify
from rag_core import RAGCore
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)

app = Flask(__name__)

# Initialize the RAG core
# This will load data and build the FAISS index on startup.
try:
    logging.info("Initializing RAG Core...")
    rag_core = RAGCore(data_path='backend/rag_service/ipc_sections.json')
    logging.info("RAG Core initialized successfully.")
except Exception as e:
    logging.error(f"Failed to initialize RAG Core: {e}")
    rag_core = None

@app.route('/search', methods=['POST'])
def search():
    if not rag_core:
        return jsonify({"error": "RAG Core not initialized"}), 500

    data = request.get_json()
    if not data or 'query' not in data:
        return jsonify({"error": "Query not provided"}), 400

    query = data['query']
    logging.info(f"Received search query: {query}")
    
    try:
        results = rag_core.search(query)
        logging.info(f"Search found {len(results)} results.")
        return jsonify(results)
    except Exception as e:
        logging.error(f"Error during search: {e}")
        return jsonify({"error": "Failed to perform search"}), 500

if __name__ == '__main__':
    # Running on port 5001 to avoid conflict with the Node.js backend
    app.run(host='0.0.0.0', port=5001, debug=True) 