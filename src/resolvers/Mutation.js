import { ObjectID} from "mongodb";


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
        if(status >= 0 && status <= 2){

        const object = await collection.insertOne({team: team.map(obj => ObjectID(obj)), date, result, status});
        return object.ops[0];
        }else{
            return new Error("Insert correct status");
        }
    },

    updateResult : async (parent, args, ctx, info) => {
        const resultID = args.id;
        const { client, pubsub } = ctx;

        const db = client.db("League");
        const collection = db.collection("Matchs");

        let jsonUpdate;

        if(args.result){
            jsonUpdate = {
                result: args.result,
                ...jsonUpdate
            }
        }
        const result = await collection.findOneAndUpdate({_id: ObjectID(resultID)}, {$set: jsonUpdate},{returnOriginal:false});
       
        pubsub.publish(resultID, {
            matchUpdate: result.value
          });

        return result.value;
    },
    
    startMatch: async (parent, args, ctx, info) => {
        const { id, status } = args;
        const { client, pubsub } = ctx;

        const db = client.db("League");
        const collection = db.collection("Matchs");
        
        if (status >= 0 && status <= 2) {
          const updated = await collection.findOneAndUpdate(
            { _id: ObjectID(id) },
            { $set: { status } },
            { returnOriginal: false }
          );
     
          pubsub.publish(id, {
            matchUpdate: updated.value
          });
          return updated.value;
        } else {
          throw new Error(
            "Insert correct status (0: not started, 1: playing, 2: finished)"
          );
        }
    }
}
    export {Mutation as default};