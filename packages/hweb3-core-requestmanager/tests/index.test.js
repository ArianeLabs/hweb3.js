var errors = require('@arianelabs/hweb3-core-helpers').errors;
import {
    Client,
    PrivateKey,
    AccountCreateTransaction, TransactionReceipt, TransactionResponse,
} from '@hashgraph/sdk';
import { HttpProvider } from '@arianelabs/hweb3-providers-http';
import { Manager } from "../src/index";

const methods = [
    'setProvider',
    'send',
    'getReceipt',
];

let requestManager;
// TODO add environment variable
const accountId = '';
const privateKey = '';
const client = Client.forTestnet();
client.setOperator(accountId, privateKey);

const provider = new HttpProvider(client);

describe("Request manager static fields", () => {
    // TODO test RequestManager.givenProvider
    it("Manager.givenProvider toBeDefined", () => {
        expect(Manager.givenProvider).toBeDefined();
    });

    it("Manager.providers toBeDefined", () => {
        expect(Manager.providers).toBeDefined();
    });
});

describe("Request manager", () => {
    let tx;
    let txResponse;
    beforeAll(() => {
        requestManager = new Manager(provider);

        const newAccountPrivateKey = PrivateKey.generateED25519();

        tx = new AccountCreateTransaction()
            .setKey(newAccountPrivateKey);
    });

    it("defines requestManager", () => {
        expect(requestManager).toBeDefined();
    });

    it("defines requestManager fields", () => {
        expect(requestManager.provider).toBeDefined();
        expect(requestManager.providers).toBeDefined();
    });

    it("requestManager.provider to be provider", () => {
        expect(requestManager.provider).toBe(provider);
    });

    it("requestManager.providers to be defined HttpProvider", () => {
        expect(requestManager.providers).toHaveProperty('HttpProvider');
    });

    it("requestManager.providers to toEqual", () => {
        expect(requestManager.providers).toEqual({ HttpProvider: HttpProvider });
    });

    it("requestManager.providers.HttpProvider to be instance of HttpProvider", () => {
        const requestManagerHttpProvider = new requestManager.providers.HttpProvider(client);
        expect(requestManagerHttpProvider).toBeInstanceOf(HttpProvider);
    });

    it.each(methods)('defines %s()', (method) => {
            expect(typeof requestManager[method]).toBe("function");
        }
    );

    it("requestManager.setProvider", () => {
        requestManager.setProvider(provider);
        expect(requestManager.provider).toBe(provider);
    });

    it("requestManager.setProvider() whitout arguments", () => {
        expect(() => {
            requestManager.setProvider();
        }).toThrow();
    });

    it("requestManager.setProvider() whit failed provider arguments", () => {
        const failedProvider = 'test';
        expect(() => {
            requestManager.setProvider(failedProvider);
        }).toThrowError('Can\'t set provider for "' + failedProvider + '"');
    });

    it("requestManager.send()",(done) => {
        function callback(err, data) {
            try {
                txResponse = data;
                expect(data).toBeInstanceOf(TransactionResponse);
                done();
            } catch (error) {
                expect(err).toStrictEqual(error);
                done(error);
            }
        }

        requestManager.send(tx, callback);
    });

    it("requestManager.getReceipt()",(done) => {
        function callback(err, data) {
            // console.log('data', data);
            try {
                expect(data).toBeInstanceOf(TransactionReceipt);
                done();
            } catch (error) {
                expect(err).toStrictEqual(error);
                done(error);
            }
        }

        requestManager.getReceipt(txResponse, callback);
    });
});

describe("Request manager without provider", () => {
    beforeAll(() => {
        requestManager = new Manager(provider);
        requestManager.provider = null;
    });

    it("requestManager.send() without provider", () => {
        function callback(error) {
            expect(error).toStrictEqual(errors.InvalidProvider());
        }

        requestManager.send('test', callback);
    });

    it("requestManager.getReceipt() without provider", () => {
        function callback(error) {
            expect(error).toStrictEqual(errors.InvalidProvider());
        }

        requestManager.getReceipt('test', callback);
    });
});

describe("Request manager send and getReceipt with errors", () => {
    let tx = null;
    let txResponse = null;

    beforeAll(() => {
        requestManager = new Manager(provider);
    });

    it("requestManager.send()",(done) => {
        function callback(err) {
            try {
                done();
            } catch (error) {
                expect(err).toStrictEqual(error);
                done(error);
            }
        }

        requestManager.send(tx, callback);
    });

    it("requestManager.getReceipt()",(done) => {
        function callback(err) {
            try {
                done();
            } catch (error) {
                expect(err).toStrictEqual(error);
                done(error);
            }
        }

        requestManager.getReceipt(txResponse, callback);
    });
});
