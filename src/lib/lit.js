import { LitNodeClient, uint8arrayFromString, checkAndSignAuthMessage } from '@lit-protocol/lit-node-client';

const client = new LitNodeClient();
const chain = 'ethereum';
//const litNodeClient = new LitNodeClient();

/** 
 * Access control for a wallet with > 0.00001 ETH
 * const accessControlConditionsETHBalance = [
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
 */

// Must hold at least one Monster Suit NFT (https://opensea.io/collection/monster-suit)
const accessControlConditions = [
    {
      contractAddress: '0x89b597199dac806ceecfc091e56044d34e59985c',
      standardContractType: 'ERC721',
      chain,
      method: 'balanceOf',
      parameters: [
        ':userAddress'
      ],
      returnValueTest: {
        comparator: '>',
        value: '0'
      }
    }
  ]

class Lit {
  litNodeClient

  async connect() {
    await client.connect()
    this.litNodeClient = client
  }

  async encryptString(str) {
    if (!this.litNodeClient) {
      await this.connect()
    }

    try {
      const encrypted = await client.encrypt({
        dataToEncrypt: uint8arrayFromString(str),
          chain,
          accessControlConditions,
      });

      return encrypted;
    } catch (e) {
      throw new Error('Unable to encrypt content: ' + e);
    }
  }

  async decryptString(ciphertext, dataToEncryptHash) {
    if (!this.litNodeClient) {
      await this.connect()
    }
    const authSig = await checkAndSignAuthMessage({
      chain
    });

    console.log("ciphertext: ", ciphertext);
    console.log("data to encrypt: ", ciphertext);
    try {
      return await client.decrypt(
        {
          accessControlConditions,
          ciphertext,
          dataToEncryptHash,
          authSig,
          chain: 'ethereum',
        },
      );
    } catch (e) {
      throw new Error('Unable to decrypt content: ' + e);
    }
  }
}

export default new Lit()
