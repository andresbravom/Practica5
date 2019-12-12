import { ObjectID} from "mongodb";
const Match = {
    team: async (parent, args, ctx, info) => {
        const { client } = ctx;

        const db = client.db("League");
        const collection = db.collection("Teams");
        const teamsArray = parent.team.map(obj => ObjectID(obj));
        
        const result = await collection.find({_id:{$in: teamsArray}});
        return result.toArray();
    },
    status: (parent, args, ctx, info ) => {
        const status = parent.status;
        if(status === 0){
            return "Not started";
        } 
        if(status === 1){
            return "Playing";
        } 
        if(status === 2){
            return "Finished";
        } 
    }
}
export {Match as default};