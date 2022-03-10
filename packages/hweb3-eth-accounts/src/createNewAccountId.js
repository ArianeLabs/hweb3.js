import { AccountCreateTransaction } from "@hashgraph/sdk";

const createNewAccountId = function(newAccountPrivateKey, cb) {
    var _this = this;

    const newAccountPublicKey = newAccountPrivateKey.publicKey;

    // Create the transaction
    const tx = new AccountCreateTransaction()
        .setKey(newAccountPublicKey);

    _this.currentProvider.send(tx, (error, txResponse) => {
        if (error) {
            throw error;
        }

        _this.currentProvider.getReceipt(txResponse, (error, txReceipt) => {
            if (error) {
                throw error;
            }

            const resp = Object.assign({}, txReceipt);
            resp.privateKey = newAccountPrivateKey;
            resp.publicKey = newAccountPublicKey;

            cb(resp);
        });
    });
};

export default createNewAccountId;
