import * as LitJsSdk from '@lit-protocol/lit-node-client';

// インスタンスの設定
const litNodeClient = new LitJsSdk.LitNodeClient({
  litNetwork: 'cayenne',
});
const chain = 'mumbai';

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

/**
 * Litのクラスライブラリ
 */
class Lit {  
  client

  /**
   * 接続用メソッド
   */
  async connect() {
    await litNodeClient.connect();
    this.client = litNodeClient;
  }

  /**
   * テキストデータを暗号化するメソッド
   * @param {*} url 
   * @returns 
   */
  async encryptString(url) {
    if (!this.client) {
      await this.connect()
    }

    const authSig = await LitJsSdk.checkAndSignAuthMessage({ 
      chain: 'mumbai'
    });

    try {
      // encryptString methodをコール
      return await LitJsSdk.encryptString({
        dataToEncrypt: url,
        chain,
        authSig,
        accessControlConditions: accs,
      }, litNodeClient);
    } catch (e) {
      console.log(e);
      throw new Error('Unable to encrypt content: ' + e);
    }
  }

  /**
   * 復号化のメソッド
   * @param {*} ciphertext 
   * @param {*} dataToEncryptHash 
   * @returns 
   */
  async decryptString(ciphertext, dataToEncryptHash) {
    if (!this.client) {
      await this.connect()
    }
    const authSig = await LitJsSdk.checkAndSignAuthMessage({ 
      chain 
    });

    console.log('ciphertext: ', ciphertext);
    console.log('data to decrypt: ', dataToEncryptHash);

    try {
      // decrypToString methodをコール
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
}

export default new Lit()
