const Mutation = { 

    addTeam: async (parent, args, ctx, info) =>{
        const { name } = args;
        const { client } = ctx;
        
        const db = client.db("League");
        const collection = db.collection ("Teams");

        const result = await collection.findOne({name});

        if(!result){
            const object = await collection.insertOne({name});
            return object.ops[0];
        }else{
            return undefined;
        }  
    },

    addMatch: async (parent, args, ctx, info) => {
        const { team,  result, status} = args;
        const { client } = ctx;
        const date = new Date().getDate();

        const db = client.db("League");
        const collection = db.collection("Matchs");

        const object = await collection.insertOne({team: team.map(obj => ObjectID(obj)), date, result, status});
        return object.ops[0];
    },

    updateResult : async (parent, args, ctx, info) => {
        const resultID = args.id;
        const { client } = ctx;

        const message = "Update sucessfuly";
        const db = client.db("League");
        const collection = db.collection("Matchs");

        let jsonUpdate;

        if(args.result){
            jsonUpdate = {
                result: args.result,
                ...jsonUpdate
            }
        }
        const result = await collection.updateOne({_id: ObjectID(resultID)}, {$set: jsonUpdate});
        return message;
    }  
}
    export {Mutation as default};