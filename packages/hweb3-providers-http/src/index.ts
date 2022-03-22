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
 * @file index.js
 * @authors:
 * Patryk Matyjasiak <patryk.matyjasiak@arianelabs.com>
 * @date 2022
 */

import {
    AccountInfoQuery,
    Client,
    TransactionResponse,
    Transaction,
    AccountInfo,
    AccountId,
    LedgerId,
    AccountBalanceQuery,
    AccountBalance,
    TransactionReceiptQuery,
    TransactionId,
    TransactionReceipt,
} from '@hashgraph/sdk';
import { HttpProviderBase } from "@arianelabs/hweb3-core-helpers";

/**
 * HttpProvider should be used to send Hedera node calls
 * @param {Client} client
 */

export class HttpProvider implements HttpProviderBase {
    connected: boolean;
    private accountId: string | AccountId;
    private client: Client;

    constructor(...args: any[]) {
        this.connected = true;
        if (args.length === 1) {
            this.client = args[0];
        }
        if (args.length >= 2) {
            switch (args[2]) {
                case 'testnet': this.client = Client.forTestnet(); break;
                case 'previewnet': this.client = Client.forPreviewnet(); break;
                default: this.client = Client.forMainnet();
            }
            this.client.setOperator(args[0], args[1]);
            this.accountId = args[0];
        }
    }

    disconnect = (): boolean => false;

    /**
     * Return the ID of the current network.
     *
     * @method getLedgerId
     * @returns {LedgerId}
     */
    getLedgerId = function(): LedgerId {
        return this.client.ledgerId;
    };

    /**
     * Return the entire network map for the current network.
     *
     * @method getNetwork
     * @returns {[key: string]: string | AccountId}
     */
    getNetwork = function(): {[key: string]: string | AccountId} {
        return this.client.network;
    };

    /**
     * Return the mirror network.
     *
     * @method getMirrorNetwork
     * @returns string[]
     */
    getMirrorNetwork = function(): string[] {
        return this.client.mirrorNetwork;
    };

    /**
     * Get the balance for an account.
     *
     * @method getAccountBalance
     * @param {string | AccountId} accountId
     * @returns Promise<AccountBalance>
     */
    getAccountBalance = async function(
        accountId?: string | AccountId,
    ): Promise<AccountBalance> {
        const query = new AccountBalanceQuery()
            .setAccountId(accountId || this.accountId);

        return query.execute(this.client);
    };

    /**
     * Get the info for an account.
     *
     * @method getAccountInfo
     * @param {string | AccountId} accountId
     * @returns Promise<AccountInfo>
     */
    getAccountInfo = async function(
        accountId?: string | AccountId,
    ): Promise<AccountInfo> {
        const query = new AccountInfoQuery()
            .setAccountId(accountId || this.accountId);

        return query.execute(this.client);
    };

    /**
     * Get the info for an account.
     *
     * @method getTransactionReceipt
     * @param {TransactionId} transactionId
     * @returns Promise<TransactionReceipt>
     */
    getTransactionReceipt = async function(
        transactionId: TransactionId
    ): Promise<TransactionReceipt> {
        const query = new TransactionReceiptQuery()
            .setTransactionId(transactionId)

        return query.execute(this.client);
    };

    /**
     * Sign and send a request using the wallet.
     *
     * @method sendRequest
     * @param {Transaction} tx
     * @returns Promise<TransactionResponse>
     */
    sendRequest = async function(tx: Transaction): Promise<TransactionResponse> {
        return tx.execute(this.client)
    }

    /**
     * Wait for the receipt for a transaction response.
     *
     * @method waitForReceipt
     * @param {TransactionResponse} response
     * @returns Promise<TransactionReceipt>
     */
    waitForReceipt = async function(response: TransactionResponse): Promise<TransactionReceipt> {
        const query = new TransactionReceiptQuery()
            .setTransactionId(response.transactionId)

        return query.execute(this.client);
    };
}