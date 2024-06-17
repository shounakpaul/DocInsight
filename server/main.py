import os
import shutil
from flask import Flask, request
from langchain_community.llms import Ollama
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings.fastembed import FastEmbedEmbeddings
from langchain_community.document_loaders import PDFPlumberLoader
from langchain_community.vectorstores import Chroma
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.prompts import PromptTemplate
from langchain.chains.retrieval import create_retrieval_chain


app = Flask(__name__)
llm = Ollama(model='tinyllama', temperature=0.1)

db_path = 'db'

embeddings = FastEmbedEmbeddings()

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=100,
    length_function=len,
    is_separator_regex=False
)

raw_prompt = PromptTemplate.from_template('''
                                          <s>[INST] You are a technical assisstant good at searching documents. If you do not have information from the provided information please say so. [/INST]
                                             [INST] {input}
                                                    Context: {context}
                                                    Answer:
                                             [/INST]  

                                          ''')


def delete_all_files_in_directory(directory):
    if os.path.exists(directory):
        for filename in os.listdir(directory):
            file_path = os.path.join(directory, filename)
            try:
                if os.path.isfile(file_path) or os.path.islink(file_path):
                    os.unlink(file_path)
                elif os.path.isdir(file_path):
                    shutil.rmtree(file_path)
            except Exception as e:
                print(f'Failed to delete {file_path}. Reason: {e}')
    else:
        print(f'Directory {directory} does not exist.')


@app.route('/ask', methods=['POST'])
def ask():
    print("ask route has been accessed!")
    json_content = request.json
    query = json_content.get('query')
    print(query)
    res = llm.invoke(query)
    return res


@app.route('/upload_pdf', methods=['POST'])
def upload():
    print("pdf route has been accessed!")
    file = request.files['file']
    file_name = file.filename
    save_path = f"uploads/{file_name}"
    file.save(save_path)
    print(f"File saved at {save_path}")

    loader = PDFPlumberLoader(save_path)
    docs = loader.load_and_split()
    print(f"Loaded {len(docs)} documents")
    chunks = text_splitter.split_documents(docs)

    vector_store = Chroma.from_documents(
        documents=chunks, embedding=embeddings, persist_directory=db_path
    )
    vector_store.persist()

    print(vector_store)

    response = {"status": "success", "message": "File uploaded successfully",
                "doc_count": len(docs), "chunk_count": len(chunks)}
    return response


@app.route('/ask_pdf', methods=['POST'])
def ask_pdf():
    print("ask_pdf route has been accessed!")
    json_content = request.json
    query = json_content.get('query')

    print(query)

    print("Loading vector store")
    vector_store = Chroma(persist_directory=db_path,
                          embedding_function=embeddings)

    print("Creating chain")
    retriever = vector_store.as_retriever(
        search_type='similarity_score_threshold',
        search_kwargs={
            'k': 20,
            'score_threshold': 0.1
        },
    )
    document_chain = create_stuff_documents_chain(llm, raw_prompt)
    chain = create_retrieval_chain(retriever, document_chain)

    result = chain.invoke({"input": query})
    print(result)

    sources = []
    for doc in result['context']:
        sources.append(
            {"source": doc.metadata['source'],
                "page_content": doc.page_content}
        )

    response_answer = {"answer": result['answer'], "sources": sources}
    return response_answer


@app.route('/fetch_uploaded', methods=['GET'])
def fetch_uploaded():
    print("fetch_uploaded route has been accessed!")
    files = os.listdir('uploads')
    response = {"status": "success", "files": files}
    return response


@app.route('/reset', methods=['GET'])
def reset():
    print("reset route has been accessed!")
    delete_all_files_in_directory('uploads')
    delete_all_files_in_directory(db_path)
    response = {"status": "success", "message": "Reset successful"}
    return response


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3300, debug=True)
