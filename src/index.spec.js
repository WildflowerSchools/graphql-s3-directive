const run = require('docker-run')
const { request } = require('graphql-request')
const expect = require('chai').expect
const {server} = require("./testsupport")


const uri = "http://localhost:4000/graphql"

process.env.PGPASSWORD = "iamaninsecurepassword"
process.env.PGUSER = "beehive_user"
process.env.PGDATABASE = "beehive-tests-integrated"
process.env.PGHOST = "localhost"
process.env.PGPORT = "5432"


var dbContainer



before(async function() {
    // helper for waiting for things
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // do the deed, get postgreSQL running
    dbContainer = await (async function() {
        console.log('starting minio')
        var child = run('minio/minio:latest', {
          remove: true,
          ports: {
            9000: 9000
          }
        })
        // wait a bit for minio to start up
        await sleep(5000)
    })()

})


after(async function(){ 
    console.log("shutting down minio")
    dbContainer.destroy()
})



describe('Beehive test suite', function(){

    const {s3} = require("./")

    var expressApp

    before(async function() {
        // setup an apollo-server-express app and run it
        const { schema } = require("./schema");
        expressApp = await server(schema)
    })

    after(async function() {
        expressApp.close()
    })

    describe('files', function() {
        it('creates a file', async function() {
            var query = `
                    mutation {
                      upload(thing: {name: "thing", file: {name: "file", data: "test-data 90120398520349582304952034958"}}) {
                        file_id
                        name
                        file {
                            name
                            key
                            data
                            contentType
                        }
                      }
                    }
                `
            var thing = await request(uri, query)
            console.log(thing)
            expect(thing).to.not.equal(null)
            expect(thing.newThing.thing_id).to.not.equal(null)
            expect(thing.newThing.name).to.equal("thing")
            expect(thing.newThing.system.created).to.not.equal(null)
        })

    })

})







