const testTx = {
    "hex": "01000000c0b5f55c01d2a2bccadda547331aee0e0611d4780554cbdcef50b10d603813c340d15b03be0200000049483045022100cb60e33229b45cf3c175097d97a2115e71015928ec550dcd3341a556214c949902205923634d52f2fc1579ecdd7c5c2ece98db2df6dac97690c064f6af7892b8116f01ffffffff03000000000000000000005668e66e0000002321036d2c68823e4fa2ab1188d9f63a29a37986fda129cef0fb18a90ef85e0fb2a901ac435868e66e0000002321036d2c68823e4fa2ab1188d9f63a29a37986fda129cef0fb18a90ef85e0fb2a901ac00000000",
    "txid": "29a4c8805d78a26efb37b5890832e7e41d61a891a722571577f574c54fdb34b0",
    "version": 1,
    "time": 1559606720,
    "locktime": 0,
    "vin": [
        {
            "txid": "be035bd140c31338600db150efdccb540578d411060eee1a3347a5ddcabca2d2",
            "vout": 2,
            "scriptSig": {
                "asm": "3045022100cb60e33229b45cf3c175097d97a2115e71015928ec550dcd3341a556214c949902205923634d52f2fc1579ecdd7c5c2ece98db2df6dac97690c064f6af7892b8116f01",
                "hex": "483045022100cb60e33229b45cf3c175097d97a2115e71015928ec550dcd3341a556214c949902205923634d52f2fc1579ecdd7c5c2ece98db2df6dac97690c064f6af7892b8116f01"
            },
            "sequence": 4294967295
        }
    ],
    "vout": [
        {
            "value": 0,
            "n": 0,
            "scriptPubKey": {
                "asm": "",
                "hex": "",
                "type": "nonstandard"
            }
        },
        {
            "value": 4763.12,
            "n": 1,
            "scriptPubKey": {
                "asm": "036d2c68823e4fa2ab1188d9f63a29a37986fda129cef0fb18a90ef85e0fb2a901 OP_CHECKSIG",
                "hex": "21036d2c68823e4fa2ab1188d9f63a29a37986fda129cef0fb18a90ef85e0fb2a901ac",
                "reqSigs": 1,
                "type": "pubkey",
                "addresses": [
                    "sc5J9ZSUbqYzWXhCiLXrqZiNeKoVu2HeiF"
                ]
            }
        },
        {
            "value": 4763.12000579,
            "n": 2,
            "scriptPubKey": {
                "asm": "036d2c68823e4fa2ab1188d9f63a29a37986fda129cef0fb18a90ef85e0fb2a901 OP_CHECKSIG",
                "hex": "21036d2c68823e4fa2ab1188d9f63a29a37986fda129cef0fb18a90ef85e0fb2a901ac",
                "reqSigs": 1,
                "type": "pubkey",
                "addresses": [
                    "sc5J9ZSUbqYzWXhCiLXrqZiNeKoVu2HeiF"
                ]
            }
        }
    ],
    "blockhash": "9ae0e6f7427a7c7e3d4186db51d62198724c073b5cc43f5fe2e473ad338ccef3",
    "confirmations": 38938,
    "blocktime": 1559606720
};

