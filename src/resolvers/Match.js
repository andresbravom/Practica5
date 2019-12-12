import { ObjectID} from "mongodb";
const Match = {
    team: async (parent, args, ctx, info) => {
        const { client } = ctx;

        const db = client.db("League");
        const collection = db.collection("Teams");
        const teamsArray = parent.team.map(obj => ObjectID(obj));
        
        const result = await collection.find({_id:{$in: teamsArray}});
        return result.toArray();
    }
}
export {Match as default};