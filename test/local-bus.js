'use strict';

var expect = require('chai').expect;
var sinon = require('sinon');
var LocalBus = require('../src/lib/local-bus');
var _ = require('lodash');
var q = require('q');


describe('LocalBus', function(){
	it('Publishes all events to local listeners', function(done){
		var localBus = new LocalBus();
		var listener = sinon.stub();
		var events = [
			{topic:'topic1', data:'event1-1'},
			{topic:'topic2', data:'event2-1'}
		];

		events.forEach(function(event){
			localBus.on(event.topic, listener);
		});
		
		events.forEach(function(event){
			localBus.publish(event.topic, event);
		});

		setTimeout(function(){
			expect(listener.args).to.have.length(events.length);
			var topics = _.map(events, 'topic');
			var publishedTopics = _.map(listener.args, _.ary(_.partialRight(_.get, '[0].topic'), 1));
			expect(_.difference(topics, publishedTopics)).to.have.length(0);

			done();
		});
	});

	it ('Publishes only matching events to local topic pattern listeners', function(done){
		var localBus = new LocalBus();
		var listener = sinon.stub();

		localBus.on('stock.nyse.*', listener);

		var events = {
			'stock.nyse.google': {topic:'stock.nyse.google', price:23444},
			'stock.nyse.microsoft':{topic:'stock.nyse.microsoft', price:432},
			'stock.tokyo.apple':{topic:'stock.nyse.microsoft', price:70034}
		};

		_.forEach(events, function(event, topic){localBus.publish(topic, event);});
		
		setTimeout(function(){
			expect(listener.args).to.have.length(2);
			var topics = _.keys(events);
			var publishedTopics = _.map(listener.args, _.ary(_.partialRight(_.get, '[0].topic'), 1));
			expect(_.difference(topics, publishedTopics)).to.have.length(1);

			done();
		});
	});
});