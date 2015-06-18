'use strict';

var TopicSubscribers = require('./topic-subscribers');

function LocalBus(){
	var self = this;
	self.subscribers = new TopicSubscribers();
}

LocalBus.prototype.publish = function(topic, event){
	this.emit(topic, event);
};

LocalBus.prototype.on = function(topic, subscriber){
	this.subscribers.add(topic, subscriber);
};

LocalBus.prototype.emit = function(topic){
	var self = this;
	var args = Array.prototype.slice.call(arguments, 1);
	
	self.subscribers.choose(topic).then(function(found){
		(found || []).forEach(function(subscriber){
			subscriber.apply(null, args);
		});
	})
	.fail(function(err){
		throw(err);
	});

};
module.exports = LocalBus;