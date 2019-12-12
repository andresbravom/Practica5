const Query = {
    getTeams : async (parent, args, ctx, info) => {
       const { client } = ctx;
       
       const db = client.db ("League"); 
       const collection = db.collection ("Teams");

       const result = await collection.find({}).toArray();

       return result;
    
    }
 }
export {Query as default};