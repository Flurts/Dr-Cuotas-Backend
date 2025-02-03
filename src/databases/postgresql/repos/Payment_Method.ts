import { connection } from "..";
import { Payment_Method } from "@entities/models/";

const paymentMethodRepository = connection.getRepository(Payment_Method);

export { paymentMethodRepository as PaymentMethodRepository };
