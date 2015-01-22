'use strict';

var _ = require('lodash');
var Member = require('./Member.js');
var Nest = require('./Nest.js');
var Pregnancy = require('./Pregnancy.js');

var Individual = Member.Individual;
var Group = Member.Group;

var Pedigree = function(members, nests) {
  /*
    Todo:

    For the members structure, I think we should choose one of:

    1. An array of objects where the objects all have an "_id" field.
    2. An associative array of objects where the ID of the object is its key.

    We probably shouldn't have both (as we have now?).
  */
  this.members = members;
  this.nests = nests;
};

module.exports = Pedigree;
