'use strict';
/*jshint latedef:false*/

var util  = require('util');
var TopicSubscribers = require('./topic-subscribers');
var amqp = require('amqplib');
var _ = require('lodash');
var q = require('q');
var debug = require('debug')('event-bus');

function EventBus(options){
	var self = this;

	self.options = _.extend({
		amqpUri: 'amqp://localhost:5672',
		exchange: 'amqpExchange',
		queue: 'amqpQueue',
		broadcastTopic: [],	//an array of topic patterns that will be broadcast outside the current process
		maxReconnect: 1000
	}, options);

	self.boundTopics = [];

	if(self.options.doBroadcast){
		self.options.doBroadcast = _.map(self.options.doBroadcast, _.ary(self._compileTopicPattern, 1));
	}
	
	//internal object for managing subscriptions
	self.subscribers = new TopicSubscribers();

	//open a connection
	self.connection = q(amqp.connect(self.options.amqpUri, {}));
	//close the connection when program exits
	self.connection.then(function(conn){
		process.once('SIGINT', conn.close.bind(conn));
		conn.on('Error', function(){
			debug('A connection error has occured');
		});
	});
	//establish channels
	self.pubChannel = self._makePubChannel();
	self.pubChannelReconnects = 0;
	self.subChannel = self._makeSubChannel();
	self.subChannelReconnects = 0;
}

EventBus.prototype.subscribe = function(topic, listener, callback){
	var self = this;

	self.subscribers.add(topic, listener);
	callback = _.partial(callback || _.noop);
	return self._bindQueue(topic).then(callback, callback);
};

EventBus.prototype.unsubscribe = function(topic, listener, callback){
	var self = this;

	self.subscribers.remove(topic, listener);
	callback = _.partial(callback || _.noop);
	return self._unbindQueue(topic).then(callback, callback);
};

EventBus.prototype.publish = function(topic, message, doBroadcast){
	var self = this;
	_.forEach(self.subscribers.choose(topic), function(listener){
		listener(topic, message);
	});


	//if doBroadcast is true then convert doBroadcast to an array whose only 
	//element is a topic pattern that matches this event type
	var topicPattern = self._compileTopicPattern('#.'+event.eventType+'.#');
	doBroadcast = doBroadcast?[topicPattern] : doBroadcast;
	
	//if doBroadcast is specified, override doBroadcast option setting
	doBroadcast = doBroadcast || self.options.doBroadcast;
	

	if(doBroadcast){
		//todo:put code to broadcast through amqp
		//self.redisPubClient.publish(eventType, event);
	}

};

EventBus.prototype._broadCast = function(topic, message){
	var self = this;

	self.pubChannel.then(function(ch){
		ch.publish(self.options.exchange, topic, new Buffer(JSON.stringify(message), 'utf-8'));
	});
};

EventBus.prototype._recieveBroadcast = function(msg){
	var self = this;
	var topic = msg.fields.routingKey;
	var message = JSON.parse(msg.content.toString());

	self.publish(topic, message, false);
};
EventBus.prototype._bindQueue = function(topic){
	var self = this;
	return self.subChannel.then(function(ch){
		return ch.bindQueue(self.options.queue, self.options.exchange, topic);
	})
	.then(function(){
		self.boundTopics.push(topic);
		self.boundTopics = _.unique(self.boundTopics);
	}, function(err){
		debug(err);
		self.boundTopics.push(topic);
		self.boundTopics = _.unique(self.boundTopics);
	});
};

EventBus.prototype._unbindQueue = function(topic){
	var self = this;
	return self.subChannel.then(function(ch){
		return ch.unbindQueue(self.options.queue, self.options.exchange, topic);
	})
	.then(function(){
		self.boundTopics = _.remove(self.boundTopics);
	}, function(err){
		debug(err);
		self.boundTopics = _.remove(self.boundTopics);
	});
};

EventBus.prototype._reconnectSubChannel = function(){

};

EventBus.prototype._reconnectPubChannel = function(){};

EventBus.prototype._makePubChannel = function(){
	var self = this;
	debug('Making pub channel');
	return self.connection.then(function(conn){
		return conn.createChannel();
	})
	.then(function(pubChannel){
		pubChannel.on('error', function(){
			debug('An error has occured on the publish channel to AMQP');
		});

		return pubChannel.assertExchange(self.option.amqpExchange, 'topic', {durable:true})
		.then(function(){
			return pubChannel;
		});
	});
};

EventBus.prototype._makeSubChannel = function(){
	var self = this;
	var subChannel;

	debug('Making sub channel');
	return self.connection.then(function(conn){
		return conn.createChannel();
	})
	.then(function(channel){
		subChannel = channel;
		subChannel.on('error', function(){
			debug('An error has occured on the publish channel to AMQP');
		});
		return subChannel.assertExchange(self.options.amqpExchange, 'topic');
	})
	.then(function(){
		return subChannel;
	});
};

module.exports = function(options){
	return new EventBus(options);
};