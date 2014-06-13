var ucoin  = require('./..');
var should = require('should');
var fs     = require('fs');
var async  = require('async');

var pubkeyCat = fs.readFileSync(__dirname + '/data/lolcat.pub', 'utf8');
var pubkeyUbot1 = fs.readFileSync(__dirname + '/data/ubot1.pub', 'utf8');

describe('A server', function () {

  var hdcServer;
  beforeEach(function (done) {
    if (hdcServer) {
      hdcServer.disconnect();
    }
    hdcServer = ucoin.createHDCServer({ name: 'hdc1' });
    hdcServer.reset(done);
  })
  
  it('HDC should emit error on wrong data type', function (done) {
    hdcServer.on('error', function (err) {
      should.exist(err);
      done();
    });
    hdcServer.write({ some: 'data' });
  });
  
  it('HDC should accept pubkeys', function (done) {
    hdcServer.on('pubkey', function (pubkey) {
      should.exist(pubkey);
      done();
    });
    hdcServer.write({ pubkey: pubkeyCat });
  });
  
  it('HDC should allow both simple & multiple writings', function (done) {
    async.parallel([
      until(hdcServer, 'pubkey', 2)
    ], done);
    hdcServer.singleWriteStream().write({ pubkey: pubkeyUbot1 });
    hdcServer.singleWriteStream().end();
    hdcServer.write({ pubkey: pubkeyCat });
  });
  
  it('HDC should accept votes', function (done) {
    async.parallel([
      until(hdcServer, 'vote', 1)
    ], done);
    hdcServer.write({ pubkey: pubkeyUbot1 });
    hdcServer.write({
      amendment: {
        "version": 1,
        "number": 0,
        "generated": 1398895200,
        "nextVotes": 1,
        "dividend": null,
        "coinBase": null,
        "votersCount": 1,
        "membersCount": 3,
        "currency": "beta_brousouf",
        "votersRoot": "D049002A6724D35F867F64CC087BA351C0AEB6DF",
        "membersRoot": "2A22E19061A41EB95F628F7EFB8FB2DAF6BAB4FE",
        "coinAlgo": "Base2Draft",
        "previousHash": null,
        "coinList": [],
        "votersChanges": [
          "+D049002A6724D35F867F64CC087BA351C0AEB6DF"
        ],
        "membersChanges": [
          "+2E69197FAB029D8669EF85E82457A1587CA0ED9C",
          "+C73882B64B7E72237A2F460CE9CAB76D19A8651E",
          "+D049002A6724D35F867F64CC087BA351C0AEB6DF"
        ]
      },
      "issuer": "D049002A6724D35F867F64CC087BA351C0AEB6DF",
      "sigDate": new Date()
    });
  });
  
  it('HDC should accept transactions', function (done) {
    async.parallel([
      until(hdcServer, 'transaction', 1)
    ], done);
    hdcServer.write({ pubkey: pubkeyUbot1 });
    hdcServer.write({
      amendment: {
        "version": 1,
        "number": 0,
        "generated": 1398895200,
        "nextVotes": 1,
        "dividend": null,
        "coinBase": null,
        "votersCount": 1,
        "membersCount": 3,
        "currency": "beta_brousouf",
        "votersRoot": "D049002A6724D35F867F64CC087BA351C0AEB6DF",
        "membersRoot": "2A22E19061A41EB95F628F7EFB8FB2DAF6BAB4FE",
        "coinAlgo": "Base2Draft",
        "previousHash": null,
        "coinList": [],
        "votersChanges": [
          "+D049002A6724D35F867F64CC087BA351C0AEB6DF"
        ],
        "membersChanges": [
          "+2E69197FAB029D8669EF85E82457A1587CA0ED9C",
          "+C73882B64B7E72237A2F460CE9CAB76D19A8651E",
          "+D049002A6724D35F867F64CC087BA351C0AEB6DF"
        ]
      },
      "issuer": "D049002A6724D35F867F64CC087BA351C0AEB6DF",
      "sigDate": new Date()
    });
    hdcServer.write({
      amendment: {
        "version": 1,
        "number": 1,
        "generated": 1398981600,
        "nextVotes": 1,
        "dividend": null,
        "coinBase": null,
        "votersCount": 1,
        "membersCount": 3,
        "currency": "beta_brousouf",
        "votersRoot": "D049002A6724D35F867F64CC087BA351C0AEB6DF",
        "membersRoot": "2A22E19061A41EB95F628F7EFB8FB2DAF6BAB4FE",
        "coinAlgo": "Base2Draft",
        "previousHash": "65A55999086155BF6D3E4EB5D475E46E4E2307D2",
        "coinList": [],
        "votersChanges": [],
        "membersChanges": []
      },
      "issuer": "D049002A6724D35F867F64CC087BA351C0AEB6DF",
      "sigDate": new Date()
    });
    hdcServer.write({
      amendment: {
        "version": 1,
        "number": 2,
        "generated": 1399068000,
        "nextVotes": 1,
        "dividend": 100,
        "coinBase": 0,
        "votersCount": 1,
        "membersCount": 3,
        "currency": "beta_brousouf",
        "votersRoot": "D049002A6724D35F867F64CC087BA351C0AEB6DF",
        "membersRoot": "2A22E19061A41EB95F628F7EFB8FB2DAF6BAB4FE",
        "coinAlgo": "Base2Draft",
        "previousHash": "8EDE25D246E3402A6D5AF31B1D9AA02239B80452",
        "coinList": [
          26,
          7,
          5,
          3,
          1
        ],
        "votersChanges": [],
        "membersChanges": []
      },
      "issuer": "D049002A6724D35F867F64CC087BA351C0AEB6DF",
      "sigDate": new Date()
    });
    hdcServer.write({
      "signature": "-----BEGIN PGP SIGNATURE-----\r\nVersion: GnuPG v1.4.15 (GNU/Linux)\r\n\r\niQEcBAABAgAGBQJThe/DAAoJEDwCajRJsiQWeaUH/iAtPE1yph+7+1SxmCvJ1NaT\r\ngyyI5t86b72NmgslAoexC5xsPUnwwZPBUjMCR0xLO4x1FOEwYoMYyKCvNRKdKbKe\r\nDQ1z+chCMP+sHMl/4PG7di4PT+OE5Oqgrbi8Gq1HRA4l5iamyxOoInNUoSCjxe2g\r\n4HFLPN40Hv9ovWKDlKx14hTVbN2xlnAwf3LlCOiCQsC+YWCvawAbwWL1PBvNJmF8\r\ntAW3fjFKbMlzkTLMgAWUUviozZUedScgVQ443TMxJdvnh+SCDoLqNI573I7lRy41\r\n3DzGp913OU4iTFcgHCK6XnvNw3ycqYpdIW22rniWJewartHJJQfFWX1VAMSfhIc=\r\n=QxTg\r\n-----END PGP SIGNATURE-----\r\n",
      "version": 1,
      "currency": "beta_brousouf",
      "sender": "D049002A6724D35F867F64CC087BA351C0AEB6DF",
      "number": 0,
      "previousHash": null,
      "recipient": "D049002A6724D35F867F64CC087BA351C0AEB6DF",
      "coins": [
        "D049002A6724D35F867F64CC087BA351C0AEB6DF-2-12",
        "D049002A6724D35F867F64CC087BA351C0AEB6DF-2-14"
      ],
      "sigDate": new Date(),
      "comment": "",
    });
  });
})

function until (server, eventName, count) {
  var counted = 0;
  var max = count == undefined ? 1 : count;
  return function (callback) {
    server.on(eventName, function (obj) {
      console.log('event = %s', eventName);
      should.exist(obj);
      counted++;
      if (counted == max)
        callback();
    });
  }
}