const fastify = require('fastify')();

fastify.register(require('fastify-mongodb'), {
  url: 'mongodb://127.0.0.1:27017/db'
}, err => {
  if (err) throw err
});

function getUser(request, reply) {

	reply.header('Access-Control-Allow-Origin', '*');

	const { db } = fastify.mongo

	db.collection('tracks', onCollection)

	  function onCollection (err, col) {
	    if (err) return reply.send(err)

	    col.find({}).toArray( (err, tracks) => {
	      reply.send({ tracks: tracks } )
	    });
	  };
	
}

function recordTrackingData(request, reply) {
	let tracks = request.body.tracks;

	const { db } = fastify.mongo;
	db.collection("tracks").insertMany(tracks, function(err, res) {
	    if (err) {
	    	console.log(err);
	    } else {
	    	reply.send({ 
	    		tracks: tracks, 
	    		insertedCount: res.insertedCount,
	    		insertedIds: res.insertedIds
	    	});
	    }
	  });
}



module.exports = function (fastify, opts, next) {
	fastify.post('/', recordTrackingData);
  	fastify.get('/user/', getUser);
  	next()
};