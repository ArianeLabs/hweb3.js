import { FileAppendTransaction, FileCreateTransaction, FileId } from '@hashgraph/sdk';
import { Manager } from '@arianelabs/hweb3-core-requestmanager';
import { provider } from '@arianelabs/hweb3-core';

export class File {
    fileId: FileId | null;
    _requestManager?: Manager
    currentProvider: provider

    constructor(fileId?: FileId) {
        this.fileId = fileId || null;

    }

    setProvider = function () {
    }

    async create(content: string | Uint8Array, memo?: string) {
        // TODO;
        const tx = new FileCreateTransaction()
            .setContents(content)
            .setKeys([this.currentProvider.client._operator.publicKey])
        ;

        if (memo) tx.setFileMemo(memo);

        const txResponse = await new Promise(resolve => this._requestManager.send(tx, resolve));
        const txReceipt = await new Promise(resolve => this._requestManager.getReceipt(txResponse, resolve));

        return txReceipt;
    }

    async appendToFile(content: string | Uint8Array) {
        if (!this.fileId) {
            throw new Error('No file ID');
        }

        const tx = new FileAppendTransaction()
            .setFileId(this.fileId)
            .setContents(content)

        const txResponse = await new Promise(resolve => this._requestManager.send(tx, resolve));
        const txReceipt = await new Promise(resolve => this._requestManager.getReceipt(txResponse, resolve));

        return txReceipt;
    }
}
