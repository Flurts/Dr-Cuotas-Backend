import { Query, Resolver } from "type-graphql";

@Resolver()
class PingResolver {
  @Query(() => String)
  ping() {
    return "pong";
  }
}

export default PingResolver;
