import {
  Client,
  FileAppendTransaction,
  FileContentsQuery,
  FileCreateTransaction,
  FileDeleteTransaction,
  FileId,
  FileInfo,
  FileInfoQuery,
  FileUpdateTransaction,
  Timestamp,
  KeyList,
  LedgerId,
  Transaction,
  Hbar,
  TransactionId,
} from '@hashgraph/sdk';
import {Manager} from '@arianelabs/hweb3-core-requestmanager';
import {packageInit} from '@arianelabs/hweb3-core';
import {HttpProviderBase} from "@arianelabs/hweb3-core-helpers";
import {HttpProvider} from '@arianelabs/hweb3-providers-http';
import Long from "long";
import {BigNumber} from "@hashgraph/sdk/lib/transaction/Transaction";

interface createParams {
  contents?: string | Uint8Array
  memo?: string
  expirationTime?: Date | Timestamp
}

interface appendToFileParams {
  contents?: string | Uint8Array
  chunkSize?: number
  maxChunks?: number
  fileId?: fileIdType,
}

interface updateFileParams {
  contents?: string | Uint8Array
  memo?: string
  expirationTime?: Date | Timestamp
  fileId?: fileIdType,
}

type fileIdType = string | FileId | undefined;

interface txObject {
  tx: Transaction;
  send: Function
}

interface sendArguments {
  transactionMemo?: string
  maxTransactionFee?: number | string | Long | BigNumber | Hbar
  validDuration?: number
  regenerateTransactionId?: boolean
  transactionId?: TransactionId
}

export class File {
  currentProvider: HttpProviderBase
  fileId: fileIdType;
  _requestManager?: Manager
  keys: KeyList
  size: Long.Long
  expirationTime: Timestamp
  deleted: boolean
  ledgerId: LedgerId | null
  memo: string
  tx: Transaction

  constructor(fileId?: fileIdType) {
    this.fileId = fileId;
    this.keys = null;
    this.size = null;
    this.expirationTime = null;
    this.deleted = null;
    this.ledgerId = null;
    this.memo = null;
  }

  _executeMethod() {
    const _this = this;
    const args = Array.prototype.slice.call(arguments).shift();

    switch (args) {
      case 'send':
        return this._requestManager.provider.sendRequest(_this.tx)
          .then((txResponse) => {
            return this._requestManager.provider.getTransactionReceipt(txResponse.transactionId)
          });
      default:
        throw new Error('Method "' + args + '" not implemented.');
    }
  };

  _createTxObject(tx){
    var txObject: txObject = {
      send: () => null,
      tx,
    };

    this.setTransaction(tx);

    txObject.send = (args: sendArguments) => {
      if (args.transactionMemo) {
        tx.setTransactionMemo(args.transactionMemo);
      }
      if (args.maxTransactionFee) {
        tx.setMaxTransactionFee(args.maxTransactionFee);
      }
      if (args.validDuration) {
        tx.setTransactionValidDuration(args.validDuration);
      }
      if (args.regenerateTransactionId) {
        tx.setRegenerateTransactionId(args.regenerateTransactionId);
      }
      if (args.transactionId) {
        tx.setTransactionId(args.transactionId);
      }

      return this._executeMethod.bind(this, 'send')
    };

    return txObject;
  }

  setProvider(provider: HttpProviderBase) {
    packageInit(this, [provider]);
  };

  setFileId(fileId: fileIdType) {
    this.fileId = fileId;
  };

  setTransaction(tx: Transaction) {
    this.tx = tx;
  };

  createFile({
    contents,
    memo,
    expirationTime,
  }: createParams = {}) {
    const tx = new FileCreateTransaction()
            .setKeys([this.currentProvider.client._operator.publicKey]);

    if (contents) tx.setContents(contents);
    if (memo) tx.setFileMemo(memo);
    if (expirationTime) tx.setExpirationTime(expirationTime);

    return this._createTxObject(tx);
  }

  async appendToFile({
    contents,
    chunkSize,
    maxChunks,
    fileId,
  }: appendToFileParams = {}) {
    var args = Array.prototype.slice.call(arguments);
    var txObject = {};

    const id = fileId || this.fileId;
    if (!id) {
      throw new Error('No file ID');
    }

    const tx = new FileAppendTransaction().setFileId(id)

    if (contents) tx.setContents(contents);
    if (chunkSize) tx.setChunkSize(chunkSize);
    if (maxChunks) tx.setMaxChunks(maxChunks);

    return this._createTxObject(tx);
  }

  async updateFile({
    contents,
    memo,
    expirationTime,
    fileId,
  }: updateFileParams = {}) {
    const id = fileId || this.fileId;
    if (!id) {
      throw new Error('No file ID');
    }

    const tx = await new FileUpdateTransaction()
      .setFileId(id)

    if (contents) tx.setContents(contents);
    if (memo) tx.setFileMemo(memo);
    if (expirationTime) tx.setExpirationTime(expirationTime);

    return this._createTxObject(tx);
  }

  async deleteFile(fileId?: string | FileId | undefined) {
    const id = fileId || this.fileId;
    if (!id) {
      throw new Error('No file ID');
    }
    //Create the transaction
    const tx = await new FileDeleteTransaction().setFileId(id)

    return this._createTxObject(tx);
  }

  async getFileContents(fileId?: FileId): Promise<Uint8Array> {
   const id = fileId || this.fileId;
   if (!id) {
     throw new Error('No file ID');
   }

   const query = new FileContentsQuery().setFileId(id);

   return await query.execute(this._requestManager.provider.client);
  }

  async getFileInfo(fileId?: FileId): Promise<FileInfo> {
   const id = fileId || this.fileId;
   if (!id) {
     throw new Error('No file ID');
   }

   const query = new FileInfoQuery().setFileId(id);
   return await query.execute(this._requestManager.provider.client)
  }
}

const myAccountId = '0.0.29674178';
const myPrivateKey= '302e020100300506032b657004220420857877963ad72e14a4bf323583eda74eefbb17cf8d8ddb8e9dd52028228286e6'
const client = Client.forTestnet();
client.setOperator(myAccountId, myPrivateKey);
const test = new File();
const provider = new HttpProvider(client);

test.setProvider(provider);
test.createFile({ contents: "the file contents" })
  .send({
    transactionMemo: "Transaction memo",
  })().then((test) => console.log(test))
