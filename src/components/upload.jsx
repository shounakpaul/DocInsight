import React, { useEffect, useState } from "react";
import Button from "./button";

function Upload({ setMessages }) {
  const [file, setFile] = useState(null);

  const fetchUploadedFiles = async () => {
    const response = await fetch("/api/fetch_uploaded");
    const data = await response.json();
    return data["files"];
  };

  const resetConversation = async () => {
    const response = await fetch("/api/reset");
    console.log(await response.json());
    setMessages([]);
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]); 
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload_pdf", {
      method: "POST",
      body: formData,
    });

    setFile(null);
    document.getElementById("fileUpload").value = "";
    console.log(file);
    if (response.ok) {
      console.log("File uploaded successfully");
    } else {
      console.error("File upload failed");
    }
  };

  let [uploadedFiles, setUploadedFiles] = useState([]);
  useEffect(() => {
    const fetchFiles = async () => {
      const data = await fetchUploadedFiles();
      setUploadedFiles(data);
    };

    // Call once immediately
    fetchFiles();

    // Then set up interval to fetch every 5 seconds
    const intervalId = setInterval(fetchFiles, 2000);

    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center px-10 py-10 mx-10 my-5 border gap-y-10 border-neutral-500 rounded-3xl">
      <div className="flex flex-row items-center justify-between w-full">
        <div>
          <p className="text-xl font-bold">Upload Files</p>
          <p className="text-lg font-light">
            Uploaded files will act as the context for the answers.
          </p>
        </div>
        <div className="flex flex-row items-center p-2 border gap-x-10 border-neutral-400 rounded-3xl">
          <input type="file" onChange={handleFileChange} id="fileUpload" />
          <Button onClick={handleUpload} content={"Upload"} />
        </div>
      </div>
      <div className="w-full gap-y-2">
        <div className="flex flex-row items-start justify-between">
          <p className="text-lg font-bold">Current Uploaded Files</p>
          <Button
            content={"Reset Conversation"}
            className={"hover:text-red-600"}
            onClick={resetConversation}
          />
        </div>
        {uploadedFiles.length === 0 ? (
          <p className="text-lg font-light">No files uploaded yet.</p>
        ) : (
          uploadedFiles.map((file, index) => (
            <div key={index}>
              <p>{file}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Upload;
