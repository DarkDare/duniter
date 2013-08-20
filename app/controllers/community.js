var jpgp       = require('../lib/jpgp');
var async      = require('async');
var mongoose   = require('mongoose');
var _          = require('underscore');
var Membership = mongoose.model('Membership');
var Amendment  = mongoose.model('Amendment');
var PublicKey  = mongoose.model('PublicKey');
var Merkle     = mongoose.model('Merkle');
var Vote       = mongoose.model('Vote');

module.exports = function (pgp, currency, conf) {

  this.currentVotes = function (req, res) {
    async.waterfall([
      function (next){
        Amendment.current(next);
      },
      function (am, next){
        Merkle.signaturesOfAmendment(am.number, am.hash, next);
      },
      function (merkle, next){
        Merkle.processForURL(req, merkle, function (hashes, done) {
          Vote
          .find({ hash: { $in: hashes } })
          .sort('hash')
          .exec(function (err, votes) {
            var map = {};
            votes.forEach(function (vote){
              map[vote.hash] = vote.signature;
            });
            done(null, map);
          });
        }, next);
      }
    ], function (err, json) {
      if(err){
        res.send(500, err);
        return;
      }
      merkleDone(req, res, json);
    });
  };

  this.join = function (req, res) {
    async.waterfall([

      // Parameters
      function(callback){
        if(!(req.body && req.body.request && req.body.signature)){
          callback('Requires a membership request + signature');
          return;
        }
        callback(null, req.body.request, req.body.signature);
      },

      // Check signature's key ID
      function(msr, sig, callback){
        var keyID = jpgp().signature(sig).issuer();
        if(!(keyID && keyID.length == 16)){
          callback('Cannot identify signature issuer`s keyID');
          return;
        }
        callback(null, msr + sig, keyID);
      },

      // Looking for corresponding public key
      function(signedMSR, keyID, callback){
        PublicKey.search("0x" + keyID, function (err, keys) {
          if(keys.length > 1){
            callback('Multiple PGP keys found for this keyID.');
            return;
          }
          if(keys.length < 1){
            callback('Corresponding Public Key not found.');
            return;
          }
          var pubkey = keys[0];
          var ms = new Membership();
          callback(null, ms, signedMSR, pubkey);
        });
      },

      // Verify signature
      function(ms, signedMSR, pubkey, callback){
        async.waterfall([
          function (next){
            ms.parse(signedMSR, next);
          },
          function (ms, next){
            ms.verify(currency, next);
          },
          function (valid, next){
            ms.verifySignature(pubkey.raw, next);
          },
          function (verified, next){
            var cert = jpgp().certificate(pubkey.raw);
            Membership.find({ fingerprint: cert.fingerprint, basis: ms.basis }, next);
          },
          function (requests, next){
            var msEntity = ms;
            if(requests.length > 0){
              msEntity = requests[0];
              ms.copyValues(msEntity);
            }
            msEntity.fingerprint = pubkey.fingerprint;
            msEntity.save(function (err) {
              next(err, msEntity);
            });
          },
          function (ms, next) {
            Merkle.forNextMembership(function (err, merkle) {
              next(err, ms, merkle);
            });
          },
          function (ms, merkle, next) {
            merkle.push(ms.hash);
            merkle.save(function (err) {
              next(err, ms);
            });
          }
        ], callback);
      }
    ], function (err, recordedMS) {
      if(err){
        res.send(400, err);
      }
      else res.end(JSON.stringify({
        request: recordedMS.hdc(),
        signature: recordedMS.signature
      }));
    });
  };

  this.memberships = function (req, res) {
    async.waterfall([
      function (next){
        Merkle.forNextMembership(next);
      },
      function (merkle, next){
        Merkle.processForURL(req, merkle, function (hashes, done) {
          Membership
          .find({ hash: { $in: hashes } })
          .sort('hash')
          .exec(function (err, memberships) {
            var map = {};
            memberships.forEach(function (m){
              map[m.hash] = m;
            });
            var values = {};
            hashes.forEach(function (hash, index){
              values[hash] = {
                "signature": map[hash].signature,
                "request": {
                  "version": map[hash].version,
                  "currency": map[hash].currency,
                  "status": map[hash].status,
                  "basis": map[hash].basis
                }
              }
            });
            done(null, values);
          });
        }, next);
      }
    ], function (err, json) {
      if(err){
        res.send(500, err);
        return;
      }
      merkleDone(req, res, json);
    });
  }
  
  return this;
}

function merkleDone(req, res, json) {
  if(req.query.nice){
    res.setHeader("Content-Type", "text/plain");
    res.end(JSON.stringify(json, null, "  "));
  }
  else res.end(JSON.stringify(json));
}