const dummyBlocks = [
{
    "hash": "ba9fcc6e840fa3bf564ed33affb9a96745f52f37ea7ac5bf19bed03ae558acdf",
    "confirmations": 1,
    "size": 213,
    "height": 118679,
    "version": 7,
    "merkleroot": "79a5de27e97f4dd0109a4dd841c4dfb2fdbc7b86e403e5d19c43c8eb7fc706f8",
    "mint": 1,
    "time": 1563534968,
    "nonce": 3569038342,
    "bits": "1d06b50a",
    "difficulty": 0.1490916,
    "blocktrust": "262b0412",
    "chaintrust": "5371cc2ee7bff62f59f",
    "previousblockhash": "b7a99825ff187fee58e6c4e43bef5afcb040ba539e2cfcf297de2b53a312f4ac",
    "flags": "proof-of-work",
    "proofhash": "0000000678dc041a5f81f9af4444b8abd0090b588e1985d13dfe826095e50f45",
    "entropybit": 1,
    "modifier": "efc5a61ce5be319b",
    "tx": [
        "79a5de27e97f4dd0109a4dd841c4dfb2fdbc7b86e403e5d19c43c8eb7fc706f8"
    ]
},
{
    "hash": "b7a99825ff187fee58e6c4e43bef5afcb040ba539e2cfcf297de2b53a312f4ac",
    "confirmations": 2,
    "size": 213,
    "height": 118678,
    "version": 7,
    "merkleroot": "9735b00477d515ad4e70469e43e777a8b3d9ce11620fe9078bc7e2de0692d74d",
    "mint": 1,
    "time": 1563534673,
    "nonce": 1793398532,
    "bits": "1d08b3ff",
    "difficulty": 0.1148997,
    "blocktrust": "1d6a2e95",
    "chaintrust": "5371cc2ee7bd937f18d",
    "previousblockhash": "ed87817e057c0dd08ee7fc3bf0ad4cc55162b8bd0e4ca367f728925328c3e015",
    "nextblockhash": "ba9fcc6e840fa3bf564ed33affb9a96745f52f37ea7ac5bf19bed03ae558acdf",
    "flags": "proof-of-work",
    "proofhash": "000000027211b407ac1230ca11f4f42943b37e2917098fd71f118679bf61e428",
    "entropybit": 0,
    "modifier": "efc5a61ce5be319b",
    "tx": [
        "9735b00477d515ad4e70469e43e777a8b3d9ce11620fe9078bc7e2de0692d74d"
    ]
},
{
    "hash": "ed87817e057c0dd08ee7fc3bf0ad4cc55162b8bd0e4ca367f728925328c3e015",
    "confirmations": 3,
    "size": 446,
    "height": 118677,
    "version": 7,
    "merkleroot": "afa55284ddbb82f816707953ded6f5afea2323faea6cb3197873af1050afe7ab",
    "mint": 5.39011864,
    "time": 1563534672,
    "nonce": 0,
    "bits": "1a03c6e1",
    "difficulty": 4442026.53738471,
    "blocktrust": "43c7ee51805ccd",
    "chaintrust": "5371cc2ee7bbbcdc2f8",
    "previousblockhash": "d5ddb9d014c94b812ac5973bbd5a55725035c0cc82e57add17ede6623c103dc9",
    "nextblockhash": "b7a99825ff187fee58e6c4e43bef5afcb040ba539e2cfcf297de2b53a312f4ac",
    "flags": "proof-of-stake",
    "proofhash": "0001aa2d6648cb899efeac550f59303b78fb71b35103e7de83353a97bcf01398",
    "entropybit": 1,
    "modifier": "efc5a61ce5be319b",
    "tx": [
        "5113b463762889eed28c1d5371cf6a1f6d23fa8407e7f9f788d117152fa1977c",
        "65a04f19948e20005de18a78a6a5335cc6dfdcde58549144ef9d109f4a11edfd"
    ],
    "signature": "3045022100a1172a28aaf417ce31252ce8f3acb82957cbb5119162fbaf03e3549b89ece51f022075af1dff4ad8b858ecaa8ac07e75cb61f67c660b4e21d719c9968cb8d2d9392e"
},
{
    "hash": "d5ddb9d014c94b812ac5973bbd5a55725035c0cc82e57add17ede6623c103dc9",
    "confirmations": 4,
    "size": 213,
    "height": 118676,
    "version": 7,
    "merkleroot": "d0e71cbebc85e6f11eab21399e5c494c76383fff10b92132055ffae86ca7245d",
    "mint": 1,
    "time": 1563534609,
    "nonce": 1282062850,
    "bits": "1d084df4",
    "difficulty": 0.12041474,
    "blocktrust": "1ed39eef",
    "chaintrust": "5371c7f268d6a4d662b",
    "previousblockhash": "3a88f95980bf53945b90aa6503e27b7be4ce1cd92e5c587ddff08732200e0fbe",
    "nextblockhash": "ed87817e057c0dd08ee7fc3bf0ad4cc55162b8bd0e4ca367f728925328c3e015",
    "flags": "proof-of-work",
    "proofhash": "0000000445c51ea673a41025acc32e4ee040abd151f63a199471f00db8e44e20",
    "entropybit": 1,
    "modifier": "efc5a61ce5be319b",
    "tx": [
        "d0e71cbebc85e6f11eab21399e5c494c76383fff10b92132055ffae86ca7245d"
    ]
},
{
    "hash": "3a88f95980bf53945b90aa6503e27b7be4ce1cd92e5c587ddff08732200e0fbe",
    "confirmations": 5,
    "size": 445,
    "height": 118675,
    "version": 7,
    "merkleroot": "03816b6bd7a17365723cb20b91a7fd94f2947793ae1a970e7ed7b4ef710938ab",
    "mint": 1.16867584,
    "time": 1563534608,
    "nonce": 0,
    "bits": "1a04e69b",
    "difficulty": 3423308.65517359,
    "blocktrust": "343c80e43a5925",
    "chaintrust": "5371c7f268d4b79c73c",
    "previousblockhash": "d895d858c0f7e713eaa3e7ec167355f596307c102f20dc146e6835197b2f519e",
    "nextblockhash": "d5ddb9d014c94b812ac5973bbd5a55725035c0cc82e57add17ede6623c103dc9",
    "flags": "proof-of-stake stake-modifier",
    "proofhash": "0001a4e0f7488ec8fb89cee9c92ef5180c24393d4e02bbf67aeca156ea429a08",
    "entropybit": 0,
    "modifier": "efc5a61ce5be319b",
    "tx": [
        "f0733dd1929fd144a8938fbe73b0b97807636427e8563c97babc4de11c979ce7",
        "82a774a81eec43afa6976b3d15213e95283032373ab3a89a78bea833f2d67ba0"
    ],
    "signature": "304402201c91bcf76287e497582b76e3f30743df759c7b4036a630d193795116389304f602201869fbaf6d617af40540aec4d6e855b751d4abcd5a508e3f7adb2d45892ee2c2"
}
];

class RpcAdapter
{
	constructor(config)
	{
		this.mock = {
			config
		};

		this.newAddress = jest.fn();
		this.getRawTransaction = jest.fn();
		this.getBlock = jest.fn();
		this.getBlockHash = jest.fn();

		this.newAddress.mockResolvedValue("sc5J9ZSUbqYzWXhCiLXrqZiNeKoVu2HeiF");
		
		this.getRawTransaction.mockImplementation(async ([ txid, verbose = 1 ]) => {
			if(txid === '29a4c8805d78a26efb37b5890832e7e41d61a891a722571577f574c54fdb34b0') return verbose ? testTx : testTx.hex;
			else throw Error("No such mempool or blockchain transaction. Use gettransaction for wallet transactions.");
		});

		this.getBlock.mockImplementation(async ([ hash ]) => {
			const block = dummyBlocks.find(b => b.hash === hash);

			if(!block) throw Error("Block not found");

			return block;
		});

		this.getBlockHash.mockImplementation(async ([ height ]) => {
			const block = dummyBlocks.find(b => b.height === height);

			if(!block) throw Error("Block height out of range");
		});
	}
}

module.exports = RpcAdapter;