

exports.server = async function(schema) {
    const express = require("express")
    const { ApolloServer } = require('apollo-server-express')
    const voyager = require('graphql-voyager/middleware')
    const {ensureBucketsExist} = require("./")

    await (async () => {
        console.log("checking minio")
        try {
            await ensureBucketsExist(schema)
            console.log("minio checked")
        } catch (e) {
            console.log(e)
        }
    })()

    const server = new ApolloServer({
        schema,
        formatError: error => {
            console.log(error)
            return error
        },
        formatResponse: response => {
            console.log(response)
            return response
        },
    })

    const app = express()

    app.use('/voyager', voyager.express({ endpointUrl: server.graphqlPath }))

    server.applyMiddleware({ app })

    return app.listen({ port: 4000 }, () =>
      console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
    )

}
