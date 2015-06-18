'use strict';

var expect = require('chai').expect;
var sinon = require('sinon');
var TopicSubscribers = require('../src/lib/topic-subscribers');
var _ = require('lodash');
var q = require('q');

function makeSubscriptions(subscriptions, topicSubscribers){
	_.forEach(subscriptions, function(subscribers, topic){
		_.forEach(subscribers, function(subscriber){
			topicSubscribers.add(topic, subscriber);
		});
	});
}

describe('TopicSubscribers', function(){

	context('With simple keyword subscriptions', function(){
		beforeEach(function(done){
			var gwatch = sinon.stub();
			var mwatch = sinon.stub();
			var nwatch = sinon.stub();
			var twatch = sinon.stub();
			
			var subscriptions = {};
			subscriptions['stock.nyse.google'] = [gwatch, nwatch];
			subscriptions['stock.nyse.microsoft'] = [mwatch, nwatch];
			subscriptions['stock.tokyo.google'] = [gwatch, twatch];
			subscriptions['stock.tokyo.microsoft'] = [mwatch, twatch];
			this.subscriptions = subscriptions;

			var topicSubscribers = {};
			topicSubscribers['stock.nyse.google'] = [gwatch, nwatch];
			topicSubscribers['stock.nyse.microsoft'] = [mwatch, nwatch];
			topicSubscribers['stock.tokyo.google'] = [gwatch, twatch];
			topicSubscribers['stock.tokyo.microsoft'] = [mwatch, twatch];

			this.subscribers = new TopicSubscribers();
			makeSubscriptions(subscriptions, this.subscribers);
			done();
		});
		
		it('TopicSubscribers.choose returns the proper subscribers for each topic', function(done){
			var test = this;
			_.reduce(test.topicSubscribers, function(a, subscribers, topic){
				return a.then(function(){
					return q.ninvoke(test.subscribers, 'choose', topic)
					.then(function(found){
						expect(found).to.have.length(subscribers.length);
						var containsAll = _.every(subscribers, _.partial(_.contains, found));
						expect(containsAll).to.be.true;
					});
				});
			}, q())
			.then(function(){return done();})
			.fail(function(err){
				return done(err);
			}).done();
		});
	});
	
	context('With single word wild card (*) subscriptions', function(){
		beforeEach(function(done){
			var gwatch = sinon.stub();
			var mwatch = sinon.stub();
			var nwatch = sinon.stub();
			var twatch = sinon.stub();
			
			var subscriptions = {};
			subscriptions['stock.*.google'] = [gwatch];
			subscriptions['stock.*.microsoft'] = [mwatch];
			subscriptions['stock.nyse.*'] = [nwatch];
			subscriptions['stock.tokyo.*'] = [twatch];
			this.subscriptions = subscriptions;

			var topicSubscribers = {};
			topicSubscribers['stock.nyse.google'] = [gwatch, nwatch];
			topicSubscribers['stock.nyse.microsoft'] = [mwatch, nwatch];
			topicSubscribers['stock.tokyo.google'] = [gwatch, twatch];
			topicSubscribers['stock.tokyo.microsoft'] = [mwatch, twatch];

			this.subscribers = new TopicSubscribers();
			makeSubscriptions(subscriptions, this.subscribers);
			done();
		});
		
		it('TopicSubscribers.choose returns the proper subscribers for each topic', function(done){
			var test = this;
			_.reduce(test.topicSubscribers, function(a, subscribers, topic){
				return a.then(function(){
					return q.ninvoke(test.subscribers, 'choose', topic)
					.then(function(found){
						expect(found).to.have.length(subscribers.length);
						var containsAll = _.every(subscribers, _.partial(_.contains, found));
						expect(containsAll).to.be.true;
					});
				});
			}, q())
			.then(function(){return done();})
			.fail(function(err){
				return done(err);
			}).done();
		});
	});

	context('With multi word wild card (#) subscriptions', function(){
		beforeEach(function(done){
			var gwatch = sinon.stub();
			var mwatch = sinon.stub();
			var nwatch = sinon.stub();
			var twatch = sinon.stub();
			var awatch = sinon.stub();
			
			var subscriptions = {};
			subscriptions['#.google'] = [gwatch];
			subscriptions['#.microsoft'] = [mwatch];
			subscriptions['#.nyse.*'] = [nwatch];
			subscriptions['#.tokyo.*'] = [twatch];
			subscriptions['stock.#'] = [awatch];
			this.subscriptions = subscriptions;

			var topicSubscribers = {};
			topicSubscribers['stock.nyse.google'] = [gwatch, nwatch, awatch];
			topicSubscribers['stock.nyse.microsoft'] = [mwatch, nwatch, awatch];
			topicSubscribers['stock.tokyo.google'] = [gwatch, twatch, awatch];
			topicSubscribers['stock.tokyo.microsoft'] = [mwatch, twatch, awatch];
			topicSubscribers['trades.tokyo.microsoft'] = [];

			this.subscribers = new TopicSubscribers();
			makeSubscriptions(subscriptions, this.subscribers);
			done();
		});
		
		it('TopicSubscribers.choose returns the proper subscribers for each topic', function(done){
			var test = this;
			_.reduce(test.topicSubscribers, function(a, subscribers, topic){
				return a.then(function(){
					return q.ninvoke(test.subscribers, 'choose', topic)
					.then(function(found){
						expect(found).to.have.length(subscribers.length);
						var containsAll = _.every(subscribers, _.partial(_.contains, found));
						expect(containsAll).to.be.true;
					});
				});
			}, q())
			.then(function(){return done();})
			.fail(function(err){
				return done(err);
			}).done();
		});
	});
});