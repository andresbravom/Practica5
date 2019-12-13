const Subscription = {
    matchUpdate: {
        subscribe(parent, args, ctx, info){
            const {id} = args;
            const {pubsub} = ctx;
            return pubsub.asyncIterator(`match${id}`);
        }
    },
    teamUpdate: {
        subscribe(parent, args, ctx, info){
            const {id} = args;
            const {pubsub} = ctx;
            return pubsub.asyncIterator(`team${id}`);
        }
    }
}

export {Subscription as default};