import 'should';

import { execToString } from './lib/execToString';
import { itShouldHandleErrorsConsistently } from './lib/itShouldHandleErrorsConsistently';

import * as types from '../lib/userid';

const userid: typeof types = require(process.env.MOCHA_IMPORT_OVERRIDE || '../lib/userid.js');

// Simply test against current user's info

const shellUsername = execToString('id -un');
const shellGroupName = execToString('id -gn');

const shellUid = Number(execToString('id -u'));
const shellGid = Number(execToString('id -g'));

// Get a nice list
const shellGids = execToString('id -G')
  .split(' ')
  .map(s => Number(s))
  .sort();

// As per https://github.com/cinderblock/node-userid/issues/3 we need to test long usernames.
// But we don't want to fail if a username is missing.
const longUsername = process.env.LONG_USERNAME_TEST;
const longUsernameUid = longUsername ? Number(execToString(`id -u ${longUsername}`)) : -1;

// Try long group names too
const longGroupname = process.env.LONG_GROUPNAME_TEST;
const longGroupnameGid = longGroupname ? Number(execToString(`id -g ${longGroupname}`)) : -1;

function testIdsMethod() {
  it(`should load a user's uid [${shellUid}] and gid [${shellGid}] by username [${shellUsername}] as an object`, () => {
    const libIds = userid.ids(shellUsername);

    libIds.uid.should.equal(shellUid);
    libIds.gid.should.equal(shellGid);
  });

  if (longUsername) {
    it(`should work with a long username [${longUsername}] that exists`, () => {
      const libLongIds = userid.ids(longUsername);

      libLongIds.uid.should.equal(longUsernameUid);

      // TODO: Test `libLongIds.gid.should.equal(shellGid)` properly
    });
  }

  itShouldHandleErrorsConsistently(userid.ids, 'string', 'username', 'username not found');
}

describe('userid', () => {
  describe('method userid.ids', testIdsMethod);

  // If we're using the Node API
  if (process.env.MOCHA_USE_NODE_API) {
    // this method matches `userid.ids` for historical compatibility
    describe('method userid.uid (should match method `userid.ids`)', testIdsMethod);
  } else {
    // Otherwise it has its own signature
    describe('method userid.uid', () => {
      it(`should load user's uid [${shellUid}] by username [${shellUsername}]`, () => {
        userid.uid(shellUsername).should.equal(shellUid);
      });

      if (longUsername) {
        it(`should work with a long username [${longUsername}] that exists`, () => {
          userid.uid(longUsername).should.equal(longUsernameUid);
        });
      }

      itShouldHandleErrorsConsistently(userid.uid, 'string', 'username', 'username not found');
    });
  }

  describe('method userid.username', () => {
    it(`should load a username [${shellUsername}] by uid [${shellUid}]`, () => {
      userid.username(shellUid).should.equal(shellUsername);
    });

    if (longUsername) {
      it(`should load a long username [${longUsername}] by uid [${longUsernameUid}]`, () => {
        userid.username(longUsernameUid).should.equal(longUsername);
      });
    }

    itShouldHandleErrorsConsistently(userid.username, 'number', 'uid', 'uid not found');
  });

  describe('method userid.gid', () => {
    it(`should load group's gid [${shellGid}] by group name [${shellGroupName}]`, () => {
      userid.gid(shellGroupName).should.equal(shellGid);
    });

    if (longGroupname) {
      it(`should work with a long groupname [${longGroupname}] that exists`, () => {
        userid.gid(longGroupname).should.equal(longGroupnameGid);
      });
    }

    itShouldHandleErrorsConsistently(userid.gid, 'string', 'groupname', 'groupname not found');
  });

  describe('method userid.groupname', () => {
    it(`should load a group's name [${shellGroupName}] by gid [${shellGid}]`, () => {
      userid.groupname(shellGid).should.equal(shellGroupName);
    });

    if (longGroupname) {
      it(`should work with a long groupname [${longGroupname}] that exists`, () => {
        userid.groupname(longGroupnameGid).should.equal(longGroupname);
      });
    }

    itShouldHandleErrorsConsistently(userid.groupname, 'number', 'gid', 'gid not found');
  });

  describe('method userid.gids', () => {
    it(`should load a list of gids [${shellGids}] by username [${shellUsername}]`, () => {
      userid.gids(shellUsername).sort().should.deepEqual(shellGids);
    });

    // TODO: test for a long username
    // TODO: test for a long groupname in returned list

    itShouldHandleErrorsConsistently(userid.gids, 'string', 'user', 'getpwnam');
  });
});
