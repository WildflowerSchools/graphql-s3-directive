const { request } = require('graphql-request')


const uri = "http://localhost:4022/graphql"


const fixtures = async () => {
    try {
        const things = [
            {name: "precious and fragile things", material: "mixed", type: "WOOD"},
            {name: "special", material: "mixed", type: "WOOD"},
            {name: "special", material: "mixed", type: "PLASTIC"},
            {name: "special", material: "mixed", type: "STONE"},
            {name: "special", material: "mixed", type: "WATER"},
            {name: "crisps", material: "mixed", type: "WOOD"},
            {name: "harry potter", material: "mixed", type: "WOOD"},
            {name: "38 dogs in a 88 gallon sack", material: "mixed", type: "WOOD"},
            {name: "random", material: "mixed", type: "WOOD"},
            {name: "word", material: "mixed", type: "WOOD"},
            {name: "phrase", material: "mixed", type: "WOOD"},
            {name: "pencil", material: "mixed", type: "WOOD"},
            {name: "dog", material: "mixed", type: "WOOD"},
            {name: "lipstick", material: "mixed", type: "WOOD"},
            {name: "virgina", material: "mixed", type: "WOOD"},
            {name: "school", material: "mixed", type: "WOOD"},
            {name: "candy", material: "mixed", type: "WOOD"},
            {name: "ron", material: "mixed", type: "WOOD"},
            {name: "hermione", material: "mixed", type: "WOOD"},
            {name: "dumbledore", material: "mixed", type: "WOOD"},
            {name: "death", material: "mixed", type: "WOOD"},
            {name: "eater", material: "mixed", type: "WOOD"},
            {name: "affairs", material: "mixed", type: "WOOD"},
            {name: "in order", material: "mixed", type: "WOOD"},
            {name: "stone", material: "mixed", type: "WOOD"},
            {name: "mirror", material: "mixed", type: "PLASTIC"},
            {name: "person", material: "mixed", type: "WOOD"},
            {name: "not use it", material: "mixed", type: "PLASTIC"},
            {name: "carrots", material: "mixed", type: "WOOD"},
            {name: "snape", material: "mixed", type: "WOOD"},
            {name: "atom", material: "atomic", type: "WOOD"},
            {name: "source", material: "mixed", type: "WOOD"},
            {name: "tree", material: "mixed", type: "WOOD"},
            {name: "tunes", material: "mixed", type: "WOOD"},
            {name: "keynote", material: "mixed", type: "WOOD"},
            {name: "acorn", material: "mixed", type: "WOOD"},
            {name: "chatter", material: "mixed", type: "WOOD"},
            {name: "driveway", material: "mixed", type: "WOOD"},
            {name: "skin", material: "mixed", type: "WOOD"},
            {name: "love", material: "mixed", type: "WOOD"},
            {name: "conversation", material: "mixed", type: "WOOD"},
            {name: "every flavor bean", material: "mixed", type: "WOOD"},
            {name: "vomit", material: "mixed", type: "WOOD"},
            {name: "toffee", material: "mixed", type: "WOOD"},
            {name: "earwax", material: "mixed", type: "WOOD"},
            {name: "alas", material: "mixed", type: "WOOD"},
            {name: "atlas", material: "mixed", type: "WOOD"},
        ]
        for(var thing of things) {
            await request(uri, `
                mutation {
                  newThing(thing: {name: "${thing.name}", material: "${thing.material}", type: ${thing.type}}) {
                    thing_id
                    name
                    system {
                        created
                    }
                  }
                }
            `)
        }
    } catch(err) {
        console.log(err);
    }
}

fixtures()
