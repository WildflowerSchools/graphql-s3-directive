const fs = require('fs')
const request = require('request')
const uuidv4 = require('uuid/v4')



exports.multipartMutation = function(url, file, mutation, variables) {
    return new Promise(function(resolve, reject) {
        // file should be an object that has:
        // path - full path to file in the filesystem
        // filename - name of file to sent to service
        // varpath - jsonpath to the Upload in the request
        fs.readFile(file.path, function(err, content) {
            if(err){
                reject(err)
            }
            var boundary = uuidv4()
            var data = ""
            data += "--" + boundary + "\r\n"
            data += "Content-Disposition: form-data; name=\"operations\"\r\n\r\n"
            data += JSON.stringify({query: mutation, variables: variables})
            data += "\r\n"

            data += "--" + boundary + "\r\n"
            data += "Content-Disposition: form-data; name=\"map\"\r\n\r\n"
            data += JSON.stringify({file: [file.varpath]})
            data += "\r\n"

            data += "--" + boundary + "\r\n"
            data += "Content-Disposition: form-data; name=\"file\"; filename=\"" + file.filename + "\"\r\n"
            data += "Content-Type:application/octet-stream\r\n\r\n"
            var payload = Buffer.concat([
                    Buffer.from(data, "utf8"),
                    Buffer.from(content, "binary"),
                    Buffer.from("\r\n--" + boundary + "--\r\n", "utf8"),
            ])
            var options = {
                method: 'post',
                url: url,
                headers: {"Content-Type": "multipart/form-data; boundary=" + boundary},
                body: payload,
            }
            console.log(url)
            console.log(payload.toString())
            request(options, function(error, response, body) {
                if(error) {
                    reject(error)
                } else {
                    resolve(JSON.parse(body).data)
                }
            })
        })
    })
}