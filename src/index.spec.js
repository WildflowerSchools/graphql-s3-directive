const run = require('docker-run')
// const { request } = require('graphql-request')
const expect = require('chai').expect
const {server} = require("./testsupport")


const uri = "http://localhost:4000/graphql"


var dbContainer


before(async function() {
    // helper for waiting for things
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // do the deed, get minio running
    dbContainer = await (async function() {
        console.log('starting minio')
        var child = run('minio/minio:latest', {
          remove: true,
          ports: {
            9000: 9000
          },
          argv: ["server", "/data"],
          env: {
            MINIO_ACCESS_KEY: "myaccesskey",
            MINIO_SECRET_KEY: "mysecret",
          },
        })
        child.stdout.pipe(process.stdout)
        child.stderr.pipe(process.stderr)
        // wait a bit for minio to start up
        await sleep(3000)
        return child
    })()

})


after(async function(){ 
    console.log("shutting down minio")
    dbContainer.destroy()
})



describe('graphql-s3-directive test suite', function(){

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
            const client = require('./client')
            var mutation = `
                    mutation ($file: Upload!) {
                      upload(file: {name: "thing", file: {name: "file", data: $file}}) {
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
            var file = {
                path: "./README.md",
                filename: "README.md",
                varpath: "variables.file",
            }
            var thing = await client.multipartMutation(uri, file, mutation, {file: null})
            console.log(thing)
            expect(thing).to.not.equal(null)
            expect(thing.upload.file_id).to.not.equal(null)
            expect(thing.upload.name).to.equal("thing")
            expect(thing.upload.file.key).to.not.equal(null)
        })

    })

})
