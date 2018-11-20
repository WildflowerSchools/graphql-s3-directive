const {SchemaDirectiveVisitor} = require('graphql-tools')
const graphql = require('graphql')
const AWS = require('aws-sdk')


const defaultBucketName = process.env.AWS_BUCKET ? process.env.AWS_BUCKET : "unit-test-bucket"
const defaultAWSRegion = process.env.AWS_REGION ? process.env.AWS_REGION : "us-east-1"


let s3conf = {
    region: defaultAWSRegion,
}

if (process.env.NODE_ENV != 'production') {
    // for testing and local
    s3conf.endpoint = 'http://localhost:9000'
    s3conf.s3ForcePathStyle = true
    s3conf.accessKeyId = 'myaccesskey'
    s3conf.secretAccessKey = 'mysecret'
    s3conf.sslEnabled = false
    s3conf.signatureVersion = 'v4'
    s3conf.region = 'us-east-1'
    s3conf.logger = console
}

const s3 = new AWS.S3(s3conf)

// export s3 object so that it has the same settings, used for tests
exports.s3 = s3

exports.ensureBucketsExist = async function(schema) {
    console.log(schema._s3Info)
    for(var key of Object.keys(schema._s3Info)) {
        var bucketInfo = schema._s3Info[key]
        var params = {
            Bucket: bucketInfo.bucketName,
            CreateBucketConfiguration: {
                LocationConstraint: bucketInfo.region
            }
        }
        console.log(`creating bucket ${bucketInfo.bucketName}`)
        await s3.createBucket(params).promise()
    }
}


class BytesScalar extends graphql.GraphQLScalarType {

    serialize(value) {
        if (value instanceof String) {
            return value
        } else if(value instanceof Buffer) {
            return value.toString('utf-8')
        }
    }

    parseValue(value) {
        if (!(typeof value === 'string' || value instanceof String)) {
            throw new TypeError('Bytes cannot represent non string type ' + JSON.stringify(value));
        }
        return value
    }

    parseLiteral(ast) {
        if (ast.kind !== graphql.Kind.STRING) {
            throw new TypeError('Bytes cannot represent non string type ' + String(ast.value != null ? ast.value : null));
        }
        return ast.value
    }

}


exports.resolvers = {
    Bytes: BytesScalar
}


exports.typeDefs = `
    scalar Bytes

    directive @s3file (bucketName: String, keyPrefix: String, region: String) on FIELD_DEFINITION
    directive @s3fileDirectBytes on FIELD_DEFINITION

    input S3FileInput {
        name: String
        contentType: String
        data: Bytes!
    }

    type S3File {
        name: String
        bucketName: String!
        key: String!
        data: Bytes! @s3fileDirectBytes
        contentType: String!
        size: Int
        created: String!
    }

`


class S3FileDirective extends SchemaDirectiveVisitor {

    visitFieldDefinition(field, details) {
        const keyPrefix = this.args.keyPrefix
        const bucketName = this.args.bucketName ? this.args.bucketName : defaultBucketName
        const region = this.args.region ? this.args.region : defaultAWSRegion
        const objType = details.objectType
        const schema = this.schema

        if(!this.schema._s3Info) {
            this.schema._s3Info = []
        }
        this.schema._s3Info[`${objType}:${field.name}`] = {
            keyPrefix: keyPrefix,
            bucketName: bucketName,
            objType: objType,
            region: region,
        }
    }

}

class S3fileDirectBytesDirective extends SchemaDirectiveVisitor {

    visitFieldDefinition(field, details) {
        const keyPrefix = this.args.keyPrefix
        const schema = this.schema

        field.resolve = async function (obj, args, context, info) {
            return exports.loadFromS3(obj.bucketName, obj.key)
        }
    }

}

function now() {
    var date = new Date();
    return date.toISOString();
}

exports.directives = {
    s3file: S3FileDirective,
    s3fileDirectBytes: S3fileDirectBytesDirective
};


exports.uploadToS3 = async function(obj_id, input, key_prefix, bucketName) {
    // generate key from obj and input
    const name = input.name ? input.name : "file.dat"
    const s3_key = `${key_prefix}/${obj_id}/${name}`
    const contentType = input.contentType ? input.contentType : 'application/octet-stream'
    // send bytes to S3
    var params = {
        Body: input.data,
        Bucket: bucketName,
        Key: s3_key,
        ContentType: contentType,
    }
    try {
        await s3.putObject(params).promise()
    } catch(err) {
        console.log(err)
        throw Error(`could not write to s3 ${err}`)
    }

    // return the reference object for relational storage
    return {
        bucketName: bucketName,
        name: name,
        key: s3_key,
        contentType: contentType,
        size: 0,
        created: now(),
    }
}


exports.loadFromS3 = async function(bucket, key) {
    try {
        var params = {
            Bucket: bucket, 
            Key: key,
        }
        var obj = await s3.getObject(params).promise()
        return obj.Body.toString('utf-8')
    } catch(err) {
        console.log(err)
        throw Error(`could not write to s3 ({err.message})`)
    }
}
