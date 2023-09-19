import * as LitJsSdk from '@lit-protocol/lit-node-client';

const litNodeClient = new LitJsSdk.LitNodeClient({
  litNetwork: 'cayenne',
});
const chain = 'ethereum';

// Must hold at least 0.00001 ETH
const accs = [
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

class Lit {
  async connect() {
    await litNodeClient.connect()
  }

  async encryptString(url) {
    if (!litNodeClient) {
      await this.connect()
    }

    console.log('url of uploaded file ', url);
    const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain: 'ethereum' });

    try {
      const encrypted = await LitJsSdk.encryptString({
        dataToEncrypt: url,
        chain,
        authSig,
        accessControlConditions: accs,
      }, litNodeClient);

      return encrypted;
    } catch (e) {
      throw new Error('Unable to encrypt content: ' + e);
    }
  }

  async decryptString(ciphertext, dataToEncryptHash) {
    if (!litNodeClient) {
      await this.connect()
    }
    const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain });

    console.log('ciphertext: ', ciphertext);
    console.log('data to encrypt: ', ciphertext);
    try {
      return await this.litNodeClient.decryptToString(
        {
          accessControlConditions: accs,
          ciphertext,
          dataToEncryptHash,
          authSig,
          chain,
        },
      );
    } catch (e) {
      throw new Error('Unable to decrypt content: ' + e);
    }
  }
}

export default new Lit()
