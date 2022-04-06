import {
    Client,
    AccountInfo,
    AccountBalance,
    TransactionReceipt,
    TransactionResponse,
    PrivateKey,
    AccountCreateTransaction,
} from '@hashgraph/sdk';
import { HttpProvider } from '../src';

const methods = [
    'disconnect',
    'getLedgerId',
    'getNetwork',
    'getMirrorNetwork',
    'getAccountBalance',
    'getAccountInfo',
    'getTransactionReceipt',
    'sendRequest',
    'waitForReceipt'
];

let provider;
// TODO add environment variable
const accountId = '';
const privateKey = '';

describe("HttpProvider with the given client argument", () => {
    let client;
    let tx;
    let txResponse;
    beforeAll(() => {
        client = Client.forTestnet();
        client.setOperator(accountId, privateKey);

        provider = new HttpProvider(client);

        const newAccountPrivateKey = PrivateKey.generateED25519();

        tx = new AccountCreateTransaction()
            .setKey(newAccountPrivateKey)
    });

    it.each(methods)('defines %s()', (method) => {
            expect(typeof provider[method]).toBe("function");
        },
    );

    it("defines a private client", () => {
        expect(provider['client']).toBeDefined();
    });

    it("defines a client to be provider", () => {
        expect(provider['client']).toBe(client);
    });

    it("client in testnet", () => {
        expect(provider.getLedgerId().isTestnet()).toBe(true);
        expect(provider.getLedgerId().isPreviewnet()).toBe(false);
        expect(provider.getLedgerId().isMainnet()).toBe(false);
    });

    it("defines a private accountId", () => {
        expect(provider['accountId']).toBeDefined();
    });

    it("accountId to be client._operator.accountId", () => {
        expect(provider['accountId']).toBe(client._operator.accountId);
    });

    it("getLedgerId to be client.ledgerId", () => {
        expect(provider.getLedgerId()).toBe(client.ledgerId);
    });

    it("getNetwork to be client.network", () => {
        expect(provider.getNetwork()).toStrictEqual(client.network);
    });

    it("getMirrorNetwork to be client.mirrorNetwork", () => {
        expect(provider.getMirrorNetwork()).toStrictEqual(client.mirrorNetwork);
    });

    it('async getAccountBalance', async () => {
        expect.assertions(1);
        const data = await provider.getAccountBalance();
        expect(data).toBeInstanceOf(AccountBalance);
    });

    it('async getAccountBalance with incorrect accountId argument', async () => {
        expect.assertions(1);
        await expect(provider.getAccountBalance('test')).rejects.toThrowError('failed to parse entity id: test');
    });

    it('async getAccountInfo', async () => {
        expect.assertions(1);
        const data = await provider.getAccountInfo();
        expect(data).toBeInstanceOf(AccountInfo);
    });

    it('getAccountInfo with incorrect accountId argument', async () => {
        expect.assertions(1);
        await expect(provider.getAccountInfo('test')).rejects.toThrowError('failed to parse entity id: test');
    });

    it('async sendRequest', async () => {
        expect.assertions(1);
        const data = await provider.sendRequest(tx);
        txResponse = data;
        expect(data).toBeInstanceOf(TransactionResponse);
    });

    it('async sendRequest without argument', async () => {
        expect.assertions(1);
        await expect(provider.sendRequest()).rejects.toThrowError('Pass correct tx: Transaction argument');
    });

    it('async getTransactionReceipt', async () => {
        expect.assertions(1);
        const data = await provider.getTransactionReceipt(txResponse.transactionId);
        expect(data).toBeInstanceOf(TransactionReceipt);
    });

    it('async getTransactionReceipt without argument', async () => {
        expect.assertions(1);
        await expect(provider.getTransactionReceipt()).rejects.toThrowError('Pass transactionId argument');
    });

    it('async getTransactionReceipt with no transactionId instanceof TransactionId argument', async () => {
        expect.assertions(1);
        await expect(provider.getTransactionReceipt('test')).rejects.toThrowError('Pass correct transactionId: TransactionId argument');
    });

    it('async waitForReceipt', async () => {
        expect.assertions(1);
        const data = await provider.waitForReceipt(txResponse);
        expect(data).toBeInstanceOf(TransactionReceipt);
    });

    it('async waitForReceipt with no response: TransactionResponse argument', async () => {
        expect.assertions(1);
        await expect(provider.waitForReceipt('test')).rejects.toThrowError('Pass correct response: TransactionResponse argument');
    });
});

describe("HttpProvider accountId, privateKey, networkType arguments", () => {
    let tx;
    beforeAll(() => {
        provider = new HttpProvider(accountId, privateKey, 'testnet');

        const newAccountPrivateKey = PrivateKey.generateED25519();

        tx = new AccountCreateTransaction()
            .setKey(newAccountPrivateKey)
    });

    it("defines a private client", () => {
        expect(provider['client']).toBeDefined();
    });

    it("defines a private accountId", () => {
        expect(provider['accountId']).toBeDefined();
    });

    it("accountId to be accountId", () => {
        expect(provider['accountId']).toBe(accountId);
    });
});

describe("HttpProvider client network type", () => {
    it("client in testnet", () => {
        provider = new HttpProvider(accountId, privateKey, 'testnet');
        expect(provider.getLedgerId().isTestnet()).toBe(true);
        expect(provider.getLedgerId().isPreviewnet()).toBe(false);
        expect(provider.getLedgerId().isMainnet()).toBe(false);
    });

    it("client in previewnet", () => {
        provider = new HttpProvider(accountId, privateKey, 'previewnet');
        expect(provider.getLedgerId().isPreviewnet()).toBe(true);
        expect(provider.getLedgerId().isTestnet()).toBe(false);
        expect(provider.getLedgerId().isMainnet()).toBe(false);
    });

    it("client in mainnet", () => {
        provider = new HttpProvider(accountId, privateKey);
        expect(provider.getLedgerId().isMainnet()).toBe(true);
        expect(provider.getLedgerId().isTestnet()).toBe(false);
        expect(provider.getLedgerId().isPreviewnet()).toBe(false);
    });
});

describe("HttpProvider without client or accountId", () => {
    it("client in testnet", () => {
        expect(() => {
            // tslint:disable-next-line:ban-ts-ignore
           // @ts-ignore
            new HttpProvider();
        }).toThrowError(
            'You have to set the provider with one of the two combinations of arguments: ' +
            '1. client: Client or ' +
            '2. accountId: string | AccountId, privateKey: string | PrivateKey, networkType?: ClientNetworkName'
        )
    });
});
