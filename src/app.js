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
        getTeams: [Team]
    }
    type Mutation{
        addTeam(name: String!): Team!
        addMatch(team: [ID!]!, result: [Int]!, status: Int!): Match!
    }
`
const resolvers = {
    Match:{
        team: async (parent, args, ctx, info) => {
            const { client } = ctx;

            const db = client.db("League");
            const collection = db.collection("Teams");
            const teamsArray = parent.team.map(obj => ObjectID(obj));
            console.log(teamsArray);
            
            const result = await collection.find({_id:{$in: teamsArray}});
            return result.toArray();
        }

    },
    Query:{
       getTeams : async (parent, args, ctx, info) => {
          const { client } = ctx;
          
          const db = client.db ("League"); 
          const collection = db.collection ("Teams");

          const result = await collection.find({}).toArray();

          return result;
       
       }
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
            console.log(object.ops[0]);
            return object.ops[0];
        }
       

        
        
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