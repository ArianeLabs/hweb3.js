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
} from '@hashgraph/sdk';
import {Manager} from '@arianelabs/hweb3-core-requestmanager';
import {packageInit} from '@arianelabs/hweb3-core';
import {errors, formatters, HttpProviderBase} from "@arianelabs/hweb3-core-helpers";
import {HttpProvider} from '@arianelabs/hweb3-providers-http';
import Long from "long";

interface createParams {
    content?: string | Uint8Array
    memo?: string
    expirationTime?: Timestamp
}

interface appendToFileParams {
    content?: string | Uint8Array
    chunkSize?: number
    maxChunks?: number
    fileId?: fileIdType,
}

interface updateFileParams {
    content?: string | Uint8Array
    memo?: string
    expirationTime?: Timestamp
    fileId?: fileIdType,
}

type fileIdType = string | FileId | undefined;

interface txObject {
    send: Function
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

    constructor(fileId?: fileIdType) {
        this.fileId = fileId;
        this.keys = null;
        this.size = null;
        this.expirationTime = null;
        this.deleted = null;
        this.ledgerId = null;
        this.memo = null;
    }

    _executeMethod = function _executeMethod() {
        const _this = this;
        const args = Array.prototype.slice.call(arguments);
        console.log('args', args)
        switch (args.type) {
            case 'send':

            return _this;
            default:
                throw new Error('Method "' + args.type + '" not implemented.');
        }
    };

    _createTxObject(tx){
        var args = Array.prototype.slice.call(arguments);
        var txObject: txObject = {
            send: () => null
        };

        txObject.send = this._executeMethod.bind(txObject, 'send');

        return txObject;
    }

    setProvider = function (provider: HttpProviderBase) {
        packageInit(this, [provider]);
    };

    setFileId = function (fileId: fileIdType) {
        this.fileId = fileId;
    };

    createFile({
       content,
       memo,
       expirationTime,
    }: createParams = {}) {
        const tx = new FileCreateTransaction()
            .setKeys([this.currentProvider.client._operator.publicKey]);

        if (content) tx.setContents(content);
        if (memo) tx.setFileMemo(memo);
        if (expirationTime) tx.setExpirationTime(expirationTime);

        return this._createTxObject(tx);

        // return await this._requestManager.provider.sendRequest(tx)
        //     .then((txResponse) => {
        //         return this._requestManager.provider.getTransactionReceipt(txResponse.transactionId)
        //     })
    }

    async appendToFile({
      content,
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

        const tx = new FileAppendTransaction()
            .setFileId(id)

        if (content) tx.setContents(content);
        if (chunkSize) tx.setChunkSize(chunkSize);
        if (maxChunks) tx.setMaxChunks(maxChunks);

        return await this._requestManager.provider.sendRequest(tx)
            .then((txResponse) => {
                return this._requestManager.provider.getTransactionReceipt(txResponse.transactionId)
            })
    }

    async updateFile({
      content,
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

        if (content) tx.setContents(content);
        if (memo) tx.setFileMemo(memo);
        if (expirationTime) tx.setExpirationTime(expirationTime);

        return await this._requestManager.provider.sendRequest(tx)
            .then((txResponse) => {
                return this._requestManager.provider.getTransactionReceipt(txResponse.transactionId)
            })

    }

    async deleteFile(fileId?: string | FileId | undefined) {
        const id = fileId || this.fileId;
        if (!id) {
            throw new Error('No file ID');
        }
        //Create the transaction
        const tx = await new FileDeleteTransaction()
            .setFileId(id)

        return await this._requestManager.provider.sendRequest(tx)
            .then((txResponse) => {
                return this._requestManager.provider.getTransactionReceipt(txResponse.transactionId)
            })
    }

    async getFileContents(fileId?: FileId): Promise<Uint8Array> {
        const id = fileId || this.fileId;
        if (!id) {
            throw new Error('No file ID');
        }

        const query = new FileContentsQuery()
            .setFileId(id);

        return await query.execute(this._requestManager.provider.client)
    }

    async getFileInfo(fileId?: FileId): Promise<FileInfo> {
        const id = fileId || this.fileId;
        if (!id) {
            throw new Error('No file ID');
        }

        const query = new FileInfoQuery()
            .setFileId(id);

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
const test2 = test.createFile().send();
console.log('test2', test2)
