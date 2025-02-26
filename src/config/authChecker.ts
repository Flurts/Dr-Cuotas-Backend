import { AuthChecker } from "type-graphql";
import { Context } from "@/utils/constants/index";
import { verifyJwt } from "@/services/JWT/jose";

// Define la función authChecker
const customAuthChecker: AuthChecker<Context> = async ({ context }, roles) => {
  const req: Express.Request = context.req;

  // @ts-expect-error Ignorar el error de tipo de TS
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader) {
    return false;
  }

  const [token] = authorizationHeader.split(" ");

  try {
    const decodedToken = await verifyJwt(token);

    if (!decodedToken) {
      return false;
    }

    const payload = decodedToken.payload;
    const userRole = payload.role as string;

    console.log("🔍 Debug información:");
    console.log("- Roles requeridos:", roles);
    console.log("- Rol del usuario:", userRole);
    console.log("- Payload completo:", payload);

    // Guardar información del usuario en el contexto
    context.auth = {
      userId: payload.userId as string,
      sub: payload.sub!,
      role: payload.role as string
    };

    // Si no hay roles requeridos (@Authorized()), solo verificamos que el token sea válido
    if (roles.length === 0) {
      return true;
    }

    // Si hay roles específicos (@Authorized("Admin")), verificamos que el usuario tenga el rol requerido
    const hasRequiredRole = roles.includes(userRole);
    console.log("🔒 Tiene el rol requerido?:", hasRequiredRole);

    return hasRequiredRole;
  } catch (error) {
    return false;
  }
};

export default customAuthChecker;
