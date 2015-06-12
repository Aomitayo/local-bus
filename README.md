# local-bus

A generic bus for topic-based publication of events.
It represents my conceptualization of a topic based message bus for 
event-sourced microservice architectures.

In applying the microservices architecutral style with or without event-sourcing,
It is often necessary to listen on an amqp message queue. In many cases  we also
find it necessary to broadcast events to listeners within the microservice and
also to listeners outside the microservice. 

This package is an abstraction over an amqp message bus. It serves as an event
bus for internal modules of a microservice. 
Extending node js's events.EventEmitter, it will notify internal modules of 
internal and external events on topics of interest to the internal modules; whilst
selectively publising internal events to external components/services that need to
be notified of those events.

This package is still in early stages. Do feel free to use it at your own risk.


## installation

npm install local-bus

## Usage

```
var bus = require('local-bus')({
	amqpUri: 'amqp://localhost:5672',
	exchange: 'amqpExchange',
	queue: 'amqpQueue',
	pubTopics: ['stock.nyse.*', '#.trades.nyse']
});

bus.publish(topic, event);
...

bus.subscribe('contacts.ContactRegistered.tenantx', function(event){
	// Do something with event data here
});

```