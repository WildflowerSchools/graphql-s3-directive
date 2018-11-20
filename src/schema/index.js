const {makeExecutableSchema, mergeSchemas} = require('graphql-tools')
const {typeDefs, directives, uploadToS3, resolvers} = require("../")
const uuidv4 = require('uuid/v4')


const logger = { log: e => console.log(e) }

var FILES = {}


exports.schema = makeExecutableSchema({
  typeDefs: [
    typeDefs,
`

    type File {
        file_id: ID!
        name: String
        file: S3File @s3file(keyPrefix: "test-objects", bucketName: "unit-test-bucket-sir")
    }

    input FileInput {
        name: String
        file: S3FileInput
    }

    type Query {
        files: [File!]
    }

    type Mutation {
        upload(file: FileInput): File!
    }

    schema {
        query: Query
        mutation: Mutation
    }

`
  ],
  schemaDirectives: directives,
  logger: logger,
  resolvers: [
    resolvers,
    {
        Query: {
            files(obj, args, context, info) {
                console.log(Object.values(FILES))
                return Object.values(FILES)
            },
        },
        Mutation: {
            async upload(obj, args, context, info) {
                const input = args.file
                obj = {
                    file_id: uuidv4()
                }
                obj.file = await uploadToS3(obj.file_id, input.file, "test-objects", "unit-test-bucket-sir")
                obj.name = args.file.name
                FILES[obj.file_id] = obj
                return obj
            },
        },
    }]
})

