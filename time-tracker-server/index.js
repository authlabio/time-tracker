// Require the framework and instantiate it
const fastify = require('fastify')()

const cors = require('cors')

const corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204 
}

fastify.use(cors(corsOptions))

fastify.register(require('./routes/tracking'), { prefix: '/v1/trackings' });

fastify.post('/test', function(req, reply) {
  reply.header('Access-Control-Allow-Origin', '*');

  reply.send({kk: 'jewel'});
})



// Run the server!
fastify.listen(3000, function (err) {
  if (err) throw err
  console.log(`server listening on ${fastify.server.address().port}`)
});