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
        if(status >= 1 && status <= 3){

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
        const result = await collection.findOneAndUpdate({_id: ObjectID(resultID)}, {$set: jsonUpdate}, {returnOriginal:false});
       
        pubsub.publish(`match${resultID}`, {
          matchUpdate: result.value
        });

        pubsub.publish(`team${result.value.team[0]}`,{
          teamUpdate: result.value
        });

         pubsub.publish(`team${result.value.team[1]}`,{
          teamUpdate: result.value
        });
        
        
        return result.value;
    },
    
    startMatch: async (parent, args, ctx, info) => {
        const statusID = args.id;
        const {client,pubsub} = ctx;

        const db = client.db("League");
        const collection = db.collection("Matchs");

        let jsonUpdate;

        if(args.status){
          jsonUpdate = {
            status: args.status
          }
        }
        const result = await collection.findOneAndUpdate({_id: ObjectID(statusID)}, {$set: jsonUpdate}, {returnOriginal:false});
        

        pubsub.publish(`match${statusID}`, {
            matchUpdate: result.value
        });

        pubsub.publish(`team${result.value.team[0]}`,{
          teamUpdate: result.value
        });

         pubsub.publish(`team${result.value.team[1]}`,{
          teamUpdate: result.value
        });

        return result.value;
    }
};

export {Mutation as default};