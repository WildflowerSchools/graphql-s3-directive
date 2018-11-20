# S3 Directive for GraphQL

A simple directive for graphQL that can be used to include S3 files in responses of graphql queries. Also includes helpers for uploading data to be stored in S3.

### Basic usage

Add the package as a dependency.

Require the following when building your schema.

```javascript
const {typeDefs, directives, uploadToS3, resolvers} = require("../")
```

#### typeDefs

Includes the types required by the directive as well as the directive definition itself.

#### directives

The directives to be set on the `schemaDirectives` property of the schema.

#### resolvers

Some standard resolvers required for the directive to work

#### uploadToS3

Function to call in your mutation resolvers that upload files.

```javascript
    async upload(obj, args, context, info) {
        const input = args.file
        obj = {
            file_id: uuidv4()
        }
        obj.file = await uploadToS3(obj.file_id, input.file, "test-objects", "unit-test-bucket-sir")
        obj.name = args.file.name
        // do something with the obj metadata, must be stored with the rest of your graph so that it can be later resolved.
        return obj
    },
```

### Including in Schema

[Example Schema](src/schema/index.js)

In your schema include the type `S3File`, adding the `@s3file` annotation only adds a reference to the schema that the bucket should exist and when calling `ensureBucketsExist` those buckets will be created. 


```javascript
    type File {
        file_id: ID!
        name: String
        file: S3File @s3file(keyPrefix: "test-objects", bucketName: "unit-test-bucket-sir")
    }
```


## Changelog

### v0.1.0

First release with basic functionality

- Upload helper
- Directive for resolver
- types defined
