import { AuthChecker } from "type-graphql";
import { Context } from "@/utils/constants/index";
import { verifyJwt } from "@/services/JWT/jose";

// Define la función authChecker
const customAuthChecker: AuthChecker<Context> = async ({ context }, roles) => {
  // Verifica si hay un usuario autenticado en el contexto
  const req: Express.Request = context.req;

  // Obtener el JWT del encabezado de autorización
  // @ts-expect-error Ignorar el error de tipo de TS
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader) {
    // Si no se proporciona JWT en el encabezado de autorización, devuelve false
    return false;
  }

  // Extraer el token JWT de la cabecera de autorización
  const [token] = authorizationHeader.split(" "); // Se asume que el token está en el formato "Bearer <token>"

  try {
    // Verificar y decodificar el token JWT
    const decodedToken = await verifyJwt(token);

    if (!decodedToken) {
      // Si el token no es válido, devuelve false
      return false;
    }

    const payload = decodedToken.payload;

    // Agregar la información del usuario al contexto
    context.auth = {
      userId: payload.userId as string, // Suponiendo que el token tiene una propiedad 'userId'
      sub: payload.sub! // Suponiendo que el token tiene una propiedad 'sub' para el email del usuario
    };

    // Devuelve true indicando que el usuario está autenticado
    return true;
  } catch (error) {
    // Si ocurre algún error al verificar el token JWT, devuelve false
    return false;
  }
};

export default customAuthChecker;
