/*
    This file is part of web3.js.
    web3.js is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.
    web3.js is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.
    You should have received a copy of the GNU Lesser General Public License
    along with web3.js.  If not, see <http://www.gnu.org/licenses/>.
*/
/**
 * @file index.d.ts
 * @author Josh Stevens <joshstevens19@hotmail.co.uk>
 * @date 2018
 */

import {
    Client,
    PrivateKey,
    ClientNetworkName,
    TransactionResponse,
    Transaction,
    AccountInfo,
    AccountId,
    LedgerId,
    AccountBalance,
    TransactionId,
    TransactionReceipt,
} from '@hashgraph/sdk';

export class formatters {
    static outputBigNumberFormatter(number: number): number;

    static inputSignFormatter(data: string): string;

    static inputAddressFormatter(address: string): string;

    static isPredefinedBlockNumber(blockNumber: string): boolean;

    static inputDefaultBlockNumberFormatter(blockNumber: string): string;

    static inputBlockNumberFormatter(blockNumber: string | number): string | number;

    static outputBlockFormatter(block: any): any; // TODO: Create Block interface

    static txInputFormatter(txObject: any): any;

    static inputCallFormatter(txObject: any): any;

    static inputTransactionFormatter(txObject: any): any;

    static outputTransactionFormatter(receipt: any): any;

    static outputTransactionReceiptFormatter(receipt: any): any;

    static inputLogFormatter(log: any): any;

    static outputLogFormatter(log: any): any;

    static inputPostFormatter(post: any): any; // TODO: Create Post interface

    static outputPostFormatter(post: any): any; // TODO: Create Post interface

    static outputSyncingFormatter(result: any): any; // TODO: Create SyncLog interface
}

export class errors {
    static ErrorResponse(result: Error): Error;
    static InvalidNumberOfParams(
        got: number,
        expected: number,
        method: string
    ): Error;
    static InvalidConnection(host: string, event?: WebSocketEvent): ConnectionError;
    static InvalidProvider(): Error;
    static InvalidResponse(result: Error): Error;
    static ConnectionTimeout(ms: string): Error;
    static ConnectionNotOpenError(): Error;
    static ConnectionCloseError(event: WebSocketEvent | boolean): Error | ConnectionError;
    static MaxAttemptsReachedOnReconnectingError(): Error;
    static PendingRequestsOnReconnectingError(): Error;
    static ConnectionError(msg: string, event?: WebSocketEvent): ConnectionError;
    static RevertInstructionError(reason: string, signature: string): RevertInstructionError
    static TransactionRevertInstructionError(reason: string, signature: string, receipt: object): TransactionRevertInstructionError
    static TransactionError(message: string, receipt: object): TransactionError
    static NoContractAddressFoundError(receipt: object): TransactionError
    static ContractCodeNotStoredError(receipt: object): TransactionError
    static TransactionRevertedWithoutReasonError(receipt: object): TransactionError
    static TransactionOutOfGasError(receipt: object): TransactionError
    static ResolverMethodMissingError(address: string, name: string): Error
    static ContractMissingABIError(): Error
    static ContractOnceRequiresCallbackError(): Error
    static ContractEventDoesNotExistError(eventName: string): Error
    static ContractReservedEventError(type: string): Error
    static ContractMissingDeployDataError(): Error
    static ContractNoAddressDefinedError(): Error
    static ContractNoFromAddressDefinedError(): Error
}

export class IpcProviderBase {
    constructor(path: string);

    responseCallbacks: any;
    notificationCallbacks: any;
    connected: boolean;
    connection: any;

    addDefaultEvents(): void;

    supportsSubscriptions(): boolean;

    send(
        payload: JsonRpcPayload,
        callback: (error: Error | null, result?: JsonRpcResponse) => void
    ): void;

    on(type: string, callback: () => void): void;

    once(type: string, callback: () => void): void;

    removeListener(type: string, callback: () => void): void;

    removeAllListeners(type: string): void;

    reset(): void;

    reconnect(): void;
}

export abstract class HttpProviderBase {
    connected: boolean;

    constructor(client: Client);
    constructor(accountId: string | AccountId, privateKey: string | PrivateKey, networkType?: ClientNetworkName);

    disconnect(): boolean;

    getLedgerId(): LedgerId;

    getNetwork(): {[key: string]: string | AccountId};

    getMirrorNetwork(): string[];

    getAccountBalance(accountId: string | AccountId): Promise<AccountBalance>;

    getAccountInfo(accountId: string | AccountId): Promise<AccountInfo>;

    getTransactionReceipt(transactionId: TransactionId): Promise<TransactionReceipt>;

    sendRequest(tx: Transaction): Promise<TransactionResponse>;

    waitForReceipt(response: TransactionResponse): Promise<TransactionReceipt>;
}

export interface RequestItem {
    payload: JsonRpcPayload;
    callback: (error: any, result: any) => void;
}

export interface JsonRpcPayload {
    jsonrpc: string;
    method: string;
    params: any[];
    id?: string | number;
}

export interface JsonRpcResponse {
    jsonrpc: string;
    id: number;
    result?: any;
    error?: string;
}

export interface RevertInstructionError extends Error {
    reason: string;
    signature: string;
}

export interface TransactionRevertInstructionError extends Error {
    reason: string;
    signature: string;
}

export interface TransactionError extends Error {
    receipt: object;
}

export interface ConnectionError extends Error {
    code: string | undefined;
    reason: string | undefined;
}

export interface WebSocketEvent {
    code?: number;
    reason?: string;
}
