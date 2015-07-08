'use strict';

var _ = require('lodash');
var q = require('q');

function TopicSubscribers(){
	this.subscriptions = [];
	this.filters = [];
}

TopicSubscribers.prototype = {
	choose: function(topic, cb){
		var self = this;
		cb = cb || _.noop;
		return q(self.subscriptions)
		.then(function(){
			return _.chain(self.subscriptions).filter(function(v){
				return v.compiledPattern.test(topic);
			})
			.map(function(v){
				return v.subscriber;
			})
			.valueOf();
		})
		.then(function(byTopic){
			cb(null, byTopic);
			return byTopic;
		});
	},
	add: function(pattern, subscriber){
		this.subscriptions.push({pattern: pattern, compiledPattern: this._compilePattern(pattern),  subscriber:subscriber});
	},
	remove: function(pattern, subscriber){
		this.subscriptions = _.remove(this.subscriptions, {pattern:pattern, subscriber:subscriber});
	},
	useFilter: function(pattern, filter){
		if(typeof filter !== 'function'){
			throw new Error('filter should be a function with signature fn(topic, subscriber, callback)');
		}
		this.filter.push({pattern:pattern, compiledPattern: this._compilePattern(pattern), filter: filter});
	},
	removeFilter: function(pattern, filter){
		this.filters = _.remove(this.filters, {pattern:pattern, filter: filter});
	},
	_chooseFilter: function(topic, cb){
		return _.filter(this.filters, function(filterDef){
			filterDef.compiledPattern.test(topic);
		});
	},
	_compilePattern: function(pattern){
		if(typeof pattern  === 'string'){
			return new RegExp(
				'^' + pattern
					.replace(/\.?\*\.?/g, '(\\.?[a-zA-Z0-9]+\\.?)')
					.replace(/\.?\#\.?/g, '(\\.?[a-zA-Z0-9]+(.[a-zA-Z0-9])*\\.?)?') + '$'
			);
		}
		else if(typeof pattern === 'object' && pattern.test){
			return pattern;
		}
		else{
			throw new Error('pattern is expected to be a string or regular expression');
		}
	}
};

module.exports = TopicSubscribers;