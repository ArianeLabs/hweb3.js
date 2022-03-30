import {
  FileAppendTransaction,
  FileContentsQuery,
  FileCreateTransaction,
  FileDeleteTransaction,
  FileId,
  FileInfoQuery,
  FileUpdateTransaction,
  Timestamp,
  KeyList,
  LedgerId,
  Hbar,
  TransactionId,
} from '@hashgraph/sdk';
import {Manager} from '@arianelabs/hweb3-core-requestmanager';
import {packageInit} from '@arianelabs/hweb3-core';
import {HttpProviderBase} from "@arianelabs/hweb3-core-helpers";
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
  fileId?: FileId,
}

interface updateFileParams {
  contents?: string | Uint8Array
  memo?: string
  expirationTime?: Date | Timestamp
  fileId?: FileId,
}

interface txObject {
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
  fileId: FileId;
  _requestManager?: Manager
  keys: KeyList
  size: Long.Long
  expirationTime: Timestamp
  isDeleted: boolean
  ledgerId: LedgerId | null
  fileMemo: string

  constructor(fileId?: FileId, ...args) {
    if (args.length || (this._requestManager && this._requestManager.provider)) {
      packageInit(this, args || [this._requestManager.provider]);
    }

    this.fileId = fileId;
    this.keys = null;
    this.size = null;
    this.expirationTime = null;
    this.isDeleted = null;
    this.ledgerId = null;
    this.fileMemo = null;
  }

  _createTxObject(tx, isCreate = false){
    const _this = this;
    const txObject: txObject = {
      send: function () {},
    };

    txObject.send = async function(args: sendArguments, callback?: Function) {
      callback = callback || function () { };
      args = args || {};

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

      const txResponse = await _this._requestManager.provider.sendRequest(tx);
      const txReceipt = await _this._requestManager.provider.getTransactionReceipt(txResponse.transactionId);

      if (isCreate) {
        const newFile = new File(txReceipt.fileId, _this._requestManager.provider);
        await newFile.getFileInfo(txReceipt.fileId);
        callback(newFile);
        return newFile;
      } else {
        await _this.getFileInfo(txReceipt.fileId);
        callback(_this);
        return _this;
      }
    };

    return txObject;
  }

  setProvider(provider: HttpProviderBase) {
    packageInit(this, [provider]);
  };

  setFileId(fileId: FileId) {
    this.fileId = fileId;
  };

  createFile({
    contents,
    memo,
    expirationTime,
  }: createParams = {}): txObject {
    const tx = new FileCreateTransaction()
            .setKeys([this.currentProvider.client._operator.publicKey]);

    if (contents) tx.setContents(contents);
    if (memo) tx.setFileMemo(memo);
    if (expirationTime) tx.setExpirationTime(expirationTime);

    return this._createTxObject(tx, true);
  }

  appendToFile({
    contents,
    chunkSize,
    maxChunks,
    fileId,
  }: appendToFileParams = {}): txObject {
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

  updateFile({
    contents,
    memo,
    expirationTime,
    fileId,
  }: updateFileParams = {}) {
    const id = fileId || this.fileId;
    if (!id) {
      throw new Error('No file ID');
    }

    const tx = new FileUpdateTransaction()
      .setFileId(id)

    if (contents) tx.setContents(contents);
    if (memo) tx.setFileMemo(memo);
    if (expirationTime) tx.setExpirationTime(expirationTime);

    return this._createTxObject(tx);
  }

  deleteFile(fileId?: string | FileId) {
    const id = fileId || this.fileId;
    if (!id) {
      throw new Error('No file ID');
    }
    const tx = new FileDeleteTransaction().setFileId(id)

    return this._createTxObject(tx);
  }

  async getFileContents(fileId?: FileId, callback?: Function) {
    callback = callback || function () { };
    const id = fileId || this.fileId;
    if (!id) {
      throw new Error('No file ID');
    }

    const query = new FileContentsQuery().setFileId(id);

    const contents = await query.execute(this._requestManager.provider.client);

    callback(contents);
    return contents;
  }

  async getFileInfo(fileId?: FileId, callback?: Function) {
    callback = callback || function () { };
    const id = fileId || this.fileId;
    if (!id) {
      throw new Error('No file ID');
    }

    const query = new FileInfoQuery().setFileId(id);
    await query.execute(this._requestManager.provider.client).then(response => {
      this.fileId = response.fileId;
      this.keys = response.keys;
      this.size = response.size;
      this.expirationTime = response.expirationTime;
      this.isDeleted = response.isDeleted;
      this.ledgerId = response.ledgerId
      this.fileMemo = response.fileMemo;
    })

    callback(this);
    return this;
  }
}
