import  {GraphQLServer} from 'graphql-yoga'
import { MongoClient, ObjectID} from "mongodb";
import "babel-polyfill";
import * as uuid from 'uuid'

const usr = "andresBM";
const pwd = "qwerty123";
const url = "cluster0-k7hro.gcp.mongodb.net/test?retryWrites=true&w=majority";

/**
 * Connects to MongoDB Server and returns connected client
 * @param {string} usr MongoDB Server user
 * @param {string} pwd MongoDB Server pwd
 * @param {string} url MongoDB Server url
 */

const connectToDb = async function(usr, pwd, url) {
    const uri = `mongodb+srv://${usr}:${pwd}@${url}`;
    const client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  
    await client.connect();
    return client;
  };

/**
 * Starts GraphQL server, with MongoDB Client in context Object
 * @param {client: MongoClinet} context The context for GraphQL Server -> MongoDB Client
 */

const runGraphQLServer = function(context){
const typeDefs = `
    type Team{
        name: String!
        _id: ID!  
    }
    type Match{
        team:[Team]!
        date: Int!
        result: [Int]!
        status: Int!
        _id: ID!
       
    }
    type Query{
        getTeams(_id: ID!): [Team]
    }
    type Mutation{
        addTeam(name: String!): Team!
        addMatch(team: [ID!]!, result: [Int]!, status: Int!): Match!
    }
`
const resolvers = {
    // User:{
    //     bills: async(parent, args, ctx, info) => {
    //         const user = ObjectID(parent._id);
    //         const{ client } = ctx;

    //         const db = client.db("API");
    //         const collection = db.collection("Bills");
    //         const result = await collection.find({user}).toArray();
    //         return result;
    //     }, 
    //     _id(parent, args, ctx, info){
    //         const result = parent._id;
    //         return result;
    //     }
    // },

    // Bill:{
    //     user: async(parent, args, ctx, info) =>{
    //         const userID = parent.user;
    //         const { client } = ctx;

    //         const db = client.db("API");
    //         const collection = db.collection("Users");
    //         const result = await collection.findOne({_id: ObjectID(userID)});
    //         return result;
    //     }, 
    //     _id(parent, args, ctx, info){
    //         const result = parent._id;
    //         return result;
    //     }
    // },
    Query:{
       
    },
    Mutation:{

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
        }
        // addUser: async(parent, args, ctx, info) => {
        //     const { userName, password } = args;
        //     const { client } = ctx;

        //     const db = client.db("API");
        //     const collection = db.collection("Users");
  
        //     const result = await collection.findOne({userName});
        //     if (!result){
        //         const object = await collection.insertOne({userName, password});
        //         return object.ops[0];
        //     }else{
        //         return null;
        //     }
        // },

        // addBill: async(parent, args, ctx, info) => {
        //     const { userName, token, amount, concept, date } = args;
           
        //     const { client } = ctx;
          

        //     const db = client.db("API");
        //     const collection = db.collection("Bills");
        //     const collectionUsers = db.collection("Users");

          
        //     const result = await collectionUsers.findOne({token, userName});
        

        //     if(result){
        //         const user = result._id;
          
        //         const object = await collection.insertOne({user, amount, concept, date});
        //         return object.ops[0];
        //     }else{
        //         return null;
        //     }         
        // },

        // login: async(parent, args, ctx, info) => {
        //     const { userName, password } = args;
        //     const { client } = ctx;
           

        //     const db = client.db("API");
        //     const collection = db.collection("Users");

        //     const result = await collection.findOne({userName, password});

        //     if(result){
        //        const token = uuid.v4();
        //        await collection.updateOne({userName: userName}, {$set: {token: token}});
        //        return token;
        //     }else{
        //         return null;
        //     }
        // },
        // logout: async(parent, args, ctx, info) =>{
        //     const { userName, token } = args;
        //     const { client } = ctx;
        //     const newToken = null;

        //     const db = client.db("API");
        //     const collection = db.collection("Users");

        //     const result = await collection.findOne({userName, token});

        //     if(result){
        //         await collection.updateOne({userName: userName}, {$set: {token: newToken}});
        //         return token;
        //     }else{
        //         return null;
        //     }  
        // }, 
        // removeUser: async(parent, args, ctx, info) =>{
        //     const { userName, token } = args;
        //     const { client } = ctx;

        //     const message = "Remove successfuly";
        //     const db = client.db("API");
        //     const collectionUsers = db.collection("Users");
        //     const collectionBills = db.collection("Bills");

        //     const result = await collectionUsers.findOne({userName, token});
        //     if(result){
        //         const removeBills = () => {
        //             return new Promise((resolve, reject)=> {
        //                 const object = collectionBills.deleteMany({user: ObjectID(result._id)});
        //                 resolve (object);
        //             }
        //         )};

        //         const deleteUser = () =>{
        //             return new Promise((resolve, reject) =>{
        //                 const result = collectionUsers.deleteOne({userName});
        //                 resolve (result);
        //             }
        //         )};

        //         (async function(){
        //             const asyncFunctions = [
        //                 removeBills(),
        //                 deleteUser()
        //             ];
        //             await Promise.all(asyncFunctions);
        //         })();
        //         return message;
        //     }else{
        //         return null;
        //     }

            
        // }
    }
}
const server = new GraphQLServer({typeDefs, resolvers, context});
server.start(() => console.log("Server started"));
};
const runApp = async function(){
    const client = await connectToDb(usr, pwd, url);
    console.log("Connect to Mongo DB");

    runGraphQLServer({client});
};

runApp();