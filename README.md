# Unlockable Content with IPFS x Lit

![Image for application](/public/UnlockableContent.png)
To show how to use Lit, we’ll build a DApp with a React frontend. The DApp connects to [IPFS (InterPlanetary File System)](https://docs.ipfs.tech/concepts/what-is-ipfs/) to upload images or files, stores the Lit encrypted IPFS content identifier (CID) to the application’s state, and decrypts the CID to display the uploaded file. The access control conditions for encrypting and decrypting the file will be whether or not the connected wallet holds at least  0.00001 ETH.

Generally, content that is unlockable is only unlockable on the platform it was created on. What is unlockable on OpenSea is not unlockable on Zora.

Using Lit Protocol, it's possible to provision decryption keys so any content can be decentralized and private, essentially encrypted and unlockable. Imagine a future where an NFT that is unlockable on OpenSea is unlockable on SolSea. Additionally, Lit Protocol makes it possible to have unlockable content accessible outside of traditional NFT platforms. One example is token gating items in a Shopify store.

**What is IPFS**

[IPFS](https://ipfs.io/) is a communication protocol that uses peer-to-peer networking to store, retrieve, and share data through a distributed file system mechanism. 

On IFPS, when you upload data to an existing node on the protocol, the data is distributed into smaller chunks, then hashed and given a unique content identifier (CID). For every new upload of new data or previously uploaded data, a new cryptographic hash (CID) is generated, making every upload to the network unique.

Use of IPFS in the wild:

- [Ceramic](https://ceramic.network/), which builds and extends IPFS to create open source data streams.

This guide starts with a base React application with IPFS set up. You can fork [this branch of the project](https://github.com/debbly/IPFS-lit/tree/without-lit) and follow along or see the complete code with Lit [here](https://github.com/debbly/IPFS-lit/tree/lit-sdk-v3).

![Lit site GIF](/public/lit.gif)

The full process for uploading and viewing the files should not change significantly from the base IPFS application to the application that uses Lit Protocol. The main visual addition is the decryption button.

## Initializing the Project with Infura

Update the IPFS projectID and projectSecret to your IPFS project information. If you do not have an Infura account, go [here](https://infura.io/) to sign up.

Make sure you update the keys and secret in `App.js`

```js
const projectId = '';   // <---------- your Infura Project ID

const projectSecret = '';   // <---------- your Infura Secret
//(for security concerns, consider saving these values in .env files)
```

## **Installation and Initializing Lit** 

Add the Lit JS SDK to your project. Make sure you are on version 3.0.1 or higher.

```jsx
yarn add @lit-protocol/lit-node-client@3.0.1
```

Within your /src folder, create a lib folder and create a lit.js file.

At the top of the lit.js file, include the Lit JS SDK

```jsx
import * as LitJsSdk from '@lit-protocol/lit-node-client';
```

 The SDK requires an active connection to the LIT nodes to store and retrieve encryption keys and signing requests. We’ll initialize a LitNodeClient and by calling `connect()`. The `connect()` function returns a Promise that resolves when a connection the Lit nodes is established. Make sure you are connected before doing any calls with the `LitNodeClient`.

```jsx
const client = new LitJsSdk.LitNodeClient({
  litNetwork: 'cayenne',
});

class Lit {
  litNodeClient;

  async connect() {
    await client.connect();
    this.litNodeClient = client;
  }
}

export default new Lit();
```

Before the Lit class, we are going to set a global access control condition. [Access control conditions](https://developer.litprotocol.com/coreConcepts/accessControl/intro) are how on-chain conditions are set. Examples of on-chain conditions are:

- User is a member of a DAO
- User holds an NFT in a collection
- User holds at least 0.1 ETH
- User owns a specific wallet address
- Using boolean operations (AND + OR) for any of the above

For this example, we are going to set the access control on if the wallet contains at least 0.00001 ETH.

```jsx
const chain = 'ethereum'

const accessControlConditionsNFT = [
  {
    contractAddress: '',
    standardContractType: '',
    chain,
    method: 'eth_getBalance',
    parameters: [
      ':userAddress',
      'latest'
    ],
    returnValueTest: {
      comparator: '>=',
      value: '10000000000000'
    }
  }
]
```

## **Encrypt and Upload**

![Encrypt with Lit](/public/encrypt.png)

Within your lit.js file, add an encryptString function. 

```jsx
async encryptString(str) {
    if (!this.litNodeClient) {
      await this.connect();
    }
  }
```

Within the encryptString function, we will encrypt the string and tell the `LitNodeClient` to save the relationship between the access control condition(s) and the content. This will be necessary for decrypting.

Lit functions explained:

- **checkAndSignAuthMessage**: Checks for an existing cryptographic authentication signature and creates one if it doesn’t exist. This is used to prove ownership of a given wallet address to the Lit nodes.
- **encryptString**: Encrypts any string.

```jsx
const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain });
try {
      return await LitJsSdk.encryptString({
        dataToEncrypt: url,
        chain,
        authSig,
        accessControlConditions: accs,
      }, litNodeClient);
    } catch (e) {
      throw new Error('Unable to encrypt content: ' + e);
}
```

Go to the App.js file. Within the App function, add in two states to keep track of the encrypted ciphers and the encrypted hash. Another way, that will make it easier to track the encrypted material is to make a map of the pairs. Each pair, the cipher and the encrypted hash, are needed at the decryption step. 

```jsx
  const [encryptedCipherArr, setEncryptedCipherArr] = useState([]);
  const [encryptedEncryptedHashArr, setEncryptedHashArr] = useState([]);
```

Within the handleSubmit function, add in your call to encrypt the URL. This should happen after the file has been uploaded to IPFS and a path is obtained. The created variable will hold a CID (a unique content identifier) and a string path. In order to obtain the URL to IPFS, we will use the path to construct the URL. 

Your handleSubmit function should look like this:

```jsx
async function handleSubmit(e) {
    e.preventDefault();

    try {
       const created = await client.add(file);
      const url = `https://infura-ipfs.io/ipfs/${created.path}`;

      const encrypted = await lit.encryptString(url);

      setEncryptedCipherArr((prev) => [...prev, encrypted.ciphertext]);
      setEncryptedHashArr((prev) => [...prev, encrypted.dataToEncryptHash]);
    } catch (error) {
      console.log(error.message);
    }
  }
```

To check if we’re on the correct path, we can add in a few console logs to check the encrypted output. 

For the following IPFS url:

[`https://infura-ipfs.io/ipfs/QmQFuqBx1AuYXJvpvJVuHUSRJaRoSovfTuJTG45PpbdcV1`](https://infura-ipfs.io/ipfs/QmQFuqBx1AuYXJvpvJVuHUSRJaRoSovfTuJTG45PpbdcV1)

The `cipherText` and `dataToEncryptHash` returned from encryptString( ) should look like:
```js
ciphertext:  gOlj+FWgJICGj8I4t6YKyDz6CK69069OuJOw7rQcEGr+2DgGpGxUSb9SRDIXeOoJTR6E0G0PJZA73mmczuPKvIvZpA8JCRTLSFQdwCQNxchLLquevGRSIZ8/N88NK11Ye8pJwpiQ7sZrsYnXAdU09/ZOXdpP1aN4ThfLoRy+1U4pm/TEz0MWKrlhGTHmIyDqqjktq5g01C+maS1QAw==
dataToEncryptHash:  e80a752fbee810acddc149888a19a84a6e4fd1a4b50cea7ca4bec7021f97262d
```

## **Decrypt and Display**

![Decrypt](/public/decrypt.png)

Within our lit.js file, we create a decryptString function that will take in the encrypted string and the data encrypted hash and pass back a decrypted string if we hold the correct conditions to decrypt. 

Lit functions explained:

- **checkAndSignAuthMessage**: Checks for an existing cryptographic authentication signature and creates one if it doesn’t exist. This is used to prove ownership of a given wallet address to the Lit nodes.
- **decryptToString**: Decrypt a string that was encrypted using the Lit Node Client encryptString function.

```jsx
async decryptString(encryptedStr, encryptedSymmetricKey) {
    if (!this.litNodeClient) {
      await this.connect()
    }

    const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain })
    try {
      return await LitJsSdk.decryptToString(
        {
          accessControlConditions: accs,
          ciphertext,
          dataToEncryptHash,
          authSig,
          chain,
        }, litNodeClient
      );
    } catch (e) {
      throw new Error('Unable to decrypt content: ' + e);
    }
  }
```

Go back to the App.js file. Within the App function, add in a state to keep track of the decrypted URLs. Feel free to remove `const [urlArr, setUrlArr] = useState([]);` , we will not be using that state.

```jsx
const [decryptedFileArr, setDecryptedFileArr] = useState([]);
```

Within the App function, add in a decrypt helper function. This helper function is called when the `decrypt` button is pressed.

```jsx
function decrypt() {
    Promise.all(encryptedUrlArr.map((url, idx) => {
      return lit.decryptString(url, encryptedKeyArr[idx]);
    })).then((values) => {
      setDecryptedFileArr(values.map((v) => {
        return v;
      }));
    });
  }
```

Finally, within the JSX at the bottom of the App.js file, update the div labeled display to take into account the new decrypted array. Allow a few moments for the decrypt function to work and you should see your image shortly! Be patient :).

```jsx
<div className="display">
  {decryptedFileArr.length !== 0
    ? decryptedFileArr.map((el) => <img src={el} alt="images" />) : <h3>Upload data</h3>}
</div>
```

Congrats! We now have a decentralized application that utilizes Lit to encrypt and decrypt files stored on IPFS. 

### Additional Examples Using Lit Protocol
![React Example in JS-SDK](/public/lit_encrypt_react.png)
Check out [this example React application](https://github.com/LIT-Protocol/js-sdk/tree/feat/SDK-V3/apps/demo-encrypt-decrypt-react) that encrypts and decrypts a **string** using the Lit JS SDK V3. This gives an overview of the time it takes to encrypt and decrypt a simple string.

## The Lit Future

So you’re thinking, Lit Protocol is pretty cool and can do some awesome things around privacy that is widely missing from the decentralized web. Learn more about Lit through the [developer docs](https://developer.litprotocol.com/).

In the coming months, we'll be releasing some awesome features to help you build quickly and easily. Allowing builders to seamlessly add automated signing to their applications, all without the stress of managing keys.
