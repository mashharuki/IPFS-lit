import { create } from "ipfs-http-client";
import { useState } from "react";
import lit from "../lib/lit";
import "./App.css";
import Header from "./Header";


const projectId = process.env.REACT_APP_INFURA_PROJECT_ID;   // <---------- your Infura Project ID
const projectSecret = process.env.REACT_APP_INFURA_PROJECT_SECRET;  // <---------- your Infura Secret


const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

const client = create({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    headers: {
        authorization: auth,
    },
});

/**
 * App コンポーネント
 * @returns 
 */
function App() {
  const [file, setFile] = useState(null);
  const [encryptedCipherArr, setEncryptedCipherArr] = useState([]);
  const [encryptedEncryptedHashArr, setEncryptedHashArr] = useState([]);
  const [decryptedFileArr, setDecryptedFileArr] = useState([]);

  /**
   * retrieveFile メソッド
   * @param {*} e 
   */
  function retrieveFile(e) {
    const data = e.target.files[0];
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(data);

    reader.onloadend = () => {
      setFile(Buffer(reader.result));
    };

    e.preventDefault();
  }

  /**
   * 復号化メソッド
   */
  function decrypt() {
    console.log('============= start =============');
    if (encryptedCipherArr.length !== 0) {
      Promise.all(encryptedCipherArr.map((url, idx) => {
        // decryptStringメソッドをコール
        return lit.decryptString(url, encryptedEncryptedHashArr[idx]);
      })).then((values) => {
        setDecryptedFileArr(values.map((v) => {
          return v;
        }));
      });
    }
  }

  /**
   * handleSubmit メソッド
   * @param {*} e 
   */
  async function handleSubmit(e) {
    e.preventDefault();

    try {
      console.log('============= start =============');
      const created = await client.add(file);
      const url = `https://infura-ipfs.io/ipfs/${created.path}`;
      // encryptString メソッドをコール
      const encrypted = await lit.encryptString(url);

      console.log('IPFS URL: ', url);
      console.log('ciphertext: ', encrypted.ciphertext);
      console.log('data to encrypt hash: ', encrypted.dataToEncryptHash);

      setEncryptedCipherArr((prev) => [...prev, encrypted.ciphertext]);
      setEncryptedHashArr((prev) => [...prev, encrypted.dataToEncryptHash]);
      console.log('============= end =============');
    } catch (error) {
      console.log("error:", error.message);
    }
  }

  return (
    <div className="App">
      <Header
        title="Here's an example of how to use Lit SDK V3 with IPFS"
      />

      <div className="main">
        <form onSubmit={handleSubmit}>
          <input 
            type="file" 
            onChange={retrieveFile} 
          />
          <button 
            type="submit" 
            className="button"
          >
            Submit 
          </button>
        </form>
      </div>
      <div>
        <button 
          className="button" 
          onClick={decrypt}
        >
          Decrypt
        </button>
        <div className="display">
          {decryptedFileArr.length !== 0
            ? decryptedFileArr.map((el) => <img src={el} alt={'alt'} style={{width:'500px', height: '600px;'}}/>
          ) : (
            <h3>Upload data, please! </h3>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
