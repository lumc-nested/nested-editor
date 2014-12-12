'use strict';

describe('Main', function() {
  var Kinetic, Member, member;

  beforeEach(function() {
    Kinetic = require('kinetic');
    Member = require('../../../src/scripts/core/Member.js');
  });

  it('should contain a Shape child', function() {
    member = new Member({});
    expect(member.children.length).toBe(1);
  });

  it('should be a square for male', function() {
    member = new Member({'gender': 1});
    expect(member.shape.className).toBe('Rect');
    expect(member.shape.rotation()).toBe(0);
  });

  it('should be a circle for female', function(){
    member = new Member({'gender': 2});
    expect(member.shape.className).toBe('Circle');
  });

  it('should be a diamond for unknown gender', function() {
    member = new Member({'gender': 0});
    expect(member.shape.className).toBe('Rect');
    expect(member.shape.rotation()).toBe(45);
  });

  it('should be dead', function(){
    member = new Member({'deceased': true});
    expect(member.isDead()).toBe(true);

    member = new Member({'dateOfDeath': '1945-09-29'});
    expect(member.isDead()).toBe(true);
  });

  it('should not be dead', function(){
    member = new Member({});
    expect(member.isDead()).toBe(false);

    member = new Member({'deceased': false});
    expect(member.isDead()).toBe(false);
  });

});
