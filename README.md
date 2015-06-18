# local-bus

A generic bus for topic-based message exchange.

In applying the microservices architecutral style with or without event-sourcing,
It is often necessary to listen on a message queue. In many cases  we also
find it necessary to broadcast messages to listeners both within and outside the
microservice.

This package is an abstraction over an Amqp message bus/broker. It serves as a 
message bus for the internal modules of a microservice; and a message endpoint
for external services.

It routes messages (which come from internal modules or external components) to 
internal modules of the microservice. It also broadcast messages to external 
components through an Amqp message broker.
Message routing is based on topics, and topic patterns as implemented in Amqp.
Configuration options allow for the pre-selection of the message topics that are 
broadcast to external components.

This package is still in the early stages of development. Do feel free to use it
at your own risk.


## installation

npm install local-bus

## Usage

```
var bus = require('local-bus')({
	amqpUri: 'amqp://localhost:5672',
	exchange: 'amqpExchange',
	queue: 'amqpQueue',
	broadcastTopics: ['stock.nyse.*', '#.trades.nyse']
});

bus.publish(event);
...

bus.on('stock.nyse.google', function(event){
	// Do something with event data here
});

```