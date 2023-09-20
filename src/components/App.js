import "./App.css";
import { useState } from "react";
import { create } from "ipfs-http-client";
import lit from "../lib/lit";
import Header from "./Header";

const projectId = '';   // <---------- your Infura Project ID

const projectSecret = '';  // <---------- your Infura Secret
//(for security concerns, consider saving these values in .env files)

const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

const client = create({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    headers: {
        authorization: auth,
    },
});

function App() {
  const [file, setFile] = useState(null);
  const [encryptedCipherArr, setEncryptedCipherArr] = useState([]);
  const [encryptedEncryptedHashArr, setEncryptedHashArr] = useState([]);
  const [decryptedFileArr, setDecryptedFileArr] = useState([]);

  function retrieveFile(e) {
    const data = e.target.files[0];
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(data);

    reader.onloadend = () => {
      setFile(Buffer(reader.result));
    };

    e.preventDefault();
  }

  function decrypt() {
    if (encryptedCipherArr.length !== 0) {
      Promise.all(encryptedCipherArr.map((url, idx) => {
        return lit.decryptString(url, encryptedEncryptedHashArr[idx]);
      })).then((values) => {
        setDecryptedFileArr(values.map((v) => {
          return v;
        }));
      });
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const created = await client.add(file);
      const url = `https://infura-ipfs.io/ipfs/${created.path}`;

      const encrypted = await lit.encryptString(url);

      console.log('IPFS URL: ', url);
      console.log('ciphertext: ', encrypted.ciphertext);
      console.log('data to encrypt hash: ', encrypted.dataToEncryptHash);

      setEncryptedCipherArr((prev) => [...prev, encrypted.ciphertext]);
      setEncryptedHashArr((prev) => [...prev, encrypted.dataToEncryptHash]);
    } catch (error) {
      console.log(error.message);
    }
  }

  return (
    <div className="App">
      <Header
        title="Here's an example of how to use Lit with IPFS"
      />

      <div className="main">
        <form onSubmit={handleSubmit}>
          <input type="file" onChange={retrieveFile} />
          <button type="submit" className="button">Submit</button>
        </form>
      </div>
      <div>
        <button className="button" onClick={decrypt}>Decrypt</button>
        <div className="display">
          {decryptedFileArr.length !== 0
            ? decryptedFileArr.map((el) => <img src={el} alt={'alt'} style={{width:'500px', height: '600px;'}}/>) : <h3>Upload data, please! </h3>}
        </div>
      </div>
    </div>
  );
}

export default App;
